<template>
  <div class="modal-backdrop" v-if="visible && product" @click.self="closeModal" role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
    <div class="modal-content card product-detail-modal">
      <div class="modal-header">
        <h3 :id="modalTitleId">Product Details: {{ product.model || product.name }}</h3>
        <button class="close-button no-print" @click="closeModal" aria-label="Close modal">&times;</button>
      </div>
      <div class="card-body" ref="detailPrintContent" style="max-height: 75vh; overflow-y: auto;">
        <div class="print-header print-only" style="display:none; text-align:center; margin-bottom: 1rem;">
          <h3 style="font-family: var(--font-family-serif); margin-bottom: 0.25rem;">{{ settingsStore.storeName }}</h3>
          <h4 class="report-title-print" style="margin-bottom: 0.25rem;">Product Details</h4>
          <p style="font-size:0.9em;">Product: <strong>{{ product.model || product.name }}</strong> (SKU: {{ product.no || product.sku }})</p>
          <p style="font-size:0.8em;">Generated: {{ new Date().toLocaleString() }}</p>
        </div>
        <hr class="print-only" style="display:none; border-top: 1px solid #ccc; margin: 1rem 0;">

        <div v-if="product.image_url" class="product-image-container mb-3">
          <img :src="product.image_url" :alt="product.model || product.name" class="product-image" @error="imageLoadError = true" v-show="!imageLoadError">
          <div v-if="imageLoadError" class="image-placeholder">Image not available</div>
        </div>

        <div class="details-grid">
          <div class="detail-group">
            <h4>Core Information</h4>
            <p><strong>Model/Name:</strong> {{ product.model || product.name || '-' }}</p>
            <p><strong>Company/Brand:</strong> {{ product.company || '-' }}</p>
            <p><strong>Category:</strong> {{ product.category || '-' }}</p>
            <p><strong>SKU/No.:</strong> {{ product.no || product.sku || '-' }}</p>
            <p><strong>Serial Number:</strong> {{ product.serial_number || '-' }}</p>
            <p><strong>Condition:</strong> {{ product.condition || '-' }}</p>
          </div>

          <div class="detail-group">
            <h4>Stock & Pricing</h4>
            <p><strong>Quantity in Stock:</strong> {{ product.quantity }}</p>
            <p><strong>Selling Price:</strong> {{ settingsStore.currencySymbol }}{{ (product.selling_price || 0).toFixed(2) }}</p>
            <p><strong>Base/Cost Price:</strong> {{ settingsStore.currencySymbol }}{{ (product.base_price || 0).toFixed(2) }}</p>
            <p><strong>Best Price:</strong> {{ settingsStore.currencySymbol }}{{ (product.best_price || 0).toFixed(2) }}</p>
            <p><strong>Supplier:</strong> {{ product.supplier || '-' }}</p>
            <p><strong>Purchase Date:</strong> {{ product.purchase_date ? formatDate(product.purchase_date) : '-' }}</p>
          </div>

          <div class="detail-group full-span-if-specs-long">
            <h4>Specifications</h4>
            <p><strong>CPU:</strong> {{ product.cpu || '-' }} {{ product.gen ? `(${product.gen} Gen)` : '' }}</p>
            <p><strong>RAM:</strong> {{ product.ram || '-' }}</p>
            <p><strong>Storage:</strong>
              <span v-if="product.ssd">SSD: {{ product.ssd }}</span>
              <span v-if="product.ssd && product.hdd"> | </span>
              <span v-if="product.hdd">HDD: {{ product.hdd }}</span>
              <span v-if="!product.ssd && !product.hdd">-</span>
            </p>
            <p><strong>VGA:</strong> {{ product.vga_type || '-' }} {{ product.vga_memory ? `(${product.vga_memory})` : '' }}</p>
            <p><strong>Screen Touch:</strong> {{ product.screen_touch ? 'Yes' : 'No' }}</p>
            <p><strong>Color:</strong> {{ product.color || '-' }}</p>
            <p><strong>Dimensions:</strong> {{ product.dimensions || '-' }}</p>
            <p><strong>Weight:</strong> {{ product.weight || '-' }}</p>
            <p><strong>Warranty:</strong> {{ product.warranty || '-' }}</p>
          </div>

          <div class="detail-group full-span-if-desc-long">
            <h4>Additional Information</h4>
            <p><strong>Description/Notes:</strong></p>
            <p class="description-text">{{ product.description || '-' }}</p>
            <p><strong>Tags:</strong> <span v-if="product.tags">{{ product.tags }}</span><span v-else>-</span></p>
            <p><strong>Created At:</strong> {{ product.createdAt ? new Date(product.createdAt).toLocaleString() : '-' }}</p>
            <p><strong>Last Updated:</strong> {{ product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-' }}</p>
          </div>
        </div>
      </div>
      <div class="card-footer button-group no-print" style="justify-content: space-between;">
        <button type="button" class="btn btn-light" @click="printDetails">🖨️ Print Details</button>
        <router-link :to="{ name: 'EditProduct', params: { id: product.idInternal } }" class="btn btn-secondary" @click="closeModal">
          ✏️ Edit Product
        </router-link>
        <button type="button" class="btn btn-primary" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const props = defineProps({
  visible: Boolean,
  product: Object // The full product object to display
});

const emit = defineEmits(['close']);

const settingsStore = useSettingsStore();
const toastStore = useToastStore();
const detailPrintContent = ref(null);
const imageLoadError = ref(false);

const modalTitleId = computed(() => `productDetailTitle-${props.product?.idInternal}`);

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    imageLoadError.value = false; // Reset image error state when product changes
  }
});

