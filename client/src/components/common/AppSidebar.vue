<template>
  <aside
    class="app-sidebar"
    :class="{
      'is-collapsed': isEffectivelyCollapsedForCss,
      'is-mobile-view': isMobileView,
      'is-hover-expanded': isHoverExpandedState
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="sidebar-sticky-content">
      <div v-if="showProfileArea" class="sidebar-profile mb-3 text-center">
        <h4 class="profile-name">{{ settingsStore.storeName }}</h4>
        <small class="profile-email">Admin User (admin@example.com)</small>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li v-for="item in navigationItems" :key="item.name">
            <router-link v-if="!item.children" :to="item.to" class="nav-item" active-class="is-active" @click="linkClicked(item)">
              <span class="nav-icon" v-html="item.icon"></span>
              <span class="nav-text">{{ $t(item.name) }}</span>
            </router-link>
            <div v-else class="nav-item has-submenu" @click="toggleSubmenu(item.name)" :class="{'submenu-open': isSubmenuDisplayable(item.name)}">
              <span class="nav-icon" v-html="item.icon"></span>
              <span class="nav-text">{{ $t(item.name) }}</span>
              <span class="submenu-arrow" :class="{'arrow-up': openSubmenus[item.name]}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <ul v-if="item.children && isSubmenuDisplayable(item.name)"
                class="submenu"
                :style="{ maxHeight: isSubmenuDisplayable(item.name) ? '500px' : '0px' }">
              <li v-for="child in item.children" :key="child.name">
                <router-link :to="child.to" class="nav-item submenu-item" active-class="is-active" @click="linkClicked(child)">
                  <span class="nav-text">{{ $t(child.name) }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  isCollapsed: Boolean,
  isMobileView: Boolean,
});

const emit = defineEmits(['sidebar-hover-start', 'sidebar-hover-end', 'mobile-sidebar-toggled']);

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const route = useRoute();
const openSubmenus = ref({});
const isHoverExpandedState = ref(false);

const isEffectivelyCollapsedForCss = computed(() => {
  if (props.isMobileView) {
    return props.isCollapsed;
  }
  return props.isCollapsed && !isHoverExpandedState.value;
});

const showProfileArea = computed(() => {
  if (props.isMobileView) return !props.isCollapsed;
  return !props.isCollapsed || isHoverExpandedState.value;
});

const icons = {
  dashboard: `📊`, products: `📦`, customers: `👥`, pos: `🛒`, sales: `📈`,
  reports: `📋`,
  settings: `⚙️`,
  inventory: `🏭`,
  suppliers: `🚚`,
  employees: `👔`,
  admin: `🛡️`
};

const navigationItems = computed(() => {
  const items = [
    { name: 'common.dashboard', to: '/', icon: icons.dashboard },
    {
      name: 'common.products', icon: icons.products,
      children: [ { name: 'common.products', to: '/products' }, { name: 'common.add', to: '/products/add' } ]
    },
    {
      name: 'common.inventory', icon: icons.inventory,
      children: [ { name: 'common.inventory', to: '/inventory' }, { name: 'common.transfers', to: '/transfers' } ]
    },
    { name: 'common.suppliers', to: '/suppliers', icon: icons.suppliers },
    { name: 'common.customers', to: '/customers', icon: icons.customers },
    { name: 'common.employees', to: '/employees', icon: icons.employees },
    { name: 'common.pos', to: '/pos', icon: icons.pos },
    { name: 'common.sales', to: '/sales', icon: icons.sales },
    { name: 'common.reports', to: '/reports', icon: icons.reports },
    { name: 'common.settings', to: '/settings', icon: icons.settings },
  ];

  if (userStore.isAdmin) {
    items.push({ name: 'admin.title', to: '/admin', icon: icons.admin });
  }

  return items;
});

const toggleSubmenu = (itemName) => {
  if (!props.isMobileView && props.isCollapsed && !isHoverExpandedState.value) {
    handleMouseEnter();
    setTimeout(() => {
      openSubmenus.value[itemName] = !openSubmenus.value[itemName];
    }, 50);
  } else {
    openSubmenus.value[itemName] = !openSubmenus.value[itemName];
  }
};

const isSubmenuDisplayable = (itemName) => {
  if (props.isMobileView && props.isCollapsed) return false;
  if (!props.isMobileView && props.isCollapsed && !isHoverExpandedState.value) return false;
  return !!openSubmenus.value[itemName];
};

const linkClicked = (item) => {
  if(props.isMobileView){
    emit('mobile-sidebar-toggled');
  }
  if (!item.children) {
    Object.keys(openSubmenus.value).forEach(key => {
      const navItem = navigationItems.value.find(nav => nav.name === key);
      let isParentOfCurrent = false;
      if (navItem && navItem.children) {
        isParentOfCurrent = navItem.children.some(child => route.path === child.to || (child.to !== '/' && route.path.startsWith(child.to)));
      }
    });
  }
};

const handleMouseEnter = () => {
  if(!props.isMobileView && props.isCollapsed){
    isHoverExpandedState.value = true;
    emit('sidebar-hover-start');
  }
}
const handleMouseLeave = () => {
  if(!props.isMobileView && props.isCollapsed){
    isHoverExpandedState.value = false;
    emit('sidebar-hover-end');
    Object.keys(openSubmenus.value).forEach(key => {
      openSubmenus.value[key] = false;
    });
  }
}

watch(() => props.isCollapsed, (newValIsCollapsed) => {
  if (newValIsCollapsed) {
    isHoverExpandedState.value = false;
    if (!props.isMobileView) {
      Object.keys(openSubmenus.value).forEach(key => {
        openSubmenus.value[key] = false;
      });
    }
  }
});

