<template>
  <div class="admin-page page-content-wrapper">
    <div class="page-header flex justify-between items-center mb-6">
      <h1 class="page-title mb-0">{{ $t('admin.title') }}</h1>
    </div>

    <div class="admin-dashboard grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- System Status Card -->
      <div class="card">
        <div class="card-header">
          <h3>{{ $t('admin.system_status') }}</h3>
        </div>
        <div class="card-body">
          <div class="status-item flex justify-between items-center mb-2">
            <span>Server Uptime</span>
            <span class="badge badge-success">99.9%</span>
          </div>
          <div class="status-item flex justify-between items-center mb-2">
            <span>Database Connection</span>
            <span class="badge badge-success">Connected</span>
          </div>
          <div class="status-item flex justify-between items-center">
            <span>Last Backup</span>
            <span class="text-sm text-gray-500">2 hours ago</span>
          </div>
        </div>
      </div>

      <!-- User Management Card -->
      <div class="card">
        <div class="card-header">
          <h3>{{ $t('admin.user_management') }}</h3>
        </div>
        <div class="card-body text-center">
          <p class="mb-4 text-gray-500">Manage system users and roles.</p>
          <router-link to="/employees" class="btn btn-primary w-full">
            {{ $t('common.employees') }}
          </router-link>
        </div>
      </div>

      <!-- System Logs Card -->
      <div class="card">
        <div class="card-header">
          <h3>{{ $t('admin.system_logs') }}</h3>
        </div>
        <div class="card-body">
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex justify-between">
              <span>User Login (Admin)</span>
              <span class="text-xs text-gray-400">10:42 AM</span>
            </li>
            <li class="flex justify-between">
              <span>Product Updated (ID: 42)</span>
              <span class="text-xs text-gray-400">09:15 AM</span>
            </li>
            <li class="flex justify-between">
              <span>Backup Completed</span>
              <span class="text-xs text-gray-400">08:00 AM</span>
            </li>
          </ul>
          <button class="btn btn-light btn-sm w-full mt-4">View All Logs</button>
        </div>
      </div>
    </div>

    <!-- Advanced Configuration Section -->
    <div class="card mt-6">
      <div class="card-header">
        <h3>{{ $t('admin.advanced_settings') }}</h3>
      </div>
      <div class="card-body">
        <div class="form-group checkbox-group">
          <input type="checkbox" id="maintenance-mode" v-model="maintenanceMode">
          <label for="maintenance-mode">Enable Maintenance Mode</label>
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="debug-mode" v-model="debugMode">
          <label for="debug-mode">Enable Debug Logging</label>
        </div>
        <div class="mt-4">
          <button class="btn btn-warning" @click="saveAdvancedSettings">Save Configuration</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToastStore } from '@/stores/toastStore';

const toastStore = useToastStore();
const maintenanceMode = ref(false);
const debugMode = ref(false);

const saveAdvancedSettings = () => {
  // Mock save
  toastStore.success('Advanced settings saved successfully.');
};
</script>

<style scoped>
.status-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}
.status-item:last-child {
  border-bottom: none;
}
</style>
