<template>
  <aside
    class="desk-sidebar"
    :class="{
      'is-collapsed': isEffectivelyCollapsedForCss,
      'is-mobile-view': isMobileView,
      'is-hover-expanded': isHoverExpandedState
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="sidebar-header">
      <div class="brand-area">
        <div class="brand-logo">
          <span class="brand-initial">{{ settingsStore.storeName.charAt(0) }}</span>
        </div>
        <div class="brand-text" v-if="!isEffectivelyCollapsedForCss || isHoverExpandedState">
          <h4 class="store-name">{{ settingsStore.storeName }}</h4>
        </div>
      </div>
    </div>

    <div class="sidebar-content">
      <nav class="desk-nav">
        <ul>
          <li v-for="item in navigationItems" :key="item.name" class="nav-group">
            <template v-if="!item.children">
              <router-link :to="item.to" class="desk-nav-item" active-class="is-active" @click="linkClicked(item)">
                <span class="nav-icon" v-html="item.icon"></span>
                <span class="nav-label">{{ $t(item.name) }}</span>
              </router-link>
            </template>
            
            <template v-else>
              <div 
                class="desk-nav-item has-submenu" 
                :class="{ 'is-open': isSubmenuDisplayable(item.name) }"
                @click="toggleSubmenu(item.name)"
              >
                <span class="nav-icon" v-html="item.icon"></span>
                <span class="nav-label">{{ $t(item.name) }}</span>
                <span class="submenu-indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
              <ul 
                class="desk-submenu"
                :style="{ maxHeight: isSubmenuDisplayable(item.name) ? '500px' : '0px' }"
              >
                <li v-for="child in item.children" :key="child.name">
                  <router-link :to="child.to" class="desk-submenu-item" active-class="is-active" @click="linkClicked(child)">
                    <span class="submenu-dot"></span>
                    <span class="submenu-label">{{ $t(child.name) }}</span>
                  </router-link>
                </li>
              </ul>
            </template>
          </li>
        </ul>
      </nav>
    </div>
    
    <div class="sidebar-footer" v-if="!isEffectivelyCollapsedForCss || isHoverExpandedState">
      <div class="user-profile">
        <div class="avatar">A</div>
        <div class="user-info">
          <span class="user-name">Administrator</span>
          <span class="user-role">System Manager</span>
        </div>
      </div>
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
  if (props.isMobileView) return props.isCollapsed;
  return props.isCollapsed && !isHoverExpandedState.value;
});

