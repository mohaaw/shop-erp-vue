<template>
  <header class="app-header">
    <div class="header-left">
      <button
        v-if="userStore.isAuthenticated"
        @click="toggleSidebar"
        class="btn-icon sidebar-toggle-btn"
        :aria-label="isSidebarOpenOnMobile ? 'Close sidebar' : 'Open sidebar'"
        :title="isSidebarOpenOnMobile ? 'Close sidebar' : 'Open sidebar'"
      >
        <svg v-if="!isSidebarOpenOnMobile || !isMobileView" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <router-link to="/" class="logo">
        {{ settingsStore.storeName }} ✨
      </router-link>
    </div>
    <div class="header-center">
    </div>
    <div class="header-right">
      <ThemeSwitcher />
      <div v-if="userStore.isAuthenticated" class="user-profile-menu">
        <button class="btn-icon user-avatar-btn" @click="toggleUserMenu" aria-label="User Menu" ref="userMenuButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="user-name-display-sm">{{ userStore.user?.name?.split(' ')[0] }}</span>
        </button>
        <div v-if="isUserMenuOpen" class="user-dropdown-menu" ref="userDropdown">
          <div class="dropdown-user-info">
            <strong>{{ userStore.user?.name }}</strong>
            <small>{{ userStore.user?.email }} ({{ userStore.user?.role }})</small>
          </div>
          <hr class="dropdown-divider">
          <router-link to="/settings" class="dropdown-item" @click="closeUserMenu">⚙️ Settings</router-link>
          <a href="#" class="dropdown-item" @click.prevent="handleLogout">🚪 Logout</a>
        </div>
      </div>
      <router-link v-else to="/login" class="btn btn-primary btn-sm">Login</router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore'; // Import user store

const emit = defineEmits(['toggle-sidebar']);
const props = defineProps({
  isMobileView: Boolean,
  isSidebarOpenOnMobile: Boolean
});

const settingsStore = useSettingsStore();
const userStore = useUserStore(); // Instantiate user store

const isUserMenuOpen = ref(false);
const userMenuButton = ref(null);
const userDropdown = ref(null);

const toggleSidebar = () => emit('toggle-sidebar');
const toggleUserMenu = () => isUserMenuOpen.value = !isUserMenuOpen.value;
const closeUserMenu = () => isUserMenuOpen.value = false;

const handleClickOutside = (event) => {
  if (isUserMenuOpen.value &&
    userMenuButton.value && !userMenuButton.value.contains(event.target) &&
    userDropdown.value && !userDropdown.value.contains(event.target)) {
    closeUserMenu();
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

const handleLogout = () => {
  userStore.logout(); // Call logout action from user store
  closeUserMenu();
};
</script>

<style scoped>
/* ... (Keep existing AppHeader styles from previous full version) ... */
/* Add/modify styles for user name display and login button */
.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--space-lg); height: 70px;
  background: var(--header-bg); color: var(--header-text-color);
  box-shadow: var(--box-shadow-sm); position: sticky; top: 0; z-index: 1020;
}
.header-left, .header-center, .header-right { display: flex; align-items: center; }
.sidebar-toggle-btn { margin-right: var(--space-md); color: var(--header-text-color); opacity: 0.8; }
.sidebar-toggle-btn:hover { opacity: 1; background-color: rgba(255,255,255,0.1); }
.logo {
  font-size: 1.6em;
  font-weight: 700; font-family: var(--font-family-serif);
  letter-spacing: 1px; color: var(--header-text-color); text-decoration: none;
}
.logo:hover { opacity:0.9; }
.header-right > * { margin-left: var(--space-md); }
.user-profile-menu { position: relative; display: flex; align-items: center;}
.user-avatar-btn { color: var(--header-text-color); opacity: 0.8; display: flex; align-items: center; gap: var(--space-xs); }
.user-avatar-btn:hover { opacity: 1; background-color: rgba(255,255,255,0.1); }
.user-name-display-sm {
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block; /* Or none, depending on design */
  margin-left: var(--space-xs);
  color: var(--header-text-color);
}
@media (max-width: 768px) { /* Hide name on smaller screens if too crowded */
  .user-name-display-sm { display: none; }
}

.user-dropdown-menu {
  position: absolute; top: calc(100% + var(--space-sm) + 2px); right: 0;
  background-color: var(--modal-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius); box-shadow: var(--box-shadow-strong);
  min-width: 220px; z-index: 1030; padding-top: var(--space-sm); padding-bottom: var(--space-sm);
  animation: fadeInDropdown 0.15s ease-out;
}
@keyframes fadeInDropdown {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-user-info { padding: var(--space-sm) var(--space-md); padding-bottom: var(--space-md); display: flex; flex-direction: column; }
.dropdown-user-info strong { font-weight: 600; color: var(--text-color); }
.dropdown-user-info small { font-size: 0.85em; color: var(--text-color-muted); }
.dropdown-divider { height: 1px; margin: var(--space-sm) 0; overflow: hidden; background-color: var(--border-color); border: 0; }
.dropdown-item { display: flex; align-items:center; gap: 0.75rem; padding: var(--space-sm) var(--space-md); color: var(--text-color); text-decoration: none; white-space: nowrap; font-size: 0.95rem; cursor: pointer; }
.dropdown-item:hover { background-color: var(--bg-color-offset); color: var(--primary-color); }

.btn-icon { background: none; border: none; cursor: pointer; padding: var(--space-sm); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; }
.btn-icon:hover { background-color: var(--bg-tertiary); }
[data-theme="dark"] .btn-icon:hover { background-color: rgba(255,255,255,0.1); }
</style>
