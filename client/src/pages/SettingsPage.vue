<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="page-title">⚙️ Settings & Configuration</h1>
      <p class="page-subtitle">Manage your store, preferences, and application data</p>
    </div>

    <!-- Settings Navigation Tabs -->
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- GENERAL SETTINGS TAB -->
    <div v-show="activeTab === 'general'" class="settings-section">
      <!-- Appearance Settings -->
      <div class="card">
        <div class="card-header">🎨 Appearance & Theme</div>
        <div class="card-body">
          <div class="settings-row">
            <div class="settings-left">
              <h4 class="setting-title">Interface Theme</h4>
              <p class="setting-description">Choose between light and dark mode. Your preference is saved automatically.</p>
            </div>
            <div class="settings-right">
              <ThemeSwitcher class="theme-switcher-inline" />
            </div>
          </div>
        </div>
      </div>

      <!-- Store Information -->
      <div class="card">
        <div class="card-header">🏪 Store Information</div>
        <div class="card-body">
          <form @submit.prevent="handleStoreInfoUpdate">
            <div class="form-group">
              <label for="settings-store-name" class="form-label">Store Name *</label>
              <input 
                type="text" 
                id="settings-store-name" 
                v-model="editableSettings.storeName" 
                class="form-control"
                @blur="validateStoreInfo"
                maxlength="100"
                placeholder="Enter your store name"
              >
              <small class="form-text">Used in reports, exports, and receipts</small>
            </div>

            <div class="form-group">
              <label for="settings-store-address" class="form-label">Store Address</label>
              <textarea 
                id="settings-store-address" 
                v-model="editableSettings.storeAddress" 
                class="form-control" 
                rows="3"
                placeholder="Enter complete store address"
              ></textarea>
              <small class="form-text">Displayed on invoices and official documents</small>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="settings-store-email" class="form-label">Contact Email</label>
                <input 
                  type="email" 
                  id="settings-store-email" 
                  v-model="editableSettings.storeEmail" 
                  class="form-control"
                  @blur="validateEmail"
                  placeholder="contact@store.com"
                >
                <small class="form-text">For customer inquiries</small>
              </div>

              <div class="form-group">
                <label for="settings-store-phone" class="form-label">Contact Phone</label>
                <input 
                  type="tel" 
                  id="settings-store-phone" 
                  v-model="editableSettings.storePhone" 
                  class="form-control"
                  placeholder="+1 (555) 123-4567"
                >
                <small class="form-text">For customer support</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">💾 Save Store Information</button>
              <button type="button" @click="resetStoreInfo" class="btn btn-secondary">↶ Reset</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Preferences -->
      <div class="card">
        <div class="card-header">⚙️ Business Preferences</div>
        <div class="card-body">
          <form @submit.prevent="handlePreferencesUpdate">
            <div class="form-grid-2">
              <div class="form-group">
                <label for="currency-symbol-setting" class="form-label">Currency Symbol *</label>
                <div class="input-with-preview">
                  <input 
                    type="text" 
                    id="currency-symbol-setting" 
                    v-model="editableSettings.currencySymbol" 
                    class="form-control"
                    maxlength="3"
                    placeholder="$"
                  >
                  <span class="currency-preview">{{ editableSettings.currencySymbol }}100.00</span>
                </div>
                <small class="form-text">Used in all financial displays</small>
              </div>

              <div class="form-group">
                <label for="low-stock-setting" class="form-label">Low Stock Alert Level (units) *</label>
                <input 
                  type="number" 
                  id="low-stock-setting" 
                  v-model.number="editableSettings.lowStockThreshold" 
                  class="form-control"
                  min="0"
                  max="999"
                  placeholder="5"
                >
                <small class="form-text">Items at or below this count will trigger warnings</small>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">💾 Save Preferences</button>
              <button type="button" @click="resetPreferences" class="btn btn-secondary">↶ Reset</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DATA MANAGEMENT TAB -->
    <div v-show="activeTab === 'data'" class="settings-section">
      <!-- Product Data Export/Import -->
      <div class="card">
        <div class="card-header">📊 Product Data Management</div>
        <div class="card-body">
          <p class="card-description">
            Export your products to Excel for backup or external analysis. Import products from Excel to update inventory.
            <strong>Note:</strong> Importing will replace all current products.
          </p>

          <div class="data-action-group">
            <div class="data-action">
              <div class="action-icon success">📥</div>
              <div class="action-content">
                <h4>Export Products</h4>
                <p>Download all products as Excel file</p>
              </div>
              <button 
                class="btn btn-success" 
                @click="handleExportProductsExcel" 
                :disabled="productStore.isLoading || productStore.products.length === 0 || exportingExcel"
              >
                <span v-if="exportingExcel" class="btn-loading">
                  <span class="loader-inline"></span> Exporting...
                </span>
                <span v-else>📊 Export ({{ productStore.products.length }} items)</span>
              </button>
            </div>

            <div class="data-action">
              <div class="action-icon info">📤</div>
              <div class="action-content">
                <h4>Import Products</h4>
                <p>Upload Excel file to replace products</p>
              </div>
              <label class="btn btn-info" :class="{ 'is-loading': importingExcel }">
                <span v-if="importingExcel" class="btn-loading">
                  <span class="loader-inline"></span> Importing...
                </span>
                <span v-else>📊 Choose File</span>
                <input 
                  type="file" 
                  id="import-excel-file" 
                  accept=".xlsx, .xls" 
                  @change="handleImportProductsExcel" 
                  style="display: none;" 
                  :disabled="importingExcel"
                >
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Backup/Restore -->
      <div class="card">
        <div class="card-header">💾 Complete Data Backup</div>
        <div class="card-body">
          <p class="card-description">
            Backup all application data (Products, Sales, Customers, Settings) to a JSON file. Restore from backup to recover all data.
            <strong>Note:</strong> Restoring will overwrite all current data.
          </p>

          <div class="data-action-group">
            <div class="data-action">
              <div class="action-icon warning">⬇️</div>
              <div class="action-content">
                <h4>Export All Data</h4>
                <p>Complete backup of all application data</p>
              </div>
              <button 
                class="btn btn-warning" 
                @click="handleExportAllDataJSON" 
                :disabled="exportingJson"
              >
                <span v-if="exportingJson" class="btn-loading">
                  <span class="loader-inline"></span> Exporting...
                </span>
                <span v-else>💾 Backup Now</span>
              </button>
            </div>

            <div class="data-action">
              <div class="action-icon info">⬆️</div>
              <div class="action-content">
                <h4>Restore from Backup</h4>
                <p>Restore data from previously saved JSON file</p>
              </div>
              <label class="btn btn-primary" :class="{ 'is-loading': importingJson }">
                <span v-if="importingJson" class="btn-loading">
                  <span class="loader-inline"></span> Restoring...
                </span>
                <span v-else>💾 Restore</span>
                <input 
                  type="file" 
                  id="import-file-json" 
                  accept=".json" 
                  @change="handleImportAllDataJSON" 
                  style="display: none;" 
                  :disabled="importingJson"
                >
              </label>
            </div>
          </div>

          <div class="backup-info">
            <div class="info-item">
              <strong>Last Backup:</strong> {{ lastBackupTime }}
            </div>
            <div class="info-item">
              <strong>Data Size:</strong> {{ estimatedDataSize }}
            </div>
            <div class="info-item">
              <strong>Total Records:</strong> {{ totalRecords }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SYSTEM TAB -->
    <div v-show="activeTab === 'system'" class="settings-section">
      <!-- System Information -->
      <div class="card">
        <div class="card-header">ℹ️ System Information</div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-card">
              <span class="info-label">Application Version</span>
              <span class="info-value">{{ appVersion }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Current Theme</span>
              <span class="info-value">{{ settingsStore.theme === 'dark' ? '🌙 Dark' : '☀️ Light' }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Products Loaded</span>
              <span class="info-value">{{ productStore.products.length }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Sales Records</span>
              <span class="info-value">{{ salesStore.sales.length }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Customers</span>
              <span class="info-value">{{ customerStore.customers.length }}</span>
            </div>
            <div class="info-card">
              <span class="info-label">Storage Used</span>
              <span class="info-value">{{ storageUsed }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card danger-card">
        <div class="card-header danger-header">⚠️ Danger Zone</div>
        <div class="card-body">
          <p class="danger-warning">
            <strong>Warning:</strong> The following actions are irreversible and will delete all stored application data including Products, Sales, Customers, and Settings. Please proceed with caution!
          </p>

          <div class="danger-actions">
            <button 
              class="btn btn-danger btn-large" 
              @click="handleSystemReset"
            >
              🗑️ Clear All Application Data
            </button>
          </div>

          <div class="danger-info">
            <p>This action will:</p>
            <ul>
              <li>Delete all products and inventory</li>
              <li>Delete all sales records and transactions</li>
              <li>Delete all customer information</li>
              <li>Reset application settings to defaults</li>
              <li>Clear all application cache</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProductStore } from '@/stores/productStore';
import { useSalesStore } from '@/stores/salesStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useToastStore } from '@/stores/toastStore';
import * as XLSX from 'xlsx';

const settingsStore = useSettingsStore();
const productStore = useProductStore();
const salesStore = useSalesStore();
const customerStore = useCustomerStore();
const toastStore = useToastStore();

const activeTab = ref('general');
const originalSettings = reactive({});

const tabs = [
  { id: 'general', icon: '⚙️', label: 'General' },
  { id: 'data', icon: '💾', label: 'Data Management' },
  { id: 'system', icon: 'ℹ️', label: 'System' }
];

const editableSettings = reactive({
  storeName: '',
  storeAddress: '',
  storeEmail: '',
  storePhone: '',
  currencySymbol: '',
  lowStockThreshold: 0,
});

const exportingExcel = ref(false);
const importingExcel = ref(false);
const exportingJson = ref(false);
const importingJson = ref(false);

const appVersion = '1.0.0';

const lastBackupTime = computed(() => {
  const lastBackup = localStorage.getItem('lastBackupTime');
  if (!lastBackup) return 'Never';
  const date = new Date(lastBackup);
  return date.toLocaleString();
});

const estimatedDataSize = computed(() => {
  const data = JSON.stringify(settingsStore.getAllApplicationData());
  const bytes = new Blob([data]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
});

const totalRecords = computed(() => {
  return productStore.products.length + salesStore.sales.length + customerStore.customers.length;
});

const storageUsed = computed(() => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(2)} KB`;
  return `${(total / (1024 * 1024)).toFixed(2)} MB`;
});

onMounted(() => {
  loadSettings();
});

const loadSettings = () => {
  editableSettings.storeName = settingsStore.storeName;
  editableSettings.storeAddress = settingsStore.storeAddress;
  editableSettings.storeEmail = settingsStore.storeEmail;
  editableSettings.storePhone = settingsStore.storePhone;
  editableSettings.currencySymbol = settingsStore.currencySymbol;
  editableSettings.lowStockThreshold = settingsStore.lowStockThreshold;
  
  // Store originals
  Object.assign(originalSettings, editableSettings);
};

const validateStoreInfo = () => {
  if (!editableSettings.storeName.trim()) {
    toastStore.warning('Store name cannot be empty');
  }
};

const validateEmail = () => {
  if (editableSettings.storeEmail && !editableSettings.storeEmail.includes('@')) {
    toastStore.warning('Please enter a valid email address');
  }
};

const resetStoreInfo = () => {
  editableSettings.storeName = originalSettings.storeName;
  editableSettings.storeAddress = originalSettings.storeAddress;
  editableSettings.storeEmail = originalSettings.storeEmail;
  editableSettings.storePhone = originalSettings.storePhone;
  toastStore.info('Store information reset');
};

const resetPreferences = () => {
  editableSettings.currencySymbol = originalSettings.currencySymbol;
  editableSettings.lowStockThreshold = originalSettings.lowStockThreshold;
  toastStore.info('Preferences reset');
};

const handleStoreInfoUpdate = () => {
  if (!editableSettings.storeName.trim()) {
    toastStore.error('Store name cannot be empty');
    return;
  }

  settingsStore.updateStoreInfo({
    name: editableSettings.storeName,
    address: editableSettings.storeAddress,
    email: editableSettings.storeEmail,
    phone: editableSettings.storePhone,
  });

  Object.assign(originalSettings, editableSettings);
  toastStore.success('✓ Store information updated successfully');
};

const handlePreferencesUpdate = () => {
  if (!editableSettings.currencySymbol.trim()) {
    toastStore.error('Currency symbol cannot be empty');
    return;
  }

  if (editableSettings.lowStockThreshold < 0) {
    toastStore.error('Low stock threshold must be non-negative');
    return;
  }

  let updated = false;
  if (settingsStore.currencySymbol !== editableSettings.currencySymbol) {
    if (settingsStore.updateCurrencySymbol(editableSettings.currencySymbol)) {
      updated = true;
    }
  }
  if (settingsStore.lowStockThreshold !== editableSettings.lowStockThreshold) {
    if (settingsStore.updateLowStockThreshold(editableSettings.lowStockThreshold)) {
      updated = true;
    }
  }

  if (updated) {
    Object.assign(originalSettings, editableSettings);
    toastStore.success('✓ Preferences updated successfully');
  } else {
    toastStore.info('No changes to save');
  }
};

const handleExportProductsExcel = async () => {
  if (productStore.products.length === 0) {
    toastStore.info('No products to export');
    return;
  }

  exportingExcel.value = true;
  toastStore.info('Exporting products to Excel...');

  try {
    await new Promise(r => setTimeout(r, 200));
    
    const exportData = productStore.products.map(p => ({
      "No.": p.no || '',
      "Serial Number": p.serial_number || '',
      "Category": p.category || '',
      "Company": p.company || '',
      "Model": p.model || '',
      "Condition": p.condition || 'New',
      "CPU": p.cpu || '',
      "Gen": p.gen || '',
      "Screen Touch (Yes/No)": p.screen_touch ? 'Yes' : 'No',
      "RAM": p.ram || '',
      "Quantity": p.quantity,
      "HDD": p.hdd || '',
      "SSD": p.ssd || '',
      "VGA Type": p.vga_type || '',
      "VGA Memory": p.vga_memory || '',
      "Base Price": p.base_price,
      "Selling Price": p.selling_price,
      "Best Price": p.best_price,
      "Supplier": p.supplier || '',
      "Purchase Date": p.purchase_date || '',
      "Warranty": p.warranty || '',
      "Dimensions": p.dimensions || '',
      "Weight": p.weight || '',
      "Color": p.color || '',
      "Description": p.description || '',
      "Image URL": p.image_url || '',
      "Tags": p.tags || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    
    const fileName = `${settingsStore.storeName.replace(/\s+/g, '_')}_Products_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toastStore.success(`✓ Exported ${productStore.products.length} products successfully!`);
  } catch (err) {
    console.error('Excel export error:', err);
    toastStore.error(`Error exporting products: ${err.message}`);
  } finally {
    exportingExcel.value = false;
  }
};

const handleImportProductsExcel = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  importingExcel.value = true;
  toastStore.info('Importing products from Excel...');

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      await new Promise(r => setTimeout(r, 200));
      
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });

      if (jsonData.length === 0) {
        toastStore.warning('Excel sheet is empty or unreadable');
        return;
      }

      if (!confirm(`This will REPLACE all ${productStore.products.length} current products with ${jsonData.length} products from Excel.\n\nAre you absolutely sure?`)) {
        toastStore.info('Import cancelled');
        return;
      }

      const importedProducts = jsonData.map((row) => {
        let purchaseDate = row["Purchase Date"];
        if (purchaseDate instanceof Date && !isNaN(purchaseDate)) {
          purchaseDate = purchaseDate.toISOString().split('T')[0];
        } else if (typeof purchaseDate === 'number' && purchaseDate > 0) {
          const excelEpoch = new Date(1899, 11, 30);
          purchaseDate = new Date(excelEpoch.getTime() + purchaseDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (typeof purchaseDate === 'string' && purchaseDate.trim() !== '') {
          const parsedDate = new Date(purchaseDate.trim());
          purchaseDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : '';
        } else {
          purchaseDate = '';
        }

        return {
          no: String(row["No."] || '').trim(),
          serial_number: String(row["Serial Number"] || '').trim(),
          category: String(row["Category"] || '').trim(),
          company: String(row["Company"] || '').trim(),
          model: String(row["Model"] || '').trim(),
          condition: String(row["Condition"] || 'New').trim(),
          cpu: String(row["CPU"] || '').trim(),
          gen: String(row["Gen"] || '').trim(),
          screen_touch: String(row["Screen Touch (Yes/No)"] || 'No').toLowerCase() === 'yes',
          ram: String(row["RAM"] || '').trim(),
          quantity: parseInt(row["Quantity"], 10) || 0,
          hdd: String(row["HDD"] || '').trim(),
          ssd: String(row["SSD"] || '').trim(),
          vga_type: String(row["VGA Type"] || '').trim(),
          vga_memory: String(row["VGA Memory"] || '').trim(),
          base_price: parseFloat(row["Base Price"]) || 0,
          selling_price: parseFloat(row["Selling Price"]) || 0,
          best_price: parseFloat(row["Best Price"]) || 0,
          supplier: String(row["Supplier"] || '').trim(),
          purchase_date: purchaseDate,
          warranty: String(row["Warranty"] || '').trim(),
          dimensions: String(row["Dimensions"] || '').trim(),
          weight: String(row["Weight"] || '').trim(),
          color: String(row["Color"] || '').trim(),
          description: String(row["Description"] || '').trim(),
          image_url: String(row["Image URL"] || '').trim(),
          tags: String(row["Tags"] || '').trim()
        };
      });

      await productStore.clearAllProductsData(true);
      let importedCount = 0;
      for (const prod of importedProducts) {
        if (prod.model && prod.company && prod.category && prod.condition && !isNaN(prod.quantity) && !isNaN(prod.selling_price)) {
          await productStore.addProduct(prod);
          importedCount++;
        }
      }
      productStore._saveProductsToLocalStorage();

      toastStore.success(`✓ Imported ${importedCount} products! (${importedProducts.length - importedCount} rows skipped)`);
    } catch (err) {
      console.error('Excel import error:', err);
      toastStore.error(`Error importing products: ${err.message}`);
    } finally {
      event.target.value = null;
      importingExcel.value = false;
    }
  };
  reader.readAsArrayBuffer(file);
};

const handleExportAllDataJSON = () => {
  exportingJson.value = true;
  toastStore.info('Exporting all application data...');

  try {
    const dataToExport = settingsStore.getAllApplicationData();
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${settingsStore.storeName.replace(/\s+/g, '_')}_FullBackup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();

    localStorage.setItem('lastBackupTime', new Date().toISOString());
    toastStore.success('✓ Full application data exported successfully!');
  } catch (err) {
    console.error('JSON export error:', err);
    toastStore.error(`Error exporting data: ${err.message}`);
  } finally {
    exportingJson.value = false;
  }
};

const handleImportAllDataJSON = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  importingJson.value = true;
  toastStore.info('Importing application data from JSON...');

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      if (!confirm('⚠️ This will OVERWRITE ALL current application data including:\n- Products\n- Sales Records\n- Customers\n- Settings\n\nAre you absolutely sure?')) {
        toastStore.info('Restore cancelled');
        return;
      }

      await settingsStore.importAllApplicationData(importedData);

      loadSettings();
      localStorage.setItem('lastBackupTime', new Date().toISOString());

      toastStore.success('✓ Full application data restored successfully! (Refresh to see all changes)', 5000);
    } catch (err) {
      console.error('JSON import error:', err);
      toastStore.error(`Error importing data: ${err.message}`, 5000, true);
    } finally {
      event.target.value = null;
      importingJson.value = false;
    }
  };
  reader.readAsText(file);
};

