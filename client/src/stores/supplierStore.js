import { defineStore } from 'pinia';

const LS_SUPPLIERS_KEY = 'shopErpVUE_suppliers';

export const useSupplierStore = defineStore('supplier', {
    state: () => ({
        suppliers: [],
        isLoading: false,
        error: null,
    }),
    getters: {
        getSupplierById: (state) => (id) => {
            return state.suppliers.find(s => s.id === id);
        },
        totalSuppliers: (state) => state.suppliers.length,
    },
    actions: {
        _saveToLocalStorage() {
            localStorage.setItem(LS_SUPPLIERS_KEY, JSON.stringify(this.suppliers));
        },
        async fetchSuppliers() {
            this.isLoading = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
                const saved = localStorage.getItem(LS_SUPPLIERS_KEY);
                this.suppliers = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.error = 'Failed to load suppliers.';
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        async addSupplier(supplierData) {
            this.isLoading = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const newSupplier = {
                    id: `SUP_${Date.now()}`,
                    ...supplierData,
                    createdAt: new Date().toISOString(),
                };
                this.suppliers.push(newSupplier);
                this._saveToLocalStorage();
                return newSupplier;
            } catch (e) {
                this.error = 'Failed to add supplier.';
                throw e;
            } finally {
                this.isLoading = false;
            }
        },
        async updateSupplier(id, updates) {
            this.isLoading = true;
            try {
                const index = this.suppliers.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.suppliers[index] = { ...this.suppliers[index], ...updates };
                    this._saveToLocalStorage();
                    return this.suppliers[index];
                }
                throw new Error('Supplier not found');
            } catch (e) {
                this.error = 'Failed to update supplier.';
                throw e;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteSupplier(id) {
            this.isLoading = true;
            try {
                this.suppliers = this.suppliers.filter(s => s.id !== id);
                this._saveToLocalStorage();
            } catch (e) {
                this.error = 'Failed to delete supplier';
                throw e;
            } finally {
                this.isLoading = false;
            }
        }
    },
});