const closeModal = () => {
  emit('close');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Assuming dateString is YYYY-MM-DD
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
};

const printDetails = () => {
  if (detailPrintContent.value) {
    const printWindow = window.open('', '_blank', 'height=700,width=1000');
    if(printWindow) {
      printWindow.document.write('<html><head><title>Product Details</title>');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try { return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n'); }
          catch (e) { if (styleSheet.href) return `<link rel="stylesheet" href="${styleSheet.href}">`; return ''; }
        }).join('\n');

      printWindow.document.write(`<style>${styles}</style>`);
      printWindow.document.write('<style>.no-print{display:none !important;} .print-only{display:block !important;} body{font-family: Arial, sans-serif; margin: 20px; color: #000;} .product-image-container{text-align:center; margin-bottom:1rem;} .product-image{max-width:200px; max-height:200px; border:1px solid #ccc;} .details-grid{font-size:10pt;} .detail-group h4{font-size:12pt; margin-top:0.5rem; border-bottom:1px solid #ccc; padding-bottom:0.2rem;} .detail-group p{margin:0.3rem 0;} .report-title-print{text-align:center; margin-bottom:0.5rem; font-size: 14pt;} .store-name-print{display:block !important; text-align:center; font-weight:bold; margin-bottom: 0.5rem;} .date-print{display:block !important; text-align:center; font-size:0.9em; margin-bottom:0.5rem;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(detailPrintContent.value.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    } else {
      toastStore.error("Could not open print window. Please check pop-up blocker settings.", 4000);
    }
  }
};
</script>

<style scoped>
.modal-backdrop { /* Standard modal backdrop */ }
.modal-content.product-detail-modal { max-width: 800px; } /* Wider for details */
.modal-header h3 { font-size: 1.4em; font-family: var(--font-family-sans); }
.close-button { /* Standard close button */ }