// Feather Icons (SVG)
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  products: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  inventory: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`, // Using User icon as placeholder for inventory if specific one not found, or box
  suppliers: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1z"></path><path d="M16 8h4l3 3v5h-7V8z"></path><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  customers: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  employees: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  pos: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  sales: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  reports: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  admin: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
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
    // Close other submenus if needed, or keep logic simple
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
.desk-sidebar {
  width: 240px;
  background: var(--sidebar-background);
  border-inline-end: 1px solid var(--sidebar-border);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column;
  z-index: 50;
  height: 100vh;
  position: sticky;
  top: 0;
}

[data-theme="dark"] .desk-sidebar {
  background: var(--sidebar-background);
  border-inline-end: 1px solid var(--sidebar-border);
}

.desk-sidebar.is-mobile-view {
  position: fixed; inset-inline-start: 0; top: 0; height: 100vh; z-index: 1030;
  transform: translateX(-100%);
  box-shadow: 20px 0 40px rgba(0,0,0,0.1);
}

[dir="rtl"] .desk-sidebar.is-mobile-view { transform: translateX(100%); }
.desk-sidebar.is-mobile-view:not(.is-collapsed) { transform: translateX(0%); width: 240px !important; }

/* Collapsed State */
.desk-sidebar:not(.is-mobile-view).is-collapsed { width: 60px; }
.desk-sidebar:not(.is-mobile-view).is-collapsed .nav-label,
.desk-sidebar:not(.is-mobile-view).is-collapsed .submenu-indicator,
.desk-sidebar:not(.is-mobile-view).is-collapsed .brand-text,
.desk-sidebar:not(.is-mobile-view).is-collapsed .sidebar-footer {
  display: none; opacity: 0; pointer-events: none;
}
.desk-sidebar:not(.is-mobile-view).is-collapsed .desk-nav-item {
  justify-content: center; padding-inline: 0;
}
.desk-sidebar:not(.is-mobile-view).is-collapsed .nav-icon {
  margin-inline-end: 0;
}
.desk-sidebar:not(.is-mobile-view).is-collapsed .desk-submenu { display: none !important; }

/* Hover Expanded */
.desk-sidebar:not(.is-mobile-view).is-hover-expanded {
  width: 240px; box-shadow: 4px 0 24px rgba(0,0,0,0.05); z-index: 1010;
}
.desk-sidebar.is-hover-expanded .nav-label,
.desk-sidebar.is-hover-expanded .submenu-indicator,
.desk-sidebar.is-hover-expanded .brand-text,
.desk-sidebar.is-hover-expanded .sidebar-footer {
  display: block; opacity: 1; pointer-events: auto;
}
.desk-sidebar.is-hover-expanded .desk-nav-item { justify-content: flex-start; padding-inline: 12px; }
.desk-sidebar.is-hover-expanded .nav-icon { margin-inline-end: 10px; }

/* Header */
.sidebar-header {
  height: 60px; display: flex; align-items: center; padding: 0 16px;
  border-bottom: 1px solid var(--sidebar-border);
}
.brand-area { display: flex; align-items: center; gap: 12px; width: 100%; }
.brand-logo {
  width: 32px; height: 32px; background: var(--primary-color); color: white;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; flex-shrink: 0;
}
.brand-text { white-space: nowrap; overflow: hidden; }
.store-name { font-size: 14px; font-weight: 600; color: var(--text-main); margin: 0; }

/* Content */
.sidebar-content { flex: 1; overflow-y: auto; padding: 12px; }
.desk-nav ul { list-style: none; padding: 0; margin: 0; }
.nav-group { margin-bottom: 4px; }

/* Nav Items */
.desk-nav-item {
  display: flex; align-items: center; padding: 8px 12px;
  color: var(--text-main); text-decoration: none; border-radius: 6px;
  transition: all 0.2s ease; cursor: pointer; font-size: 14px; font-weight: 500;
  user-select: none;
}
.desk-nav-item:hover {
  background-color: var(--sidebar-active-bg);
}
.desk-nav-item.is-active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
}
.desk-nav-item.is-active .nav-icon {
  color: var(--sidebar-active-text);
}

.nav-icon {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; margin-inline-end: 10px;
  color: var(--text-muted); transition: color 0.2s;
}
.nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Submenu */
.submenu-indicator { margin-inline-start: auto; color: var(--text-muted); transition: transform 0.2s; }
.desk-nav-item.is-open .submenu-indicator { transform: rotate(180deg); }

.desk-submenu {
  list-style: none; padding-inline-start: 26px; overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.desk-submenu-item {
  display: flex; align-items: center; padding: 6px 12px;
  color: var(--text-muted); text-decoration: none; border-radius: 4px;
  font-size: 13px; margin-top: 2px;
}
.desk-submenu-item:hover { color: var(--text-main); background: rgba(0,0,0,0.03); }
.desk-submenu-item.is-active {
  color: var(--primary-color);
  background: transparent;
  font-weight: 600;
}
.submenu-dot {
  width: 4px; height: 4px; background: currentColor; border-radius: 50%;
  margin-inline-end: 8px; opacity: 0.6;
}

/* Footer */
.sidebar-footer {
  padding: 12px 16px; border-top: 1px solid var(--sidebar-border);
}
.user-profile { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 32px; height: 32px; background: var(--secondary-color); color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.user-info { display: flex; flex-direction: column; overflow: hidden; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text-main); }
.user-role { font-size: 11px; color: var(--text-muted); }
</style>
