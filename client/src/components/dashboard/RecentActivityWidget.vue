<template>
  <div class="recent-activity-widget card">
    <div class="card-header">Recent Activity</div>
    <div class="card-body">
      <ul v-if="activities.length" class="activity-list">
        <li v-for="activity in activities" :key="activity.id" class="activity-item">
          <div class="activity-icon-wrapper" :style="{ backgroundColor: activity.iconBg }">
            <span class="activity-icon" v-html="activity.icon"></span>
          </div>
          <div class="activity-content">
            <p class="activity-text" v-html="activity.text"></p>
            <small class="activity-time">{{ activity.time }}</small>
          </div>
        </li>
      </ul>
      <p v-else class="text-center text-muted">No recent activity to display.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const icons = {
  sale: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  product: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
  customer: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>`
};

const activities = ref([
  { id: 1, icon: icons.sale, iconBg: 'var(--success-color)', text: "New sale <strong>#ORD-12346</strong> processed for <strong>$79.99</strong>.", time: "2 minutes ago" },
  { id: 2, icon: icons.product, iconBg: 'var(--info-color)', text: "Product <strong>'Wireless Ergonomic Mouse'</strong> stock updated.", time: "15 minutes ago" },
  { id: 3, icon: icons.customer, iconBg: 'var(--primary-color)', text: "New customer <strong>'Alice Wonderland'</strong> registered.", time: "1 hour ago" },
  { id: 4, icon: icons.product, iconBg: 'var(--warning-color)', text: "Product <strong>'Mechanical Keyboard'</strong> is low on stock (3 units left).", time: "3 hours ago" },
]);
</script>

<style scoped>
.activity-list { list-style: none; padding: 0; }
.activity-item {
  display: flex; align-items: flex-start;
  margin-bottom: var(--space-md); padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--bg-tertiary);
}
.activity-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.activity-icon-wrapper {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-right: var(--space-md); color: white;
}
.activity-icon-wrapper .activity-icon :deep(svg) { stroke: white; width: 20px; height: 20px; }
.activity-content { flex-grow: 1; }
.activity-text { margin-bottom: var(--space-xs); font-size: 0.9rem; line-height: 1.5; color: var(--text-color); }
.activity-text :deep(strong) { font-weight: 600; color: var(--text-color); }
[data-theme="dark"] .activity-text :deep(strong) { color: var(--primary-hover-color); }
.activity-time { font-size: 0.8rem; color: var(--text-color-muted); }
.text-muted { color: var(--text-color-muted); }
</style>
