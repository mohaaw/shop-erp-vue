<template>
  <div class="customers-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">👥 Customer Management</h1>
      <button @click="openCustomerModal(null)" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
        Add New Customer
      </button>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <input
          type="text"
          class="form-control"
          placeholder="🔍 Search customers by name, email, phone..."
          :value="customerStore.searchTerm"
          @input="customerStore.setSearchTerm($event.target.value)"
        />
      </div>
    </div>

    <div v-if="customerStore.isLoading && !initialLoadComplete && customerStore.customers.length === 0" class="card">
      <div class="card-body text-center p-5">
        <div class="loader"></div>
        <p class="mt-2 text-muted">Loading customers...</p>
      </div>
    </div>
    <div v-else-if="customerStore.error" class="card"><div class="card-body form-alert alert-danger">
      <p><strong>Error loading customers:</strong> {{ customerStore.error }}</p>
      <button class="btn btn-sm btn-primary mt-2" @click="loadCustomers">Try Again</button>
    </div></div>
    <div v-else-if="customerStore.filteredCustomers.length" class="card">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Type</th>
            <th>Date Joined</th>
            <th>Total Spent ({{ settingsStore.currencySymbol }})</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="customer in customerStore.filteredCustomers" :key="customer.idInternal">
            <td>{{ customer.name }}</td>
            <td>{{ customer.email || '-' }}</td>
            <td>{{ customer.phone || '-' }}</td>
            <td><span class="badge badge-secondary">{{ customer.customer_type || 'N/A' }}</span></td>
            <td>{{ customer.date_joined ? new Date(customer.date_joined).toLocaleDateString() : '-' }}</td>
            <td>
              {{ settingsStore.currencySymbol }}{{ (customer.totalSpentPlaceholder || 0).toFixed(2) }}
            </td>
            <td>
              <button @click="openCustomerModal(customer.idInternal)" class="btn btn-sm btn-secondary mr-1" title="Edit Customer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button @click="confirmDelete(customer)" class="btn btn-sm btn-danger" title="Delete Customer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="card">
      <div class="card-body text-center p-5">
        <p v-if="customerStore.searchTerm && customerStore.searchTerm.length > 0" class="text-muted">
          No customers match your search criteria for "<strong>{{ customerStore.searchTerm }}</strong>".
        </p>
        <p v-else class="text-muted">
          No customers found.
          <a href="#" @click.prevent="openCustomerModal(null)" class="link-primary">Add your first customer!</a>
        </p>
      </div>
    </div>

    <CustomerForm
      :visible="isCustomerModalVisible"
      :customer-id="editingCustomerId"
      @close="closeCustomerModal"
      @customer-saved="handleCustomerSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '@/stores/customerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';
import CustomerForm from '@/components/customers/CustomerForm.vue';

const customerStore = useCustomerStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const isCustomerModalVisible = ref(false);
const editingCustomerId = ref(null);
const initialLoadComplete = ref(false);

const loadCustomers = async () => {
  await customerStore.fetchCustomers();
  initialLoadComplete.value = true;
};

onMounted(() => {
  loadCustomers();
});

const openCustomerModal = (customerId = null) => {
  editingCustomerId.value = customerId;
  isCustomerModalVisible.value = true;
};
const closeCustomerModal = () => {
  isCustomerModalVisible.value = false;
  editingCustomerId.value = null;
};
const handleCustomerSaved = () => {
  // Toast is handled within CustomerForm.vue upon successful save
  // The list will reactively update because the store changed.
  // No explicit fetch needed here if store updates its array reactively.
};
const confirmDelete = (customer) => {
  if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This might affect related sales records if not handled properly.`)) {
    customerStore.deleteCustomer(customer.idInternal)
      .then(() => {
        toastStore.info(`Customer "${customer.name}" deleted.`);
      })
      .catch(error => {
        console.error("Failed to delete customer:", error);
        toastStore.error(`Error deleting customer: ${error.message || 'Unknown error'}`);
      });
  }
};
</script>

<style scoped>
/* Styles are similar to ProductsListPage, ensure consistency via main.css */
.page-title { margin-bottom: 0; }
.btn svg { vertical-align: middle; margin-right: var(--space-xs); }
.btn.btn-sm svg { width: 14px; height: 14px; }
.table td, .table th { vertical-align: middle; }
.loader { margin-bottom: 0.5rem; }
.form-alert.alert-danger {
  color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;
  padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius);
}
[data-theme="dark"] .form-alert.alert-danger { background-color: #52262a; border-color: #8B3A3F; color: #ffacac; }
.link-primary { color: var(--primary-color); text-decoration: underline; font-weight:500; }
.link-primary:hover { color: var(--primary-hover-color); }
.text-muted { color: var(--text-color-muted); }
</style>
