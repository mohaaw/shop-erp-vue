<template>
  <div class="dashboard-stats">
    <!-- KPI Summary Section -->
    <div v-if="visibleWidgets.kpiSummary" class="kpi-summary-section relative group">
      <div v-if="editMode" class="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button @click="$emit('toggle-widget', 'kpiSummary')" class="bg-red-500 text-white p-1 rounded text-xs">Hide</button>
      </div>
      <div class="metric-card-sm">
        <div class="metric-label">Average Order Value</div>
        <div class="metric-value">{{ currencySymbol }}{{ averageOrderValue.toFixed(2) }}</div>
        <div class="metric-trend" :class="aovTrend >= 0 ? 'positive' : 'negative'">
          <span v-if="aovTrend >= 0">▲</span><span v-else>▼</span> {{ Math.abs(aovTrend).toFixed(1) }}%
        </div>
      </div>
      <div class="metric-card-sm">
        <div class="metric-label">Profit Margin</div>
        <div class="metric-value">{{ profitMargin.toFixed(1) }}%</div>
        <div class="metric-trend" :class="profitMargin >= 30 ? 'positive' : 'warning'">
          <span v-if="profitMargin >= 30">✓</span><span v-else>!</span> {{ profitMargin >= 30 ? 'Healthy' : 'Monitor' }}
        </div>
      </div>
      <div class="metric-card-sm">
        <div class="metric-label">New Customers</div>
        <div class="metric-value">{{ newCustomersThisWeek }}</div>
        <div class="metric-trend" :class="newCustomersTrend >= 0 ? 'positive' : 'negative'">
          <span v-if="newCustomersTrend >= 0">▲</span><span v-else>▼</span> vs last week
        </div>
      </div>
      <div class="metric-card-sm">
        <div class="metric-label">Repeat Customer Rate</div>
        <div class="metric-value">{{ repeatCustomerRate.toFixed(1) }}%</div>
        <div class="metric-trend positive">
          <span>✓</span> Loyalty
        </div>
      </div>
    </div>

    <!-- Main KPI Cards -->
    <div v-if="visibleWidgets.mainMetrics" class="dashboard-metrics relative group">
       <div v-if="editMode" class="absolute -top-4 end-0 opacity-100 z-10">
        <button @click="$emit('toggle-widget', 'mainMetrics')" class="bg-red-500 text-white p-1 rounded text-xs">Hide Section</button>
      </div>
      <StatCard
        title="Total Revenue"
        :value="totalRevenue.toFixed(2)"
        :prefixUnit="currencySymbol"
        :iconHtml="icons.revenue"
        color="var(--success-color)"
        :change="revenueChangePercent.toFixed(1) + '%'"
        :changeType="revenueChangePercent >= 0 ? 'positive' : 'negative'"
        changePeriod="vs last week"
        footerText="View Sales Reports"
        footerLink="/sales"
      />
      <StatCard
        title="Total Orders"
        :value="totalOrders"
        :iconHtml="icons.orders"
        color="var(--info-color)"
        :change="ordersChangePercent.toFixed(1) + '%'"
        :changeType="ordersChangePercent >= 0 ? 'positive' : 'negative'"
        changePeriod="vs last week"
        footerText="View Orders"
        footerLink="/sales"
      />
      <StatCard
        title="Total Products"
        :value="totalProducts"
        :iconHtml="icons.products"
        color="var(--primary-color)"
        footerText="Manage Products"
        footerLink="/products"
      />
      <StatCard
        title="Stock Value"
        :value="totalStockValue.toFixed(2)"
        :prefixUnit="currencySymbol"
        :iconHtml="icons.stockValue"
        color="#E67E22"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StatCard from '@/components/dashboard/StatCard.vue';

const props = defineProps({
  editMode: Boolean,
  visibleWidgets: Object,
  currencySymbol: String,
  averageOrderValue: Number,
  aovTrend: Number,
  profitMargin: Number,
  newCustomersThisWeek: Number,
  newCustomersTrend: Number,
  repeatCustomerRate: Number,
  totalRevenue: Number,
  revenueChangePercent: Number,
  totalOrders: Number,
  ordersChangePercent: Number,
  totalProducts: Number,
  totalStockValue: Number,
  icons: Object
});

defineEmits(['toggle-widget']);
</script>

<style scoped>
/* Reusing styles from DashboardPage.vue or relying on global/tailwind */
.kpi-summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--card-bg-color), var(--bg-color-offset));
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.metric-card-sm {
  padding: var(--space-md);
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  text-align: center;
  transition: all 0.3s ease;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-color-muted);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--space-sm);
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.metric-trend {
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.metric-trend.positive { color: var(--success-color); }
.metric-trend.negative { color: var(--danger-color); }
.metric-trend.warning { color: var(--warning-color); }

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

@media (max-width: 1200px) {
  .dashboard-metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 992px) {
  .dashboard-metrics { grid-template-columns: 1fr; }
  .kpi-summary-section { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 576px) {
  .kpi-summary-section { grid-template-columns: 1fr; }
}
</style>
