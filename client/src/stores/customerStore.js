// src/stores/customerStore.js
import { defineStore } from 'pinia';

const LS_CUSTOMERS_KEY = 'shopErpVUE_customers';
const LS_SEEDED_CUSTOMERS_KEY = 'shopErpVUE_seeded_customers';

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    customers: [],
    isLoading: false,
    error: null,
    searchTerm: '',
  }),
  getters: {
    filteredCustomers: (state) => {
      if (!state.searchTerm) {
        return state.customers.sort((a,b) => a.name.localeCompare(b.name));
      }
      const lowerSearchTerm = state.searchTerm.toLowerCase();
      return state.customers.filter(customer =>
        (customer.name && customer.name.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.phone && customer.phone.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.customer_type && customer.customer_type.toLowerCase().includes(lowerSearchTerm))
      ).sort((a,b) => a.name.localeCompare(b.name));
    },
    getCustomerById: (state) => (idInternal) => {
      return state.customers.find(customer => customer.idInternal === idInternal);
    },
    // This getter uses the placeholder. Real calculation would involve salesStore.
    getCustomerTotalSpentDisplay: (state) => (idInternal) => {
      const customer = state.getCustomerById(idInternal);
      return customer?.totalSpentPlaceholder || 0;
    }
  },
  actions: {
    _saveCustomersToLocalStorage() {
      localStorage.setItem(LS_CUSTOMERS_KEY, JSON.stringify(this.customers));
    },
    async fetchCustomers() {
      this.isLoading = true;
      this.error = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const savedCustomers = localStorage.getItem(LS_CUSTOMERS_KEY);
        this.customers = savedCustomers ? JSON.parse(savedCustomers) : [];

        if (this.customers.length === 0 && !localStorage.getItem(LS_SEEDED_CUSTOMERS_KEY)) {
          this.seedInitialCustomers();
          localStorage.setItem(LS_SEEDED_CUSTOMERS_KEY, 'true');
        }
      } catch (e) {
        this.error = 'Failed to load customers.'; console.error(e); this.customers = [];
      } finally {
        this.isLoading = false;
      }
    },
    async addCustomer(customerData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newCustomer = {
          idInternal: customerData.idInternal || `cust_vue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: customerData.name || 'Unknown Customer',
          email: customerData.email || '',
          phone: customerData.phone || '',
          customer_type: customerData.customer_type || 'Regular',
          address: customerData.address || '',
          notes: customerData.notes || '',
          date_joined: customerData.date_joined || new Date().toISOString().split('T')[0],
          totalSpentPlaceholder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.customers.unshift(newCustomer);
        this._saveCustomersToLocalStorage();
        return newCustomer;
      } catch (e) { this.error = 'Failed to add customer.'; console.error(e); throw e; }
      finally { this.isLoading = false; }
    },
    async updateCustomer(updatedCustomerData) {
      this.isLoading = true;
      this.error = null;
      try {
        const index = this.customers.findIndex(c => c.idInternal === updatedCustomerData.idInternal);
        if (index !== -1) {
          this.customers[index] = {
            ...this.customers[index],
            ...updatedCustomerData,
            updatedAt: new Date().toISOString()
          };
          this._saveCustomersToLocalStorage();
          return this.customers[index];
        } else { throw new Error('Customer not found for update.'); }
      } catch (e) { this.error = 'Failed to update customer.'; console.error(e); throw e; }
      finally { this.isLoading = false; }
    },
    async deleteCustomer(customerIdInternal) {
      this.isLoading = true;
      this.error = null;
      try {
        // Future: If salesStore exists, sales associated with this customer might need to be anonymized.
        // For now, this action is standalone.
        this.customers = this.customers.filter(c => c.idInternal !== customerIdInternal);
        this._saveCustomersToLocalStorage();
      } catch (e) { this.error = 'Failed to delete customer.'; console.error(e); throw e; }
      finally { this.isLoading = false; }
    },
    setSearchTerm(term) {
      this.searchTerm = term;
    },
    seedInitialCustomers() {
      const seedData = [
        {
          idInternal: "cust_vue_seed_001", name: "Alice Goldwin", email: "alice.g@example.com",
          phone: "555-0101", customer_type: "VIP",
          address: "123 Luxury Lane, Gold City, GC 12345",
          notes: "Prefers gold-accented products. High value customer. Enjoys new tech.",
          date_joined: "2023-05-15", totalSpentPlaceholder: 0, // This will be updated by seeded sales
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          idInternal: "cust_vue_seed_002", name: "Robert Blackwood", email: "bob.b@example.com",
          phone: "555-0102", customer_type: "Business",
          address: "456 Onyx St, Obsidian Town, OT 67890",
          notes: "Buys in bulk for his company. Interested in extended warranties and business solutions.",
          date_joined: "2023-08-20", totalSpentPlaceholder: 0, // This will be updated by seeded sales
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
      ];
      this.customers = seedData;
      this._saveCustomersToLocalStorage();
      console.log('Initial customers seeded into customerStore.');
    },
    // Called by salesStore after a sale is processed
    updateCustomerTotalSpent(customerIdInternal, saleTotalAmount) {
      const customerIndex = this.customers.findIndex(c => c.idInternal === customerIdInternal);
      if (customerIndex !== -1) {
        this.customers[customerIndex].totalSpentPlaceholder =
          (this.customers[customerIndex].totalSpentPlaceholder || 0) + saleTotalAmount;
        this.customers[customerIndex].updatedAt = new Date().toISOString();
        this._saveCustomersToLocalStorage();
      } else {
        console.warn(`Customer with ID ${customerIdInternal} not found in customerStore to update total spent.`);
      }
    },
    clearAllCustomersData(isImporting = false) { // Add flag
      this.customers = [];
      this.error = null;
      this.searchTerm = '';
      this._saveCustomersToLocalStorage();
      if (!isImporting) {
        localStorage.removeItem(LS_SEEDED_CUSTOMERS_KEY);
      }
      console.log('All customers data cleared from customerStore.');
    }

  },
});
