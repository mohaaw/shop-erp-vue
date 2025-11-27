<template>
  <div class="stock-movement-report-component card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Stock Movement Ledger</span>
      <button
        v-if="selectedProductId && filteredMovements.length > 0"
        @click="printReport"
        class="btn btn-sm btn-outline-secondary no-print"
      >
        🖨️ Print Ledger
      </button>
    </div>
    <div class="card-body">
      <div class="filter-section form-grid-2 mb-3 no-print">
        <div class="form-group">
          <label for="report-product-select">Select Product:</label>
          <select id="report-product-select" class="form-control form-control-sm" v-model="selectedProductId">
            <option :value="null">-- Select a Product --</option>
            <option v-for="product in productStore.products" :key="product.idInternal" :value="product.idInternal">
              {{ product.model || product.name }} ({{ product.company }}) - SKU: {{ product.no || product.sku || 'N/A' }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Current Stock:</label>
          <input type="text" class="form-control form-control-sm" :value="currentProductStock" readonly disabled>
        </div>
      </div>

      <div v-if="stockMovementStore.isLoading && !selectedProductId" class="text-center p-3 text-muted">
        <div class="loader"></div> Loading initial movement data...
      </div>
      <div v-else-if="!selectedProductId" class="text-center p-3 text-muted">
        Please select a product to view its stock movement history.
      </div>
      <div v-else>
        <div ref="reportPrintContent">
          <div class="print-header print-only" style="display:none; text-align:center; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-family-serif); margin-bottom: 0.25rem;">{{ settingsStore.storeName }}</h3>
            <h4 class="report-title-print" style="margin-bottom: 0.25rem;">Stock Movement Ledger</h4>
            <p style="font-size:0.9em;">Product: <strong>{{ selectedProductDetails?.model || selectedProductDetails?.name }}</strong> (SKU: {{ selectedProductDetails?.no || selectedProductDetails?.sku }})</p>
            <p style="font-size:0.8em;">Generated: {{ new Date().toLocaleString() }}</p>
          </div>
          <hr class="print-only" style="display:none; border-top: 1px solid #ccc; margin: 1rem 0;">

          <h4 class="mt-3 report-title-screen no-print">
            History for: {{ selectedProductDetails?.model || selectedProductDetails?.name }}
          </h4>

          <div class="table-responsive mt-3" v-if="filteredMovements.length > 0">
            <table class="table table-sm table-hover">
              <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Qty Change</th>
                <th>New Qty</th>
                <th>Reason</th>
                <th>Related Doc ID</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="movement in filteredMovements" :key="movement.id">
                <td>{{ new Date(movement.date).toLocaleString() }}</td>
                <td>
                    <span class="badge" :class="getMovementTypeBadgeClass(movement.type)">
                        {{ formatMovementType(movement.type) }}
                    </span>
                </td>
                <td :class="movement.quantityChange >= 0 ? 'text-success' : 'text-danger'">
                  {{ movement.quantityChange > 0 ? '+' : '' }}{{ movement.quantityChange }}
                </td>
                <td>{{ movement.newQuantity }}</td>
                <td>{{ movement.reason || '-' }}</td>
                <td>{{ movement.relatedDocumentId || '-' }}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-muted text-center mt-3">No stock movement history found for this product.</p>
        </div>
      </div>
      <div v-if="stockMovementStore.error" class="form-alert alert-danger mt-3">
        Error loading stock movements: {{ stockMovementStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStockMovementStore } from '@/stores/stockMovementStore';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const stockMovementStore = useStockMovementStore();
const productStore = useProductStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const selectedProductId = ref(null);
const reportPrintContent = ref(null);

const filteredMovements = computed(() => {
  if (!selectedProductId.value) return [];
  return stockMovementStore.getMovementsByProductId(selectedProductId.value);
});

const selectedProductDetails = computed(() => {
  if (!selectedProductId.value) return null;
  return productStore.getProductById(selectedProductId.value);
});

const currentProductStock = computed(() => {
  return selectedProductDetails.value?.quantity ?? 'N/A';
});


const printReport = () => {
  if (reportPrintContent.value && selectedProductId.value) {
    const printWindow = window.open('', '_blank', 'height=700,width=1000');
    if(printWindow) {
      printWindow.document.write('<html><head><title>Stock Movement Ledger</title>');
      const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r=>r.cssText).join('\n'); } catch{ if(s.href) return `<link rel="stylesheet" href="${s.href}">`; return '';}}).join('\n');
      printWindow.document.write(`<style>${styles}</style>`);
      printWindow.document.write('<style>.no-print{display:none !important;} .print-only{display:block !important;} .report-title-print{text-align:center; margin-bottom:0.5rem; font-size: 14pt;} table{font-size:9pt} body{background-color: #fff !important; color: #000 !important; font-family: Arial, sans-serif;} .store-name-print{display:block !important; text-align:center; font-weight:bold; margin-bottom: 0.5rem;} .date-print{display:block !important; text-align:center; font-size:0.9em; margin-bottom:0.5rem;}</style>');
      printWindow.document.write('</head><body style="margin: 20px;">');
      printWindow.document.write(reportPrintContent.value.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    } else {
      toastStore.error("Could not open print window. Please check pop-up blocker settings.", 4000);
    }
  }
};


const formatMovementType = (type) => {
  if (!type) return 'Unknown';
  return type.replace(/_/g, ' ').replace(/\b(.)/g, c => c.toUpperCase());
};

const getMovementTypeBadgeClass = (type) => {
  if (!type) return 'badge-secondary';
  if (type.includes('sale') || type.includes('remove') || type.includes('damage') || type.includes('loss') || type.includes('deletion')) {
    return 'badge-danger';
  }
  if (type.includes('add') || type.includes('initial') || type.includes('received') || type.includes('return_customer')) {
    return 'badge-success';
  }
  return 'badge-info';
};

onMounted(async () => {
  const promises = [];
  if (productStore.products.length === 0 && !productStore.isLoading) {
    promises.push(productStore.fetchProducts());
  }
  if (stockMovementStore.movements.length === 0 && !stockMovementStore.isLoading) {
    promises.push(stockMovementStore.fetchAllMovements());
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
});
</script>

<style scoped>
.filter-section .form-group { margin-bottom: 0; }
.table-sm th, .table-sm td { padding: var(--space-sm) var(--space-md); font-size: 0.9rem; }
.text-success { color: var(--success-color) !important; }
.text-danger { color: var(--danger-color) !important; }
.text-muted { color: var(--text-color-muted); }
.loader { width: 24px; height: 24px; border-width: 3px; margin: 0 auto var(--space-sm) auto; }
.form-control-sm { padding: 0.5rem 0.75rem; font-size: 0.9rem; height: auto; }
.btn-outline-secondary {
  color: var(--secondary-color); border-color: var(--secondary-color);
}
.btn-outline-secondary:hover {
  color: var(--text-color-inverted); background-color: var(--secondary-color); border-color: var(--secondary-color);
}
[data-theme="dark"] .btn-outline-secondary { color: var(--nav-text-color); border-color: var(--nav-text-color); }
[data-theme="dark"] .btn-outline-secondary:hover { color: var(--bg-color); background-color: var(--nav-text-color); }

</style>
