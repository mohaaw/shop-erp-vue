<template>
  <div class="toast-container">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.type}`"
        @click="!toast.persistent && toastStore.removeToast(toast.id)"
        role="alert"
        aria-live="assertive"
      >
        <span class="toast-icon" v-html="getIcon(toast.type)" aria-hidden="true"></span>
        <span class="toast-message">{{ toast.message }}</span>
        <button
          v-if="toast.persistent || !toast.duration"
        @click.stop="toastStore.removeToast(toast.id)"
        class="toast-close-btn"
        aria-label="Close toast"
        >&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore';

const toastStore = useToastStore();

const icons = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

const getIcon = (type) => {
  return icons[type] || icons.info;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  z-index: 2000;
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-md);
  width: auto;
  max-width: 380px; /* Increased max width */
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-md); /* Increased gap */
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-strong);
  color: var(--text-color-inverted);
  font-size: 0.95rem;
  border-left-width: 5px;
  border-left-style: solid;
  cursor: default; /* Default cursor, click on close button */
  transition: opacity 0.4s ease, transform 0.4s ease;
}
/* Non-persistent toasts can be clickable to dismiss */
.toast:not([class*="toast-persistent"]) { /* This selector is tricky, handle logic in JS */
  /* cursor: pointer; */ /* Removed, as click is on whole toast to dismiss if not persistent */
}


.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.toast-icon :deep(svg) {
  stroke: currentColor;
}
.toast-message {
  flex-grow: 1;
  word-break: break-word;
}
.toast-close-btn {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0 var(--space-xs);
  margin-left: var(--space-sm);
  cursor: pointer;
}
.toast-close-btn:hover {
  opacity: 1;
}

/* Specific toast types (ensure CSS variables for darken are defined or use hex) */
.toast-success { background-color: var(--success-color); border-left-color: var(--success-color); }
.toast-error   { background-color: var(--danger-color); border-left-color: var(--danger-color); }
.toast-info    { background-color: var(--info-color); border-left-color: var(--info-color); }
.toast-warning {
  background-color: var(--warning-color);
  border-left-color: var(--warning-color);
  color: var(--text-on-primary); /* Or var(--text-color) if warning bg is light */
}
[data-theme="light"] .toast-warning { color: var(--text-color); }


.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s ease-out;
}
.toast-fade-leave-active { /* For items leaving the list */
  position: absolute;
  /* width: 100%; /* This can be problematic, ensure it doesn't overlap */
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px); /* Slight scale and slide up */
}
</style>
