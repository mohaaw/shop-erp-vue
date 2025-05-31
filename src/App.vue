<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </component>
  <GlobalToaster />
</template>

<script setup>
import { shallowRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import GlobalToaster from '@/components/common/GlobalToaster.vue'; // ADD THIS IMPORT

const route = useRoute();
const layoutComponent = shallowRef(DefaultLayout);

watch(
  () => route.meta,
  async (meta) => {
    if (meta && meta.layout) {
      // Logic for switching layouts, e.g., for an AuthLayout
      // For now, we'll assume it always defaults or falls back to DefaultLayout
      layoutComponent.value = DefaultLayout;
    } else {
      layoutComponent.value = DefaultLayout;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style>
/* Global transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
