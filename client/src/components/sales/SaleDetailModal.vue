<template>
  <div class="modal-backdrop" v-if="visible && sale" @click.self="closeModal">
    <div class="modal-content card">
      <div class="modal-header">
        <h3>Sale Details (ID: ...{{ sale.id.slice(-8) }})</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="card-body" style="max-height: 75vh; overflow-y: auto;">
        <div v-if="sale" class="sale-details-grid">
          <div class="detail-item"><strong>Date:</strong> <span>{{ new Date(sale.date).toLocaleString() }}</span></div>
          <div class="detail-item"><strong>Customer:</strong> <span>{{ sale.customerName || 'Anonymous' }}</span></div>
          <div class="detail-item"><strong>Subtotal:</strong> <span>{{ settingsStore.currencySymbol }}{{ sale.subtotalAmount.toFixed(2) }}</span></div>
          <div class="detail-item">
            <strong>Discount ({{ sale.discountPercentage.toFixed(1) }}%):</strong>
            <span>-{{ settingsStore.currencySymbol }}{{ sale.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="detail-item"><strong>Total Amount:</strong> <span class="text-primary" style="font-weight:bold;">{{ settingsStore.currencySymbol }}{{ sale.totalAmount.toFixed(2) }}</span></div>
          <div class="detail-item">
            <strong>Estimated Profit:</strong>
            <span :class="sale.estimatedProfit >= 0 ? 'text-success' : 'text-danger'" style="font-weight:bold;">
                    {{ settingsStore.currencySymbol }}{{ sale.estimatedProfit.toFixed(2) }}
                </span>
          </div>
        </div>

        <h4 class="mt-3 mb-2">Items Sold:</h4>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
            <tr>
              <th>Product (Model)</th>
              <th>Qty</th>
              <th>Price Each</th>
              <th>Base Price Each</th>
              <th>Subtotal</th>
              <th>Item Profit</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in sale.items" :key="index">
              <td>{{ item.productModel }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ settingsStore.currencySymbol }}{{ item.priceAtSale.toFixed(2) }}</td>
              <td>{{ settingsStore.currencySymbol }}{{ item.basePriceAtSale.toFixed(2) }}</td>
              <td>{{ settingsStore.currencySymbol }}{{ (item.priceAtSale * item.quantity).toFixed(2) }}</td>
              <td :class="(item.priceAtSale - item.basePriceAtSale) * item.quantity >= 0 ? 'text-success' : 'text-danger'">
                {{ settingsStore.currencySymbol }}{{ ((item.priceAtSale - item.basePriceAtSale) * item.quantity).toFixed(2) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer button-group" style="justify-content: flex-end;">
        <button type="button" class="btn btn-light" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps({
  visible: Boolean,
  sale: Object // The full sale object to display
});

const emit = defineEmits(['close']);

const settingsStore = useSettingsStore();

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  align-items: center; justify-content: center; z-index: 1040;
  animation: fadeInBackdrop 0.3s ease-out;
}
@keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  width: 90%; max-width: 800px; /* Wider for sale details */
  display: flex; flex-direction: column;
  animation: slideInModal 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 1rem; margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
  margin: 0; font-size: 1.6em; font-weight: 700;
  color: var(--text-color); font-family: var(--font-family-serif);
}
.close-button {
  background: transparent; border: none; font-size: 2.2rem; font-weight: bold;
  color: var(--text-color-muted); cursor: pointer; padding: 0 0.5rem; line-height: 1;
}
.close-button:hover { color: var(--primary-color); }

.sale-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-sm) var(--space-lg);
  margin-bottom: var(--space-lg);
  font-size: 0.95rem;
}
.detail-item {
  padding: var(--space-xs) 0;
}
.detail-item strong {
  color: var(--text-color-muted);
  margin-right: var(--space-sm);
}
.text-primary { color: var(--primary-color); } /* Ensure defined in main.css */
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }

.table-sm th, .table-sm td { /* Smaller padding for detail table */
  padding: var(--space-sm) var(--space-md);
}
.button-group { margin-top: 0; }
.modal-content .card-footer {
  background-color: var(--bg-color-offset);
  border-top: 1px solid var(--border-color);
  padding: var(--space-md) 2.5rem;
}
</style>
