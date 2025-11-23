<template>
  <div class="stat-card card" :style="cardStyle">
    <div class="card-body">
      <div v-if="iconHtml" class="stat-icon-wrapper" :style="{ backgroundColor: iconBgColor || color }">
        <span class="stat-icon" v-html="iconHtml"></span>
      </div>
      <div class="stat-content">
        <h3 class="stat-title">{{ title }}</h3>
        <p class="stat-value">
          <span v-if="prefixUnit">{{ prefixUnit }}</span>{{ value }}<span v-if="suffixUnit">{{ suffixUnit }}</span>
        </p>
        <p v-if="change" class="stat-change" :class="changeTypeClass">
          <span v-if="changeType === 'positive'">▲</span>
          <span v-if="changeType === 'negative'">▼</span>
          {{ change }} <span v-if="changePeriod">vs {{ changePeriod }}</span>
        </p>
      </div>
    </div>
    <div v-if="footerLink && footerText" class="card-footer text-center">
      <router-link :to="footerLink" class="footer-link">{{ footerText }} &rarr;</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: [String, Number],
  iconHtml: String, // Changed from 'icon' to 'iconHtml' to be explicit about v-html usage
  color: String,
  iconBgColor: String,
  prefixUnit: String,
  suffixUnit: String,
  change: String,
  changeType: {
    type: String,
    default: 'neutral' // 'positive', 'negative', 'neutral'
  },
  changePeriod: String,
  footerText: String,
  footerLink: [String, Object]
});

const cardStyle = computed(() => {
  // Removed border-left logic as it conflicts with glassmorphism
  return {};
});

const changeTypeClass = computed(() => {
  if (props.changeType === 'positive') return 'text-success';
  if (props.changeType === 'negative') return 'text-danger';
  return 'text-muted';
});
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  opacity: 0.5;
}

.stat-card .card-body {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1.2rem;
}

.stat-icon-wrapper {
  width: 64px; height: 64px;
  border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, var(--primary-color), #d97706); /* Default fallback */
}

.stat-icon :deep(svg) {
  width: 32px; height: 32px;
  stroke: white; stroke-width: 2px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.stat-content {
  flex-grow: 1; min-width: 0;
  display: flex; flex-direction: column;
}

.stat-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 500;
  display: flex; align-items: center; gap: 0.25rem;
}

.text-success { color: hsl(var(--success-h), var(--success-s), 40%) !important; }
.text-danger { color: hsl(var(--danger-h), var(--danger-s), 50%) !important; }
[data-theme="dark"] .text-success { color: hsl(var(--success-h), var(--success-s), 60%) !important; }
[data-theme="dark"] .text-danger { color: hsl(var(--danger-h), var(--danger-s), 70%) !important; }

.card-footer {
  background: rgba(0,0,0,0.02);
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0;
}

.footer-link {
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 600;
  transition: all 0.2s;
}
.footer-link:hover {
  letter-spacing: 0.02em;
}
</style>
