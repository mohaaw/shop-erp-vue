<template>
  <div class="dashboard-charts">
    <div class="card" v-if="visibleWidgets.performanceCharts">
      <div class="card-header flex justify-between items-center">
        <span>Performance Insights</span>
        <button v-if="editMode" @click="$emit('toggle-widget', 'performanceCharts')" class="text-xs bg-red-500 text-white px-2 py-1 rounded">Hide</button>
      </div>
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

    <div class="card mt-4" v-if="visibleWidgets.categoryChart">
      <div class="card-header flex justify-between items-center">
        <span>Product Category Distribution (Stock)</span>
        <button v-if="editMode" @click="$emit('toggle-widget', 'categoryChart')" class="text-xs bg-red-500 text-white px-2 py-1 rounded">Hide</button>
      </div>
      <div class="card-body">
        <div class="chart-container" style="height: 300px;"><canvas id="category-distribution-chart"></canvas></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSalesStore } from '@/stores/salesStore';
import Chart from 'chart.js/auto';

const props = defineProps({
  editMode: Boolean,
  visibleWidgets: Object
});

defineEmits(['toggle-widget']);

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const salesStore = useSalesStore();

let salesProfitChart7DaysInstance = ref(null);
let topProductsChartInstance = ref(null);
let categoryDistributionChartInstance = ref(null);

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
  if (!document.getElementById('sales-profit-chart-7days')) return;
  const ctx = document.getElementById('sales-profit-chart-7days').getContext('2d');
  if (!ctx) return;
  if (salesProfitChart7DaysInstance.value) salesProfitChart7DaysInstance.value.destroy();

  const dailyData = salesStore.dailySalesAndProfit(7);
  const labels = dailyData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const salesData = dailyData.map(d => d.sales);
  const profitData = dailyData.map(d => d.profit);
  const isDarkMode = settingsStore.theme === 'dark';

  salesProfitChart7DaysInstance.value = new Chart(ctx, {
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
  if (!document.getElementById('top-products-chart')) return;
  const ctx = document.getElementById('top-products-chart').getContext('2d');
  if (!ctx) return;
  if (topProductsChartInstance.value) topProductsChartInstance.value.destroy();

  const topProductsData = salesStore.topSellingProductsByQuantity(5);
  const labels = topProductsData.map(p => p.name);
  const dataPoints = topProductsData.map(p => p.quantity);
  const isDarkMode = settingsStore.theme === 'dark';
  const bgColorsLight = ['#D4AF37', '#4A4A4A', '#2E8B57', '#4682B4', '#8A2BE2'];
  const bgColorsDark = ['#D4AF37', '#A0A0A0', '#50C878', '#7CB9E8', '#9370DB'];

  topProductsChartInstance.value = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels.length > 0 ? labels : ['No Sales Data'],
      datasets: [{ label: 'Top Selling Products (Quantity)', data: dataPoints.length > 0 ? dataPoints : [1], backgroundColor: (isDarkMode ? bgColorsDark : bgColorsLight).slice(0, labels.length || 1), borderColor: isDarkMode ? '#121212' : '#FFFFFF', borderWidth: 2, hoverOffset: 8 }]
    }, options: { ...getChartDefaultOptions(), plugins: { ...getChartDefaultOptions().plugins, legend: { position: 'right'}}}
  });
};

const renderCategoryDistributionChart = () => {
  if (!document.getElementById('category-distribution-chart')) return;
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

  categoryDistributionChartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['No Product Data'],
      datasets: [{ label: 'Stock by Category', data: dataPoints.length > 0 ? dataPoints : [1], backgroundColor: (isDarkMode ? bgColorsDark : bgColorsLight).slice(0, labels.length || 1), borderColor: isDarkMode ? '#121212' : '#FFFFFF', borderWidth: 2, hoverOffset: 8 }]
    }, options: { ...getChartDefaultOptions(), plugins: { ...getChartDefaultOptions().plugins, legend: { position: 'right'}}}
  });
};

const initializeAndRenderCharts = async () => {
  await nextTick();
  if (props.visibleWidgets.performanceCharts) {
    renderSalesProfitChart7Days();
    renderTopProductsChart();
  }
  if (props.visibleWidgets.categoryChart) {
    renderCategoryDistributionChart();
  }
};

onMounted(() => {
  initializeAndRenderCharts();
});

watch(() => settingsStore.theme, () => {
  setTimeout(() => { initializeAndRenderCharts(); }, 100);
}, { deep: true });

watch([
  () => productStore.products,
  () => salesStore.sales,
  () => props.visibleWidgets
], () => {
  setTimeout(() => {
    initializeAndRenderCharts();
  }, 100);
}, { deep: true });
</script>

<style scoped>
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
</style>
