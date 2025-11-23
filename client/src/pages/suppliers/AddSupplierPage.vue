<template>
  <div class="add-supplier-page container mx-auto p-4 max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700">
        ← Back
      </button>
      <h1 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Supplier' : 'Add New Supplier' }}</h1>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input v-model="form.name" type="text" required class="form-control w-full" placeholder="e.g. Acme Corp" />
        </div>

        <!-- Contact Person -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
          <input v-model="form.contactPerson" type="text" class="form-control w-full" placeholder="e.g. John Doe" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="form-control w-full" placeholder="contact@acme.com" />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input v-model="form.phone" type="tel" class="form-control w-full" placeholder="+1 234 567 890" />
          </div>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea v-model="form.address" rows="3" class="form-control w-full" placeholder="123 Business St..."></textarea>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea v-model="form.notes" rows="2" class="form-control w-full" placeholder="Additional details..."></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t mt-6">
          <button type="button" @click="$router.back()" class="btn btn-light">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Supplier' : 'Save Supplier') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSupplierStore } from '@/stores/supplierStore';
import { useToastStore } from '@/stores/toastStore';
import { useRouter, useRoute } from 'vue-router';

const supplierStore = useSupplierStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const isSubmitting = ref(false);
const isEditing = computed(() => !!route.params.id);

const form = ref({
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  notes: ''
});

onMounted(async () => {
  if (isEditing.value) {
    await supplierStore.fetchSuppliers();
    const supplier = supplierStore.getSupplierById(route.params.id);
    if (supplier) {
      form.value = { ...supplier };
    } else {
      toastStore.error('Supplier not found');
      router.push('/suppliers');
    }
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await supplierStore.updateSupplier(route.params.id, form.value);
      toastStore.success('Supplier updated successfully');
    } else {
      await supplierStore.addSupplier(form.value);
      toastStore.success('Supplier added successfully');
    }
    router.push('/suppliers');
  } catch (error) {
    toastStore.error('Failed to save supplier');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
