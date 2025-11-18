<template>
  <div class="default-layout" :class="{ 'sidebar-visually-collapsed': sidebarState.isEffectivelyCollapsed }">
    <AppHeader
      @toggle-sidebar="handleSidebarToggleRequest"
      :is-mobile-view="sidebarState.isMobileView"
      :is-sidebar-open-on-mobile="!sidebarState.isUserCollapsed && sidebarState.isMobileView"
    />
    <div class="layout-container">
      <AppSidebar
        :is-collapsed="sidebarState.isUserCollapsed"
        :is-mobile-view="sidebarState.isMobileView"
        :is-hover-expanded="sidebarState.isHoveringOverCollapsedSidebar"
        @sidebar-hover-start="handleSidebarHover(true)"
        @sidebar-hover-end="handleSidebarHover(false)"
        @mobile-sidebar-toggled="handleMobileSidebarCloseRequest"
      />
      <main class="main-content" :style="mainContentStyle">
        <div class="page-content-wrapper">
          <slot />
        </div>
      </main>
    </div>
    <div
      v-if="sidebarState.isMobileView && !sidebarState.isUserCollapsed"
      class="mobile-sidebar-overlay"
      @click="handleMobileSidebarCloseRequest"
    ></div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, computed } from 'vue';
import AppHeader from '@/components/common/AppHeader.vue';
import AppSidebar from '@/components/common/AppSidebar.vue';

const SIDEBAR_WIDTH_EXPANDED = '260px';
const SIDEBAR_WIDTH_COLLAPSED = '70px';

const sidebarState = reactive({
  isUserCollapsed: localStorage.getItem('shopErpSidebarCollapsed') === 'true',
  isMobileView: window.innerWidth < 992,
  isHoveringOverCollapsedSidebar: false,
  get isEffectivelyCollapsed() {
    if (this.isMobileView) return this.isUserCollapsed;
    return this.isUserCollapsed && !this.isHoveringOverCollapsedSidebar;
  }
});
const mainContentStyle = computed(() => {
  // Margin-left is now handled by CSS media queries for better performance and consistency
  return {};
});
const handleSidebarToggleRequest = () => {
  sidebarState.isUserCollapsed = !sidebarState.isUserCollapsed;
  localStorage.setItem('shopErpSidebarCollapsed', sidebarState.isUserCollapsed.toString());
  if (sidebarState.isMobileView) sidebarState.isHoveringOverCollapsedSidebar = false;
};
const handleMobileSidebarCloseRequest = () => {
  if (sidebarState.isMobileView) {
    sidebarState.isUserCollapsed = true;
    localStorage.setItem('shopErpSidebarCollapsed', sidebarState.isUserCollapsed.toString());
  }
};
const handleSidebarHover = (isHovering) => {
  if (!sidebarState.isMobileView && sidebarState.isUserCollapsed) {
    sidebarState.isHoveringOverCollapsedSidebar = isHovering;
  }
};
const updateScreenState = () => {
  const newIsMobileView = window.innerWidth < 992;
  if (newIsMobileView && !sidebarState.isMobileView) {
    sidebarState.isUserCollapsed = true;
    sidebarState.isHoveringOverCollapsedSidebar = false;
    localStorage.setItem('shopErpSidebarCollapsed', 'true');
  } else if (!newIsMobileView && sidebarState.isMobileView) {
    sidebarState.isUserCollapsed = localStorage.getItem('shopErpSidebarCollapsed') === 'true';
  }
  sidebarState.isMobileView = newIsMobileView;
};
onMounted(() => {
  window.addEventListener('resize', updateScreenState); updateScreenState();
});
onUnmounted(() => { window.removeEventListener('resize', updateScreenState); });
</script>

<style scoped>
.default-layout { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: var(--bg-color); }
.layout-container { display: flex; flex-grow: 1; overflow: hidden; position: relative; }
.main-content { flex-grow: 1; overflow-y: auto; padding: var(--space-lg); background-color: var(--bg-color); transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-left: 0; }

@media (min-width: 992px) {
  .default-layout:not(.sidebar-visually-collapsed) .main-content {
    margin-left: 260px;
  }
  .default-layout.sidebar-visually-collapsed .main-content {
    margin-left: 70px;
  }
}

.page-content-wrapper { padding-bottom: var(--space-xl); }
.main-content { padding-top: var(--space-md); }

@media (max-width: 768px) {
  .main-content { padding: var(--space-md); }
}

.mobile-sidebar-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 1025;
}
</style>
