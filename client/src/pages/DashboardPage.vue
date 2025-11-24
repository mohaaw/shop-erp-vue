<template>
  <div class="dashboard-page">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="page-title mb-1">📊 {{ settingsStore.storeName }} Dashboard</h1>
        <p class="text-muted text-sm">Overview of your store's performance</p>
      </div>
      <div class="flex gap-3">
        <button @click="toggleEditMode" class="btn btn-secondary btn-sm glass-btn">
          <span v-if="!editMode">✏️ Edit Layout</span>
          <span v-else>✅ Done Editing</span>
        </button>
      </div>
    </div>

    <!-- Edit Mode Instructions -->
    <div v-if="editMode" class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
      <p class="font-bold">Edit Mode Active</p>
      <p>Click "Hide" on widgets you want to remove. Use the "Reset Layout" button to restore all widgets.</p>
      <button @click="resetLayout" class="mt-2 text-sm underline">Reset Layout</button>
    </div>

    <DashboardStats
      :editMode="editMode"
      :visibleWidgets="visibleWidgets"
      :currencySymbol="settingsStore.currencySymbol"
      :averageOrderValue="averageOrderValue"
      :aovTrend="aovTrend"
      :profitMargin="profitMargin"
      :newCustomersThisWeek="newCustomersThisWeek"
      :newCustomersTrend="newCustomersTrend"
      :repeatCustomerRate="repeatCustomerRate"
      :totalRevenue="salesStore.totalRevenue"
      :revenueChangePercent="revenueChangePercent"
      :totalOrders="salesStore.totalSalesRecords"
      :ordersChangePercent="ordersChangePercent"
      :totalProducts="productStore.products.length"
      :totalStockValue="productStore.totalStockValue"
      :icons="icons"
      @toggle-widget="toggleWidget"
    />

    <div class="dashboard-row">
      <div class="dashboard-col-two-thirds">
        <div v-if="visibleWidgets.quickActions" class="relative group mb-4">
           <div v-if="editMode" class="absolute -top-2 right-0 z-10">
            <button @click="toggleWidget('quickActions')" class="bg-red-500 text-white p-1 rounded text-xs">Hide</button>
          </div>
          <QuickActionsWidget />
        </div>

        <DashboardCharts
          :editMode="editMode"
          :visibleWidgets="visibleWidgets"
        />

        <div class="dashboard-col-one-third">
          <div v-if="visibleWidgets.recentActivity" class="relative group">
             <div v-if="editMode" class="absolute -top-2 right-0 z-10">
              <button @click="toggleWidget('recentActivity')" class="bg-red-500 text-white p-1 rounded text-xs">Hide</button>
            </div>
            <RecentActivityWidget />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import DashboardCharts from '@/components/dashboard/DashboardCharts.vue';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget.vue';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget.vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useSalesStore } from '@/stores/salesStore';

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const customerStore = useCustomerStore();
const salesStore = useSalesStore();

// Edit Mode State
const editMode = ref(false);
const visibleWidgets = ref({
  kpiSummary: true,
  mainMetrics: true,
  quickActions: true,
  performanceCharts: true,
  categoryChart: true,
  recentActivity: true
});

// Load saved layout from localStorage
const loadLayout = () => {
  const saved = localStorage.getItem('dashboardLayout');
  if (saved) {
    visibleWidgets.value = JSON.parse(saved);
  }
};

const saveLayout = () => {
  localStorage.setItem('dashboardLayout', JSON.stringify(visibleWidgets.value));
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    saveLayout();
  }
};

const toggleWidget = (widgetName) => {
  visibleWidgets.value[widgetName] = !visibleWidgets.value[widgetName];
};

const resetLayout = () => {
  visibleWidgets.value = {
    kpiSummary: true,
    mainMetrics: true,
    quickActions: true,
    performanceCharts: true,
    categoryChart: true,
    recentActivity: true
  };
  saveLayout();
};

