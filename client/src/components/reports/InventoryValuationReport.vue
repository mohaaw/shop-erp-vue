<template>
  <div class="inventory-valuation-report-component card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <span>Inventory Valuation Report</span>
      <button
        v-if="productsForReport.length > 0"
        @click="printReport"
        class="btn btn-sm btn-outline-secondary no-print"
      >
        🖨️ Print Report
      </button>
    </div>
    <div class="card-body">
      <div ref="reportPrintContent">
        <p class="print-only store-name-print" style="display:none; text-align:center; font-weight:bold; font-size: 1.2em;">{{ settingsStore.storeName }}</p>
        <h4 class="mt-3 report-title-print">Inventory Valuation Report</h4>
        <p class="print-only date-print" style="display:none; text-align:center; font-size: 0.9em;">Generated: {{ new Date().toLocaleString() }}</p>
        <hr class="print-only" style="display:none; border-top: 1px solid #ccc; margin: 1rem 0;">

        <div class="summary-metrics form-grid-3 mb-4">
          <div class="metric-item card card-body">
            <strong>Total Units in Stock:</strong>
            {{ totalUnitsInStock }}
          </div>
          <div class="metric-item card card-body">
            <strong>Total Value (at Cost):</strong>
            {{ settingsStore.currencySymbol }}{{ productStore.inventoryValuationByCost.toFixed(2) }}
          </div>
          <div class="metric-item card card-body">
            <strong>Total Value (at Sale Price):</strong>
            {{ settingsStore.currencySymbol }}{{ productStore.inventoryValuationBySalePrice.toFixed(2) }}
          </div>
        </div>

        <div v-if="productStore.isLoading && productStore.products.length === 0" class="text-center p-3">
          <div class="loader"></div> Loading product data...
        </div>
        <div v-else-if="productsForReport.length > 0" class="table-responsive">
          <table class="table table-sm table-hover">
            <thead>
            <tr>
              <th>Product (Model)</th>
              <th>SKU/No.</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Cost Price ({{ settingsStore.currencySymbol }})</th>
              <th>Sale Price ({{ settingsStore.currencySymbol }})</th>
              <th>Total Value (Cost)</th>
              <th>Total Value (Sale)</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="product in productsForReport" :key="product.idInternal">
              <td>{{ product.model || product.name }}</td>
              <td>{{ product.no || product.sku || '-' }}</td>
              <td>{{ product.category || '-' }}</td>
              <td>{{ product.quantity }}</td>
              <td>{{ settingsStore.currencySymbol }}{{ (product.base_price || 0).toFixed(2) }}</td>
              <td>{{ settingsStore.currencySymbol }}{{ (product.selling_price || 0).toFixed(2) }}</td>
              <td style="font-weight: 500;">{{ settingsStore.currencySymbol }}{{ product.valuationAtCost.toFixed(2) }}</td>
              <td style="font-weight: 500;">{{ settingsStore.currencySymbol }}{{ product.valuationAtSalePrice.toFixed(2) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted text-center mt-3">
          No products found to generate valuation report. Add some products first.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const reportPrintContent = ref(null);

const productsForReport = computed(() => productStore.productsWithIndividualValuation);

const totalUnitsInStock = computed(() => {
  return productStore.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
});

const printReport = () => {
  if (reportPrintContent.value) {
    const printWindow = window.open('', '_blank', 'height=700,width=1000');
    if(printWindow) {
      printWindow.document.write('<html><head><title>Inventory Valuation Report</title>');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch {
            if (styleSheet.href) return `<link rel="stylesheet" href="${styleSheet.href}">`;
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`<style>${styles}</style>`);
      printWindow.document.write('<style>.no-print{display:none !important;} .print-only{display:block !important;} .report-title-print{text-align:center; margin-bottom:0.5rem; font-size: 14pt;} .summary-metrics .metric-item{border:1px solid #eee; margin-bottom:0.5rem; background-color: #fff !important; /* Ensure white background for print */} table{font-size:9pt} body{background-color: #fff !important; color: #000 !important;} </style>');
      printWindow.document.write('</head><body style="margin: 20px;">');
      printWindow.document.write(reportPrintContent.value.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      const toastStore = useToastStore();
      toastStore.error("Could not open print window. Please check pop-up blocker settings.", 4000);
      // As an alternative, you could try printing the current window with print-specific CSS
      // window.print(); // This would print the whole page, styled by @media print
    }
  }
};

onMounted(async () => {
  if (productStore.products.length === 0 && !productStore.isLoading) {
    await productStore.fetchProducts();
  }
});
</script>

<style scoped>
.summary-metrics .metric-item {
  padding: var(--space-md); text-align: left;
  font-size: 0.95rem;
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-sm);
}
.summary-metrics .metric-item strong {
  display: block; font-size: 0.85rem; color: var(--text-color-muted);
  margin-bottom: var(--space-xs);
}
/* .summary-metrics .metric-item { font-size: 1.2rem; font-weight: 600; } // Already defined, ensure no conflict */
.table-sm th, .table-sm td { padding: var(--space-sm) var(--space-md); }
.loader { width: 24px; height: 24px; border-width: 3px; margin: 0 auto var(--space-sm) auto; }
.btn-outline-secondary {
  color: var(--secondary-color);
  border-color: var(--secondary-color);
}
.btn-outline-secondary:hover {
  color: var(--text-color-inverted);
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}
[data-theme="dark"] .btn-outline-secondary {
  color: var(--nav-text-color);
  border-color: var(--nav-text-color);
}
[data-theme="dark"] .btn-outline-secondary:hover {
  color: var(--bg-color);
  background-color: var(--nav-text-color);
}
</style>
