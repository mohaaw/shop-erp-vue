// src/stores/settingsStore.js
import { defineStore } from 'pinia';
// Import other stores for full data export/import
import { useProductStore } from './productStore';
import { useCustomerStore } from './customerStore';
import { useSalesStore } from './salesStore';
// cartStore is typically transient, but if you want to save/load its state:
// import { useCartStore } from './cartStore';


const LS_PREFIX = 'shopErpVUE_';
const DEFAULT_SETTINGS = {
  storeName: "Tech Store Pro Max",
  storeAddress: "123 Tech Avenue, Circuit City",
  storeEmail: "contact@techstorepromax.com",
  storePhone: "+1-555-TECH-PRO",
  currencySymbol: "$",
  theme: "light",
  lowStockThreshold: 5,
};

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const loadedSettings = JSON.parse(localStorage.getItem(LS_PREFIX + 'appSettings'));
    return {
      ...DEFAULT_SETTINGS,
      ...(loadedSettings || {}),
      theme: (loadedSettings && loadedSettings.theme) ? loadedSettings.theme : DEFAULT_SETTINGS.theme,
    };
  },
  actions: {
    saveSettings() {
      const settingsToSave = {
        storeName: this.storeName,
        storeAddress: this.storeAddress,
        storeEmail: this.storeEmail,
        storePhone: this.storePhone,
        currencySymbol: this.currencySymbol,
        theme: this.theme,
        lowStockThreshold: this.lowStockThreshold,
      };
      localStorage.setItem(LS_PREFIX + 'appSettings', JSON.stringify(settingsToSave));
    },
    setTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', this.theme);
      this.saveSettings();
    },
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },
    initializeTheme() {
      document.documentElement.setAttribute('data-theme', this.theme);
    },
    updateStoreInfo({ name, address, email, phone }) {
      this.storeName = name || this.storeName;
      this.storeAddress = address || this.storeAddress;
      this.storeEmail = email || this.storeEmail;
      this.storePhone = phone || this.storePhone;
      this.saveSettings();
    },
    updateCurrencySymbol(newSymbol) {
      if (newSymbol && newSymbol.trim() !== "") {
        this.currencySymbol = newSymbol.trim();
        this.saveSettings();
        return true;
      }
      return false;
    },
    updateLowStockThreshold(newThreshold) {
      const threshold = parseInt(newThreshold, 10);
      if (!isNaN(threshold) && threshold >= 0) {
        this.lowStockThreshold = threshold;
        this.saveSettings();
        return true;
      }
      return false;
    },

    // --- Full Data Export/Import/Reset ---
    getAllApplicationData() {
      const productStore = useProductStore();
      const customerStore = useCustomerStore();
      const salesStore = useSalesStore();
      // const cartStore = useCartStore(); // If you want to include cart state

      return {
        appSettings: { ...this.$state }, // Current settings
        products: [...productStore.products],
        customers: [...customerStore.customers],
        sales: [...salesStore.sales],
        // cartItems: [...cartStore.items], // Example if saving cart
        exportedAt: new Date().toISOString(),
        appVersion: 'shopErpVUE_1.0' // Example versioning
      };
    },

    async importAllApplicationData(jsonData) {
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error("Invalid data format for import.");
      }

      const { appSettings, products, customers, sales /*, cartItems */ } = jsonData;

      // It's crucial to reset other stores BEFORE applying new data
      const productStore = useProductStore();
      const customerStore = useCustomerStore();
      const salesStore = useSalesStore();
      // const cartStore = useCartStore();

      // Clear existing data in other stores
      await productStore.clearAllProductsData(true); // Pass a flag to prevent re-seeding immediately
      await customerStore.clearAllCustomersData(true);
      await salesStore.clearAllSalesData(true);
      // await cartStore.clearCart(); // Cart usually resets anyway

      // Import new settings
      if (appSettings) {
        Object.assign(this, DEFAULT_SETTINGS, appSettings); // Merge, prioritizing imported
        this.saveSettings();
        this.initializeTheme(); // Re-apply theme
      } else {
        this.$reset(); // Reset to default if no settings in import
      }

      // Import data into other stores
      if (products && Array.isArray(products)) {
        productStore.$patch({ products: products });
        productStore._saveProductsToLocalStorage(); // Manually save after patch
      }
      if (customers && Array.isArray(customers)) {
        customerStore.$patch({ customers: customers });
        customerStore._saveCustomersToLocalStorage();
      }
      if (sales && Array.isArray(sales)) {
        salesStore.$patch({ sales: sales });
        salesStore._saveSalesToLocalStorage();
      }

      // Clear seeded flags so if data is empty, seeding can occur on next fetch
      localStorage.removeItem('shopErpVUE_seeded_products');
      localStorage.removeItem('shopErpVUE_seeded_customers');
      localStorage.removeItem('shopErpVUE_seeded_sales');

      // Optionally, trigger fetches in stores to re-apply any post-load logic (like seeding if lists are empty)
      // This might be redundant if $patch and save cover it.
      // await productStore.fetchProducts();
      // await customerStore.fetchCustomers();
      // await salesStore.fetchSales();
      console.log("Application data imported.");
    },

    async resetAllApplicationData() {
      console.log("SettingsStore: Initiating full application data reset...");
      const productStore = useProductStore();
      const customerStore = useCustomerStore();
      const salesStore = useSalesStore();
      // const cartStore = useCartStore();

      // Clear data in all stores
      await productStore.clearAllProductsData(); // This should clear LS and seeded flag
      await customerStore.clearAllCustomersData();
      await salesStore.clearAllSalesData();
      // await cartStore.clearCart();

      // Reset this settings store
      Object.assign(this, DEFAULT_SETTINGS);
      this.saveSettings(); // Save default settings
      this.initializeTheme(); // Apply default theme

      // Re-trigger seeding by calling fetch (which checks for seeded flag)
      // This is important to get back to a usable default state
      await productStore.fetchProducts();
      await customerStore.fetchCustomers();
      await salesStore.fetchSales();

      console.log("SettingsStore: Full application data reset complete.");
    }
  },
});
