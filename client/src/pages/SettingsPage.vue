<template>
  <div class="settings-page">
    <div class="page-header mb-6">
      <h1 class="page-title text-2xl font-bold text-gray-800">⚙️ Settings</h1>
      <p class="text-gray-500">Manage global configuration and preferences</p>
    </div>

    <div class="settings-layout flex flex-col md:flex-row gap-6">
      <!-- Sidebar Navigation -->
      <div class="settings-sidebar w-full md:w-64 flex-shrink-0">
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-4">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors flex items-center gap-3"
            :class="{'bg-blue-50 text-blue-600 border-l-4 border-l-blue-500': activeTab === tab.id, 'text-gray-700 border-l-4 border-l-transparent': activeTab !== tab.id}"
          >
            <span class="text-lg">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="settings-content flex-1">
        <form @submit.prevent="saveSettings" class="space-y-6">
          
          <!-- COMPANY SETTINGS -->
          <div v-if="activeTab === 'company'" class="card">
            <div class="card-header">
              <h3 class="card-title">Company Profile</h3>
            </div>
            <div class="card-body form-grid">
              <div class="form-group">
                <label class="form-label required">Company Name</label>
                <input type="text" v-model="settings.storeName" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Abbreviation</label>
                <input type="text" v-model="settings.company.abbreviation" class="form-input" placeholder="e.g. TSP">
              </div>
              <div class="form-group">
                <label class="form-label">Country</label>
                <input type="text" v-model="settings.company.country" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Default Currency</label>
                <input type="text" v-model="settings.company.currency" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Timezone</label>
                <input type="text" v-model="settings.company.timezone" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Fiscal Year Start</label>
                <input type="text" v-model="settings.company.fiscalYearStart" class="form-input" placeholder="MM-DD">
              </div>
            </div>
          </div>

          <!-- LOCALIZATION -->
          <div v-if="activeTab === 'localization'" class="card">
            <div class="card-header"><h3 class="card-title">Localization</h3></div>
            <div class="card-body form-grid">
              <div class="form-group">
                <label class="form-label">Date Format</label>
                <select v-model="settings.formats.date" class="form-select">
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (Euro)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Time Format</label>
                <select v-model="settings.formats.time" class="form-select">
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Language</label>
                <select v-model="settings.locale" class="form-select">
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Currency Symbol</label>
                <input type="text" v-model="settings.currencySymbol" class="form-input">
              </div>
            </div>
          </div>

          <!-- NUMBER SERIES -->
          <div v-if="activeTab === 'naming'" class="card">
            <div class="card-header"><h3 class="card-title">Document Naming</h3></div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 class="font-semibold mb-3">Sales Invoice</h4>
                  <div class="form-group mb-2">
                    <label class="form-label">Prefix</label>
                    <input type="text" v-model="settings.numberSeries.sales.prefix" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Padding</label>
                    <input type="number" v-model.number="settings.numberSeries.sales.padding" class="form-input">
                  </div>
                  <div class="text-xs text-gray-500 mt-2">Example: {{ settings.numberSeries.sales.prefix }}00001</div>
                </div>

                <div class="p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 class="font-semibold mb-3">Purchase Order</h4>
                  <div class="form-group mb-2">
                    <label class="form-label">Prefix</label>
                    <input type="text" v-model="settings.numberSeries.purchase.prefix" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Padding</label>
                    <input type="number" v-model.number="settings.numberSeries.purchase.padding" class="form-input">
                  </div>
                </div>

                <div class="p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 class="font-semibold mb-3">Quotation</h4>
                  <div class="form-group mb-2">
                    <label class="form-label">Prefix</label>
                    <input type="text" v-model="settings.numberSeries.quotation.prefix" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Padding</label>
                    <input type="number" v-model.number="settings.numberSeries.quotation.padding" class="form-input">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DEFAULTS -->
          <div v-if="activeTab === 'defaults'" class="card">
            <div class="card-header"><h3 class="card-title">Global Defaults</h3></div>
            <div class="card-body form-grid">
              <div class="form-group">
                <label class="form-label">Default Warehouse</label>
                <input type="text" v-model="settings.defaults.warehouse" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Default Payment Terms</label>
                <select v-model="settings.defaults.paymentTerms" class="form-select">
                  <option value="Immediate">Immediate</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Default UOM</label>
                <input type="text" v-model="settings.defaults.uom" class="form-input">
              </div>
            </div>
          </div>

          <!-- STOCK -->
          <div v-if="activeTab === 'stock'" class="card">
            <div class="card-header"><h3 class="card-title">Stock Settings</h3></div>
            <div class="card-body form-grid">
              <div class="form-group">
                <label class="form-label">Valuation Method</label>
                <select v-model="settings.stock.valuationMethod" class="form-select">
                  <option value="FIFO">FIFO (First In First Out)</option>
                  <option value="LIFO">LIFO (Last In First Out)</option>
                  <option value="Moving Average">Moving Average</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Low Stock Threshold</label>
                <input type="number" v-model.number="settings.lowStockThreshold" class="form-input">
              </div>
              <div class="form-group flex items-center pt-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.stock.allowNegativeStock" class="form-checkbox">
                  <span class="text-sm font-medium text-gray-700">Allow Negative Stock</span>
                </label>
              </div>
              <div class="form-group flex items-center pt-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.stock.autoReserve" class="form-checkbox">
                  <span class="text-sm font-medium text-gray-700">Auto Reserve Stock on Order</span>
                </label>
              </div>
            </div>
          </div>

          <!-- TAX -->
          <div v-if="activeTab === 'tax'" class="card">
            <div class="card-header"><h3 class="card-title">Tax Configuration</h3></div>
            <div class="card-body form-grid">
              <div class="form-group">
                <label class="form-label">Default Tax Name</label>
                <input type="text" v-model="settings.tax.name" class="form-input" placeholder="e.g. VAT">
              </div>
              <div class="form-group">
                <label class="form-label">Default Tax Rate (%)</label>
                <input type="number" v-model.number="settings.tax.rate" class="form-input" step="0.01">
              </div>
              <div class="form-group flex items-center pt-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="settings.tax.inclusive" class="form-checkbox">
                  <span class="text-sm font-medium text-gray-700">Tax Included in Price</span>
                </label>
              </div>
            </div>
          </div>

          <!-- SYSTEM -->
          <div v-if="activeTab === 'system'" class="space-y-6">
            <!-- Theme -->
            <div class="card">
              <div class="card-header"><h3 class="card-title">Appearance</h3></div>
              <div class="card-body">
                <div class="grid grid-cols-2 gap-4">
                  <div 
                    class="border rounded-lg p-4 cursor-pointer transition-all"
                    :class="settings.theme === 'light' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'"
                    @click="settings.theme = 'light'; settingsStore.setTheme('light')"
                  >
                    <div class="font-semibold mb-1">☀️ Frappe Flat</div>
                    <div class="text-xs text-gray-500">Clean, light ERPNext standard</div>
                  </div>
                  <div 
                    class="border rounded-lg p-4 cursor-pointer transition-all"
                    :class="settings.theme === 'dark' ? 'border-blue-500 bg-gray-800 text-white ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'"
                    @click="settings.theme = 'dark'; settingsStore.setTheme('dark')"
                  >
                    <div class="font-semibold mb-1">🌑 Frappe Dark</div>
                    <div class="text-xs opacity-75">Professional dark mode</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Data Management -->
            <div class="card">
              <div class="card-header"><h3 class="card-title">Data Management</h3></div>
              <div class="card-body space-y-4">
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <h4 class="font-medium">Export Products</h4>
                    <p class="text-xs text-gray-500">Download all products as Excel</p>
                  </div>
                  <button type="button" @click="handleExportProductsExcel" class="btn btn-secondary btn-sm">Download .xlsx</button>
                </div>
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <h4 class="font-medium">Full Backup</h4>
                    <p class="text-xs text-gray-500">Export entire database as JSON</p>
                  </div>
                  <button type="button" @click="handleExportAllDataJSON" class="btn btn-secondary btn-sm">Backup .json</button>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="card border-red-200">
              <div class="card-header bg-red-50 border-b border-red-100">
                <h3 class="card-title text-red-700">Danger Zone</h3>
              </div>
              <div class="card-body">
                <p class="text-sm text-gray-600 mb-4">Irreversible actions. Proceed with caution.</p>
                <button type="button" @click="handleSystemReset" class="btn btn-danger w-full">
                  🗑️ Factory Reset System
                </button>
              </div>
            </div>
          </div>

          <!-- Save Bar -->
          <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 z-50 md:pl-64">
            <button type="button" @click="loadSettings" class="btn btn-secondary">Discard Changes</button>
            <button type="submit" class="btn btn-primary">💾 Save Settings</button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProductStore } from '@/stores/productStore';
