<template>
  <div class="settings-page">
    <h1 class="page-title">⚙️ Application Settings</h1>

    <div class="card">
      <div class="card-header">Appearance</div>
      <div class="card-body">
        <div class="form-group theme-switch-wrapper" style="justify-content: space-between;">
          <label for="themeToggleInput" style="margin-bottom:0; font-weight: 600;">Interface Theme:</label>
          <ThemeSwitcher id="themeToggleInput" />
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Store Information</div>
      <div class="card-body">
        <form @submit.prevent="handleStoreInfoUpdate">
          <div class="form-group">
            <label for="settings-store-name">Store Name:</label>
            <input type="text" id="settings-store-name" v-model="editableSettings.storeName" class="form-control">
          </div>
          <div class="form-group">
            <label for="settings-store-address">Store Address:</label>
            <textarea id="settings-store-address" v-model="editableSettings.storeAddress" class="form-control" rows="3"></textarea>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label for="settings-store-email">Contact Email:</label>
              <input type="email" id="settings-store-email" v-model="editableSettings.storeEmail" class="form-control">
            </div>
            <div class="form-group">
              <label for="settings-store-phone">Contact Phone:</label>
              <input type="tel" id="settings-store-phone" v-model="editableSettings.storePhone" class="form-control">
            </div>
          </div>
          <div class="button-group" style="justify-content: flex-end;">
            <button type="submit" class="btn btn-primary btn-sm">💾 Save Store Info</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Preferences</div>
      <div class="card-body">
        <form @submit.prevent="handlePreferencesUpdate" class="form-grid-2">
          <div class="form-group">
            <label for="currency-symbol-setting">Currency Symbol:</label>
            <input type="text" id="currency-symbol-setting" v-model="editableSettings.currencySymbol" class="form-control" style="max-width: 100px;">
          </div>
          <div class="form-group">
            <label for="low-stock-setting">Low Stock Warning Level (units):</label>
            <input type="number" id="low-stock-setting" v-model.number="editableSettings.lowStockThreshold" class="form-control" min="0" style="max-width: 120px;">
          </div>
          <div class="form-group full-span" style="grid-column: 1 / -1; text-align: right; margin-top: 1rem;">
            <button type="submit" class="btn btn-primary btn-sm">💾 Save Preferences</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Product Data (Excel)</div>
      <div class="card-body">
        <p>Export current products to an Excel file or import products from an Excel file. Importing will <strong>replace</strong> current products.</p>
        <div class="button-group">
          <button class="btn btn-success" @click="handleExportProductsExcel" :disabled="productStore.isLoading || productStore.products.length === 0 || exportingExcel">
            <span v-if="exportingExcel"><div class="loader-btn-inline"></div> Exporting...</span>
            <span v-else>📊 Export Products to Excel</span>
          </button>
          <label class="btn btn-info" :class="{'disabled': importingExcel}">
            <span v-if="importingExcel"><div class="loader-btn-inline"></div> Importing...</span>
            <span v-else>📊 Import Products from Excel</span>
            <input type="file" id="import-excel-file" accept=".xlsx, .xls" @change="handleImportProductsExcel" style="display: none;" :disabled="importingExcel">
          </label>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">Application Data (JSON Backup)</div>
      <div class="card-body">
        <p>Export all application data (Products, Sales, Customers, Settings) to a JSON file for backup, or import from a backup file to restore state. Importing will <strong>overwrite</strong> current data.</p>
        <div class="button-group">
          <button class="btn btn-warning" @click="handleExportAllDataJSON" :disabled="exportingJson">
            <span v-if="exportingJson"><div class="loader-btn-inline"></div> Exporting...</span>
            <span v-else>💾 Export All Data (JSON)</span>
          </button>
          <label class="btn btn-primary" :class="{'disabled': importingJson}">
            <span v-if="importingJson"><div class="loader-btn-inline"></div> Importing...</span>
            <span v-else>💾 Import All Data (JSON)</span>
            <input type="file" id="import-file-json" accept=".json" @change="handleImportAllDataJSON" style="display: none;" :disabled="importingJson">
          </label>
        </div>
      </div>
    </div>

    <div class="card" style="border-left: 5px solid var(--danger-color);">
      <div class="card-header" style="color: var(--danger-color);">System Reset</div>
      <div class="card-body">
        <p><strong>Warning:</strong> This action is irreversible. It will delete all stored application data (Products, Sales, Customers, and Settings from local storage) and reset to initial seed data (if any).</p>
        <div class="button-group">
          <button class="btn btn-danger" @click="handleSystemReset">🗑️ Clear All Application Data</button>
        </div>
      </div>
    </div>
  </div>
</template>

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
.form-alert { /* Ensure styles from main.css are applied */ }
.btn.disabled, .btn:disabled { opacity: 0.65; pointer-events: none; }
.loader-btn-inline { /* Small inline loader for buttons */
  width: 1em; height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent !important; /* For visibility */
  border-top-color: transparent !important; /* Make it more C-shaped */
  border-radius: 50%;
  display: inline-block;
  vertical-align: -0.125em; /* Align with text */
  margin-right: 0.5em;
  animation: spin 0.75s linear infinite;
}
/* Ensure white loader on primary/dark buttons */
.btn-primary .loader-btn-inline,
.btn-warning .loader-btn-inline, /* If text is dark */
.btn-success .loader-btn-inline,
.btn-danger .loader-btn-inline,
.btn-info .loader-btn-inline {
  border-left-color: white;
  border-bottom-color: white;
}
[data-theme="dark"] .btn-warning .loader-btn-inline { /* if warning text becomes light on dark theme */
  border-left-color: var(--text-on-primary); /* or appropriate contrast */
  border-bottom-color: var(--text-on-primary);
}

</style>
