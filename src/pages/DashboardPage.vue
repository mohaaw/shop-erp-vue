<template>
  <div class="dashboard-page">
    <h1 class="page-title">📊 {{ settingsStore.storeName }} Dashboard</h1>

    <div class="dashboard-metrics">
      <StatCard
        title="Total Revenue"
        :value="salesStore.totalRevenue.toFixed(2)"
        :prefixUnit="settingsStore.currencySymbol"
        :iconHtml="icons.revenue"
        color="var(--success-color)"
        change="+0%"
        changeType="neutral"
        changePeriod="this period"
        footerText="View Sales Reports"
        footerLink="/sales"
      />
      <StatCard
        title="Total Orders"
        :value="salesStore.totalSalesRecords"
        :iconHtml="icons.orders"
        color="var(--info-color)"
        change="+0"
        changeType="neutral"
        changePeriod="this period"
        footerText="View Orders"
        footerLink="/sales"
      />
      <StatCard
        title="Total Products"
        :value="productStore.products.length"
        :iconHtml="icons.products"
        color="var(--primary-color)"
        footerText="Manage Products"
        footerLink="/products"
      />
      <StatCard
        title="Stock Value"
        :value="productStore.totalStockValue.toFixed(2)"
        :prefixUnit="settingsStore.currencySymbol"
        :iconHtml="icons.stockValue"
        color="#E67E22"
      />
    </div>

    <div class="dashboard-metrics">
      <StatCard
        title="Low Stock Items"
        :value="productStore.lowStockItems.length"
        :iconHtml="icons.lowStock"
        color="var(--warning-color)"
        footerText="View Low Stock"
        :footerLink="{ path: '/products', query: { filter: 'lowstock' } }"
      />
      <StatCard
        title="Out of Stock Items"
        :value="productStore.outOfStockItems.length"
        :iconHtml="icons.outOfStock"
        color="var(--danger-color)"
        footerText="View Out of Stock"
        :footerLink="{ path: '/products', query: { filter: 'outofstock' } }"
      />
      <StatCard
        title="Total Customers"
        :value="customerStore.customers.length"
        :iconHtml="icons.customers"
        color="#3498DB"
        footerText="Manage Customers"
        footerLink="/customers"
      />
      <StatCard
        title="Total Profit (Est.)"
        :value="salesStore.totalProfit.toFixed(2)"
        :prefixUnit="settingsStore.currencySymbol"
        :iconHtml="icons.profit"
        color="var(--success-color)"
      />
    </div>

    <div class="dashboard-row">
      <div class="dashboard-col-two-thirds">
        <QuickActionsWidget class="mb-4"/>

        <div class="card">
          <div class="card-header">Performance Insights</div>
          <div class="card-body">
            <div class="form-grid-2">
              <div>
                <h4>Sales & Profit - Last 7 Days</h4>
                <div class="chart-container"><canvas id="sales-profit-chart-7days"></canvas></div>
              </div>
              <div>
                <h4>Top Selling Products (by Quantity)</h4>
                <div class="chart-container"><canvas id="top-products-chart"></canvas></div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-col-one-third">
          <RecentActivityWidget />

          <div class="card mt-4">
            <div class="card-header">Product Category Distribution (Stock)</div>
            <div class="card-body">
              <div class="chart-container" style="height: 300px;"><canvas id="category-distribution-chart"></canvas></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget.vue';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget.vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useSalesStore } from '@/stores/salesStore';

let ChartJS = null;

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const customerStore = useCustomerStore();
const salesStore = useSalesStore();

let salesProfitChart7DaysInstance = ref(null);
let topProductsChartInstance = ref(null);
let categoryDistributionChartInstance = ref(null);

