<template>
  <div class="products-list-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">📦 Products</h1>
      <router-link to="/products/add" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add New Product
      </router-link>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <input
          type="text"
          class="form-control"
          placeholder="🔍 Search products by name, SKU, category, brand, model, tags..."
          :value="productStore.searchTerm"
          @input="productStore.setSearchTerm($event.target.value)"
        />
      </div>
    </div>

    <div v-if="productStore.isLoading && !initialLoadComplete && productStore.products.length === 0" class="card">
      <div class="card-body text-center p-5">
        <div class="loader"></div>
        <p class="mt-2 text-muted">Loading products...</p>
      </div>
    </div>
    <div v-else-if="productStore.error" class="card">
      <div class="card-body form-alert alert-danger">
        <p><strong>Error loading products:</strong></p>
        <p>{{ productStore.error }}</p>
        <button class="btn btn-sm btn-primary mt-2" @click="loadProducts">Try Again</button>
      </div>
    </div>
    <div v-else-if="productStore.filteredProducts.length" class="card">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
          <tr>
            <th>Name</th>
            <th>SKU/No.</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price ({{ settingsStore.currencySymbol }})</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="product in productStore.filteredProducts" :key="product.idInternal" :class="{'low-stock-row': product.quantity > 0 && product.quantity <= settingsStore.lowStockThreshold, 'no-stock-row': product.quantity <= 0}">
            <td>{{ product.model || product.name }}</td>
            <td>{{ product.no || product.sku || '-' }}</td>
            <td><span v-if="product.category" class="badge badge-info">{{ product.category }}</span></td>
            <td>{{ product.company || '-'}}</td>
            <td>{{ settingsStore.currencySymbol }}{{ product.selling_price != null ? product.selling_price.toFixed(2) : 'N/A' }}</td>
            <td>{{ product.quantity }}</td>
            <td>
                <span class="badge" :class="product.quantity > 0 ? (product.quantity <= settingsStore.lowStockThreshold ? 'badge-warning' : 'badge-success') : 'badge-danger'">
                  {{ product.quantity > 0 ? (product.quantity <= settingsStore.lowStockThreshold ? 'Low Stock' : 'In Stock') : 'Out of Stock' }}
                </span>
            </td>
            <td class="actions-cell">
              <router-link
                :to="{ name: 'EditProduct', params: { id: product.idInternal } }"
                class="btn btn-sm btn-secondary mr-1"
                title="Edit Product"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </router-link>
              <button @click="openStockAdjustmentModal(product)" class="btn btn-sm btn-warning mr-1" title="Adjust Stock">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M12 4v16"/></svg>
              </button>
              <button @click="openStockHistoryModal(product)" class="btn btn-sm btn-info mr-1" title="View Stock History">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>
              </button>
              <button @click="confirmDelete(product)" class="btn btn-sm btn-danger" title="Delete Product">
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
        <p v-if="productStore.searchTerm && productStore.searchTerm.length > 0" class="text-muted">
          No products match your search criteria for "<strong>{{ productStore.searchTerm }}</strong>".
        </p>
        <p v-else class="text-muted">
          No products found.
          <router-link to="/products/add" class="link-primary">Add your first product!</router-link>
        </p>
      </div>
    </div>

    <StockAdjustmentModal
      :visible="isStockAdjustmentModalVisible"
      :product-id="selectedProductForAction?.idInternal"
      :product-name="selectedProductForAction?.model"
      :current-stock="selectedProductForAction?.quantity"
      @close="closeStockAdjustmentModal"
      @stock-adjusted="handleStockAdjusted"
    />
    <StockHistoryModal
      :visible="isStockHistoryModalVisible"
      :product-id="selectedProductForAction?.idInternal"
      :product-name="selectedProductForAction?.model"
      @close="closeStockHistoryModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStockMovementStore } from '@/stores/stockMovementStore';
import { useToastStore } from '@/stores/toastStore'; // Import toast store
import StockAdjustmentModal from '@/components/inventory/StockAdjustmentModal.vue';
import StockHistoryModal from '@/components/inventory/StockHistoryModal.vue';

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const stockMovementStore = useStockMovementStore();
const toastStore = useToastStore(); // Instantiate toast store

const initialLoadComplete = ref(false);
const isStockAdjustmentModalVisible = ref(false);
const isStockHistoryModalVisible = ref(false);
const selectedProductForAction = ref(null);

const loadProducts = async () => {
  await productStore.fetchProducts();
  initialLoadComplete.value = true;
};

onMounted(async () => {
  await loadProducts();
  // Fetch all movements once for the history modal to filter locally
  // This might be inefficient for very large movement datasets in a real app
  if (stockMovementStore.movements.length === 0 && !stockMovementStore.isLoading) {
    await stockMovementStore.fetchAllMovements();
  }
});

const confirmDelete = (product) => {
  if (window.confirm(`Are you sure you want to delete "${product.model || product.name}"? This action cannot be undone.`)) {
    productStore.deleteProduct(product.idInternal)
      .then(() => {
        toastStore.success(`Product "${product.model || product.name}" deleted successfully.`);
      })
      .catch(error => {
        console.error("Failed to delete product:", error);
        toastStore.error(`Error deleting product: ${error.message || 'Unknown error'}`);
      });
  }
};

const openStockAdjustmentModal = (product) => {
  selectedProductForAction.value = product;
  isStockAdjustmentModalVisible.value = true;
};
const closeStockAdjustmentModal = () => {
  isStockAdjustmentModalVisible.value = false;
  selectedProductForAction.value = null;
};
const handleStockAdjusted = (payload) => {
  toastStore.success(`Stock for "${selectedProductForAction.value?.model}" adjusted successfully.`);
  // The product list should reactively update as productStore.products changes.
  // If not, a targeted productStore.fetchProducts() might be needed, but ideally not.
};

const openStockHistoryModal = (product) => {
  selectedProductForAction.value = product;
  isStockHistoryModalVisible.value = true;
};
const closeStockHistoryModal = () => {
  isStockHistoryModalVisible.value = false;
  selectedProductForAction.value = null;
};
</script>

<style scoped>
.page-title { margin-bottom: 0; }
.btn svg { vertical-align: middle; margin-right: var(--space-xs); }
.btn.btn-sm svg { width: 14px; height: 14px; }
.table td, .table th { vertical-align: middle; }
.loader { margin-bottom: 0.5rem; /* Ensure loader style from main.css is used */ }
.form-alert.alert-danger {
  color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;
  padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius);
}
[data-theme="dark"] .form-alert.alert-danger {
  background-color: #52262a; border-color: #8B3A3F; color: #ffacac;
}
.actions-cell button, .actions-cell .btn {
  margin-bottom: var(--space-xs); /* Space if buttons wrap */
}
.link-primary {
  color: var(--primary-color); text-decoration: underline; font-weight:500;
}
.link-primary:hover { color: var(--primary-hover-color); }
.text-muted { color: var(--text-color-muted); }
</style>