const handleSystemReset = async () => {
  if (!confirm('☢️ EXTREME DANGER! This will permanently delete ALL stored application data.\n\nThis action is IRREVERSIBLE!\n\nAre you absolutely certain?')) {
    return;
  }

  const confirmationText = "ERASE ALL DATA";
  const userInput = prompt(`To confirm this irreversible action, please type exactly:\n"${confirmationText}"`);

  if (userInput !== confirmationText) {
    toastStore.info('✓ Data deletion cancelled. Confirmation text did not match.');
    return;
  }

  toastStore.warning('⚠️ Resetting all application data...');

  try {
    await settingsStore.resetAllApplicationData();
    loadSettings();
    toastStore.success('✓ Application data has been reset. Initial seed data reapplied.', 5000);
    setTimeout(() => window.location.reload(), 1500);
  } catch (err) {
    console.error('Reset error:', err);
    toastStore.error(`Error during reset: ${err.message}`);
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: var(--space-xl);
}

.page-subtitle {
  color: var(--text-color-muted);
  font-size: 1rem;
  margin-top: var(--space-sm);
}

/* Settings Tabs */
.settings-tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  border-bottom: 2px solid var(--border-color);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-color-muted);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--text-color);
  background-color: var(--bg-color-offset);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-label {
  white-space: nowrap;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Settings Row */
.settings-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.settings-left {
  flex: 1;
}

.settings-right {
  flex: 0 0 auto;
}

.setting-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

.setting-description {
  font-size: 0.9rem;
  color: var(--text-color-muted);
  margin: 0;
}

.theme-switcher-inline {
  display: flex;
}

/* Form Enhancements */
.form-label {
  display: block;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
  font-size: 0.95rem;
}

.form-text {
  display: block;
  font-size: 0.85rem;
  color: var(--text-color-muted);
  margin-top: var(--space-xs);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.form-actions .btn {
  flex: 0 0 auto;
}

/* Input with Preview */
.input-with-preview {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.input-with-preview .form-control {
  flex: 0 0 80px;
}

.currency-preview {
  padding: var(--space-sm) var(--space-md);
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  white-space: nowrap;
  color: var(--text-color);
}

/* Data Management */
.card-description {
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-color-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.data-action-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.data-action {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.action-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.action-icon.success { color: var(--success-color); }
.action-icon.info { color: var(--info-color); }
.action-icon.warning { color: var(--warning-color); }

.action-content {
  flex: 1;
}

.action-content h4 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--text-color);
  font-size: 1rem;
}

.action-content p {
  margin: 0;
  color: var(--text-color-muted);
  font-size: 0.9rem;
}

.data-action .btn {
  flex-shrink: 0;
}

.backup-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.info-item {
  padding: var(--space-md);
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
}

.info-item strong {
  display: block;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
}

/* System Information */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-lg);
}

.info-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  text-align: center;
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-color-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-xs);
}

