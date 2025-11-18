// src/stores/productStore.js
import { defineStore } from 'pinia';
import { useSettingsStore } from './settingsStore';
import { useStockMovementStore } from './stockMovementStore'; // For logging stock changes

const LS_PRODUCTS_KEY = 'shopErpVUE_products';
const LS_SEEDED_PRODUCTS_KEY = 'shopErpVUE_seeded_products';

// Helper to create a full product object with defaults
const createFullProductObject = (data = {}) => {
  const now = new Date().toISOString();
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
    quantity: parseInt(data.quantity, 10) >= 0 ? parseInt(data.quantity, 10) : 0,
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


export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    searchTerm: '',
  }),
  getters: {
    filteredProducts: (state) => {
      if (!state.searchTerm) return state.products.slice().sort((a,b) => (a.model || '').localeCompare(b.model || '')); // Default sort by model
      const lowerSearchTerm = state.searchTerm.toLowerCase();
      return state.products.filter(product =>
        Object.values(product).some(value =>
          String(value).toLowerCase().includes(lowerSearchTerm)
        )
      ).sort((a,b) => (a.model || '').localeCompare(b.model || ''));
    },
    getProductById: (state) => (idInternal) => {
      return state.products.find(product => product.idInternal === idInternal);
    },
    lowStockItems: (state) => {
      const settingsStore = useSettingsStore();
      return state.products.filter(p => typeof p.quantity === 'number' && p.quantity > 0 && p.quantity <= settingsStore.lowStockThreshold).sort((a, b) => a.quantity - b.quantity);
    },
    outOfStockItems: (state) => state.products.filter(p => p.quantity === 0),
    totalStockValue: (state) => { // This is by selling_price for dashboard display
      return state.products.reduce((sum, p) => sum + ((p.selling_price || 0) * (p.quantity || 0)), 0);
    },
    availableProductsForPOS: (state) => {
      // Sort by category then model for consistent display in POS
      const sortByNameThenModel = (a,b) => {
        const catComp = (a.category || '').localeCompare(b.category || '');
        if (catComp !== 0) return catComp;
        return (a.model || '').localeCompare(b.model || '');
      };

      if (!state.searchTerm) {
        return state.products.filter(p => p.quantity > 0).sort(sortByNameThenModel);
      }
      const lowerSearchTerm = state.searchTerm.toLowerCase();
      return state.products.filter(p =>
        p.quantity > 0 &&
        Object.values(p).some(value =>
          String(value).toLowerCase().includes(lowerSearchTerm)
        )
      ).sort(sortByNameThenModel);
    },
    inventoryValuationByCost: (state) => {
      return state.products.reduce((total, product) => total + ( (product.base_price || 0) * (product.quantity || 0) ), 0);
    },
    inventoryValuationBySalePrice: (state) => { // Same as totalStockValue, alias for clarity
      return state.products.reduce((total, product) => total + ( (product.selling_price || 0) * (product.quantity || 0) ), 0);
    },
    productsWithIndividualValuation: (state) => {
      return state.products.map(p => ({
        ...p,
        valuationAtCost: (p.base_price || 0) * (p.quantity || 0),
        valuationAtSalePrice: (p.selling_price || 0) * (p.quantity || 0)
      })).sort((a,b) => (a.category + a.model).localeCompare(b.category + b.model));
    },
    stockDistributionByCategory: (state) => (limit = 7) => {
      const categoryCounts = state.products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (product.quantity || 0);
        return acc;
      }, {});
      return Object.entries(categoryCounts)
        .filter(([,qty]) => qty > 0)
        .sort(([,a],[,b]) => b-a)
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
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
        const savedProducts = localStorage.getItem(LS_PRODUCTS_KEY);
        this.products = savedProducts ? JSON.parse(savedProducts).map(p => createFullProductObject(p)) : []; // Ensure all fields

        if (this.products.length === 0 && !localStorage.getItem(LS_SEEDED_PRODUCTS_KEY)) {
          this.seedInitialProducts();
          localStorage.setItem(LS_SEEDED_PRODUCTS_KEY, 'true');
        }
      } catch (e) {
        this.error = 'Failed to load products. Data might be corrupted.';
        console.error("Error fetching/parsing products from localStorage:", e);
        this.products = [];
        // Optionally clear corrupted localStorage data
        // localStorage.removeItem(LS_PRODUCTS_KEY);
      } finally {
        this.isLoading = false;
      }
    },
    async addProduct(productData) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      try {
        const newProduct = createFullProductObject(productData); // Uses helper for consistency

        this.products.unshift(newProduct);

        if (newProduct.quantity > 0) {
          await stockMovementStore.addMovement({
            productId: newProduct.idInternal,
            productName: `${newProduct.company} ${newProduct.model}`,
            type: 'initial_stock', // Or 'purchase_received' if it's from a PO
            quantityChange: newProduct.quantity,
            newQuantity: newProduct.quantity,
            reason: 'Product Creation',
          });
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
          const oldQuantity = oldProduct.quantity;

          // Create the updated product, ensuring all fields are merged correctly
          const newProductData = createFullProductObject({ ...oldProduct, ...updatedProductData });
          newProductData.updatedAt = new Date().toISOString(); // Ensure updatedAt is fresh

          this.products[index] = newProductData;
          const newQuantity = newProductData.quantity;

          if (newQuantity !== oldQuantity) {
            await stockMovementStore.addMovement({
              productId: newProductData.idInternal,
              productName: `${newProductData.company} ${newProductData.model}`,
              type: 'manual_adjustment (form_edit)', // This specific type for form edits
              quantityChange: newQuantity - oldQuantity,
              newQuantity: newQuantity,
              reason: 'Product details form update',
            });
          }
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
          if (productToDelete.quantity !== 0) { // Log if deleting a product that had stock
            await stockMovementStore.addMovement({
              productId: productToDelete.idInternal,
              productName: `${productToDelete.company} ${productToDelete.model}`,
              type: 'deletion',
              quantityChange: -productToDelete.quantity, // Stock becomes 0
              newQuantity: 0,
              reason: 'Product deleted from system',
            });
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
          cpu: "Intel Core i9", gen: "14th", screen_touch: true, ram: "32GB DDR5", quantity: 5,
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
          cpu: "AMD Ryzen 9 7950X3D", gen: "Zen 4", screen_touch: false, ram: "64GB DDR5 6000MHz", quantity: 3,
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
      this.products = []; // Clear before seeding
      seedData.forEach(async (prodData) => { // Make sure addMovement can be awaited if it becomes async
        this.products.push(prodData); // Add to local array first
        if (prodData.quantity > 0) {
          // Log movement directly since we are not using the full addProduct action here for seeding
          await stockMovementStore.addMovement({
            productId: prodData.idInternal,
            productName: `${prodData.company} ${prodData.model}`,
            type: 'initial_stock (seed)',
            quantityChange: prodData.quantity,
            newQuantity: prodData.quantity,
            reason: 'Initial data seeding',
          });
        }
      });
      this._saveProductsToLocalStorage();
      console.log('Initial products seeded into productStore with stock movements (if any).');
    },
    async updateStockFromSale(itemsSold, saleId) {
      let productsChanged = false;
      const stockMovementStore = useStockMovementStore();
      for (const soldItem of itemsSold) {
        const productIndex = this.products.findIndex(p => p.idInternal === soldItem.productIdInternal);
        if (productIndex !== -1) {
          const product = this.products[productIndex];
          const oldQuantity = product.quantity;
          const newQuantity = Math.max(0, oldQuantity - soldItem.quantitySold);

          product.quantity = newQuantity;
          product.updatedAt = new Date().toISOString();
          productsChanged = true;

          await stockMovementStore.addMovement({
            productId: product.idInternal,
            productName: `${product.company} ${product.model}`,
            type: 'sale',
            quantityChange: -soldItem.quantitySold,
            newQuantity: newQuantity,
            relatedDocumentId: saleId,
          });
        } else {
          console.warn(`Product ID ${soldItem.productIdInternal} not found for stock update during sale.`);
        }
      }
      if (productsChanged) { this._saveProductsToLocalStorage(); }
    },
    async adjustStock({ productId, quantityChange, reason, type = 'manual_adjustment', relatedDocumentId = null }) {
      this.isLoading = true; this.error = null;
      const stockMovementStore = useStockMovementStore();
      try {
        const productIndex = this.products.findIndex(p => p.idInternal === productId);
        if (productIndex === -1) { throw new Error("Product not found for stock adjustment."); }

        const product = this.products[productIndex];
        const oldQuantity = product.quantity;
        const change = parseInt(quantityChange, 10);
        if (isNaN(change)) { throw new Error("Invalid quantity change. Must be a number."); }

        const newQuantityCalculated = oldQuantity + change;
        product.quantity = Math.max(0, newQuantityCalculated);
        product.updatedAt = new Date().toISOString();

        await stockMovementStore.addMovement({
          productId: product.idInternal,
          productName: `${product.company} ${product.model}`,
          type: type,
          quantityChange: change,
          newQuantity: product.quantity,
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
    clearAllProductsData(isImporting = false) {
      this.products = []; this.error = null; this.searchTerm = '';
      this._saveProductsToLocalStorage();
      if (!isImporting) { localStorage.removeItem(LS_SEEDED_PRODUCTS_KEY); }

      if (!isImporting) {
        const stockMovementStore = useStockMovementStore();
        // Decide if stock movements should be cleared too. If they are product specific, yes.
        // This might need a more nuanced approach, e.g., clear movements only for products being cleared.
        // For a full system reset, stockMovementStore will have its own clearAll.
        // For product import, we might keep historical movements if IDs can be re-linked, or clear them.
        // For now, let's assume product import replaces products but might keep history if IDs match.
        // For a full product data clear (not part of import), clearing movements for those products would make sense.
        // The current stockMovementStore doesn't have a "clearByProductId"
        console.warn('Clearing all products. Related stock movements are not automatically cleared by this action alone unless part of a system reset.');
      }
      console.log('All products data cleared from productStore.');
    }
  },
});