.product-image-container { text-align: center; }
.product-image {
  max-width: 100%;
  max-height: 250px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  object-fit: contain;
}
.image-placeholder {
  width: 100%; height: 150px; background-color: var(--bg-color-offset);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-color-muted); border-radius: var(--border-radius-sm);
  border: 1px dashed var(--border-color);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns by default */
  gap: var(--space-lg) var(--space-xl);
  font-size: 0.95rem;
}
.detail-group h4 {
  font-family: var(--font-family-serif);
  color: var(--primary-color);
  font-size: 1.1em;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--primary-color);
}
.detail-group p {
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}
.detail-group p strong {
  color: var(--text-color-muted);
  margin-right: var(--space-xs);
  min-width: 120px; /* Align keys somewhat */
  display: inline-block;
}
.description-text {
  white-space: pre-wrap; /* Preserve line breaks in description */
  background-color: var(--bg-color-offset);
  padding: var(--space-sm);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

/* Spanning for longer sections if needed */
.full-span-if-specs-long, .full-span-if-desc-long {
  /* By default, they are in one column. If you want them to span: */
  /* grid-column: 1 / -1; */
}
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr; /* Stack on smaller screens */
  }
}

.modal-content .card-footer { /* Standard footer */ }
</style>
```

---

### 2. Update `src/pages/products/ProductsListPage.vue`

Add a "View Details" button and logic to open the `ProductDetailModal`.


```vue
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
    <div v-else-if="productStore.error" class="card"><div class="card-body form-alert alert-danger">
      <p><strong>Error loading products:</strong></p>
      <p>{{ productStore.error }}</p>
      <button class="btn btn-sm btn-primary mt-2" @click="loadProducts">Try Again</button>
    </div></div>
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
              <button @click="openProductDetailModal(product)" class="btn btn-sm btn-info mr-1" title="View Details">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
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
    <ProductDetailModal
      :visible="isProductDetailModalVisible"
      :product="selectedProductForAction"
      @close="closeProductDetailModal"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStockMovementStore } from '@/stores/stockMovementStore';
import { useToastStore } from '@/stores/toastStore';
import StockAdjustmentModal from '@/components/inventory/StockAdjustmentModal.vue';
import StockHistoryModal from '@/components/inventory/StockHistoryModal.vue';
import ProductDetailModal from '@/components/products/ProductDetailModal.vue'; // NEW IMPORT

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const stockMovementStore = useStockMovementStore();
const toastStore = useToastStore();

const initialLoadComplete = ref(false);
const isStockAdjustmentModalVisible = ref(false);
const isStockHistoryModalVisible = ref(false);
const isProductDetailModalVisible = ref(false); // NEW STATE
const selectedProductForAction = ref(null);

const loadInitialData = async () => {
  const promises = [];
  if (productStore.products.length === 0 || productStore.error) {
    promises.push(productStore.fetchProducts());
  }
  // Fetch all movements once for the history modal to filter locally
  if (stockMovementStore.movements.length === 0 && !stockMovementStore.isLoading) {
    promises.push(stockMovementStore.fetchAllMovements());
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  initialLoadComplete.value = true;
};

onMounted(() => {
  loadInitialData();
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
const handleStockAdjusted = () => {
  toastStore.success(`Stock for "${selectedProductForAction.value?.model}" adjusted successfully.`);
};

const openStockHistoryModal = (product) => {
  selectedProductForAction.value = product;
  isStockHistoryModalVisible.value = true;
};
const closeStockHistoryModal = () => {
  isStockHistoryModalVisible.value = false;
  selectedProductForAction.value = null;
};

// NEW METHODS FOR PRODUCT DETAIL MODAL
const openProductDetailModal = (product) => {
  selectedProductForAction.value = product;
  isProductDetailModalVisible.value = true;
};
const closeProductDetailModal = () => {
  isProductDetailModalVisible.value = false;
  selectedProductForAction.value = null;
};
</script>

<style scoped>
.page-title { margin-bottom: 0; }
.btn svg { vertical-align: middle; margin-right: var(--space-xs); }
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
.actions-cell button, .actions-cell .btn {
  margin-bottom: var(--space-xs);
  margin-right: var(--space-xs); /* Ensure spacing between buttons */
}
.actions-cell button:last-child, .actions-cell .btn:last-child {
  margin-right: 0;
}
.link-primary {
  color: var(--primary-color); text-decoration: underline; font-weight:500;
}
.link-primary:hover { color: var(--primary-hover-color); }
.text-muted { color: var(--text-color-muted); }
</style>
