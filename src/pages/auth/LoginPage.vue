<template>
  <div class="login-page-wrapper">
    <div class="login-card card">
      <div class="card-header text-center">
        <h1 class="logo-font">{{ settingsStore.storeName }} ✨</h1>
        <h3>Login to Your Account</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleLogin">
          <div v-if="userStore.error && !Object.keys(validationErrors).length" class="form-alert alert-danger mb-3" role="alert">
            {{ userStore.error }}
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              class="form-control"
              v-model="credentials.email"
              required
              placeholder="admin@example.com"
              autocomplete="email" :class="{'is-invalid': validationErrors.email}"
              @input="validationErrors.email = ''"
            >
            <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email }}</div>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              v-model="credentials.password"
              required
              placeholder="password123"
              autocomplete="current-password" :class="{'is-invalid': validationErrors.password}"
              @input="validationErrors.password = ''"
            >
            <div v-if="validationErrors.password" class="invalid-feedback">{{ validationErrors.password }}</div>
          </div>
          <div class="button-group mt-4">
            <button type="submit" class="btn btn-primary w-100" :disabled="userStore.isLoading">
              <span v-if="userStore.isLoading"><div class="loader-btn-inline"></div> Logging in...</span>
              <span v-else>Login</span>
            </button>
          </div>
          <div class="text-center mt-3">
            <small>Don't have an account?
              <a href="#" @click.prevent="showRegistrationForm">Register here (Mock)</a>
            </small>
          </div>
        </form>
      </div>
    </div>
    <div v-if="showRegister" class="registration-card card mt-4">
      <div class="card-header text-center"><h3>Register New Account (Mock)</h3></div>
      <div class="card-body">
        <form @submit.prevent="handleRegister">
          <div class="form-group"> <label for="reg-name">Full Name</label> <input type="text" id="reg-name" class="form-control" v-model="registration.name" required autocomplete="name"> </div>
          <div class="form-group"> <label for="reg-email">Email</label> <input type="email" id="reg-email" class="form-control" v-model="registration.email" required autocomplete="email"> </div>
          <div class="form-group"> <label for="reg-password">Password</label> <input type="password" id="reg-password" class="form-control" v-model="registration.password" required autocomplete="new-password"> </div>
          <div class="button-group mt-3">
            <button type="submit" class="btn btn-success w-100" :disabled="userStore.isLoading">
              <span v-if="userStore.isLoading && registrationAttempted"><div class="loader-btn-inline"></div> Registering...</span>
              <span v-else>Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const credentials = reactive({ email: '', password: '' });
const validationErrors = reactive({});
const showRegister = ref(false);
const registration = reactive({ name: '', email: '', password: ''});
const registrationAttempted = ref(false);

const validateLoginForm = () => {
  for (const key in validationErrors) { delete validationErrors[key]; }
  let isValid = true;
  if (!credentials.email) { validationErrors.email = "Email is required."; isValid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) { validationErrors.email = "Invalid email format."; isValid = false; }
  if (!credentials.password) { validationErrors.password = "Password is required."; isValid = false; }
  return isValid;
};
const handleLogin = async () => {
  if (!validateLoginForm()) { toastStore.error("Please correct the form errors."); return; }
  userStore.error = null;
  await userStore.login(credentials);
  // If login fails, userStore.error will be set and displayed by the v-if in template or by a toast from the store
};
const showRegistrationForm = () => {
  showRegister.value = !showRegister.value; userStore.error = null;
  for (const key in validationErrors) { delete validationErrors[key]; }
};
const handleRegister = async () => {
  registrationAttempted.value = true;
  // Add simple validation for registration form
  if (!registration.name || !registration.email || !registration.password) {
    toastStore.error("All registration fields are required.");
    registrationAttempted.value = false; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)) {
    toastStore.error("Invalid email format for registration.");
    registrationAttempted.value = false; return;
  }
  if (registration.password.length < 6) { // Example: min password length
    toastStore.error("Password must be at least 6 characters long.");
    registrationAttempted.value = false; return;
  }

  await userStore.register(registration);
  registrationAttempted.value = false;
  if (!userStore.error) {
    showRegister.value = false;
    // Clear registration form
    registration.name = ''; registration.email = ''; registration.password = '';
  }
};
</script>

<style scoped>
/* Styles from previous LoginPage.vue */
.login-page-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: var(--space-lg); background-color: var(--bg-color-offset); }
.login-card, .registration-card { width: 100%; max-width: 420px; box-shadow: var(--box-shadow-strong); }
.card-header h1.logo-font { font-family: var(--font-family-serif); color: var(--primary-color); font-size: 2em; margin-bottom: 0.25rem; }
.card-header h3 { font-family: var(--font-family-sans); font-size: 1.2rem; color: var(--text-color-muted); font-weight: 500; margin-top: 0; }
.form-alert.alert-danger { color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb; padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius); }
[data-theme="dark"] .form-alert.alert-danger { background-color: #52262a; border-color: #8B3A3F; color: #ffacac;}
.invalid-feedback { width: 100%; margin-top: var(--space-xs); font-size: 0.875em; color: var(--danger-color); }
.form-control.is-invalid { border-color: var(--danger-color); }
.loader-btn-inline { width: 1em; height: 1em; border-width: 2px; border-style: solid; border-color: currentColor currentColor currentColor transparent; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 0.5em; animation: spin 0.6s linear infinite; }
.btn-primary .loader-btn-inline, .btn-success .loader-btn-inline { border-left-color: var(--text-on-primary); border-bottom-color: var(--text-on-primary); }
[data-theme="dark"] .btn-primary .loader-btn-inline, [data-theme="dark"] .btn-success .loader-btn-inline { border-left-color: var(--text-on-primary); border-bottom-color: var(--text-on-primary); }
</style>
