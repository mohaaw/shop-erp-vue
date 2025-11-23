// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useSettingsStore } from './stores/settingsStore';
import { useUserStore } from './stores/userStore';

import './assets/main.css';
import './assets/glassmorphism.css';

import i18n from './i18n';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // USE PINIA FIRST!
app.use(i18n);

const userStore = useUserStore();
// Call checkAuthStatus and wait for it if it's async (it is now)
// This is crucial for the first navigation guard run
userStore.checkAuthStatus().then(() => {
  app.use(router); // Mount router AFTER auth status is potentially restored

  try {
    const settingsStore = useSettingsStore();
    settingsStore.initializeTheme();
  } catch (error) {
    console.error("Error initializing theme from settings store in main.js:", error);
  }

  app.mount('#app');
}).catch(error => {
  console.error("Failed to initialize auth status, app might not behave correctly:", error);
  // Still mount the app, router guard will handle redirection if auth is required.
  app.use(router);
  app.mount('#app');
});
