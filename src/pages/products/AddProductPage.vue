<template>
  <div class="add-product-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">{{ isEditing ? '📝 Edit Product' : '✨ Add New Product' }}</h1>
      <router-link to="/products" class="btn btn-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Products
      </router-link>
    </div>
    <ProductForm
      :product-id="productId"
      @product-saved="handleProductSaved"
      @product-save-error="handleProductError"
    />
    <div v-if="pageLevelError" class="mt-3 form-alert alert-danger" role="alert">
      {{ pageLevelError }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ProductForm from '@/components/products/ProductForm.vue'; // Critical: Correct path to ProductForm

const router = useRouter();
const route = useRoute();
const pageLevelError = ref(null); // To potentially catch errors bubbled up from ProductForm

const productId = computed(() => route.params.id);
const isEditing = computed(() => !!productId.value);

onMounted(() => {
  console.log(`AddProductPage.vue MOUNTED. Editing mode: ${isEditing.value}, Product ID: ${productId.value || 'N/A'}`);
});

const handleProductSaved = (savedProduct) => {
  console.log(isEditing.value ? 'Product updated from AddProductPage:' : 'Product added from AddProductPage:', savedProduct);
  // Implement a toast notification for success
  // For example, using a global toast function or store:
  // showGlobalToast('Product saved successfully!', 'success');
  alert('Product saved successfully!'); // Simple alert for now
  router.push({ name: 'ProductsList' });
};

const handleProductError = (errorMessage) => {
  pageLevelError.value = errorMessage; // Display error on this page
  console.error('Error from ProductForm on AddProductPage:', errorMessage);
  // Optionally show a global toast for the error as well
  // showGlobalToast(`Error saving product: ${errorMessage}`, 'error');
};
</script>

<style scoped>
.page-title {
  margin-bottom: 0;
}
.btn svg {
  margin-right: var(--space-xs);
  vertical-align: middle;
}
/* Ensure alert styles are available from main.css or define here */
.form-alert.alert-danger {
  color: var(--danger-color);
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: var(--space-md);
  border: 1px solid transparent;
  border-radius: var(--border-radius);
}
[data-theme="dark"] .form-alert.alert-danger {
  background-color: #52262a;
  border-color: #8B3A3F;
  color: #ffacac;
}
</style>