import { useToastStore } from '@/stores/toastStore';
import * as XLSX from 'xlsx';

const settingsStore = useSettingsStore();
const productStore = useProductStore();
const toastStore = useToastStore();

const activeTab = ref('company');
const settings = reactive({
  storeName: '',
  company: {},
  formats: {},
  numberSeries: { sales: {}, purchase: {}, quotation: {} },
  defaults: {},
  stock: {},
  tax: {},
  notifications: {},
  theme: 'light',
  locale: 'en',
  currencySymbol: '$',
  lowStockThreshold: 5
});

const tabs = [
  { id: 'company', icon: '🏢', label: 'Company' },
  { id: 'localization', icon: '🌍', label: 'Localization' },
  { id: 'naming', icon: '🔢', label: 'Naming Series' },
  { id: 'defaults', icon: '⚙️', label: 'Defaults' },
  { id: 'stock', icon: '📦', label: 'Stock' },
  { id: 'tax', icon: '💰', label: 'Tax' },
  { id: 'system', icon: '🖥️', label: 'System' },
];

onMounted(() => {
  loadSettings();
});

const loadSettings = () => {
  // Deep copy to break reactivity with store until saved
  const storeData = JSON.parse(JSON.stringify(settingsStore.$state));
  
  // Map store data to local reactive state
  settings.storeName = storeData.storeName;
  settings.company = storeData.company || {};
  settings.formats = storeData.formats || {};
  settings.numberSeries = storeData.numberSeries || { sales: {}, purchase: {}, quotation: {} };
  settings.defaults = storeData.defaults || {};
  settings.stock = storeData.stock || {};
  settings.tax = storeData.tax || {};
  settings.notifications = storeData.notifications || {};
  settings.theme = storeData.theme;
  settings.locale = storeData.locale;
  settings.currencySymbol = storeData.currencySymbol;
  settings.lowStockThreshold = storeData.lowStockThreshold;
};

