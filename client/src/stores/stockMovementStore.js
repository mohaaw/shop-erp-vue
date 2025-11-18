// src/stores/stockMovementStore.js
import { defineStore } from 'pinia';

const LS_STOCK_MOVEMENTS_KEY = 'shopErpVUE_stockMovements';

export const useStockMovementStore = defineStore('stockMovements', {
  state: () => ({
    movements: [], // Array of: { id, productId, productName, date, type, quantityChange, newQuantity, reason, relatedDocumentId }
    isLoading: false,
    error: null,
  }),
  getters: {
    getMovementsByProductId: (state) => (productId) => {
      return state.movements
        .filter(movement => movement.productId === productId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    },
  },
  actions: {
    _saveMovementsToLocalStorage() {
      localStorage.setItem(LS_STOCK_MOVEMENTS_KEY, JSON.stringify(this.movements));
    },
    async fetchAllMovements() {
      this.isLoading = true;
      this.error = null;
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
        const savedMovements = localStorage.getItem(LS_STOCK_MOVEMENTS_KEY);
        this.movements = savedMovements ? JSON.parse(savedMovements) : [];
      } catch (e) {
        this.error = 'Failed to load stock movements.';
        console.error(e);
        this.movements = [];
      } finally {
        this.isLoading = false;
      }
    },
    // This action will be called by other stores/components when stock changes
    async addMovement(movementData) {
      // movementData: { productId, productName, type, quantityChange, newQuantity, reason?, relatedDocumentId? }
      this.isLoading = true;
      this.error = null;
      try {
        const newMovement = {
          id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          date: new Date().toISOString(),
          productId: movementData.productId,
          productName: movementData.productName || 'N/A', // Store product name at time of movement for history
          type: movementData.type, // e.g., 'initial_stock', 'sale', 'return', 'manual_adjustment', 'received_stock', 'damage'
          quantityChange: movementData.quantityChange, // Can be positive or negative
          newQuantity: movementData.newQuantity,
          reason: movementData.reason || null,
          relatedDocumentId: movementData.relatedDocumentId || null, // e.g., Sale ID, PO ID
        };
        this.movements.unshift(newMovement);
        this._saveMovementsToLocalStorage();
        console.log('Stock movement added:', newMovement);
        return newMovement;
      } catch (e) {
        this.error = 'Failed to add stock movement.';
        console.error('Error in addMovement:', e);
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    // Action for system reset
    clearAllStockMovementsData() {
      this.movements = [];
      this.error = null;
      this._saveMovementsToLocalStorage(); // Save empty array
      console.log('All stock movements data cleared.');
    }
  },
});
