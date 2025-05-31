<template>
  <div class="modal-backdrop" v-if="visible" @click.self="closeModal">
    <div class="modal-content card">
      <div class="modal-header">
        <h3>Adjust Stock for: {{ productName }}</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <form @submit.prevent="submitStockAdjustment">
        <div class="card-body" style="max-height: 70vh; overflow-y: auto;">
          <div v-if="formError" class="form-alert alert-danger mb-3">{{ formError }}</div>

          <div class="form-group">
            <label for="adjustment-type">Adjustment Type:*</label>
            <select id="adjustment-type" v-model="adjustment.type" class="form-control" required>
              <option value="manual_adjustment_add">Manual Add (e.g., found stock, received without PO)</option>
              <option value="manual_adjustment_remove">Manual Remove (e.g., stocktake correction)</option>
              <option value="damage">Damaged Goods</option>
              <option value="theft_loss">Theft / Loss</option>
              <option value="return_to_supplier">Return to Supplier</option>
              <option value="internal_use">Internal Use</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity-change">Quantity Change:*</label>
            <input
              type="number"
              id="quantity-change"
              v-model.number="adjustment.quantityChange"
              class="form-control"
              required
              placeholder="e.g., 10 for add, -5 for remove"
            >
            <small class="form-text text-muted">
              Enter a positive number to add stock, a negative number to remove stock.
            </small>
          </div>

          <div class="form-group">
            <label for="adjustment-reason">Reason for Adjustment:*</label>
            <textarea
              id="adjustment-reason"
              v-model.trim="adjustment.reason"
              class="form-control"
              rows="3"
              required
              placeholder="e.g., Stocktake correction, Damaged during handling"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="related-document-id">Related Document ID (Optional):</label>
            <input
              type="text"
              id="related-document-id"
              v-model.trim="adjustment.relatedDocumentId"
              class="form-control"
              placeholder="e.g., Internal memo number, Damage report ID"
            >
          </div>
        </div>
        <div class="card-footer button-group" style="justify-content: flex-end;">
          <button type="button" class="btn btn-light" @click="closeModal">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="productStore.isLoading">
            💾 {{ productStore.isLoading ? 'Adjusting...' : 'Adjust Stock' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { useProductStore } from '@/stores/productStore';

const props = defineProps({
  visible: Boolean,
  productId: String,
  productName: String,
  currentStock: Number,
});

const emit = defineEmits(['close', 'stock-adjusted']);

const productStore = useProductStore();
const formError = ref(null);

const initialAdjustmentState = () => ({
  type: 'manual_adjustment_add',
  quantityChange: null,
  reason: '',
  relatedDocumentId: '',
});

const adjustment = reactive(initialAdjustmentState());

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formError.value = null;
    Object.assign(adjustment, initialAdjustmentState()); // Reset form
    if (!props.productId) {
      formError.value = "Product ID is missing. Cannot adjust stock.";
    }
  }
});

const closeModal = () => {
  emit('close');
};

const validateForm = () => {
  if (!adjustment.type) return "Adjustment type is required.";
  if (adjustment.quantityChange === null || isNaN(adjustment.quantityChange) || adjustment.quantityChange === 0) {
    return "Quantity change must be a non-zero number.";
  }
  if (props.currentStock + adjustment.quantityChange < 0 && adjustment.type !== 'theft_loss' && adjustment.type !== 'damage' && adjustment.type !== 'return_to_supplier' && !adjustment.type.includes('remove')) {
    // Allow negative adjustments that result in negative stock only for specific types, or remove this check if business allows negative stock temporarily
    // For now, we let productStore.adjustStock handle capping at 0 if necessary based on its logic.
  }
  if (!adjustment.reason || adjustment.reason.length < 5) {
    return "A reason (at least 5 characters) is required for the adjustment.";
  }
  return null;
};

const submitStockAdjustment = async () => {
  formError.value = null;
  if (!props.productId) {
    formError.value = "Product information is missing. Cannot adjust stock.";
    return;
  }
  const validationError = validateForm();
  if (validationError) {
    formError.value = validationError;
    return;
  }

  try {
    await productStore.adjustStock({
      productId: props.productId,
      quantityChange: adjustment.quantityChange,
      reason: adjustment.reason,
      type: adjustment.type, // This type will be logged in stockMovementStore
      relatedDocumentId: adjustment.relatedDocumentId
    });
    emit('stock-adjusted', { productId: props.productId, newQuantity: props.currentStock + adjustment.quantityChange });
    closeModal();
  } catch (error) {
    console.error("Stock adjustment error:", error);
    formError.value = error.message || productStore.error || "An unexpected error occurred during stock adjustment.";
  }
};
</script>

<style scoped>
/* Using existing modal styles from main.css or other modal components */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  align-items: center; justify-content: center; z-index: 1040;
  animation: fadeInBackdrop 0.3s ease-out;
}
@keyframes fadeInBackdrop { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  width: 90%; max-width: 550px; /* Suitable for this form */
  display: flex; flex-direction: column;
  animation: slideInModal 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 1rem; margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
  margin: 0; font-size: 1.4em; font-weight: 600;
  color: var(--text-color);
}
.close-button {
  background: transparent; border: none; font-size: 2.2rem; font-weight: bold;
  color: var(--text-color-muted); cursor: pointer; padding: 0 0.5rem; line-height: 1;
}
.close-button:hover { color: var(--primary-color); }

.form-alert { /* Copied from previous examples, ensure it's available */
  padding: var(--space-md); margin-bottom: var(--space-lg);
  border: 1px solid transparent; border-radius: var(--border-radius);
}
.form-alert.alert-danger { color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;}
[data-theme="dark"] .form-alert.alert-danger { background-color: #52262a; border-color: #8B3A3F; color: #ffacac;}

.button-group { margin-top: 0; }
.modal-content .card-footer {
  background-color: var(--bg-color-offset);
  border-top: 1px solid var(--border-color);
  padding: var(--space-md) 2.5rem;
}
.form-text.text-muted{
  font-size: 0.85rem;
  color: var(--text-color-muted);
  margin-top: var(--space-xs);
}
</style>
