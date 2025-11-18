<template>
  <div class="recent-activity-widget card">
    <div class="card-header">Recent Activity</div>
    <div class="card-body">
      <ul v-if="recentActivities.length" class="activity-list">
        <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon-wrapper" :style="{ backgroundColor: activity.iconBg }">
            <span class="activity-icon" v-html="activity.icon"></span>
          </div>
          <div class="activity-content">
            <p class="activity-text" v-html="activity.text"></p>
            <small class="activity-time">{{ formatTime(activity.time) }}</small>
          </div>
        </li>
      </ul>
      <p v-else class="text-center text-muted">No recent activity to display.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useProductStore } from '@/stores/productStore';
import { useCustomerStore } from '@/stores/customerStore';

const salesStore = useSalesStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();

const icons = {
  sale: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  product: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
  customer: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(date).toLocaleDateString();
};

const recentActivities = computed(() => {
  const activities = [];
  
  // Add recent sales
  const recentSales = salesStore.sales.slice(-5).reverse();
  recentSales.forEach(sale => {
    const customer = customerStore.customers.find(c => c.id === sale.customerId);
    activities.push({
      id: `sale-${sale.id}`,
      icon: icons.sale,
      iconBg: 'var(--success-color)',
      text: `New sale <strong>#${sale.id.slice(-6)}</strong> for <strong>${sale.totalAmount.toFixed(2)}</strong> from <strong>${customer?.name || 'Anonymous'}</strong>`,
      time: sale.date
    });
  });

  // Add low stock warnings
  const lowStockItems = productStore.products
    .filter(p => p.quantity > 0 && p.quantity <= 5)
    .slice(-3);
  lowStockItems.forEach(product => {
    activities.push({
      id: `lowstock-${product.id}`,
      icon: icons.warning,
      iconBg: 'var(--warning-color)',
      text: `<strong>${product.model || product.name}</strong> is low on stock (<strong>${product.quantity} units</strong>)`,
      time: product.updatedAt || new Date()
    });
  });

  // Add new customers
  const recentCustomers = customerStore.customers.slice(-3).reverse();
  recentCustomers.forEach(customer => {
    activities.push({
      id: `customer-${customer.id}`,
      icon: icons.customer,
      iconBg: 'var(--primary-color)',
      text: `New customer <strong>${customer.name}</strong> registered`,
      time: customer.createdAt
    });
  });

  // Sort by time (most recent first) and return top 8
  return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
});
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
