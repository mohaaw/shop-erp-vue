<template>
  <div class="add-employee-page container mx-auto p-4 max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$router.back()" class="text-gray-500 hover:text-gray-700">
        ← Back
      </button>
      <h1 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Employee' : 'Add New Employee' }}</h1>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input v-model="form.name" type="text" required class="form-control w-full" placeholder="e.g. John Doe" />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" required class="form-control w-full" placeholder="john@example.com" />
        </div>

        <!-- Role -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <select v-model="form.role" class="form-control w-full">
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input v-model="form.phone" type="tel" class="form-control w-full" placeholder="+1 234 567 890" />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="form.status" class="form-control w-full">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t mt-6">
          <button type="button" @click="$router.back()" class="btn btn-light">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Employee' : 'Save Employee') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useToastStore } from '@/stores/toastStore';
import { useRouter, useRoute } from 'vue-router';

const employeeStore = useEmployeeStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const isSubmitting = ref(false);
const isEditing = computed(() => !!route.params.id);

const form = ref({
  name: '',
  email: '',
  role: 'cashier',
  phone: '',
  status: 'active'
});

onMounted(async () => {
  if (isEditing.value) {
    await employeeStore.fetchEmployees();
    const employee = employeeStore.getEmployeeById(route.params.id);
    if (employee) {
      form.value = { ...employee };
    } else {
      toastStore.error('Employee not found');
      router.push('/employees');
    }
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await employeeStore.updateEmployee(route.params.id, form.value);
      toastStore.success('Employee updated successfully');
    } else {
      await employeeStore.addEmployee(form.value);
      toastStore.success('Employee added successfully');
    }
    router.push('/employees');
  } catch (error) {
    toastStore.error('Failed to save employee');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
