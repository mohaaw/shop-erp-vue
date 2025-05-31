<template>
  <div class="reports-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">📊 Reports Center</h1>
    </div>

    <div class="report-selection-tabs card mb-4 no-print">
      <div class="card-body" style="padding: 0.5rem;">
        <button
          class="btn btn-tab"
          :class="{'active': activeReport === 'salesByPeriod'}"
          @click="setActiveReport('salesByPeriod')">
          Sales by Period
        </button>
        <button
          class="btn btn-tab"
          :class="{'active': activeReport === 'inventoryValuation'}"
          @click="setActiveReport('inventoryValuation')">
          Inventory Valuation
        </button>
        <button
          class="btn btn-tab"
          :class="{'active': activeReport === 'stockMovements'}"
          @click="setActiveReport('stockMovements')">
          Stock Movement Ledger
        </button>
      </div>
    </div>

    <div class="report-content">
      <div v-if="isLoadingInitialData" class="card">
        <div class="card-body text-center p-5">
          <div class="loader"></div>
          <p class="mt-2 text-muted">Loading initial data for reports...</p>
        </div>
      </div>
      <div v-else>
        <SalesReportByPeriod v-if="activeReport === 'salesByPeriod'" />
        <InventoryValuationReport v-if="activeReport === 'inventoryValuation'" />
        <StockMovementReport v-if="activeReport === 'stockMovements'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SalesReportByPeriod from '@/components/reports/SalesReportByPeriod.vue';
import InventoryValuationReport from '@/components/reports/InventoryValuationReport.vue';
import StockMovementReport from '@/components/reports/StockMovementReport.vue';
import { useSalesStore } from '@/stores/salesStore';
import { useProductStore } from '@/stores/productStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useStockMovementStore } from '@/stores/stockMovementStore';

const activeReport = ref('salesByPeriod'); // Default report to show
const isLoadingInitialData = ref(false);

const salesStore = useSalesStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();
const stockMovementStore = useStockMovementStore();

const setActiveReport = async (reportName) => {
  activeReport.value = reportName;
  // Fetch data specific to the newly activated report if it hasn't been loaded yet
  // This helps in lazy-loading data for reports not viewed initially.
  isLoadingInitialData.value = true; // Show loader while potentially fetching
  try {
    if (reportName === 'salesByPeriod' && salesStore.sales.length === 0 && !salesStore.isLoading) {
      await salesStore.fetchSales();
    }
    if (reportName === 'inventoryValuation' && productStore.products.length === 0 && !productStore.isLoading) {
      await productStore.fetchProducts();
    }
    if (reportName === 'stockMovements') {
      if (productStore.products.length === 0 && !productStore.isLoading) { // StockMovementReport needs products for dropdown
        await productStore.fetchProducts();
      }
      if (stockMovementStore.movements.length === 0 && !stockMovementStore.isLoading) {
        await stockMovementStore.fetchAllMovements();
      }
    }
    // Add similar checks for other reports
  } catch (error) {
    console.error(`Error fetching data for ${reportName} report:`, error);
    // Optionally use toastStore to show an error
  } finally {
    isLoadingInitialData.value = false;
  }
};

onMounted(async () => {
  isLoadingInitialData.value = true;
  const promises = [];
  // Initial fetch for the default active report or commonly needed data
  if (activeReport.value === 'salesByPeriod' && salesStore.sales.length === 0 && !salesStore.isLoading) {
    promises.push(salesStore.fetchSales());
  }
  if (activeReport.value === 'inventoryValuation' && productStore.products.length === 0 && !productStore.isLoading) {
    promises.push(productStore.fetchProducts());
  }
  if (activeReport.value === 'stockMovements') {
    if (productStore.products.length === 0 && !productStore.isLoading) {
      promises.push(productStore.fetchProducts());
    }
    if (stockMovementStore.movements.length === 0 && !stockMovementStore.isLoading) {
      promises.push(stockMovementStore.fetchAllMovements());
    }
  }
  // Always good to have customers available for potential filters in any report
  if (customerStore.customers.length === 0 && !customerStore.isLoading) {
    promises.push(customerStore.fetchCustomers());
  }

  if (promises.length > 0) {
    console.log("ReportsPage: Fetching initial data for selected/common reports...");
    try {
      await Promise.all(promises);
      console.log("ReportsPage: Initial data fetched.");
    } catch (error) {
      console.error("ReportsPage: Error fetching initial data:", error);
    }
  }
  isLoadingInitialData.value = false;
});

</script>

<style scoped>
.page-title {
  margin-bottom: var(--space-lg);
}
.report-selection-tabs .card-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.btn-tab {
  background-color: var(--bg-color-offset);
  color: var(--text-color-muted);
  border: 1px solid var(--border-color);
  padding: var(--space-sm) var(--space-md);
  font-weight: 500;
  cursor: pointer; /* Ensure pointer cursor for buttons */
  transition: background-color 0.2s, color 0.2s, border-color 0.2s; /* Added border-color transition */
}
.btn-tab:hover {
  background-color: var(--primary-hover-color);
  color: var(--text-on-primary);
  border-color: var(--primary-hover-color);
}
.btn-tab.active {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow-sm);
}
.report-content {
  margin-top: var(--space-lg);
}
.loader {
  margin-bottom: var(--space-sm);
}
.text-muted { color: var(--text-color-muted); }
.p-5 { padding: calc(var(--space-xl) * 1.25); }
</style>
