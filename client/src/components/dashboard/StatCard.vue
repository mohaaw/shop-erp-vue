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
  if (props.color && !props.iconBgColor) {
    return { borderLeft: `4px solid ${props.color}` };
  }
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
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-strong);
}
.stat-card .card-body {
  display: flex;
  align-items: flex-start;
  padding: 1rem 1.2rem;
  min-height: 120px;
  gap: 0.8rem;
}
.stat-icon-wrapper {
  font-size: 1.5rem;
  padding: 0.8rem;
  border-radius: 50%;
  color: white;
  margin-inline-end: 1.2rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon :deep(svg) {
  width: 28px;
  height: 28px;
  stroke: white;
}
.stat-icon { /* For emoji icons if passed as simple string to v-html */
  line-height: 1;
}

.stat-content {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.stat-title {
  font-size: 0.9rem;
  color: var(--text-color-muted);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
  font-weight: 600;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}
.stat-change {
  font-size: 0.85rem;
  margin-bottom: 0;
}
.text-success { color: var(--success-color) !important; }
.text-danger { color: var(--danger-color) !important; }
.text-muted { color: var(--text-tertiary) !important; }

.card-footer {
  background-color: var(--bg-tertiary);
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--border-color);
}
.footer-link {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
}
.footer-link:hover {
  color: var(--accent-color);
  text-decoration: underline;
}
</style>
