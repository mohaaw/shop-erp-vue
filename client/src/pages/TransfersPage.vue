<template>
  <div class="transfers-page">
    <h1 class="page-title">🚚 Stock Transfers</h1>

    <div class="card">
      <div class="card-header">{{ $t('transfers.title') }}</div>
      <div class="card-body">
        <form @submit.prevent="submitTransfer">
          <div class="form-grid-2">
            <div class="form-group">
              <label>{{ $t('transfers.source') }}</label>
              <select v-model="form.fromLocationId" class="form-control" required>
                <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.id">
                  {{ loc.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('transfers.destination') }}</label>
              <select v-model="form.toLocationId" class="form-control" required>
                <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.id" :disabled="loc.id === form.fromLocationId">
                  {{ loc.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('transfers.product') }}</label>
            <select v-model="form.productId" class="form-control" required @change="updateMaxQuantity">
              <option value="" disabled>{{ $t('transfers.select_product') }}</option>
              <option v-for="product in productStore.products" :key="product.idInternal" :value="product.idInternal">
                {{ product.company }} {{ product.model }} (Available: {{ getAvailableStock(product) }})
              </option>
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label>{{ $t('transfers.quantity') }}</label>
              <input v-model.number="form.quantity" type="number" min="1" :max="maxQuantity" class="form-control" required />
              <small class="text-muted">Max available: {{ maxQuantity }}</small>
            </div>
            <div class="form-group">
              <label>Reason / Notes</label>
              <input v-model="form.reason" type="text" class="form-control" placeholder="e.g., Restocking Shop 1" required />
            </div>
          </div>

          <div class="button-group">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Processing...' : 'Confirm Transfer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="message" :class="['form-alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useLocationStore } from '@/stores/locationStore';
import { useRoute } from 'vue-router';

const productStore = useProductStore();
const locationStore = useLocationStore();
const route = useRoute();

const loading = ref(false);
const message = ref('');
const messageType = ref('success');
const maxQuantity = ref(0);

const form = ref({
  fromLocationId: 2, // Default Warehouse
  toLocationId: 3,   // Default Shop 1
  productId: '',
  quantity: 1,
  reason: ''
});

const getAvailableStock = (product) => {
  return product.stockByLocation?.[form.value.fromLocationId] || 0;
};

const updateMaxQuantity = () => {
  const product = productStore.products.find(p => p.idInternal === form.value.productId);
  if (product) {
    maxQuantity.value = getAvailableStock(product);
  } else {
    maxQuantity.value = 0;
  }
};

watch(() => form.value.fromLocationId, updateMaxQuantity);

const submitTransfer = async () => {
  if (form.value.quantity > maxQuantity.value) {
    message.value = 'Insufficient stock in source location.';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';
  try {
    await productStore.transferStock({
      productId: form.value.productId,
      fromLocationId: form.value.fromLocationId,
      toLocationId: form.value.toLocationId,
      quantity: form.value.quantity,
      reason: form.value.reason
    });
    message.value = 'Transfer successful!';
    messageType.value = 'success';
    form.value.quantity = 1;
    form.value.reason = '';
    updateMaxQuantity();
  } catch (e) {
    message.value = e.message;
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await productStore.fetchProducts();
  if (route.query.productId) {
    form.value.productId = route.query.productId;
  }
  if (route.query.from) {
    form.value.fromLocationId = parseInt(route.query.from);
  }
  updateMaxQuantity();
});
</script>
