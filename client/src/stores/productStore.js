// src/stores/productStore.js
import { defineStore } from 'pinia';
import { useSettingsStore } from './settingsStore';
import { useStockMovementStore } from './stockMovementStore';
import { useLocationStore } from './locationStore';

const LS_PRODUCTS_KEY = 'shopErpVUE_products';
const LS_SEEDED_PRODUCTS_KEY = 'shopErpVUE_seeded_products';

// Helper to create a full product object with defaults
const createFullProductObject = (data = {}) => {
  const now = new Date().toISOString();
  // Ensure stockByLocation exists. If migrating from old data, put all 'quantity' into a default location (e.g., Shop 1 or Warehouse)
  // For simplicity, if stockByLocation is missing, we'll assign existing quantity to location 3 (Shop 1) as a default migration strategy.
  let stockByLocation = data.stockByLocation || {};

  // Migration logic: if quantity exists but stockByLocation doesn't, migrate it.
  if (!data.stockByLocation && typeof data.quantity === 'number' && data.quantity > 0) {
    stockByLocation = { 3: data.quantity }; // Default to Shop 1
  }

  return {
    idInternal: data.idInternal || `prod_vue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    no: data.no || '', // SKU
    serial_number: data.serial_number || '',
    category: data.category || 'Uncategorized',
    company: data.company || 'Unknown Brand', // Brand
    model: data.model || 'Unknown Model',
    condition: data.condition || 'New',
    cpu: data.cpu || '',
    gen: data.gen || '',
    screen_touch: data.screen_touch || false,
    ram: data.ram || '',
    // quantity is now a computed property in the app, but we store a cached total for performance/sorting if needed.
    // However, to avoid sync issues, we should rely on stockByLocation.
    // For backward compatibility with existing code that reads .quantity, we can keep it as a sum.
    quantity: calculateTotalStock(stockByLocation),
    stockByLocation: stockByLocation,
    hdd: data.hdd || '',
    ssd: data.ssd || '',
    vga_type: data.vga_type || '',
    vga_memory: data.vga_memory || '',
    base_price: parseFloat(data.base_price) >= 0 ? parseFloat(data.base_price) : 0,
    selling_price: parseFloat(data.selling_price) >= 0 ? parseFloat(data.selling_price) : 0,
    best_price: parseFloat(data.best_price) >= 0 ? parseFloat(data.best_price) : 0,
    supplier: data.supplier || '',
    purchase_date: data.purchase_date || '', // Should be YYYY-MM-DD format
    warranty: data.warranty || '',
    dimensions: data.dimensions || '',
    weight: data.weight || '',
    color: data.color || '',
    description: data.description || '',
    image_url: data.image_url || '',
    tags: data.tags || '',
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };
};

const calculateTotalStock = (stockByLocation) => {
  if (!stockByLocation) return 0;
  return Object.values(stockByLocation).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
};


export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    searchTerm: '',
  }),
  getters: {
    filteredProducts: (state) => {
      if (!state.searchTerm) return state.products.slice().sort((a, b) => (a.model || '').localeCompare(b.model || ''));
      const lowerSearchTerm = state.searchTerm.toLowerCase();
      return state.products.filter(product =>
        Object.values(product).some(value =>
          String(value).toLowerCase().includes(lowerSearchTerm)
        )
      ).sort((a, b) => (a.model || '').localeCompare(b.model || ''));
    },
    getProductById: (state) => (idInternal) => {
      return state.products.find(product => product.idInternal === idInternal);
    },
    lowStockItems: (state) => {
      const settingsStore = useSettingsStore();
      // Check total quantity for now, or per location? Usually total.
      return state.products.filter(p => p.quantity > 0 && p.quantity <= settingsStore.lowStockThreshold).sort((a, b) => a.quantity - b.quantity);
    },
    outOfStockItems: (state) => state.products.filter(p => p.quantity === 0),
    totalStockValue: (state) => {
      return state.products.reduce((sum, p) => sum + ((p.selling_price || 0) * (p.quantity || 0)), 0);
    },
    availableProductsForPOS: (state) => {
      const locationStore = useLocationStore();
      const currentLocationId = locationStore.currentLocationId;

      const sortByNameThenModel = (a, b) => {
        const catComp = (a.category || '').localeCompare(b.category || '');
        if (catComp !== 0) return catComp;
        return (a.model || '').localeCompare(b.model || '');
      };

      // Filter products that have stock in the CURRENT location
      const hasStockInCurrentLocation = (p) => {
        const stock = p.stockByLocation?.[currentLocationId] || 0;
        return stock > 0;
      };

      let filtered = state.products.filter(hasStockInCurrentLocation);

      if (state.searchTerm) {
        const lowerSearchTerm = state.searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          Object.values(p).some(value =>
            String(value).toLowerCase().includes(lowerSearchTerm)
          )
        );
      }
      return filtered.sort(sortByNameThenModel);
    },
    // Helper to get stock for a specific location
    getStockForLocation: (state) => (productId, locationId) => {
      const product = state.products.find(p => p.idInternal === productId);
      return product?.stockByLocation?.[locationId] || 0;
    },
    inventoryValuationByCost: (state) => {
      return state.products.reduce((total, product) => total + ((product.base_price || 0) * (product.quantity || 0)), 0);
    },
    inventoryValuationBySalePrice: (state) => {
      return state.products.reduce((total, product) => total + ((product.selling_price || 0) * (product.quantity || 0)), 0);
    },
    productsWithIndividualValuation: (state) => {
      return state.products.map(p => ({
        ...p,
        valuationAtCost: (p.base_price || 0) * (p.quantity || 0),
        valuationAtSalePrice: (p.selling_price || 0) * (p.quantity || 0)
      })).sort((a, b) => (a.category + a.model).localeCompare(b.category + b.model));
    },
    stockDistributionByCategory: (state) => (limit = 7) => {
      const categoryCounts = state.products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (product.quantity || 0);
        return acc;
      }, {});
      return Object.entries(categoryCounts)
        .filter(([, qty]) => qty > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit);
    }
  },
  actions: {
    _saveProductsToLocalStorage() {
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(this.products));
    },
    async fetchProducts() {
      this.isLoading = true; this.error = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const savedProducts = localStorage.getItem(LS_PRODUCTS_KEY);
        this.products = savedProducts ? JSON.parse(savedProducts).map(p => createFullProductObject(p)) : [];

        if (this.products.length === 0 && !localStorage.getItem(LS_SEEDED_PRODUCTS_KEY)) {
          this.seedInitialProducts();
          localStorage.setItem(LS_SEEDED_PRODUCTS_KEY, 'true');
        }
      } catch (e) {
        this.error = 'Failed to load products. Data might be corrupted.';
        console.error("Error fetching/parsing products from localStorage:", e);
        this.products = [];
      } finally {
        this.isLoading = false;
      }
    },
    async addProduct(productData) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      const locationStore = useLocationStore();
      try {
        const newProduct = createFullProductObject(productData);

        // If adding a product with initial quantity, assume it goes to the current location or default
        // For new products, we might want to specify location. For now, let's assume Warehouse (id 2) or current.
        // Let's default to Warehouse for new stock if not specified.
        if (newProduct.quantity > 0 && Object.keys(newProduct.stockByLocation).length === 0) {
          const defaultLoc = 2; // Warehouse
          newProduct.stockByLocation = { [defaultLoc]: newProduct.quantity };
        }

        this.products.unshift(newProduct);

        if (newProduct.quantity > 0) {
          // Log movement for each location with stock
          for (const [locId, qty] of Object.entries(newProduct.stockByLocation)) {
            if (qty > 0) {
              await stockMovementStore.addMovement({
                productId: newProduct.idInternal,
                productName: `${newProduct.company} ${newProduct.model}`,
                type: 'initial_stock',
                quantityChange: qty,
                newQuantity: qty,
                locationId: parseInt(locId),
                reason: 'Product Creation',
              });
            }
          }
        }
        this._saveProductsToLocalStorage();
        return newProduct;
      } catch (e) {
        this.error = `Failed to add product: ${e.message}`;
        console.error('Error in addProduct:', e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    async updateProduct(updatedProductData) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      try {
        const index = this.products.findIndex(p => p.idInternal === updatedProductData.idInternal);
        if (index !== -1) {
          const oldProduct = this.products[index];

          // We don't usually update stock via updateProduct anymore, we use adjustStock.
          // But if the user edits the "quantity" field directly in a form (if we allow that), we need to handle it.
          // Ideally, we disable direct quantity editing in the product form and force using "Adjust Stock" or "Transfer".
          // For now, let's assume the form might send updated fields but NOT stockByLocation changes directly unless we implement a complex UI.
          // We will preserve the existing stockByLocation if not provided in updatedProductData.

          const preservedStock = updatedProductData.stockByLocation || oldProduct.stockByLocation;
          const newQuantity = calculateTotalStock(preservedStock);

          const newProductData = createFullProductObject({
            ...oldProduct,
            ...updatedProductData,
            stockByLocation: preservedStock,
            quantity: newQuantity
          });
          newProductData.updatedAt = new Date().toISOString();

          this.products[index] = newProductData;
          // Note: We are NOT logging stock movements here because we assume stock didn't change via this generic update.
          // If we want to allow stock editing here, we'd need to diff stockByLocation.

          this._saveProductsToLocalStorage();
          return this.products[index];
        } else {
          throw new Error('Product not found for update.');
        }
      } catch (e) {
        this.error = `Failed to update product: ${e.message}`;
        console.error('Error in updateProduct:', e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteProduct(productIdInternal) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      try {
        const productIndex = this.products.findIndex(p => p.idInternal === productIdInternal);
        if (productIndex !== -1) {
          const productToDelete = this.products[productIndex];
          if (productToDelete.quantity !== 0) {
            // Log deletion for all locations
            for (const [locId, qty] of Object.entries(productToDelete.stockByLocation)) {
              if (qty > 0) {
                await stockMovementStore.addMovement({
                  productId: productToDelete.idInternal,
                  productName: `${productToDelete.company} ${productToDelete.model}`,
                  type: 'deletion',
                  quantityChange: -qty,
                  newQuantity: 0,
                  locationId: parseInt(locId),
                  reason: 'Product deleted from system',
                });
              }
            }
          }
        }
        this.products = this.products.filter(p => p.idInternal !== productIdInternal);
        this._saveProductsToLocalStorage();
      } catch (e) {
        this.error = `Failed to delete product: ${e.message}`;
        console.error('Error in deleteProduct:', e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    setSearchTerm(term) { this.searchTerm = term; },
    seedInitialProducts() {
      const stockMovementStore = useStockMovementStore();
      const nowISO = new Date().toISOString();
      const seedData = [
        createFullProductObject({
          idInternal: "prod_vue_seed_001", no: "LT001", serial_number: "SN-INVTX1-001", category: "Laptop", company: "Innovatech", model: "Spectre X1", condition: "New",
          cpu: "Intel Core i9", gen: "14th", screen_touch: true, ram: "32GB DDR5", quantity: 5, stockByLocation: { 3: 3, 4: 2 }, // Shop 1: 3, Shop 2: 2
          hdd: "N/A", ssd: "2TB NVMe Gen4", vga_type: "NVIDIA RTX 5060", vga_memory: "8GB GDDR6",
          base_price: 1800, selling_price: 2499.99, best_price: 2350,
          supplier: "TechDistributors Inc.", purchase_date: "2024-01-15", warranty: "2 years international",
          description: "Flagship ultrabook with premium features, AI capabilities, and OLED display.",
          image_url: "https://placehold.co/300x200/D4AF37/000000?text=Spectre+X1",
          dimensions: "30.5 x 20.8 x 1.5 cm", weight: "1.3 kg", color: "Obsidian Black, Gold Trim", tags: "ultrabook,premium,ai,business,oled,laptop",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: nowISO
        }),
        createFullProductObject({
          idInternal: "prod_vue_seed_002", no: "PC002", serial_number: "SN-CYBRGT-001", category: "Desktop PC", company: "CyberBuild", model: "Gaming Rig Titan II", condition: "New",
          cpu: "AMD Ryzen 9 7950X3D", gen: "Zen 4", screen_touch: false, ram: "64GB DDR5 6000MHz", quantity: 3, stockByLocation: { 2: 3 }, // Warehouse: 3
          hdd: "4TB SATA 7200RPM", ssd: "2TB Gen5 NVMe", vga_type: "AMD Radeon RX 8900XTX", vga_memory: "24GB GDDR7",
          base_price: 2200, selling_price: 3199.00, best_price: 3000,
          supplier: "PC Parts Global", purchase_date: "2024-02-10", warranty: "1 year components, 3 years service",
          description: "Ultimate gaming desktop for 4K/8K performance. Advanced liquid cooling.",
          image_url: "https://placehold.co/300x200/1C1C1C/D4AF37?text=Gaming+Titan+II",
          dimensions: "50 x 25 x 55 cm", weight: "15 kg", color: "Matte Black, Gold Accents", tags: "gaming,desktop,high-performance,streaming,vr",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: nowISO
        }),
        createFullProductObject({
          idInternal: "prod_vue_seed_003", no: "ACC003", serial_number: "SN-CNCTEM-001", category: "Mouse", company: "ConnectTech", model: "ErgoPro Wireless", condition: "New",
          quantity: 0, base_price: 45, selling_price: 79.99, best_price: 70,
          supplier: "OfficeGoods Ltd.", purchase_date: "2023-12-01", warranty: "90 days",
          description: "Ergonomic wireless mouse with 8 programmable buttons.",
          image_url: "https://placehold.co/300x200/F5F5F5/121212?text=ErgoMouse",
          color: "Graphite", tags: "ergonomic,wireless,office,mouse",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: nowISO
        }),
      ];
      this.products = [];
      seedData.forEach(async (prodData) => {
        this.products.push(prodData);
        for (const [locId, qty] of Object.entries(prodData.stockByLocation || {})) {
          if (qty > 0) {
            await stockMovementStore.addMovement({
              productId: prodData.idInternal,
              productName: `${prodData.company} ${prodData.model}`,
              type: 'initial_stock (seed)',
              quantityChange: qty,
              newQuantity: qty,
              locationId: parseInt(locId),
              reason: 'Initial data seeding',
            });
          }
        }
      });
      this._saveProductsToLocalStorage();
      console.log('Initial products seeded into productStore with stock movements.');
    },
    async updateStockFromSale(itemsSold, saleId, locationId) {
      let productsChanged = false;
      const stockMovementStore = useStockMovementStore();

      if (!locationId) {
        console.error("No locationId provided for sale stock update!");
        throw new Error("Location ID required for sale.");
      }

      for (const soldItem of itemsSold) {
        const productIndex = this.products.findIndex(p => p.idInternal === soldItem.productIdInternal);
        if (productIndex !== -1) {
          const product = this.products[productIndex];

          const currentLocStock = product.stockByLocation[locationId] || 0;
          if (currentLocStock < soldItem.quantitySold) {
            console.warn(`Insufficient stock in location ${locationId} for product ${product.model}. Proceeding anyway (negative stock).`);
          }

          const newLocStock = Math.max(0, currentLocStock - soldItem.quantitySold);

          // Update location stock
          product.stockByLocation[locationId] = newLocStock;
          // Update total quantity
          product.quantity = calculateTotalStock(product.stockByLocation);

          product.updatedAt = new Date().toISOString();
          productsChanged = true;

          await stockMovementStore.addMovement({
            productId: product.idInternal,
            productName: `${product.company} ${product.model}`,
            type: 'sale',
            quantityChange: -soldItem.quantitySold,
            newQuantity: newLocStock,
            locationId: locationId,
            relatedDocumentId: saleId,
          });
        } else {
          console.warn(`Product ID ${soldItem.productIdInternal} not found for stock update during sale.`);
        }
      }
      if (productsChanged) { this._saveProductsToLocalStorage(); }
    },
    async adjustStock({ productId, quantityChange, reason, type = 'manual_adjustment', relatedDocumentId = null, locationId }) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();

      if (!locationId) {
        this.isLoading = false;
        throw new Error("Location ID is required for stock adjustment.");
      }

      try {
        const productIndex = this.products.findIndex(p => p.idInternal === productId);
        if (productIndex === -1) { throw new Error("Product not found for stock adjustment."); }

        const product = this.products[productIndex];
        const currentLocStock = product.stockByLocation[locationId] || 0;
        const change = parseInt(quantityChange, 10);
        if (isNaN(change)) { throw new Error("Invalid quantity change. Must be a number."); }

        const newLocStock = Math.max(0, currentLocStock + change);

        product.stockByLocation[locationId] = newLocStock;
        product.quantity = calculateTotalStock(product.stockByLocation);
        product.updatedAt = new Date().toISOString();

        await stockMovementStore.addMovement({
          productId: product.idInternal,
          productName: `${product.company} ${product.model}`,
          type: type,
          quantityChange: change,
          newQuantity: newLocStock,
          locationId: locationId,
          reason: reason,
          relatedDocumentId: relatedDocumentId
        });
        this._saveProductsToLocalStorage();
        this.isLoading = false;
        return product;
      } catch (e) {
        this.error = e.message || 'Failed to adjust stock.';
        console.error('Error in adjustStock:', e);
        this.isLoading = false;
        throw e;
      }
    },
    async transferStock({ productId, fromLocationId, toLocationId, quantity, reason }) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      try {
        const productIndex = this.products.findIndex(p => p.idInternal === productId);
        if (productIndex === -1) throw new Error("Product not found.");

        const product = this.products[productIndex];
        const fromStock = product.stockByLocation[fromLocationId] || 0;

        if (fromStock < quantity) {
          throw new Error(`Insufficient stock in source location.`);
        }

        // Deduct from source
        product.stockByLocation[fromLocationId] = fromStock - quantity;
        // Add to dest
        product.stockByLocation[toLocationId] = (product.stockByLocation[toLocationId] || 0) + quantity;

        // Total quantity remains same, but we update it just in case
        product.quantity = calculateTotalStock(product.stockByLocation);
        product.updatedAt = new Date().toISOString();

        // Log movements
        await stockMovementStore.addMovement({
          productId, productName: `${product.company} ${product.model}`,
          type: 'transfer_out', quantityChange: -quantity, newQuantity: product.stockByLocation[fromLocationId],
          locationId: fromLocationId, reason: `Transfer to Loc ${toLocationId}: ${reason}`
        });

        await stockMovementStore.addMovement({
          productId, productName: `${product.company} ${product.model}`,
          type: 'transfer_in', quantityChange: quantity, newQuantity: product.stockByLocation[toLocationId],
          locationId: toLocationId, reason: `Transfer from Loc ${fromLocationId}: ${reason}`
        });

        this._saveProductsToLocalStorage();
        this.isLoading = false;
      } catch (e) {
        this.error = e.message;
        this.isLoading = false;
        throw e;
      }
    },
    clearAllProductsData(isImporting = false) {
      this.products = []; this.error = null; this.searchTerm = '';
      this._saveProductsToLocalStorage();
      if (!isImporting) { localStorage.removeItem(LS_SEEDED_PRODUCTS_KEY); }
      console.log('All products data cleared from productStore.');
    }
  },
});

