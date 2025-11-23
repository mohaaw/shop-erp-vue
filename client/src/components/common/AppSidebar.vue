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
  width: 260px; background-color: var(--nav-bg-color); color: var(--nav-text-color);
  border-inline-end: 1px solid var(--border-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column;
}
.app-sidebar.is-mobile-view {
  position: fixed; inset-inline-start: 0; top: 0; height: 100vh; z-index: 1030;
  transform: translateX(-100%);
}
[dir="rtl"] .app-sidebar.is-mobile-view {
  transform: translateX(100%);
}
.app-sidebar.is-mobile-view:not(.is-collapsed) {
  transform: translateX(0%); width: 260px !important;
}

.app-sidebar:not(.is-mobile-view).is-collapsed { width: 70px; }
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-text,
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu-arrow,
.app-sidebar:not(.is-mobile-view).is-collapsed .sidebar-profile {
  display: none; opacity: 0; pointer-events: none;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-item,
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-icon {
  justify-content: center; padding-inline-start: 0; padding-inline-end: 0;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu { display: none !important; }

.app-sidebar:not(.is-mobile-view).is-hover-expanded {
  width: 260px; box-shadow: var(--box-shadow-strong); z-index: 1010;
}
.app-sidebar.is-hover-expanded .nav-text,
.app-sidebar.is-hover-expanded .submenu-arrow,
.app-sidebar.is-hover-expanded .sidebar-profile {
  display: block; opacity: 1; pointer-events: auto;
}
.app-sidebar.is-hover-expanded .sidebar-profile { text-align: center; }
.app-sidebar.is-hover-expanded .nav-item { justify-content: flex-start; }
.app-sidebar.is-hover-expanded .nav-icon { justify-content: flex-start; }

.sidebar-sticky-content { overflow-y: auto; overflow-x: hidden; height: 100%; padding: var(--space-md) 0; }
.sidebar-profile { padding: 0 var(--space-md) var(--space-md) var(--space-md); border-bottom: 1px solid var(--border-color); text-align: center; white-space: nowrap; overflow: hidden; }
.profile-name { font-size: 1.1rem; font-weight: 600; color: var(--nav-text-color); margin-bottom: var(--space-xs); }
.profile-email { font-size: 0.8rem; color: var(--text-color-muted); word-break: break-all; }
[data-theme="dark"] .profile-email { color: #9E9E9E; }

.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.sidebar-nav li { margin: 0 var(--space-sm); }
.nav-item {
  display: flex; align-items: center; padding: 0.8rem var(--space-md);
  color: var(--nav-text-color); text-decoration: none; border-radius: var(--border-radius);
  margin-bottom: var(--space-xs); transition: background-color 0.2s, color 0.2s, opacity 0.2s;
  white-space: nowrap; cursor: pointer; font-weight: 500; overflow: hidden;
}
.nav-item:hover { background-color: var(--nav-hover-bg); color: var(--nav-hover-text); }
.nav-item.is-active {
  background-color: var(--nav-active-bg); color: var(--nav-active-text) !important;
  font-weight: 600; box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}
.nav-item.is-active .nav-icon, .nav-item.is-active .nav-icon svg,
.nav-item:hover .nav-icon, .nav-item:hover .nav-icon svg {
  color: var(--nav-active-text) !important; stroke: var(--nav-active-text) !important;
}
.nav-icon {
  margin-inline-end: var(--space-md); display: flex; align-items: center;
  min-width: 24px; font-size: 1.2em;
  transition: color 0.2s, margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--nav-text-color);
}
.nav-icon svg { width: 20px; height: 20px; stroke: currentColor; }
.nav-text { flex-grow: 1; opacity: 1; transition: opacity 0.1s 0.1s linear; font-size: 0.95rem; }
.submenu-arrow { margin-inline-start: auto; transition: transform 0.2s ease, opacity 0.1s 0.1s linear; }
.submenu-arrow.arrow-up svg { transform: rotate(180deg); }
.submenu {
  list-style: none; padding-inline-start: calc(var(--space-md) + 24px + var(--space-xs) - var(--space-sm));
  max-height: 0px; overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 0;
}
.nav-item.has-submenu.submenu-open + .submenu,
.app-sidebar.is-hover-expanded .nav-item.has-submenu.submenu-open + .submenu {
  max-height: 500px; opacity: 1;
}
.app-sidebar:not(.is-mobile-view).is-collapsed:not(.is-hover-expanded) .submenu {
  max-height: 0px !important; opacity: 0 !important; overflow: hidden !important;
}
.submenu-item { padding: calc(0.8rem * 0.75) var(--space-md); font-size: 0.9em; }
.submenu-item .nav-text { color: var(--nav-text-color); }
.submenu-item:hover .nav-text { color: var(--primary-hover-color); }
.submenu-item.is-active .nav-text { color: var(--primary-color) !important; font-weight: 600; }
.submenu-item.is-active { background-color: transparent !important; }
.submenu-item:hover { background-color: var(--nav-hover-bg) !important; }
</style>
