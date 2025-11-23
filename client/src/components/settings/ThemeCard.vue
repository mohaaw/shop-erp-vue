<template>
  <div class="theme-card" :class="{ 'is-active': isActive }" @click="$emit('select', theme.name)">
    <div class="theme-preview">
      <div class="preview-header" :style="{ backgroundColor: theme.colors.background }">
        <div class="preview-sidebar" :style="{ backgroundColor: theme.colors.navBg }"></div>
        <div class="preview-content">
          <div class="preview-card" :style="{ backgroundColor: theme.colors.cardBackground }">
            <div class="preview-text" :style="{ backgroundColor: theme.colors.primary }"></div>
            <div class="preview-text secondary" :style="{ backgroundColor: theme.colors.secondary }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="theme-info">
      <h4 class="theme-name">{{ theme.name }}</h4>
      <p class="theme-description">{{ theme.description }}</p>
    </div>
    
    <div class="theme-colors">
      <div 
        v-for="(color, key) in displayColors" 
        :key="key"
        class="color-dot"
        :style="{ backgroundColor: color }"
        :title="key"
      ></div>
    </div>
    
    <div v-if="isActive" class="active-indicator">
      <span>✓ Active</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  theme: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select']);

const displayColors = computed(() => {
  return {
    primary: props.theme.colors.primary,
    secondary: props.theme.colors.secondary,
    accent: props.theme.colors.accent,
    background: props.theme.colors.background
  };
});
</script>

<style scoped>
.theme-card {
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--card-bg-color);
  position: relative;
  overflow: hidden;
}

.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--box-shadow-strong);
  border-color: var(--primary-color);
}

.theme-card.is-active {
  border-color: var(--primary-color);
  border-width: 3px;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
}

.theme-preview {
  width: 100%;
  height: 120px;
  border-radius: calc(var(--border-radius) - 2px);
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: var(--box-shadow-sm);
}

.preview-header {
  display: flex;
  height: 100%;
}

.preview-sidebar {
  width: 30%;
  height: 100%;
}

.preview-content {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card {
  width: 100%;
  height: 80%;
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-text {
  height: 8px;
  border-radius: 2px;
  width: 70%;
}

.preview-text.secondary {
  width: 50%;
}

.theme-info {
  margin-bottom: 0.75rem;
}

.theme-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.theme-description {
  font-size: 0.85rem;
  color: var(--text-color-muted);
  margin: 0;
}

.theme-colors {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  box-shadow: var(--box-shadow-sm);
}

.active-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--primary-color);
  color: var(--text-on-primary);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: var(--box-shadow);
}
</style>
