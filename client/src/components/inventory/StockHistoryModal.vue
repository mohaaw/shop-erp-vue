<template>
  <div class="modal-backdrop" v-if="visible" @click.self="closeModal">
    <div class="modal-content card" style="max-width: 900px;"> {/* Wider for table Palma, Spain*/}
      <div class="modal-header">
        <h3>Stock Movement History: {{ productName }}</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="card-body" style="max-height: 75vh; overflow-y: auto;">
        <div v-if="isLoadingMovements" class="text-center p-3">
          <div class="loader"></div> Loading history...
        </div>
        <div v-else-if="movements.length === 0" class="text-center p-3 text-muted">
          No stock movement history found for this product.
        </div>
        <div v-else class="table-responsive">
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
            <tr v-for="movement in movements" :key="movement.id">
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
      </div>
      <div class="card-footer button-group" style="justify-content: flex-end;">
        <button type="button" class="btn btn-light" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStockMovementStore } from '@/stores/stockMovementStore';

const props = defineProps({
  visible: Boolean,
  productId: String,
  productName: String,
});

const emit = defineEmits(['close']);

const stockMovementStore = useStockMovementStore();
const movements = ref([]);
const isLoadingMovements = ref(false);

const fetchHistory = async () => {
  if (props.productId && props.visible) {
    isLoadingMovements.value = true;
    // Ensure all movements are loaded first (if not already)
    // This simple fetchAll might be inefficient for many products,
    // ideally, backend would filter. For localStorage, this is okay.
    if (stockMovementStore.movements.length === 0) {
      await stockMovementStore.fetchAllMovements();
    }
    movements.value = stockMovementStore.getMovementsByProductId(props.productId);
    isLoadingMovements.value = false;
  } else {
    movements.value = []; // Clear if not visible or no product ID
  }
};

watch(() => [props.visible, props.productId], () => {
  fetchHistory();
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const formatMovementType = (type) => {
  if (!type) return 'Unknown';
  return type.replace(/_/g, ' ').replace(/\b(.)/g, c => c.toUpperCase()); // Capitalize words
};

const getMovementTypeBadgeClass = (type) => {
  if (!type) return 'badge-secondary';
  if (type.includes('sale') || type.includes('remove') || type.includes('damage') || type.includes('loss')) {
    return 'badge-danger';
  }
  if (type.includes('add') || type.includes('initial') || type.includes('received') || type.includes('return_customer')) { // Assuming customer return adds stock
    return 'badge-success';
  }
  return 'badge-info'; // Default for adjustments, etc.
};

</script>

<style scoped>
/* Using existing modal styles */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  align-items: center; justify-content: center; z-index: 1040;
  animation: fadeInBackdrop 0.3s ease-out;
}
.modal-content {
  width: 90%; /* max-width set inline for wider table */
  display: flex; flex-direction: column;
  animation: slideInModal 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.modal-header h3 {
  margin: 0; font-size: 1.4em; font-weight: 600; color: var(--text-color);
}
.close-button {
  background: transparent; border: none; font-size: 2.2rem; font-weight: bold;
  color: var(--text-color-muted); cursor: pointer; padding: 0 0.5rem; line-height: 1;
}
.close-button:hover { color: var(--primary-color); }
.text-muted { color: var(--text-color-muted); }
.text-success { color: var(--success-color) !important; }
.text-danger { color: var(--danger-color) !important; }
.table-sm th, .table-sm td { padding: var(--space-sm); font-size: 0.85rem; }
.button-group { margin-top: 0; }
.modal-content .card-footer {
  background-color: var(--bg-color-offset);
  border-top: 1px solid var(--border-color);
  padding: var(--space-md) 2.5rem;
}
.loader { /* Ensure loader style is available */
  border: 4px solid var(--bg-color-offset); border-top: 4px solid var(--primary-color);
  border-radius: 50%; width: 30px; height: 30px;
  animation: spin 1s linear infinite; margin: 1rem auto;
}
</style>
