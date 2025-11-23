<template>
  <div class="suppliers-page container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">📦 Suppliers</h1>
      <router-link to="/suppliers/add" class="btn btn-primary">
        + Add Supplier
      </router-link>
    </div>

    <div v-if="supplierStore.isLoading" class="text-center py-8">
      <div class="loader-spinner"></div>
      <p class="mt-2 text-gray-500">Loading suppliers...</p>
    </div>

    <div v-else-if="supplierStore.suppliers.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <p class="text-xl text-gray-400 mb-4">No suppliers found.</p>
      <router-link to="/suppliers/add" class="btn btn-outline-primary">
        Add Your First Supplier
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="supplier in supplierStore.suppliers" :key="supplier.id" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ supplier.name }}</h3>
            <p class="text-sm text-gray-500">{{ supplier.contactPerson }}</p>
          </div>
          <div class="flex gap-2">
             <button @click="editSupplier(supplier.id)" class="text-blue-500 hover:text-blue-700" title="Edit">
                ✏️
             </button>
             <button @click="deleteSupplier(supplier.id)" class="text-red-500 hover:text-red-700" title="Delete">
                🗑️
             </button>
          </div>
        </div>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div v-if="supplier.email" class="flex items-center gap-2">
            <span>📧</span> <a :href="`mailto:${supplier.email}`" class="hover:underline">{{ supplier.email }}</a>
          </div>
          <div v-if="supplier.phone" class="flex items-center gap-2">
            <span>📞</span> <a :href="`tel:${supplier.phone}`" class="hover:underline">{{ supplier.phone }}</a>
          </div>
          <div v-if="supplier.address" class="flex items-center gap-2">
            <span>📍</span> <span>{{ supplier.address }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSupplierStore } from '@/stores/supplierStore';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toastStore';

const supplierStore = useSupplierStore();
const router = useRouter();
const toastStore = useToastStore();

onMounted(() => {
  supplierStore.fetchSuppliers();
});

const editSupplier = (id) => {
  router.push(`/suppliers/edit/${id}`);
};

const deleteSupplier = async (id) => {
  if (confirm('Are you sure you want to delete this supplier?')) {
    try {
      await supplierStore.deleteSupplier(id);
      toastStore.success('Supplier deleted successfully');
    } catch (error) {
      toastStore.error('Failed to delete supplier');
    }
  }
};
</script>

<style scoped>
.loader-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
