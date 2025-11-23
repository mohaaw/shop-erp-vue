<template>
  <div class="inventory-page">
    <div class="flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">📦 Inventory Management</h1>
      <div class="flex gap-4 items-center">
        <label class="font-semibold">Location:</label>
        <select v-model="selectedLocationId" class="form-control w-48">
          <option v-for="loc in locationStore.locations" :key="loc.id" :value="loc.id">
            {{ loc.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Stock at {{ selectedLocationName }}</div>
      <div class="card-body">
        <div class="mb-4">
          <input v-model="searchQuery" type="text" placeholder="Search products..." class="form-control" />
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Value (Sale)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.idInternal">
                <td>
                  <div class="font-bold">{{ product.company }} {{ product.model }}</div>
                  <div class="text-xs text-muted">{{ product.idInternal }}</div>
                </td>
                <td>{{ product.category }}</td>
                <td>{{ product.no }}</td>
                <td>
                  <span :class="getStockClass(product)">
                    {{ getStock(product) }}
                  </span>
                </td>
                <td>{{ settingsStore.currencySymbol }}{{ (product.selling_price * getStock(product)).toFixed(2) }}</td>
                <td>
                  <button @click="openTransferModal(product)" class="btn btn-sm btn-primary">Transfer</button>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="6" class="text-center py-4">No products found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRouter } from 'vue-router';

const productStore = useProductStore();
const locationStore = useLocationStore();
const settingsStore = useSettingsStore();
const router = useRouter();

const selectedLocationId = ref(locationStore.currentLocationId);
const searchQuery = ref('');

const selectedLocationName = computed(() => {
  const loc = locationStore.locations.find(l => l.id === selectedLocationId.value);
  return loc ? loc.name : 'Unknown Location';
});

const filteredProducts = computed(() => {
  let products = productStore.products;
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase();
    products = products.filter(p => 
      p.model.toLowerCase().includes(lower) || 
      p.company.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
    );
  }
  return products;
});

const getStock = (product) => {
  return product.stockByLocation?.[selectedLocationId.value] || 0;
};

const getStockClass = (product) => {
  const stock = getStock(product);
  if (stock === 0) return 'text-red-600 font-bold';
  if (stock <= settingsStore.lowStockThreshold) return 'text-orange-500 font-bold';
  return 'text-green-600';
};

const openTransferModal = (product) => {
  router.push({ path: '/transfers', query: { productId: product.idInternal, from: selectedLocationId.value } });
};

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<style scoped>
.inventory-page { padding-bottom: 2rem; }
</style>
