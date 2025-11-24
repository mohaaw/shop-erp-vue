<template>
  <div class="recent-activity-widget card">
    <div class="card-header">
      <h3 class="card-title">Recent Activity</h3>
      <div class="card-actions">
        <button class="btn btn-xs btn-ghost">View All</button>
      </div>
    </div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover table-compact">
          <thead>
            <tr>
              <th class="w-12 text-center">
                <input type="checkbox" class="form-checkbox" />
              </th>
              <th class="w-24">Type</th>
              <th>Description</th>
              <th class="w-32 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in recentActivities" :key="activity.id">
              <td class="text-center">
                <input type="checkbox" class="form-checkbox" />
              </td>
              <td>
                <span class="badge" :class="activity.badgeClass">{{ activity.type }}</span>
              </td>
              <td>
                <div class="activity-content">
                  <span class="activity-text" v-html="activity.text"></span>
                </div>
              </td>
              <td class="text-right text-muted text-sm">
                {{ formatTime(activity.time) }}
              </td>
            </tr>
            <tr v-if="!recentActivities.length">
              <td colspan="4" class="text-center py-4 text-muted">
                No recent activity found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
      type: 'Sale',
      badgeClass: 'badge-success',
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
      type: 'Stock',
      badgeClass: 'badge-warning',
      text: `<strong>${product.model || product.name}</strong> is low on stock (<strong>${product.quantity} units</strong>)`,
      time: product.updatedAt || new Date()
    });
  });

  // Add new customers
  const recentCustomers = customerStore.customers.slice(-3).reverse();
  recentCustomers.forEach(customer => {
    activities.push({
      id: `customer-${customer.id}`,
      type: 'Customer',
      badgeClass: 'badge-primary',
      text: `New customer <strong>${customer.name}</strong> registered`,
      time: customer.createdAt
    });
  });

  // Sort by time (most recent first) and return top 8
  return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
});
</script>

<style scoped>
.card {
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
}
.card-title { font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0; }

.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th, .table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  color: var(--text-main);
}
.table th {
  background: var(--bg-color);
  font-weight: 600;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  position: sticky; top: 0;
}
.table-hover tbody tr:hover { background-color: var(--bg-color); }
.table-compact th, .table-compact td { padding: 8px 12px; }

.badge {
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 12px; font-size: 11px; font-weight: 600;
  line-height: 1.4;
}
.badge-success { background: rgba(40, 167, 69, 0.1); color: var(--success-color); }
.badge-warning { background: rgba(255, 193, 7, 0.1); color: var(--warning-color); }
.badge-primary { background: rgba(36, 144, 239, 0.1); color: var(--primary-color); }

.form-checkbox {
  width: 14px; height: 14px; border-radius: 3px;
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.w-12 { width: 3rem; }
.w-24 { width: 6rem; }
.w-32 { width: 8rem; }
.p-0 { padding: 0; }
</style>
