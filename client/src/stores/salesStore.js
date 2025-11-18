// src/stores/salesStore.js
import { defineStore } from 'pinia';
import { useProductStore } from './productStore';
import { useCustomerStore } from './customerStore';
// Note: settingsStore is not directly used here but might be by components consuming sales data.

const LS_SALES_KEY = 'shopErpVUE_sales';
const LS_SEEDED_SALES_KEY = 'shopErpVUE_seeded_sales';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    isLoading: false,
    error: null,
    dateFilter: null,
    customerFilter: null,
  }),
  getters: {
    getSaleById: (state) => (saleId) => {
      return state.sales.find(sale => sale.id === saleId);
    },
    getSalesByCustomerId: (state) => (customerId) => {
      return state.sales.filter(sale => sale.customerId === customerId);
    },
    filteredSales: (state) => {
      let salesToFilter = [...state.sales].sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first for list display
      if (state.dateFilter) {
        salesToFilter = salesToFilter.filter(sale => sale.date.startsWith(state.dateFilter));
      }
      if (state.customerFilter) {
        salesToFilter = salesToFilter.filter(sale => sale.customerId === state.customerFilter);
      }
      return salesToFilter;
    },
    totalSalesRecords: (state) => state.sales.length,
    totalRevenue: (state) => state.sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalProfit: (state) => state.sales.reduce((sum, sale) => sum + (sale.estimatedProfit || 0), 0),

    dailySalesAndProfit: (state) => (numberOfDays = 7) => {
      const dailyData = {};
      const today = new Date();
      today.setHours(0,0,0,0);

      for (let i = 0; i < numberOfDays; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        dailyData[dateKey] = { sales: 0, profit: 0, count: 0, date: new Date(d) };
      }

      state.sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0,0,0,0);
        const saleDateKey = saleDate.toISOString().split('T')[0];

        if (dailyData[saleDateKey] !== undefined) {
          dailyData[saleDateKey].sales += sale.totalAmount;
          dailyData[saleDateKey].profit += sale.estimatedProfit || 0;
          dailyData[saleDateKey].count += 1;
        }
      });
      return Object.values(dailyData).sort((a,b) => a.date - b.date); // Oldest first for charts
    },

    topSellingProductsByQuantity: (state) => (limit = 5) => {
      const productSales = {};
      const productStore = useProductStore();

      state.sales.forEach(sale => {
        sale.items.forEach(item => {
          if (!productSales[item.productIdInternal]) {
            const product = productStore.getProductById(item.productIdInternal);
            productSales[item.productIdInternal] = {
              id: item.productIdInternal,
              name: item.productModel || product?.model || 'Unknown Product',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productIdInternal].quantity += item.quantity;
          productSales[item.productIdInternal].revenue += (item.priceAtSale || 0) * item.quantity;
        });
      });
      return Object.values(productSales)
        .sort((a,b) => b.quantity - a.quantity)
        .slice(0, limit);
    },

    getSalesInDateRange: (state) => (startDate, endDate) => {
      if (!startDate || !endDate) {
        return [...state.sales].sort((a,b) => new Date(a.date) - new Date(b.date));
      }
      const start = new Date(startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(endDate); end.setHours(23, 59, 59, 999);
      const filtered = state.sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
      });
      return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  },
  actions: {
    _saveSalesToLocalStorage() {
      localStorage.setItem(LS_SALES_KEY, JSON.stringify(this.sales));
    },
    async fetchSales() {
      this.isLoading = true; this.error = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 150)); // Slightly longer for realism
        const savedSales = localStorage.getItem(LS_SALES_KEY);
        this.sales = savedSales ? JSON.parse(savedSales) : [];

        if (this.sales.length === 0 && !localStorage.getItem(LS_SEEDED_SALES_KEY)) {
          await this.seedInitialSales(); // Make sure seeding is awaited
          localStorage.setItem(LS_SEEDED_SALES_KEY, 'true');
        }
      } catch (e) {
        this.error = 'Failed to load sales records.';
        console.error("Error fetching/parsing sales from localStorage:", e);
        this.sales = [];
      } finally {
        this.isLoading = false;
      }
    },
    async addSale(saleData) { // Expects: { customerId?, customerName?, items, subtotalAmount, discountPercentage?, discountAmount?, totalAmount, notes? }
      this.isLoading = true; this.error = null;
      const productStore = useProductStore();
      const customerStore = useCustomerStore();
      try {
        const newSaleItems = saleData.items.map(item => {
          const product = productStore.getProductById(item.productIdInternal);
          return {
            productIdInternal: item.productIdInternal,
            productModel: item.model || item.productModel || product?.model || 'Unknown Product',
            quantity: item.quantity,
            priceAtSale: item.priceAtSale !== undefined ? item.priceAtSale : (item.price !== undefined ? item.price : 0),
            basePriceAtSale: item.basePriceAtSale !== undefined ? item.basePriceAtSale : (item.basePrice !== undefined ? item.basePrice : (product?.base_price || 0)),
          };
        });

        const calculatedSubtotal = newSaleItems.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
        const discountPercentage = saleData.discountPercentage || 0;
        const calculatedDiscountAmount = (calculatedSubtotal * discountPercentage) / 100;
        const calculatedTotalAmount = calculatedSubtotal - calculatedDiscountAmount;

        const estimatedProfit = newSaleItems.reduce((sum, item) => {
          return sum + ((item.priceAtSale - item.basePriceAtSale) * item.quantity);
        }, 0);

        const saleDate = saleData.dateForSeeding ? new Date(saleData.dateForSeeding) : new Date(); // Use provided date for seeding

        const newSale = {
          id: `SALE_VUE_${saleDate.getTime()}_${Math.random().toString(36).substring(2, 7)}`, // Use saleDate for ID consistency
          date: saleDate.toISOString(),
          customerId: saleData.customerId || null,
          customerName: saleData.customerName || 'Anonymous',
          items: newSaleItems,
          subtotalAmount: parseFloat(calculatedSubtotal.toFixed(2)),
          discountPercentage: parseFloat(discountPercentage.toFixed(2)),
          discountAmount: parseFloat(calculatedDiscountAmount.toFixed(2)),
          totalAmount: parseFloat(calculatedTotalAmount.toFixed(2)),
          notes: saleData.notes || '',
          estimatedProfit: parseFloat(estimatedProfit.toFixed(2)),
          createdAt: new Date().toISOString(), // Actual creation timestamp
        };

        this.sales.unshift(newSale);

        const itemsToUpdateStock = newSaleItems.map(item => ({
          productIdInternal: item.productIdInternal,
          quantitySold: item.quantity
        }));
        await productStore.updateStockFromSale(itemsToUpdateStock, newSale.id);

        if (newSale.customerId) {
          customerStore.updateCustomerTotalSpent(newSale.customerId, newSale.totalAmount);
        }

        this._saveSalesToLocalStorage();
        return newSale;
      } catch (e) {
        this.error = `Failed to add sale record: ${e.message}`;
        console.error('Error in salesStore.addSale:', e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    setDateFilter(date) { this.dateFilter = date; },
    setCustomerFilter(customerId) { this.customerFilter = customerId; },
    clearFilters() { this.dateFilter = null; this.customerFilter = null; },

    async seedInitialSales() {
      console.log("SalesStore: Attempting to seed initial sales...");
      const productStore = useProductStore();
      const customerStore = useCustomerStore();

      // Ensure dependent stores are loaded (and potentially seeded themselves)
      if (productStore.products.length === 0 && !productStore.isLoading) {
        console.log("SalesStore: Product store empty, fetching products for seeding sales...");
        await productStore.fetchProducts();
      }
      if (customerStore.customers.length === 0 && !customerStore.isLoading) {
        console.log("SalesStore: Customer store empty, fetching customers for seeding sales...");
        await customerStore.fetchCustomers();
      }

      // Short delay to allow reactivity if fetches were just triggered
      await new Promise(resolve => setTimeout(resolve, 200));

      const availableProducts = productStore.products;
      const availableCustomers = customerStore.customers;

      if (availableProducts.length < 2 || availableCustomers.length < 1) {
        console.warn("SalesStore: Not enough products or customers available to seed meaningful sales data. Skipping sales seeding.");
        this.sales = []; // Ensure sales is an array
        this._saveSalesToLocalStorage();
        return;
      }

      const today = new Date();
      const salesToSeedPayloads = [];

      // Sale 1 (2 days ago)
      const sale1Date = new Date(today); sale1Date.setDate(today.getDate() - 2);
      const s1p1 = availableProducts[0];
      if (!s1p1) { console.warn("SalesStore Seeding: Product 1 for seed not found."); return; }
      const sale1Subtotal = s1p1.selling_price * 1;
      salesToSeedPayloads.push({
        customerId: availableCustomers[0].idInternal, customerName: availableCustomers[0].name,
        items: [{ productIdInternal: s1p1.idInternal, model: s1p1.model, quantity: 1, priceAtSale: s1p1.selling_price, basePriceAtSale: s1p1.base_price }],
        subtotalAmount: sale1Subtotal, discountPercentage: 0, discountAmount: 0, totalAmount: sale1Subtotal,
        dateForSeeding: sale1Date.toISOString(), notes: "First seeded sale."
      });

      // Sale 2 (yesterday)
      const sale2Date = new Date(today); sale2Date.setDate(today.getDate() - 1);
      const s2p1 = availableProducts[1];
      const s2p2 = availableProducts[0]; // Re-using product 0
      if (!s2p1 || !s2p2) { console.warn("SalesStore Seeding: Products for seed sale 2 not found."); return; }
      const sale2Subtotal = (s2p1.selling_price * 2) + (s2p2.selling_price * 1);
      const sale2DiscountPerc = 10;
      const sale2DiscountAmt = sale2Subtotal * (sale2DiscountPerc / 100);
      salesToSeedPayloads.push({
        customerId: availableCustomers.length > 1 ? availableCustomers[1].idInternal : null,
        customerName: availableCustomers.length > 1 ? availableCustomers[1].name : 'Anonymous',
        items: [
          { productIdInternal: s2p1.idInternal, model: s2p1.model, quantity: 2, priceAtSale: s2p1.selling_price, basePriceAtSale: s2p1.base_price },
          { productIdInternal: s2p2.idInternal, model: s2p2.model, quantity: 1, priceAtSale: s2p2.selling_price, basePriceAtSale: s2p2.base_price },
        ],
        subtotalAmount: sale2Subtotal, discountPercentage: sale2DiscountPerc,
        discountAmount: sale2DiscountAmt, totalAmount: sale2Subtotal - sale2DiscountAmt,
        dateForSeeding: sale2Date.toISOString(), notes: "Seeded: Discounted sale."
      });

      // Process sales using the addSale action to ensure all logic is applied
      for (const salePayload of salesToSeedPayloads) {
        try {
          await this.addSale(salePayload);
        } catch (e) {
          console.error("Error seeding a sale:", e, salePayload);
        }
      }
      console.log(`SalesStore: Initial sales seeded (${this.sales.length} sales).`);
    },
    clearAllSalesData(isImporting = false) {
      this.sales = []; this.error = null; this.dateFilter = null; this.customerFilter = null;
      this._saveSalesToLocalStorage();
      if (!isImporting) { localStorage.removeItem(LS_SEEDED_SALES_KEY); }
      console.log('All sales data cleared from salesStore.');
    }
  },
});
