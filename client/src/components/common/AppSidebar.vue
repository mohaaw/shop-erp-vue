<template>
  <aside
    class="app-sidebar"
    :class="{
      'is-collapsed': isEffectivelyCollapsedForCss, /* Use a more direct computed for class if needed */
      'is-mobile-view': isMobileView,
      'is-hover-expanded': isHoverExpandedState /* Renamed for clarity from internal ref */
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
              <span class="nav-text">{{ item.name }}</span>
            </router-link>
            <div v-else class="nav-item has-submenu" @click="toggleSubmenu(item.name)" :class="{'submenu-open': isSubmenuDisplayable(item.name)}">
              <span class="nav-icon" v-html="item.icon"></span>
              <span class="nav-text">{{ item.name }}</span>
              <span class="submenu-arrow" :class="{'arrow-up': openSubmenus[item.name]}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            <ul v-if="item.children && isSubmenuDisplayable(item.name)"
                class="submenu"
                :style="{ maxHeight: isSubmenuDisplayable(item.name) ? '500px' : '0px' }">
              <li v-for="child in item.children" :key="child.name">
                <router-link :to="child.to" class="nav-item submenu-item" active-class="is-active" @click="linkClicked(child)">
                  <span class="nav-text">{{ child.name }}</span>
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

const props = defineProps({
  isCollapsed: Boolean, // User's preference for collapsed state (from DefaultLayout)
  isMobileView: Boolean, // Is the view mobile (from DefaultLayout)
  // isHoverExpanded prop removed, AppSidebar will manage its internal hover state for expansion
});

const emit = defineEmits(['sidebar-hover-start', 'sidebar-hover-end', 'mobile-sidebar-toggled']);

const settingsStore = useSettingsStore();
const route = useRoute();
const openSubmenus = ref({});

// This ref now specifically tracks if the mouse is currently hovering
// to expand a user-collapsed sidebar on desktop.
const isHoverExpandedState = ref(false);

// Determines if the sidebar should appear visually collapsed
const isEffectivelyCollapsedForCss = computed(() => {
  if (props.isMobileView) {
    return props.isCollapsed; // On mobile, collapsed prop directly means hidden/closed
  }
  // On desktop, it's collapsed if user set it AND not currently hover-expanded
  return props.isCollapsed && !isHoverExpandedState.value;
});

// Determines if the profile area should be shown
const showProfileArea = computed(() => {
  if (props.isMobileView) return !props.isCollapsed; // Show if mobile sidebar is open
  return !props.isCollapsed || isHoverExpandedState.value; // Show if desktop expanded OR hover-expanded
});


const icons = {
  dashboard: `📊`, products: `📦`, customers: `👥`, pos: `🛒`, sales: `📈`,
  reports: `📋`,
  settings: `⚙️`
};

const navigationItems = ref([
  { name: 'Dashboard', to: '/', icon: icons.dashboard },
  {
    name: 'Products', icon: icons.products,
    children: [ { name: 'View Products', to: '/products' }, { name: 'Add Product', to: '/products/add' } ]
  },
  { name: 'Customers', to: '/customers', icon: icons.customers },
  { name: 'Point of Sale', to: '/pos', icon: icons.pos },
  { name: 'Sales History', to: '/sales', icon: icons.sales },
  { name: 'Reports Center', to: '/reports', icon: icons.reports },
  { name: 'Settings', to: '/settings', icon: icons.settings },
]);

const toggleSubmenu = (itemName) => {
  // If on desktop, collapsed, and not yet hover-expanded, trigger hover expansion first
  if (!props.isMobileView && props.isCollapsed && !isHoverExpandedState.value) {
    handleMouseEnter(); // Simulate hover start to expand
    // Then toggle submenu after a brief delay for visual expansion
    setTimeout(() => {
      openSubmenus.value[itemName] = !openSubmenus.value[itemName];
    }, 50);
  } else {
    openSubmenus.value[itemName] = !openSubmenus.value[itemName];
  }
};

// Determines if a submenu's content should be rendered and visible
const isSubmenuDisplayable = (itemName) => {
  if (props.isMobileView && props.isCollapsed) return false; // Hidden if mobile sidebar is closed
  if (!props.isMobileView && props.isCollapsed && !isHoverExpandedState.value) return false; // Hidden if desktop collapsed & not hovered
  return !!openSubmenus.value[itemName]; // Otherwise, depends on its toggle state
};

