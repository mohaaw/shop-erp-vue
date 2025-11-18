<template>
  <div class="theme-switch-wrapper" title="Toggle Light/Dark Mode" @click="settingsStore.toggleTheme()">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-color-muted);"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    <label class="theme-switch">
      <input
        type="checkbox"
        :checked="settingsStore.theme === 'dark'"
        @change.stop="settingsStore.toggleTheme()"
        aria-label="Theme toggle"
      >
      <span class="slider"></span>
    </label>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-color-muted);"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settingsStore';
const settingsStore = useSettingsStore();
</script>

<style scoped>
.theme-switch-wrapper { display: flex; align-items: center; gap: 0.5rem; cursor:pointer }
.theme-switch-wrapper svg { opacity: 0.7; }
.theme-switch { display: inline-block; height: 26px; position: relative; width: 50px; }
.theme-switch input { display:none; }
.slider {
  background-color: var(--secondary-color);
  opacity: 0.6;
  bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; top: 0;
  transition: .4s; border-radius: 26px;
}
.slider:before {
  background-color: var(--bg-color); bottom: 3px; content: "";
  height: 20px; left: 3px; position: absolute; transition: .4s;
  width: 20px; border-radius: 50%;
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
}
input:checked + .slider { background-color: var(--primary-color); opacity:1; }
input:checked + .slider:before { transform: translateX(24px); }
</style>
