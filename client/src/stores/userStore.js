// src/stores/userStore.js
import { defineStore } from 'pinia';
import router from '@/router';
import { useCartStore } from './cartStore';
import { useToastStore } from './toastStore';
import apiService from '@/services/apiService';

export const LS_USER_KEY = 'shopErpVUE_user_profile';
export const LS_TOKEN_KEY = 'shopErpVUE_auth_token';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(LS_USER_KEY)) || null,
    token: localStorage.getItem(LS_TOKEN_KEY) || null,
    isLoading: false,
    error: null, // Store specific error messages here
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    currentUserDisplay: (state) => state.user ? `${state.user.name} (${state.user.role || 'user'})` : 'Guest',
  },
  actions: {
    _setAuthData(userData, authToken) {
      this.user = userData;
      this.token = authToken;
      localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(LS_TOKEN_KEY, authToken);
    },
    _clearAuthData() {
      this.user = null; this.token = null;
      localStorage.removeItem(LS_USER_KEY); localStorage.removeItem(LS_TOKEN_KEY);
    },
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      const toastStore = useToastStore();

      const response = await apiService.post('/auth/login', credentials);

      if (response.success && response.data?.token && response.data?.user) {
        this._setAuthData(response.data.user, response.data.token);
        toastStore.success(`Welcome back, ${this.user.name}!`);
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
        this.isLoading = false;
        return true;
      } else {
        // Use the error message from the apiService response
        this.error = response.error || 'Login failed: Unknown server response.';
        toastStore.error(this.error);
        this.isLoading = false;
        return false;
      }
    },
    async logout() {
      const toastStore = useToastStore(); const cartStore = useCartStore();
      this.isLoading = true;
      try {
        const response = await apiService.post('/auth/logout');
        if (!response.success) {
          console.warn("Server-side logout may have failed or not implemented:", response.error);
        }
      }
      catch (e) { console.error("Error during server-side logout API call:", e); }
      finally {
        this._clearAuthData(); cartStore.clearCart();
        toastStore.info('You have been successfully logged out.');
        router.push({ name: 'Login' }); this.isLoading = false;
      }
    },
    async register(userData) {
      this.isLoading = true; this.error = null; const toastStore = useToastStore();
      try {
        const response = await apiService.post('/auth/register', userData);
        if (response.success && response.data?.user) {
          toastStore.success("Registration successful! Please log in.");
          router.push({ name: 'Login' }); return true;
        } else {
          this.error = response.error || "Registration failed: Invalid server response.";
          toastStore.error(this.error); return false;
        }
      } catch(e) { this.error = e.message || "Registration request failed."; toastStore.error(this.error); return false; }
      finally { this.isLoading = false; }
    },
    async checkAuthStatus() {
      console.log("userStore: Checking auth status...");
      const tokenFromStorage = localStorage.getItem(LS_TOKEN_KEY);
      if (tokenFromStorage) {
        this.token = tokenFromStorage;
        const response = await apiService.get('/auth/me');
        if (response.success && response.data?.user) {
          this._setAuthData(response.data.user, tokenFromStorage);
          console.log("userStore: User session restored and verified:", this.user?.email);
        } else {
          console.warn("userStore: Token found but failed to verify/fetch user. Clearing session.", response.error);
          this._clearAuthData();
        }
      } else {
        this._clearAuthData();
        console.log("userStore: No token found. User is not authenticated.");
      }
    },
    clearAllAuthDataForSystemReset() {
      this._clearAuthData(); this.isLoading = false; this.error = null;
      console.log('All auth data cleared from userStore for system reset.');
    }
  },
});

