// src/stores/toastStore.js
import { defineStore } from 'pinia';

let toastIdCounter = 0;

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [], // Array of { id, message, type, duration, persistent }
  }),
  actions: {
    addToast({ message, type = 'info', duration = 4000, persistent = false }) {
      const id = toastIdCounter++;
      // Remove existing toast with same message and type to avoid duplicates if rapidly fired
      this.toasts = this.toasts.filter(t => !(t.message === message && t.type === type));

      this.toasts.push({ id, message, type, duration, persistent });

      if (!persistent) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id);
    },
    success(message, duration = 3000) {
      this.addToast({ message, type: 'success', duration });
    },
    error(message, duration = 5000, persistent = false) {
      this.addToast({ message, type: 'error', duration, persistent });
    },
    info(message, duration = 3000) {
      this.addToast({ message, type: 'info', duration });
    },
    warning(message, duration = 4000) {
      this.addToast({ message, type: 'warning', duration });
    },
  },
});
