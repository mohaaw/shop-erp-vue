<template>
  <div class="chart-placeholder-widget card">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">
      <div class="placeholder-content">
        <span v-html="icon" class="placeholder-icon"></span>
        <p>Chart data for "{{ title }}" will be displayed here.</p>
        <small>(Integration with a charting library like Chart.js or ApexCharts needed)</small>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  icon: String // HTML for SVG icon
});
</script>

<style scoped>
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Adjust as needed */
  text-align: center;
  color: var(--text-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
}
.placeholder-icon {
  font-size: 2.5rem; /* Size of the icon itself */
  margin-bottom: var(--space-md);
  opacity: 0.6;
}
.placeholder-icon :deep(svg) {
  width: 48px;
  height: 48px;
  stroke: var(--text-tertiary);
}
.placeholder-content p {
  font-size: 1rem;
  margin-bottom: var(--space-sm);
}
.placeholder-content small {
  font-size: 0.85rem;
}
</style>