.info-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

/* Danger Zone */
.danger-card {
  border-left: 5px solid var(--danger-color);
}

.danger-header {
  color: var(--danger-color);
}

.danger-warning {
  padding: var(--space-lg);
  background-color: rgba(220, 38, 38, 0.1);
  border-left: 4px solid var(--danger-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-color);
  margin-bottom: var(--space-lg);
}

[data-theme="dark"] .danger-warning {
  background-color: rgba(220, 38, 38, 0.15);
}

.danger-actions {
  margin-bottom: var(--space-lg);
}

.btn-large {
  padding: var(--space-md) var(--space-xl);
  font-size: 1rem;
  min-width: 200px;
}

.danger-info {
  padding: var(--space-lg);
  background-color: var(--bg-color-offset);
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  color: var(--text-color-muted);
}

.danger-info ul {
  margin: var(--space-md) 0 0 var(--space-lg);
  padding-left: var(--space-lg);
}

.danger-info li {
  margin-bottom: var(--space-xs);
  color: var(--text-color);
}

/* Loading States */
.btn-loading {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.loader-inline {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    padding: var(--space-md);
  }

  .tab-label {
    display: none;
  }

  .settings-row {
    flex-direction: column;
    gap: var(--space-md);
  }

  .data-action {
    flex-direction: column;
    text-align: center;
  }

  .action-content {
    order: 2;
  }

  .data-action .btn {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .input-with-preview {
    flex-direction: column;
    align-items: stretch;
  }

  .input-with-preview .form-control {
    flex: 1;
  }

  .currency-preview {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .backup-info {
    grid-template-columns: 1fr;
  }
}

<script setup>
import { ref, reactive, onMounted } from 'vue';
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProductStore } from '@/stores/productStore';
import { useToastStore } from '@/stores/toastStore'; // Import toast store
// For Excel functionality: npm install xlsx
import * as XLSX from 'xlsx';

const settingsStore = useSettingsStore();
const productStore = useProductStore();
const toastStore = useToastStore(); // Instantiate toast store

const editableSettings = reactive({
  storeName: '', storeAddress: '', storeEmail: '', storePhone: '',
  currencySymbol: '', lowStockThreshold: 0,
});

const exportingExcel = ref(false);
const importingExcel = ref(false);
const exportingJson = ref(false);
const importingJson = ref(false);

onMounted(() => {
  editableSettings.storeName = settingsStore.storeName;
  editableSettings.storeAddress = settingsStore.storeAddress;
  editableSettings.storeEmail = settingsStore.storeEmail;
  editableSettings.storePhone = settingsStore.storePhone;
  editableSettings.currencySymbol = settingsStore.currencySymbol;
  editableSettings.lowStockThreshold = settingsStore.lowStockThreshold;
});

const handleStoreInfoUpdate = () => {
  settingsStore.updateStoreInfo({
    name: editableSettings.storeName,
    address: editableSettings.storeAddress,
    email: editableSettings.storeEmail,
    phone: editableSettings.storePhone,
  });
  toastStore.success('Store information updated!');
};

const handlePreferencesUpdate = () => {
  let changesMade = false;
  if (settingsStore.currencySymbol !== editableSettings.currencySymbol) {
    if(settingsStore.updateCurrencySymbol(editableSettings.currencySymbol)) {
      toastStore.success('Currency symbol updated!');
      changesMade = true;
    } else {
      toastStore.error('Currency symbol cannot be empty.');
    }
  }
  if (settingsStore.lowStockThreshold !== editableSettings.lowStockThreshold) {
    if(settingsStore.updateLowStockThreshold(editableSettings.lowStockThreshold)) {
      toastStore.success('Low stock threshold updated!');
      changesMade = true;
    } else {
      toastStore.error('Low stock threshold must be a valid non-negative number.');
    }
  }

  if(!changesMade && !(settingsStore.currencySymbol !== editableSettings.currencySymbol) && !(settingsStore.lowStockThreshold !== editableSettings.lowStockThreshold)) {
    toastStore.info('No changes to save.');
  }
};

const handleExportProductsExcel = async () => {
  if (productStore.products.length === 0) {
    toastStore.info("No products to export."); return;
  }
  exportingExcel.value = true;
  toastStore.info("Exporting products to Excel...", 2000);
  try {
    await new Promise(r => setTimeout(r, 200));
    const exportData = productStore.products.map(p => ({
      "No.": p.no || '', "Serial Number": p.serial_number || '', "Category": p.category || '',
      "Company": p.company || '', "Model": p.model || '', "Condition": p.condition || 'New',
      "CPU": p.cpu || '', "Gen": p.gen || '', "Screen Touch (Yes/No)": p.screen_touch ? 'Yes' : 'No',
      "RAM": p.ram || '', "Quantity": p.quantity, "HDD": p.hdd || '', "SSD": p.ssd || '',
      "VGA Type": p.vga_type || '', "VGA Memory": p.vga_memory || '',
      "Base Price": p.base_price, "Selling Price": p.selling_price, "Best Price": p.best_price,
      "Supplier": p.supplier || '', "Purchase Date": p.purchase_date || '', "Warranty": p.warranty || '',
      "Dimensions": p.dimensions || '', "Weight": p.weight || '', "Color": p.color || '',
      "Description": p.description || '', "Image URL": p.image_url || '', "Tags": p.tags || ''
    }));
    const EXPECTED_EXCEL_HEADERS = [ /* ... (same as before) ... */
      "No.", "Serial Number", "Category", "Company", "Model", "Condition", "CPU", "Gen", "Screen Touch (Yes/No)", "RAM",
      "Quantity", "HDD", "SSD", "VGA Type", "VGA Memory", "Base Price", "Selling Price", "Best Price",
      "Supplier", "Purchase Date", "Warranty", "Dimensions", "Weight", "Color", "Description", "Image URL", "Tags"
    ];
    const worksheet = XLSX.utils.json_to_sheet(exportData, {header: EXPECTED_EXCEL_HEADERS});
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const fileName = `${settingsStore.storeName.replace(/\s+/g, '_')}_Products_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toastStore.success("Products exported successfully!");
  } catch (err) {
    console.error("Excel export error:", err);
    toastStore.error(`Error exporting products: ${err.message}`);
  } finally {
    exportingExcel.value = false;
  }
};

const handleImportProductsExcel = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  importingExcel.value = true;
  toastStore.info("Importing products from Excel...", 3000);

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      await new Promise(r => setTimeout(r, 200));
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      if (jsonData.length === 0) {
        toastStore.warning("Excel sheet is empty or unreadable."); return;
      }
      if (!confirm(`This will REPLACE all current products with ${jsonData.length} products from Excel. Continue?`)) {
        return;
      }

      const importedProducts = jsonData.map((row, index) => {
        let purchaseDate = row["Purchase Date"];
        if (purchaseDate instanceof Date && !isNaN(purchaseDate)) purchaseDate = purchaseDate.toISOString().split('T')[0];
        else if (typeof purchaseDate === 'number' && purchaseDate > 0) {
          const excelEpoch = new Date(1899, 11, 30);
          purchaseDate = new Date(excelEpoch.getTime() + purchaseDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (typeof purchaseDate === 'string' && purchaseDate.trim() !== '') {
          const parsedDate = new Date(purchaseDate.trim());
          purchaseDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : '';
        } else { purchaseDate = ''; }
        return {
          no: String(row["No."] || '').trim(), serial_number: String(row["Serial Number"] || '').trim(),
          category: String(row["Category"] || '').trim(), company: String(row["Company"] || '').trim(),
          model: String(row["Model"] || '').trim(), condition: String(row["Condition"] || 'New').trim(),
          cpu: String(row["CPU"] || '').trim(), gen: String(row["Gen"] || '').trim(),
          screen_touch: String(row["Screen Touch (Yes/No)"] || 'No').toLowerCase() === 'yes',
          ram: String(row["RAM"] || '').trim(), quantity: parseInt(row["Quantity"], 10) || 0,
          hdd: String(row["HDD"] || '').trim(), ssd: String(row["SSD"] || '').trim(),
          vga_type: String(row["VGA Type"] || '').trim(), vga_memory: String(row["VGA Memory"] || '').trim(),
          base_price: parseFloat(row["Base Price"]) || 0, selling_price: parseFloat(row["Selling Price"]) || 0,
          best_price: parseFloat(row["Best Price"]) || 0, supplier: String(row["Supplier"] || '').trim(),
          purchase_date: purchaseDate, warranty: String(row["Warranty"] || '').trim(),
          dimensions: String(row["Dimensions"] || '').trim(), weight: String(row["Weight"] || '').trim(),
          color: String(row["Color"] || '').trim(), description: String(row["Description"] || '').trim(),
          image_url: String(row["Image URL"] || '').trim(), tags: String(row["Tags"] || '').trim()
        };
      });

      await productStore.clearAllProductsData(true);
      let importedCount = 0;
      for (const prod of importedProducts) {
        if (prod.model && prod.company && prod.category && prod.condition && !isNaN(prod.quantity) && !isNaN(prod.selling_price)) {
          await productStore.addProduct(prod);
          importedCount++;
        }
      }
      productStore._saveProductsToLocalStorage();
      // await productStore.fetchProducts(); // Fetch might not be needed if addProduct updates array directly

      toastStore.success(`Imported ${importedCount} products. ${importedProducts.length - importedCount} rows skipped due to missing required fields.`);
    } catch (err) {
      console.error("Excel import error:", err);
      toastStore.error(`Error importing products: ${err.message}`);
    } finally {
      event.target.value = null;
      importingExcel.value = false;
    }
  };
  reader.readAsArrayBuffer(file);
};

const handleExportAllDataJSON = () => {
  exportingJson.value = true;
  toastStore.info("Exporting all application data...", 2000);
  try {
    const dataToExport = settingsStore.getAllApplicationData();
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${settingsStore.storeName.replace(/\s+/g, '_')}_FullBackup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
    toastStore.success('Full application data exported successfully!');
  } catch (err) {
    console.error("JSON export error:", err);
    toastStore.error(`Error exporting data: ${err.message}`);
  } finally {
    exportingJson.value = false;
  }
};

const handleImportAllDataJSON = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  importingJson.value = true;
  toastStore.info("Importing application data from JSON...", 3000);

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!confirm('This will OVERWRITE ALL current application data. Are you sure?')) {
        return;
      }
      await settingsStore.importAllApplicationData(importedData);

      editableSettings.storeName = settingsStore.storeName;
      editableSettings.storeAddress = settingsStore.storeAddress;
      editableSettings.storeEmail = settingsStore.storeEmail;
      editableSettings.storePhone = settingsStore.storePhone;
      editableSettings.currencySymbol = settingsStore.currencySymbol;
      editableSettings.lowStockThreshold = settingsStore.lowStockThreshold;

      toastStore.success('Full application data imported! Please refresh if necessary or navigate to see changes.', 5000);
      // window.location.reload(); // Optional: force reload
    } catch (err) {
      console.error("JSON import error:", err);
      toastStore.error(`Error importing data: ${err.message}`, 5000, true);
    } finally {
      event.target.value = null;
      importingJson.value = false;
    }
  };
  reader.readAsText(file);
};

const handleSystemReset = async () => {
  if (confirm('☢️ DANGER ZONE! This will ERASE ALL stored application data. This action is IRREVERSIBLE! Are you absolutely sure?')) {
    const confirmationText = "ERASE ALL DATA";
    const userInput = prompt(`To confirm, please type "${confirmationText}":`);
    if (userInput === confirmationText) {
      toastStore.warning("Resetting all application data...", 3000);
      await settingsStore.resetAllApplicationData();

      editableSettings.storeName = settingsStore.storeName;
      editableSettings.storeAddress = settingsStore.storeAddress;
      editableSettings.storeEmail = settingsStore.storeEmail;
      editableSettings.storePhone = settingsStore.storePhone;
      editableSettings.currencySymbol = settingsStore.currencySymbol;
      editableSettings.lowStockThreshold = settingsStore.lowStockThreshold;

      toastStore.success('Application data has been reset. Initial seed data (if any) reapplied.', 5000);
      setTimeout(() => window.location.reload(), 1500); // Give toast time to show
    } else {
      toastStore.info('Data deletion cancelled. Confirmation text did not match.');
    }
  }
};
</script>

<style scoped>
.theme-switch-wrapper label:first-of-type { margin-bottom: 0; color: var(--text-color); font-weight: 600; }
.card-header + .card-body p:first-child { margin-top:0; }
.button-group button, .button-group label.btn { margin-bottom: var(--space-sm); }
.btn.disabled, .btn:disabled { opacity: 0.65; pointer-events: none; }
</style>