const icons = {
  revenue: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  orders: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  products: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  customers: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  stockValue: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 7.8l-7.42 7.42a1 1 0 01-1.41 0L4 7.83"/><path d="M12 20V10"/><path d="M5 12H2a1 1 0 01-1-1V6a1 1 0 011-1h1a1 1 0 011 1v2"/><path d="M17 8h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V9"/></svg>`,
  lowStock: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01M2.45 16.85A10 10 0 0012 22a10 10 0 009.55-5.15M2.45 7.15A10 10 0 0112 2a10 10 0 019.55 5.15"/></svg>`,
  outOfStock: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16v-4m0-4h.01"/></svg>`,
  profit: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"></line><polyline points="6 10 12 4 18 10"></polyline></svg>`,
  salesChart: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  pieChart: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`
};

const getChartDefaultOptions = () => {
  const isDarkMode = settingsStore.theme === 'dark';
  return {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { color: isDarkMode ? '#E0E0E0' : '#555555', font: { family: 'Inter' } }, grid: { color: isDarkMode ? 'rgba(224, 224, 224, 0.1)' : 'rgba(0, 0, 0, 0.07)' } },
      x: { ticks: { color: isDarkMode ? '#E0E0E0' : '#555555', font: { family: 'Inter' } }, grid: { display: false } }
    },
    plugins: { legend: { labels: { color: isDarkMode ? '#E0E0E0' : '#555555', font: { family: 'Inter' } }, position: 'bottom', }, tooltip: { bodyFont: { family: 'Inter' }, titleFont: { family: 'Inter' } }
    },
    animation: { duration: 800, easing: 'easeInOutQuart' }
  };
};

const renderSalesProfitChart7Days = () => {
  if (!ChartJS || !document.getElementById('sales-profit-chart-7days')) return;
  const ctx = document.getElementById('sales-profit-chart-7days').getContext('2d');
  if (!ctx) return;
  if (salesProfitChart7DaysInstance.value) salesProfitChart7DaysInstance.value.destroy();

  const dailyData = salesStore.dailySalesAndProfit(7);
  const labels = dailyData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const salesData = dailyData.map(d => d.sales);
  const profitData = dailyData.map(d => d.profit);
  const isDarkMode = settingsStore.theme === 'dark';

  salesProfitChart7DaysInstance.value = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: `Sales (${settingsStore.currencySymbol})`, data: salesData, backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.7)' : 'rgba(212, 175, 55, 0.8)', borderColor: isDarkMode ? '#D4AF37' : '#B8860B', borderWidth: 1 },
        { label: `Profit (${settingsStore.currencySymbol})`, data: profitData, backgroundColor: isDarkMode ? 'rgba(70, 130, 180, 0.5)' : 'rgba(70, 130, 180, 0.6)', borderColor: isDarkMode ? '#4682B4' : '#3672A4', borderWidth: 2, type: 'line', tension: 0.3, fill: true }
      ]
    }, options: getChartDefaultOptions()
  });
};
const renderTopProductsChart = () => {
  if (!ChartJS || !document.getElementById('top-products-chart')) return;
  const ctx = document.getElementById('top-products-chart').getContext('2d');
  if (!ctx) return;
  if (topProductsChartInstance.value) topProductsChartInstance.value.destroy();

  const topProductsData = salesStore.topSellingProductsByQuantity(5);
  const labels = topProductsData.map(p => p.name);
  const dataPoints = topProductsData.map(p => p.quantity);
  const isDarkMode = settingsStore.theme === 'dark';
  const bgColorsLight = ['#D4AF37', '#4A4A4A', '#2E8B57', '#4682B4', '#8A2BE2'];
  const bgColorsDark = ['#D4AF37', '#A0A0A0', '#50C878', '#7CB9E8', '#9370DB'];

  topProductsChartInstance.value = new ChartJS(ctx, {
    type: 'pie',
    data: {
      labels: labels.length > 0 ? labels : ['No Sales Data'],
      datasets: [{ label: 'Top Selling Products (Quantity)', data: dataPoints.length > 0 ? dataPoints : [1], backgroundColor: (isDarkMode ? bgColorsDark : bgColorsLight).slice(0, labels.length || 1), borderColor: isDarkMode ? '#121212' : '#FFFFFF', borderWidth: 2, hoverOffset: 8 }]
    }, options: { ...getChartDefaultOptions(), plugins: { ...getChartDefaultOptions().plugins, legend: { position: 'right'}}}
  });
};
const renderCategoryDistributionChart = () => {
  if (!ChartJS || !document.getElementById('category-distribution-chart')) return;
  const ctx = document.getElementById('category-distribution-chart').getContext('2d');
  if (!ctx) return;
  if (categoryDistributionChartInstance.value) categoryDistributionChartInstance.value.destroy();

  const categoryCounts = productStore.products.reduce((acc, product) => {
    acc[product.category || 'Uncategorized'] = (acc[product.category || 'Uncategorized'] || 0) + (product.quantity || 0);
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryCounts).filter(([,qty]) => qty > 0).sort(([,a],[,b]) => b-a).slice(0, 7);
  const labels = sortedCategories.map(entry => entry[0]);
  const dataPoints = sortedCategories.map(entry => entry[1]);
  const isDarkMode = settingsStore.theme === 'dark';
  const bgColorsLight = ['#D4AF37', '#4A4A4A', '#2E8B57', '#4682B4', '#DAA520', '#B22222', '#6A5ACD'];
  const bgColorsDark = ['#D4AF37', '#A0A0A0', '#50C878', '#7CB9E8', '#FADA5E', '#FF6961', '#9370DB'];

  categoryDistributionChartInstance.value = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['No Product Data'],
      datasets: [{ label: 'Stock by Category', data: dataPoints.length > 0 ? dataPoints : [1], backgroundColor: (isDarkMode ? bgColorsDark : bgColorsLight).slice(0, labels.length || 1), borderColor: isDarkMode ? '#121212' : '#FFFFFF', borderWidth: 2, hoverOffset: 8 }]
    }, options: { ...getChartDefaultOptions(), plugins: { ...getChartDefaultOptions().plugins, legend: { position: 'right'}}}
  });
};

const initializeAndRenderCharts = async () => {
  if (typeof window.Chart === 'undefined' && !ChartJS) {
    try {
      console.log("DashboardPage: Attempting to load Chart.js dynamically...");
      const ChartModule = await import('chart.js/auto');
      ChartJS = ChartModule.default;
      console.log("DashboardPage: Chart.js loaded.", ChartJS);
    } catch (e) { console.error("Chart.js failed to load. Make sure it's installed (npm install chart.js).", e); return; }
  } else if (typeof window.Chart !== 'undefined' && !ChartJS) {
    ChartJS = window.Chart;
    console.log("DashboardPage: Chart.js found globally.");
  }

  if (!ChartJS) {
    console.error("DashboardPage: Chart.js object not available. Charts cannot be rendered.");
    return;
  }

  await nextTick();
  renderSalesProfitChart7Days();
  renderTopProductsChart();
  renderCategoryDistributionChart();
};

const loadAllDashboardData = async () => {
  console.log('DashboardPage: Fetching all necessary data for dashboard...');
  const promises = [];
  if (!productStore.products.length || productStore.error) promises.push(productStore.fetchProducts());
  if (!customerStore.customers.length || customerStore.error) promises.push(customerStore.fetchCustomers());
  if (!salesStore.sales.length || salesStore.error) promises.push(salesStore.fetchSales());

  if (promises.length > 0) {
    await Promise.all(promises);
  } else {
    console.log('DashboardPage: Data likely already loaded in stores.');
  }
  console.log('DashboardPage: Data fetch phase complete.');
  await initializeAndRenderCharts();
};

onMounted(() => {
  loadAllDashboardData();
});

watch(() => settingsStore.theme, () => {
  if (ChartJS) { setTimeout(() => { initializeAndRenderCharts(); }, 100); }
}, { deep: true }); // Added deep:true for theme object if it becomes complex

watch([
  () => productStore.products,
  () => salesStore.sales
], () => {
  if (ChartJS) {
    setTimeout(() => {
      console.log("DashboardPage: Product or Sales data changed, re-rendering charts.");
      initializeAndRenderCharts();
    }, 100);
  }
}, { deep: true });

const LOW_STOCK_THRESHOLD = computed(() => settingsStore.lowStockThreshold);

const lowStockItems = computed(() => {
  return productStore.products.filter(p => typeof p.quantity === 'number' && p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD.value)
    .sort((a,b) => a.quantity - b.quantity);
});
</script>

<style scoped>
.dashboard-page .page-title {
  font-family: var(--font-family-sans);
  font-size: 1.75rem;
  border-bottom-width: 2px;
}
.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
}
.dashboard-row > [class*="dashboard-col-"] > .card,
.dashboard-row > [class*="dashboard-col-"] > div:not(.card) {
  margin-bottom: var(--space-lg);
}
.dashboard-col-one-third { flex: 1 1 calc(33.333% - var(--space-lg)); min-width: 300px; }
.dashboard-col-two-thirds { flex: 2 1 calc(66.666% - var(--space-lg)); min-width: 300px; }
.dashboard-col-one-half { flex: 1 1 calc(50% - var(--space-lg)); min-width: 300px; }

.chart-container {
  height: 350px;
  margin-bottom: var(--space-lg);
  padding: var(--space-sm);
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  box-shadow: var(--box-shadow-sm);
  position: relative;
}
.card .chart-container {
  border: none;
  box-shadow: none;
  padding: 0;
  margin-bottom: 0;
}

.simple-list { list-style: none; padding-left: 0; margin-top: var(--space-sm); }
.simple-list li { padding: var(--space-xs) 0; font-size: 0.9rem; }
.simple-list li a { font-weight: 500; }
.simple-list li:not(:last-child) { border-bottom: 1px dashed var(--bg-tertiary); }
.text-muted { color: var(--text-color-muted); }
.mb-2 { margin-bottom: var(--space-sm) !important; }
.mt-4 { margin-top: var(--space-lg) !important; }
</style>
