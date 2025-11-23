// src/stores/cartStore.js
import { defineStore } from 'pinia';
import { useProductStore } from './productStore';
import { useSalesStore } from './salesStore';
import { useCustomerStore } from './customerStore'; // For customer name
import { useSettingsStore } from './settingsStore'; // For currency, etc.

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], // Array of { productIdInternal, model, quantity, priceAtSale, basePriceAtSale }
    customerId: null,
    customerName: 'Anonymous',
    locationId: 3, // Default to Shop 1, but should be set by POSPage
    discountPercentage: 0,
    notes: '',
    isProcessingCheckout: false,
  }),
  getters: {
    itemCount: (state) => {
      return state.items.reduce((count, item) => count + item.quantity, 0);
    },
    subtotal: (state) => {
      return state.items.reduce((total, item) => total + (item.priceAtSale * item.quantity), 0);
    },
    discountAmount: (state) => {
      const discount = (state.subtotal * state.discountPercentage) / 100;
      return parseFloat(discount.toFixed(2));
    },
    grandTotal: (state) => {
      const total = state.subtotal - state.discountAmount;
      return parseFloat(total.toFixed(2));
    },
    findItemInCart: (state) => (productIdInternal) => {
      return state.items.find(item => item.productIdInternal === productIdInternal);
    }
  },
  actions: {
    addItem(product) { // Expects a full product object from productStore
      if (!product || !product.idInternal) {
        console.error("CartStore: Invalid product data provided to addItem.", product);
        return { success: false, message: "Invalid product data." };
      }

      const productStore = useProductStore();
      const productInStore = productStore.getProductById(product.idInternal);

      // Check stock for the CURRENT location
      const stockInLocation = productStore.getStockForLocation(product.idInternal, this.locationId);

      if (!productInStore || stockInLocation <= 0) {
        console.warn(`CartStore: Product ${product.model} is out of stock in location ${this.locationId}.`);
        return { success: false, message: `${product.model} is out of stock in this location.` };
      }

      const existingItem = this.findItemInCart(product.idInternal);

      if (existingItem) {
        if (existingItem.quantity < stockInLocation) {
          existingItem.quantity++;
          return { success: true, message: `${product.model} quantity updated in cart.` };
        } else {
          console.warn(`CartStore: Cannot add more ${product.model}. Max stock (${stockInLocation}) reached in cart.`);
          return { success: false, message: `Max stock reached for ${product.model}.` };
        }
      } else {
        this.items.push({
          productIdInternal: product.idInternal,
          model: product.model,
          quantity: 1,
          priceAtSale: product.selling_price,
          basePriceAtSale: product.base_price || 0,
        });
        return { success: true, message: `${product.model} added to cart.` };
      }
    },
    removeItem(productIdInternal) {
      const initialLength = this.items.length;
      this.items = this.items.filter(item => item.productIdInternal !== productIdInternal);
      return { success: this.items.length < initialLength, message: "Item removed." };
    },
    updateItemQuantity(productIdInternal, newQuantity) {
      const itemIndex = this.items.findIndex(item => item.productIdInternal === productIdInternal);
      if (itemIndex === -1) return { success: false, message: "Item not found in cart." };

      const productStore = useProductStore();
      const productInStore = productStore.getProductById(productIdInternal);
      if (!productInStore) return { success: false, message: "Product details not found for stock check." };

      const stockInLocation = productStore.getStockForLocation(productIdInternal, this.locationId);
      const quantity = parseInt(newQuantity, 10);

      if (isNaN(quantity) || quantity < 0) {
        return { success: false, message: "Invalid quantity entered." };
      }
      if (quantity === 0) {
        this.removeItem(productIdInternal);
        return { success: true, message: "Item removed due to zero quantity." };
      }
      if (quantity > stockInLocation) {
        this.items[itemIndex].quantity = stockInLocation; // Cap at max stock
        return { success: false, message: `Quantity for ${this.items[itemIndex].model} capped at max available stock (${stockInLocation}).` };
      }

      this.items[itemIndex].quantity = quantity;
      return { success: true, message: "Item quantity updated." };
    },
    applyDiscount(percentage) {
      const discount = parseFloat(percentage);
      if (!isNaN(discount) && discount >= 0 && discount <= 100) {
        this.discountPercentage = discount;
        return { success: true, message: `Discount set to ${discount}%.` };
      } else {
        this.discountPercentage = 0;
        return { success: false, message: "Invalid discount percentage. Reset to 0%." };
      }
    },
    assignCustomer(customer) {
      if (customer && customer.idInternal) {
        this.customerId = customer.idInternal;
        this.customerName = customer.name;
      } else {
        this.customerId = null;
        this.customerName = 'Anonymous';
      }
    },
    setLocation(id) {
      this.locationId = id;
    },
    setSaleNotes(notes) {
      this.notes = notes;
    },
    clearCart() {
      this.items = [];
      this.customerId = null;
      this.customerName = 'Anonymous';
      this.discountPercentage = 0;
      this.notes = '';
      console.log('CartStore: Cart cleared.');
    },
    async processCheckout() {
      if (this.items.length === 0) {
        return { success: false, message: "Cart is empty. Cannot process sale." };
      }
      this.isProcessingCheckout = true;
      const salesStore = useSalesStore();

      const saleDataPayload = {
        customerId: this.customerId,
        customerName: this.customerName,
        locationId: this.locationId, // Pass location ID
        items: JSON.parse(JSON.stringify(this.items)),
        subtotalAmount: this.subtotal,
        discountPercentage: this.discountPercentage,
        discountAmount: this.discountAmount,
        totalAmount: this.grandTotal,
        notes: this.notes,
      };

      try {
        const newSaleRecord = await salesStore.addSale(saleDataPayload);
        if (newSaleRecord && newSaleRecord.id) { // Check if sale was successfully added
          this.clearCart(); // Clear cart ONLY on successful sale processing
          console.log('CartStore: Checkout processed, sale ID:', newSaleRecord.id);
          return { success: true, message: `Sale ${newSaleRecord.id.slice(-6)} processed successfully!`, saleId: newSaleRecord.id, saleRecord: newSaleRecord };
        } else {
          // This case might happen if salesStore.addSale has an internal issue but doesn't throw
          throw new Error(salesStore.error || "Sale processing failed in sales store.");
        }
      } catch (error) {
        console.error('CartStore: Error during checkout process:', error);
        return { success: false, message: error.message || "Checkout failed. Please try again." };
      } finally {
        this.isProcessingCheckout = false;
      }
    }
  }
});
