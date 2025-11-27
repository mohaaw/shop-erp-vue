<template>
  <div class="employees-page container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">👥 Employees & Roles</h1>
      <router-link to="/employees/add" class="btn btn-primary">
        + Add Employee
      </router-link>
    </div>

    <div v-if="employeeStore.isLoading" class="text-center py-8">
      <div class="loader-spinner"></div>
      <p class="mt-2 text-gray-500">Loading employees...</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employeeStore.employees" :key="employee.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {{ employee.name.charAt(0) }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
                  <div class="text-sm text-gray-500">{{ employee.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-purple-100 text-purple-800': employee.role === 'admin',
                  'bg-blue-100 text-blue-800': employee.role === 'manager',
                  'bg-green-100 text-green-800': employee.role === 'cashier'
                }">
                {{ employee.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ employee.phone || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ employee.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="editEmployee(employee.id)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
              <button @click="deleteEmployee(employee.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toastStore';

const employeeStore = useEmployeeStore();
const router = useRouter();
const toastStore = useToastStore();

onMounted(() => {
  employeeStore.fetchEmployees();
});

const editEmployee = (id) => {
  router.push(`/employees/edit/${id}`);
};

const deleteEmployee = async (id) => {
  if (confirm('Are you sure you want to delete this employee?')) {
    try {
      await employeeStore.deleteEmployee(id);
      toastStore.success('Employee deleted successfully');
    } catch {
      toastStore.error('Failed to delete employee');
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