const saveSettings = () => {
  // Update store state
  settingsStore.storeName = settings.storeName;
  settingsStore.company = settings.company;
  settingsStore.formats = settings.formats;
  settingsStore.numberSeries = settings.numberSeries;
  settingsStore.defaults = settings.defaults;
  settingsStore.stock = settings.stock;
  settingsStore.tax = settings.tax;
  settingsStore.notifications = settings.notifications;
  settingsStore.theme = settings.theme;
  settingsStore.locale = settings.locale;
  settingsStore.currencySymbol = settings.currencySymbol;
  settingsStore.lowStockThreshold = settings.lowStockThreshold;

  settingsStore.saveSettings();
  toastStore.success('Settings saved successfully!');
};

// Data Management Functions (Reused)
const handleExportProductsExcel = async () => {
  if (productStore.products.length === 0) return toastStore.info('No products to export');
  try {
    const ws = XLSX.utils.json_to_sheet(productStore.products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `Products_${new Date().toISOString().slice(0,10)}.xlsx`);
    toastStore.success('Exported products successfully');
  } catch (e) {
    toastStore.error('Export failed: ' + e.message);
  }
};

const handleExportAllDataJSON = () => {
  try {
    const data = settingsStore.getAllApplicationData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toastStore.success('Backup created successfully');
  } catch (e) {
    toastStore.error('Backup failed: ' + e.message);
  }
};

const handleSystemReset = async () => {
  if (confirm('Are you sure you want to factory reset? This cannot be undone.')) {
    await settingsStore.resetAllApplicationData();
    window.location.reload();
  }
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .form-grid { grid-template-columns: repeat(2, 1fr); }
}

.form-group { display: flex; flex-direction: column; }
.form-label {
  font-size: 12px; color: var(--text-muted); margin-bottom: 6px;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;
}
.form-label.required::after { content: " *"; color: var(--danger-color); }

.form-input, .form-select {
  background: var(--input-background);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 14px; color: var(--text-main);
}
.form-input:focus, .form-select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.card {
  background: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.card-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
}
.card-title { font-size: 16px; font-weight: 600; margin: 0; }
.card-body { padding: 24px; }

.btn {
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; border: 1px solid transparent;
}
.btn-primary { background: var(--primary-color); color: white; }
.btn-secondary { background: white; border-color: var(--border-color); color: var(--text-main); }
.btn-danger { background: var(--danger-color); color: white; }
</style>