const linkClicked = (item) => {
  if(props.isMobileView){
    emit('mobile-sidebar-toggled'); // Signal parent to close mobile sidebar
  }
  // If not a parent item, close all other submenus (optional behavior)
  if (!item.children) {
    Object.keys(openSubmenus.value).forEach(key => {
      const navItem = navigationItems.value.find(nav => nav.name === key);
      let isParentOfCurrent = false;
      if (navItem && navItem.children) {
        isParentOfCurrent = navItem.children.some(child => route.path === child.to || (child.to !== '/' && route.path.startsWith(child.to)));
      }
      if (!isParentOfCurrent) { // Close other submenus not related to current active path
        // This might be too aggressive if navigating within same parent.
        // Better: auto-open current parent, explicitly close others on link click.
        // For now, clicking a direct link doesn't force-close other submenus.
      }
    });
  }
};

const handleMouseEnter = () => {
  if(!props.isMobileView && props.isCollapsed){
    isHoverExpandedState.value = true;
    emit('sidebar-hover-start'); // Let parent know for potential main content margin adjustment
  }
}
const handleMouseLeave = () => {
  if(!props.isMobileView && props.isCollapsed){
    isHoverExpandedState.value = false;
    emit('sidebar-hover-end');
    // Close all submenus when hover ends and it was user-collapsed
    Object.keys(openSubmenus.value).forEach(key => {
      openSubmenus.value[key] = false;
    });
  }
}

// When sidebar is externally forced to collapse (e.g., by parent), reset hover state and close submenus
watch(() => props.isCollapsed, (newValIsCollapsed) => {
  if (newValIsCollapsed) {
    isHoverExpandedState.value = false; // Reset hover effect
    if (!props.isMobileView) { // Only close all submenus if collapsed on desktop
      Object.keys(openSubmenus.value).forEach(key => {
        openSubmenus.value[key] = false;
      });
    }
  }
});

// When switching to mobile view, reset hover state
watch(() => props.isMobileView, (newIsMobile) => {
  if (newIsMobile) {
    isHoverExpandedState.value = false;
    // If mobile view becomes active AND sidebar is marked as "open" (isCollapsed=false for mobile)
    // ensure submenus related to current route are open
    if (!props.isCollapsed) {
      autoOpenActiveSubmenu(route);
    }
  } else {
    // Switched to desktop view, re-evaluate active submenus based on expanded state
    if (!props.isCollapsed) { // If desktop sidebar is expanded
      autoOpenActiveSubmenu(route);
    } else { // Desktop sidebar is collapsed, close all
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
      } else if (openSubmenus.value[item.name] && !isChildActive) {
        // Optionally close if no child is active, unless manually kept open
        // For now, we only auto-open. User can manually close.
      }
    }
  });
};

// Auto-open parent submenu if a child route is active on initial load or direct navigation
watch(route, (currentRoute) => {
  // Only auto-open if not collapsed and not on mobile (or if mobile and sidebar is open)
  if ((!props.isMobileView && !props.isCollapsed) || (props.isMobileView && !props.isCollapsed) || isHoverExpandedState.value) {
    autoOpenActiveSubmenu(currentRoute);
  }
}, { immediate: true, deep: true });
</script>

<style scoped>
/* Styles from previous AppSidebar.vue version, ensure they match main.css needs */
.app-sidebar {
  width: 260px; background-color: var(--nav-bg-color); color: var(--nav-text-color);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; flex-shrink: 0; display: flex; flex-direction: column;
}
.app-sidebar.is-mobile-view {
  position: fixed; left: 0; top: 0; height: 100vh; z-index: 1030;
  transform: translateX(-100%);
}
.app-sidebar.is-mobile-view:not(.is-collapsed) { /* is-collapsed on mobile means "is closed" */
  transform: translateX(0%); width: 260px !important;
}

/* Desktop collapsed state - controlled by isEffectivelyCollapsedForCss */
.app-sidebar:not(.is-mobile-view).is-collapsed { width: 70px; }
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-text,
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu-arrow,
.app-sidebar:not(.is-mobile-view).is-collapsed .sidebar-profile {
  display: none; opacity: 0; pointer-events: none;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-item,
.app-sidebar:not(.is-mobile-view).is-collapsed .nav-icon {
  justify-content: center; padding-left: 0; padding-right: 0;
}
.app-sidebar:not(.is-mobile-view).is-collapsed .submenu { display: none !important; }

/* Desktop hover-expanded state - controlled by is-hover-expanded class */
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
  margin-right: var(--space-md); display: flex; align-items: center;
  min-width: 24px; font-size: 1.2em;
  transition: color 0.2s, margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--nav-text-color);
}
.nav-icon svg { width: 20px; height: 20px; stroke: currentColor; }
.nav-text { flex-grow: 1; opacity: 1; transition: opacity 0.1s 0.1s linear; font-size: 0.95rem; }
.submenu-arrow { margin-left: auto; transition: transform 0.2s ease, opacity 0.1s 0.1s linear; }
.submenu-arrow.arrow-up svg { transform: rotate(180deg); }
.submenu {
  list-style: none; padding-left: calc(var(--space-md) + 24px + var(--space-xs) - var(--space-sm));
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
