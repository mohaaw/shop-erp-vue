<template>
  <div class="sales-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">📈 Sales History & Reports</h1>
    </div>

    <div class="card mb-3">
      <div class="card-header">Filters</div>
      <div class="card-body">
        <div class="form-grid-3">
          <div class="form-group">
            <label for="sales-filter-date">Filter by Date:</label>
            <input type="date" id="sales-filter-date" class="form-control" v-model="localDateFilter">
          </div>
          <div class="form-group">
            <label for="sales-filter-customer">Filter by Customer:</label>
            <select id="sales-filter-customer" class="form-control" v-model="localCustomerFilter">
              <option :value="null">All Customers</option>
              <option v-for="customer in customerStore.customers" :key="customer.idInternal" :value="customer.idInternal">
                {{ customer.name }} ({{customer.email || customer.idInternal.slice(-6)}})
              </option>
            </select>
          </div>
          <div class="form-group" style="align-self: flex-end;">
            <button class="btn btn-secondary btn-sm mr-1" @click="applyFilters">Apply Filters</button>
            <button class="btn btn-light btn-sm" @click="clearAllFilters">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="salesStore.isLoading && salesStore.sales.length === 0" class="text-center p-5">
      <div class="loader"></div> Loading sales records...
    </div>
    <div v-else-if="salesStore.error" class="card"><div class="card-body form-alert alert-danger">{{ salesStore.error }}</div></div>
    <div v-else-if="salesStore.filteredSales.length" class="card">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
          <tr>
            <th>Sale ID</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items Qty</th>
            <th>Total ({{ settingsStore.currencySymbol }})</th>
            <th>Profit (Est. {{ settingsStore.currencySymbol }})</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="sale in salesStore.filteredSales" :key="sale.id">
            <td>...{{ sale.id.slice(-8) }}</td>
            <td>{{ new Date(sale.date).toLocaleString() }}</td>
            <td>{{ sale.customerName || 'Anonymous' }}</td>
            <td>{{ sale.items.reduce((sum, item) => sum + item.quantity, 0) }}</td>
            <td style="font-weight: bold;">{{ settingsStore.currencySymbol }}{{ sale.totalAmount.toFixed(2) }}</td>
            <td :class="sale.estimatedProfit >= 0 ? 'text-success' : 'text-danger'" style="font-weight: bold;">
              {{ settingsStore.currencySymbol }}{{ sale.estimatedProfit.toFixed(2) }}
            </td>
            <td>
              <button @click="openSaleDetailModal(sale)" class="btn btn-sm btn-info" title="View Sale Details">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Details
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="card">
      <div class="card-body text-center">
        <p v-if="salesStore.dateFilter || salesStore.customerFilter">No sales match your current filter criteria.</p>
        <p v-else>No sales records found yet. Process sales through the POS page.</p>
      </div>
    </div>

    <SaleDetailModal
      :visible="isSaleDetailModalVisible"
      :sale="selectedSale"
      @close="closeSaleDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCustomerStore } from '@/stores/customerStore';
import SaleDetailModal from '@/components/sales/SaleDetailModal.vue';

const salesStore = useSalesStore();
const settingsStore = useSettingsStore();
const customerStore = useCustomerStore();

const isSaleDetailModalVisible = ref(false);
const selectedSale = ref(null);

const localDateFilter = ref(salesStore.dateFilter);
const localCustomerFilter = ref(salesStore.customerFilter);

const loadSalesData = async () => {
  console.log('SalesPage: Fetching sales and customers if needed...');
  const promises = [];
  // if (salesStore.sales.length === 0 || salesStore.error) {
  promises.push(salesStore.fetchSales());
  // }
  // if (customerStore.customers.length === 0 || customerStore.error) {
  promises.push(customerStore.fetchCustomers()); // For the filter dropdown
  // }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  // Initialize local filters from store state if they exist after fetch
  localDateFilter.value = salesStore.dateFilter;
  localCustomerFilter.value = salesStore.customerFilter;
};

onMounted(() => {
  loadSalesData();
});

// onUnmounted(() => {
//   salesStore.clearFilters(); // Optional: clear filters when leaving page
// });

const applyFilters = () => {
  salesStore.setDateFilter(localDateFilter.value || null);
  salesStore.setCustomerFilter(localCustomerFilter.value || null);
};
const clearAllFilters = () => {
  localDateFilter.value = null;
  localCustomerFilter.value = null;
  salesStore.clearFilters();
};
const openSaleDetailModal = (sale) => {
  selectedSale.value = sale;
  isSaleDetailModalVisible.value = true;
};
const closeSaleDetailModal = () => {
  isSaleDetailModalVisible.value = false;
  selectedSale.value = null;
};
</script>

<style scoped>
.page-title { margin-bottom: 0; }
.btn svg { vertical-align: text-bottom; margin-right: var(--space-xs); } /* text-bottom for better alignment */
.btn.btn-sm svg { width: 14px; height: 14px; }
.table td, .table th { vertical-align: middle; }
.loader { margin-bottom: 0.5rem; }
.form-alert.alert-danger {
  color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;
  padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius);
}
[data-theme="dark"] .form-alert.alert-danger {
  background-color: #52262a; border-color: #8B3A3F; color: #ffacac;
}
.card-header + .card-body .form-grid-3 { margin-top: var(--space-sm); }
</style>
