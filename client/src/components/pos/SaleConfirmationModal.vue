<template>
  <div class="modal-backdrop" v-if="visible && sale" @click.self="closeModal" role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
    <div class="modal-content card sale-confirmation-modal">
      <div class="modal-header no-print">
        <h3 :id="modalTitleId">✅ Sale Confirmed!</h3>
        <button class="close-button" @click="closeModal" aria-label="Close modal">&times;</button>
      </div>
      <div ref="receiptPrintContent" class="receipt-area">
        <div class="card-body">
          <div class="print-header print-only" style="display:none; text-align:center; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-family-serif); margin-bottom: 0.25rem;">{{ settingsStore.storeName }}</h3>
            <p style="font-size:0.8em; margin-bottom: 0.1rem;">{{ settingsStore.storeAddress }}</p>
            <p style="font-size:0.8em;">{{ settingsStore.storePhone }} | {{ settingsStore.storeEmail }}</p>
            <hr style="border-style: dashed; margin: 0.5rem 0;">
          </div>
          <h4>Receipt (ID: ...{{ sale.id.slice(-8) }})</h4>
          <hr>
          <p><strong>Date:</strong> {{ new Date(sale.date).toLocaleString() }}</p>
          <p><strong>Customer:</strong> {{ sale.customerName || 'Anonymous' }}</p>
          <hr>
          <div class="table-responsive">
            <table class="table table-sm receipt-items-table">
              <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in sale.items" :key="item.productIdInternal + '-' + index">
                <td>{{ item.productModel }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">{{ settingsStore.currencySymbol }}{{ item.priceAtSale.toFixed(2) }}</td>
                <td class="text-right">{{ settingsStore.currencySymbol }}{{ (item.priceAtSale * item.quantity).toFixed(2) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <hr>
          <div class="receipt-totals">
            <p><strong>Subtotal:</strong> <span>{{ settingsStore.currencySymbol }}{{ sale.subtotalAmount.toFixed(2) }}</span></p>
            <p v-if="sale.discountAmount > 0">
              <strong>Discount ({{ sale.discountPercentage.toFixed(1) }}%):</strong>
              <span>-{{ settingsStore.currencySymbol }}{{ sale.discountAmount.toFixed(2) }}</span>
            </p>
            <p class="grand-total">
              <strong>TOTAL:</strong>
              <span>{{ settingsStore.currencySymbol }}{{ sale.totalAmount.toFixed(2) }}</span>
            </p>
          </div>
          <p v-if="sale.notes" class="sale-notes mt-2">
            <strong>Notes:</strong> {{ sale.notes }}
          </p>
          <hr>
          <p class="text-center thank-you-msg">Thank you for your purchase!</p>
          <p class="print-only store-name-print" style="display:none; text-align:center; font-size:0.8em; margin-top:1rem;">Visit us again at {{ settingsStore.storeName }}!</p>
        </div>
      </div>
      <div class="card-footer button-group no-print" style="justify-content: space-between;">
        <button type="button" class="btn btn-light" @click="printReceiptContent">🖨️ Print Receipt</button>
        <button type="button" class="btn btn-primary" @click="closeModalAndNewSale">Start New Sale</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const props = defineProps({
  visible: Boolean,
  sale: Object
});

const emit = defineEmits(['close', 'start-new-sale']);
const settingsStore = useSettingsStore();
const toastStore = useToastStore();
const receiptPrintContent = ref(null);

const modalTitleId = computed(() => `saleConfirmationTitle-${props.sale?.id}`);

const closeModal = () => {
  emit('close');
};

const closeModalAndNewSale = () => {
  emit('start-new-sale');
  emit('close');
};

const printReceiptContent = () => {
  if (receiptPrintContent.value) {
    const contentToPrint = receiptPrintContent.value.innerHTML;
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    if(printWindow){
      printWindow.document.write('<html><head><title>Sale Receipt</title>');
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch {
            if (styleSheet.href) return `<link rel="stylesheet" href="${styleSheet.href}">`;
            return '';
          }
        }).join('\n');
      printWindow.document.write(`<style>${styles}</style>`);
      printWindow.document.write(`
          <style>
            body { font-family: 'Courier New', Courier, monospace; margin: 10px; font-size: 10pt; color: #000; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .receipt-area { padding: 0; margin: 0; }
            .receipt-area .card-body { padding: 0 !important; }
            .receipt-area h4 { font-size: 12pt; text-align: center; margin-bottom: 5px; font-family: var(--font-family-sans); }
            .receipt-area hr { margin: 5px 0; border-style: dashed; border-top-width: 1px; border-color: #666; }
            .receipt-area table { width: 100%; font-size: 9pt; margin: 5px 0; }
            .receipt-area th, .receipt-area td { padding: 2px 4px; border: none; }
            .receipt-area .text-right { text-align: right; }
            .receipt-area .text-center { text-align: center; }
            .receipt-totals p { font-size: 10pt; margin-bottom: 2px; display: flex; justify-content: space-between; }
            .receipt-totals .grand-total strong, .receipt-totals .grand-total span { font-size: 11pt; font-weight: bold; }
            .sale-notes { font-size: 8pt; margin-top: 5px; }
            .thank-you-msg { font-size: 10pt; font-weight: bold; margin-top: 10px; }
            .print-header { margin-bottom: 10px !important; }
            .print-header h3 { font-size: 14pt !important; }
            .print-header p { font-size: 8pt !important; margin-bottom: 2px !important; }
          </style>
        `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(contentToPrint);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    } else {
      toastStore.error("Could not open print window. Please check pop-up blocker settings.", 4000);
    }
  } else {
    toastStore.error("Receipt content not found.", 3000);
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  align-items: center; justify-content: center; z-index: 1050;
  animation: fadeInBackdrop 0.3s ease-out;
}
@keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }

.modal-content.sale-confirmation-modal {
  width: 90%; max-width: 480px;
}
.modal-header h3 { font-size: 1.4em; font-family: var(--font-family-sans); }
.close-button {
  background: transparent; border: none; font-size: 2.2rem; font-weight: bold;
  color: var(--text-color-muted); cursor: pointer; padding: 0 0.5rem; line-height: 1;
}
.close-button:hover { color: var(--primary-color); }

.receipt-area .card-body { font-size: 0.9rem; line-height: 1.4; font-family: 'Courier New', Courier, monospace; }
.receipt-area hr { border: none; border-top: 1px dashed var(--border-color); margin: var(--space-sm) 0; }
.receipt-items-table th, .receipt-items-table td { padding: var(--space-xs) var(--space-sm); font-size: 0.85rem; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.receipt-totals p { display: flex; justify-content: space-between; margin-bottom: var(--space-xs); }
.receipt-totals p.grand-total strong,
.receipt-totals p.grand-total span { font-size: 1.1em; font-weight: bold; color: var(--primary-color); }
.sale-notes { font-size: 0.8rem; color: var(--text-color-muted); margin-top: var(--space-sm); }
.thank-you-msg { font-size: 1em; font-weight: bold; margin-top: var(--space-md); }
.modal-content .card-footer { padding: var(--space-md) 1.5rem; }
.button-group { margin-top: 0; }
</style>