// Icons (Moved from original file)
const icons = {
  revenue: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  orders: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  products: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  customers: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  stockValue: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 7.8l-7.42 7.42a1 1 0 01-1.41 0L4 7.83"/><path d="M12 20V10"/><path d="M5 12H2a1 1 0 01-1-1V6a1 1 0 011-1h1a1 1 0 011 1v2"/><path d="M17 8h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V9"/></svg>`,
  lowStock: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01M2.45 16.85A10 10 0 0012 22a10 10 0 009.55-5.15M2.45 7.15A10 10 0 0112 2a10 10 0 019.55 5.15"/></svg>`,
  outOfStock: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16v-4m0-4h.01"/></svg>`,
  profit: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="4"></line><polyline points="6 10 12 4 18 10"></polyline></svg>`,
};

// Data Loading
const loadAllDashboardData = async () => {
  const promises = [];
  if (!productStore.products.length || productStore.error) promises.push(productStore.fetchProducts());
  if (!customerStore.customers.length || customerStore.error) promises.push(customerStore.fetchCustomers());
  if (!salesStore.sales.length || salesStore.error) promises.push(salesStore.fetchSales());
  if (promises.length > 0) await Promise.all(promises);
};

onMounted(() => {
  loadAllDashboardData();
  loadLayout();
});

// Computed Properties (Moved from original file)
const getDateRangeData = (days) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return salesStore.sales.filter(s => new Date(s.date) >= startDate);
};

const thisWeekSales = computed(() => getDateRangeData(7));
const lastWeekSales = computed(() => {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return salesStore.sales.filter(s => {
    const saleDate = new Date(s.date);
    return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
  });
});

const revenueChangePercent = computed(() => {
  const thisWeekRevenue = thisWeekSales.value.reduce((sum, s) => sum + s.totalAmount, 0);
  const lastWeekRevenue = lastWeekSales.value.reduce((sum, s) => sum + s.totalAmount, 0);
  if (lastWeekRevenue === 0) return thisWeekRevenue > 0 ? 100 : 0;
  return ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
});

const ordersChangePercent = computed(() => {
  const thisWeekOrders = thisWeekSales.value.length;
  const lastWeekOrders = lastWeekSales.value.length;
  if (lastWeekOrders === 0) return thisWeekOrders > 0 ? 100 : 0;
  return ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
});

const averageOrderValue = computed(() => {
  if (salesStore.totalSalesRecords === 0) return 0;
  return salesStore.totalRevenue / salesStore.totalSalesRecords;
});

const profitMargin = computed(() => {
  if (salesStore.totalRevenue === 0) return 0;
  return (salesStore.totalProfit / salesStore.totalRevenue) * 100;
});

const newCustomersThisWeek = computed(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return customerStore.customers.filter(c => {
    const createdDate = new Date(c.createdAt || Date.now());
    return createdDate >= oneWeekAgo;
  }).length;
});

const newCustomersLastWeek = computed(() => {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return customerStore.customers.filter(c => {
    const createdDate = new Date(c.createdAt || Date.now());
    return createdDate >= twoWeeksAgo && createdDate < oneWeekAgo;
  }).length;
});

const newCustomersTrend = computed(() => {
  return newCustomersThisWeek.value - newCustomersLastWeek.value;
});

const repeatCustomerRate = computed(() => {
  if (customerStore.customers.length === 0) return 0;
  const repeatCustomers = thisWeekSales.value.reduce((set, sale) => {
    if (sale.customerId) set.add(sale.customerId);
    return set;
  }, new Set());
  return (repeatCustomers.size / customerStore.customers.length) * 100;
});

const aovTrend = computed(() => 0); // Placeholder as logic was missing in original
</script>

/* Glass styles removed for Flat theme */
.btn-secondary {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.btn-secondary:hover {
  background: var(--bg-color);
  border-color: var(--primary-color);
}
