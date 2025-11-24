<template>
  <div class="number-card card">
    <div class="card-body">
      <div class="card-title">{{ label }}</div>
      <div class="card-value" :style="{ color: color }">{{ value }}</div>
      <div class="card-trend" v-if="trend || trendLabel">
        <span 
          class="trend-indicator" 
          :class="trendClass"
          v-if="trend !== undefined"
        >
          <span v-if="trend > 0">▲</span>
          <span v-else-if="trend < 0">▼</span>
          <span v-else>—</span>
          {{ Math.abs(trend) }}%
        </span>
        <span class="trend-label" v-if="trendLabel">{{ trendLabel }}</span>
      </div>
    </div>
    <router-link v-if="footerText" :to="footerLink" class="card-footer">
      {{ footerText }}
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </router-link>
    <div class="card-icon" v-if="icon" v-html="icon"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: Number, default: undefined },
  trendLabel: { type: String, default: '' },
  color: { type: String, default: 'var(--text-main)' },
  icon: { type: String, default: '' },
  isPositive: { type: Boolean, default: true },
  footerText: { type: String, default: '' },
  footerLink: { type: String, default: '' }
});

const trendClass = computed(() => {
  if (props.trend === undefined) return '';
  if (props.trend === 0) return 'neutral';
  
  if (props.isPositive) {
    return props.trend > 0 ? 'positive' : 'negative';
  } else {
    return props.trend > 0 ? 'negative' : 'positive';
  }
});
</script>

<style scoped>
.number-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}
.number-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-color);
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  text-decoration: none;
}
.card-footer:hover {
  background: var(--bg-color-offset);
}

.card-title {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.trend-indicator {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}
.trend-indicator.positive { color: var(--success-color); }
.trend-indicator.negative { color: var(--danger-color); }
.trend-indicator.neutral { color: var(--text-muted); }

.trend-label {
  color: var(--text-muted);
}

.card-icon {
  position: absolute;
  bottom: -10px;
  right: -10px;
  opacity: 0.05;
  transform: scale(2.5);
  z-index: 1;
  color: var(--text-main);
  pointer-events: none;
}
.card-icon :deep(svg) {
  width: 64px;
  height: 64px;
}
</style>
