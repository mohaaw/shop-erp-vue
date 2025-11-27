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
          catch { if (styleSheet.href) return `<link rel="stylesheet" href="${styleSheet.href}">`; return ''; }
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

.modal-content.product-detail-modal { max-width: 800px; } /* Wider for details */
.modal-header h3 { font-size: 1.4em; font-family: var(--font-family-sans); }


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

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr; /* Stack on smaller screens */
  }
}


</style>
