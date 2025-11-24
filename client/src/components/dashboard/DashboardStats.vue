<template>
  <div class="dashboard-stats">
    <!-- KPI Summary Section -->
    <div v-if="visibleWidgets.kpiSummary" class="kpi-summary-section relative group">
      <div v-if="editMode" class="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button @click="$emit('toggle-widget', 'kpiSummary')" class="bg-red-500 text-white p-1 rounded text-xs">Hide</button>
      </div>
      
      <NumberCard
        label="Average Order Value"
        :value="currencySymbol + averageOrderValue.toFixed(2)"
        :trend="aovTrend"
        trendLabel="vs last month"
      />
      
      <NumberCard
        label="Profit Margin"
        :value="profitMargin.toFixed(1) + '%'"
        :trend="profitMargin >= 30 ? 1 : -1"
        :trendLabel="profitMargin >= 30 ? 'Healthy' : 'Monitor'"
        :isPositive="true"
      />
      
      <NumberCard
        label="New Customers"
        :value="newCustomersThisWeek"
        :trend="newCustomersTrend"
        trendLabel="vs last week"
      />
      
      <NumberCard
        label="Repeat Customer Rate"
        :value="repeatCustomerRate.toFixed(1) + '%'"
        :trend="1"
        trendLabel="Loyalty High"
      />
    </div>

    <!-- Main KPI Cards -->
    <div v-if="visibleWidgets.mainMetrics" class="dashboard-metrics relative group">
       <div v-if="editMode" class="absolute -top-4 end-0 opacity-100 z-10">
        <button @click="$emit('toggle-widget', 'mainMetrics')" class="bg-red-500 text-white p-1 rounded text-xs">Hide Section</button>
      </div>
      
      <NumberCard
        label="Total Revenue"
        :value="currencySymbol + totalRevenue.toFixed(2)"
        :trend="revenueChangePercent"
        trendLabel="vs last week"
        :icon="icons.revenue"
        color="var(--success-color)"
        footerText="View Sales Reports"
        footerLink="/sales"
      />
      
      <NumberCard
        label="Total Orders"
        :value="totalOrders"
        :trend="ordersChangePercent"
        trendLabel="vs last week"
        :icon="icons.orders"
        color="var(--info-color)"
        footerText="View Orders"
        footerLink="/sales"
      />
      
      <NumberCard
        label="Total Products"
        :value="totalProducts"
        :icon="icons.products"
        color="var(--primary-color)"
        footerText="Manage Products"
        footerLink="/products"
      />
      
      <NumberCard
        label="Stock Value"
        :value="currencySymbol + totalStockValue.toFixed(2)"
        :icon="icons.stockValue"
        color="#E67E22"
        footerText="Inventory Report"
        footerLink="/reports"
      />
    </div>
  </div>
</template>

<script setup>
import NumberCard from '@/components/dashboard/NumberCard.vue';

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
.kpi-summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
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