watch(() => props.isMobileView, (newIsMobile) => {
  if (newIsMobile) {
    isHoverExpandedState.value = false;
    if (!props.isCollapsed) {
      autoOpenActiveSubmenu(route);
    }
  } else {
    if (!props.isCollapsed) {
      autoOpenActiveSubmenu(route);
    } else {
      Object.keys(openSubmenus.value).forEach(key => {
        openSubmenus.value[key] = false;
      });
    }
  }
});

const autoOpenActiveSubmenu = (currentRoute) => {
  navigationItems.value.forEach(item => {
    if (item.children) {
      const isChildActive = item.children.some(child =>
        currentRoute.path === child.to ||
        (child.to !== '/' && currentRoute.path.startsWith(child.to.split('/:')[0]))
      );
      if (isChildActive) {
        openSubmenus.value[item.name] = true;
      }
    }
  });
};

watch(route, (currentRoute) => {
  if ((!props.isMobileView && !props.isCollapsed) || (props.isMobileView && !props.isCollapsed) || isHoverExpandedState.value) {
    autoOpenActiveSubmenu(currentRoute);
  }
}, { immediate: true, deep: true });
</script>

<style scoped>
.app-sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-inline-end: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column;
  z-index: 50;
}

[data-theme="dark"] .app-sidebar {
  background: rgba(15, 23, 42, 0.6);
  border-inline-end: 1px solid rgba(255, 255, 255, 0.05);
}

.app-sidebar.is-mobile-view {
  position: fixed; inset-inline-start: 0; top: 0; height: 100vh; z-index: 1030;
  transform: translateX(-100%);
  box-shadow: 20px 0 40px rgba(0,0,0,0.2);
}

[dir="rtl"] .app-sidebar.is-mobile-view { transform: translateX(100%); }
.app-sidebar.is-mobile-view:not(.is-collapsed) { transform: translateX(0%); width: 280px !important; }

.app-sidebar:not(.is-mobile-view).is-collapsed { width: 80px; }
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-text,
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu-arrow,
.app-sidebar:not(.is-mobile-view).is-collapsed .sidebar-profile {
  display: none; opacity: 0; pointer-events: none;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-item,
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-icon {
  justify-content: center; padding-inline-start: 0; padding-inline-end: 0; margin-inline-end: 0;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu { display: none !important; }

.app-sidebar:not(.is-mobile-view).is-hover-expanded {
  width: 280px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); z-index: 1010;
}
.app-sidebar.is-hover-expanded .nav-text,
.app-sidebar.is-hover-expanded .submenu-arrow,
.app-sidebar.is-hover-expanded .sidebar-profile {
  display: block; opacity: 1; pointer-events: auto;
}
.app-sidebar.is-hover-expanded .sidebar-profile { text-align: center; }
.app-sidebar.is-hover-expanded .nav-item { justify-content: flex-start; }
.app-sidebar.is-hover-expanded .nav-icon { justify-content: flex-start; margin-inline-end: var(--space-md); }

.sidebar-sticky-content { overflow-y: auto; overflow-x: hidden; height: 100%; padding: var(--space-md); }
.sidebar-profile { padding: 0 0 var(--space-lg) 0; border-bottom: 1px solid var(--border-color); text-align: center; white-space: nowrap; overflow: hidden; margin-bottom: var(--space-md); }
.profile-name { font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem; letter-spacing: -0.02em; }
.profile-email { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }

.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.sidebar-nav li { margin-bottom: 0.25rem; }

.nav-item {
  display: flex; align-items: center; padding: 0.9rem 1rem;
  color: var(--text-muted); text-decoration: none; border-radius: 0.75rem;
  transition: all 0.3s ease; white-space: nowrap; cursor: pointer; font-weight: 500;
  position: relative; overflow: hidden;
}

.nav-item:hover {
  background-color: var(--nav-hover-bg); color: var(--primary-color);
  transform: translateX(4px);
}
[dir="rtl"] .nav-item:hover { transform: translateX(-4px); }

.nav-item.is-active {
  background: var(--nav-active-bg);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.4);
}

.nav-item.is-active .nav-icon, .nav-item.is-active .nav-icon svg {
  color: white !important; stroke: white !important;
}

.nav-icon {
  margin-inline-end: 1rem; display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; font-size: 1.2em;
  transition: all 0.3s ease;
}
.nav-icon svg { width: 22px; height: 22px; stroke-width: 2px; }

.nav-text { flex-grow: 1; font-size: 0.95rem; letter-spacing: 0.01em; }

.submenu-arrow { margin-inline-start: auto; transition: transform 0.3s ease; opacity: 0.6; }
.submenu-arrow.arrow-up svg { transform: rotate(180deg); }

.submenu {
  list-style: none; padding-inline-start: 1.5rem;
  max-height: 0px; overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  opacity: 0; margin-top: 0.25rem;
}

.nav-item.has-submenu.submenu-open + .submenu,
.app-sidebar.is-hover-expanded .nav-item.has-submenu.submenu-open + .submenu {
  max-height: 500px; opacity: 1;
}

.submenu-item {
  padding: 0.7rem 1rem; font-size: 0.9em; border-radius: 0.5rem;
  color: var(--text-muted);
}
.submenu-item:hover { color: var(--primary-color); background: rgba(0,0,0,0.03); }
.submenu-item.is-active { color: var(--primary-color) !important; font-weight: 600; background: rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1) !important; }
</style>
