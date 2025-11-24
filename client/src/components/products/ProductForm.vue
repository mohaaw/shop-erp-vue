<template>
  <form @submit.prevent="submitForm" class="desk-form card">
    <div class="card-header">
      <h3 class="card-title">{{ isEditing ? `Editing: ${product.model}` : 'New Product' }}</h3>
    </div>
    
    <div class="card-body">
      <div v-if="isLoadingInitialData" class="text-center py-4 text-muted">
        Loading product data...
      </div>

      <div v-else class="form-sections">
        <!-- Core Details -->
        <section class="form-section">
          <h4 class="section-title">Core Details</h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">SKU / No.</label>
              <input type="text" v-model.trim="product.no" class="form-input" :class="{'is-invalid': validationErrors.no}">
              <span v-if="validationErrors.no" class="form-error">{{ validationErrors.no }}</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Serial Number</label>
              <input type="text" v-model.trim="product.serial_number" class="form-input" :class="{'is-invalid': validationErrors.serial_number}">
              <span v-if="validationErrors.serial_number" class="form-error">{{ validationErrors.serial_number }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">Category</label>
              <select v-model="product.category" class="form-select" :class="{'is-invalid': validationErrors.category}">
                <option value="">Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <span v-if="validationErrors.category" class="form-error">{{ validationErrors.category }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">Brand</label>
              <input type="text" v-model.trim="product.company" class="form-input" :class="{'is-invalid': validationErrors.company}">
              <span v-if="validationErrors.company" class="form-error">{{ validationErrors.company }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">Model</label>
              <input type="text" v-model.trim="product.model" class="form-input" :class="{'is-invalid': validationErrors.model}">
              <span v-if="validationErrors.model" class="form-error">{{ validationErrors.model }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">Condition</label>
              <select v-model="product.condition" class="form-select" :class="{'is-invalid': validationErrors.condition}">
                <option value="New">New</option>
                <option value="Used - Like New">Used - Like New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
                <option value="Refurbished">Refurbished</option>
                <option value="For Parts">For Parts</option>
              </select>
              <span v-if="validationErrors.condition" class="form-error">{{ validationErrors.condition }}</span>
            </div>
          </div>
        </section>

        <!-- Pricing & Stock -->
        <section class="form-section">
          <h4 class="section-title">Pricing & Stock</h4>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label required">Quantity</label>
              <input type="number" v-model.number="product.quantity" class="form-input" min="0" :class="{'is-invalid': validationErrors.quantity}">
              <span v-if="validationErrors.quantity" class="form-error">{{ validationErrors.quantity }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Base Price ({{ settingsStore.currencySymbol }})</label>
              <input type="number" v-model.number="product.base_price" class="form-input" min="0" step="0.01" :class="{'is-invalid': validationErrors.base_price}">
              <span v-if="validationErrors.base_price" class="form-error">{{ validationErrors.base_price }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">Selling Price ({{ settingsStore.currencySymbol }})</label>
              <input type="number" v-model.number="product.selling_price" class="form-input" min="0" step="0.01" :class="{'is-invalid': validationErrors.selling_price}">
              <span v-if="validationErrors.selling_price" class="form-error">{{ validationErrors.selling_price }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Best Price ({{ settingsStore.currencySymbol }})</label>
              <input type="number" v-model.number="product.best_price" class="form-input" min="0" step="0.01" :class="{'is-invalid': validationErrors.best_price}">
              <span v-if="validationErrors.best_price" class="form-error">{{ validationErrors.best_price }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Supplier</label>
              <input type="text" v-model.trim="product.supplier" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Purchase Date</label>
              <input type="date" v-model="product.purchase_date" class="form-input" :class="{'is-invalid': validationErrors.purchase_date}">
              <span v-if="validationErrors.purchase_date" class="form-error">{{ validationErrors.purchase_date }}</span>
            </div>
          </div>
        </section>

        <!-- Specifications -->
        <section class="form-section">
          <h4 class="section-title">Specifications</h4>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">CPU</label><input type="text" v-model.trim="product.cpu" class="form-input"></div>
            <div class="form-group"><label class="form-label">Gen</label><input type="text" v-model.trim="product.gen" class="form-input"></div>
            <div class="form-group"><label class="form-label">RAM</label><input type="text" v-model.trim="product.ram" class="form-input" placeholder="e.g. 16GB DDR4"></div>
            <div class="form-group"><label class="form-label">Storage (HDD)</label><input type="text" v-model.trim="product.hdd" class="form-input" placeholder="e.g. 1TB"></div>
            <div class="form-group"><label class="form-label">Storage (SSD)</label><input type="text" v-model.trim="product.ssd" class="form-input" placeholder="e.g. 512GB NVMe"></div>
            <div class="form-group"><label class="form-label">Graphics</label><input type="text" v-model.trim="product.vga_type" class="form-input"></div>
            <div class="form-group"><label class="form-label">VGA Memory</label><input type="text" v-model.trim="product.vga_memory" class="form-input"></div>
            <div class="form-group"><label class="form-label">Color</label><input type="text" v-model.trim="product.color" class="form-input"></div>
            
            <div class="form-group flex items-center pt-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="product.screen_touch" class="form-checkbox">
                <span class="text-sm font-medium text-main">Touch Screen</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Additional Info -->
        <section class="form-section border-none">
          <h4 class="section-title">Additional Info</h4>
          <div class="form-grid-1">
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input type="url" v-model.trim="product.image_url" class="form-input" placeholder="https://" :class="{'is-invalid': validationErrors.image_url}">
              <span v-if="validationErrors.image_url" class="form-error">{{ validationErrors.image_url }}</span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model.trim="product.description" class="form-textarea" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Tags</label>
              <input type="text" v-model.trim="product.tags" class="form-input" placeholder="comma, separated, tags">
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="card-footer flex justify-end gap-3 bg-gray-50 px-6 py-4 border-t border-gray-200">
      <router-link :to="{ name: 'ProductsList' }" class="btn btn-secondary">Cancel</router-link>
      <button type="submit" class="btn btn-primary" :disabled="productStore.isLoading">
        <span v-if="productStore.isLoading">Saving...</span>
        <span v-else>Save Product</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';

const props = defineProps({ productId: String });
const emit = defineEmits(['product-saved', 'product-save-error']);

const productStore = useProductStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const isEditing = computed(() => !!props.productId);
const validationErrors = reactive({});
const isLoadingInitialData = ref(false);

const categories = [
  'Laptop', 'Desktop PC', 'Monitor', 'Keyboard', 'Mouse', 
  'Tablet', 'Smartphone', 'Printer', 'Projector', 
  'Networking', 'Storage', 'Component', 'Accessory', 
  'Software', 'Gaming Console', 'Other Hardware'
];

const clearValidationErrors = () => {
  for (const key in validationErrors) delete validationErrors[key];
};

const getInitialProductState = () => ({
  idInternal: null, no: '', serial_number: '', category: '', company: '', model: '',
  condition: 'New', cpu: '', gen: '', screen_touch: false, ram: '',
  quantity: 0, hdd: '', ssd: '', vga_type: '', vga_memory: '',
  base_price: null, selling_price: null, best_price: null,
  supplier: '', purchase_date: '', warranty: '',
  dimensions: '', weight: '', color: '',
  description: '', image_url: '', tags: '',
});

const product = ref(getInitialProductState());

const loadProductForEditing = async () => {
  clearValidationErrors();
  if (props.productId) {
    isLoadingInitialData.value = true;
    if (productStore.products.length === 0 && !productStore.isLoading) {
      await productStore.fetchProducts();
    }
    const existingProduct = productStore.getProductById(props.productId);
    if (existingProduct) {
      product.value = { ...getInitialProductState(), ...existingProduct };
    } else {
      toastStore.error("Product not found.", 5000);
      emit('product-save-error', "Product not found.");
      product.value = getInitialProductState();
    }
    isLoadingInitialData.value = false;
  } else {
    product.value = getInitialProductState();
  }
};

onMounted(() => {
  // loadProductForEditing called by watcher
});

watch(() => props.productId, (newId, oldId) => {
  if (newId !== oldId || (newId && !product.value.idInternal && !isEditing.value)) {
    loadProductForEditing();
  }
}, { immediate: true });

const validateForm = () => {
  clearValidationErrors();
  let isValid = true;
  if (!product.value.category) { validationErrors.category = "Required"; isValid = false; }
  if (!product.value.company) { validationErrors.company = "Required"; isValid = false; }
  if (!product.value.model) { validationErrors.model = "Required"; isValid = false; }
  if (!product.value.condition) { validationErrors.condition = "Required"; isValid = false; }
  
  if (product.value.quantity === null || product.value.quantity < 0) {
    validationErrors.quantity = "Invalid quantity"; isValid = false;
  }
  if (product.value.selling_price === null || product.value.selling_price < 0) {
    validationErrors.selling_price = "Invalid price"; isValid = false;
  }
  
  const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;
  if (product.value.image_url && !urlPattern.test(product.value.image_url)) {
    validationErrors.image_url = "Invalid URL"; isValid = false;
  }

  if (!isValid) toastStore.error("Please fix form errors.", 3000);
  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) return;
  
  const productData = { ...product.value };
  // Ensure numbers
  ['base_price', 'best_price', 'selling_price'].forEach(k => productData[k] = parseFloat(productData[k]) || 0);
  productData.quantity = parseInt(productData.quantity) || 0;

  try {
    let saved;
    if (isEditing.value) {
      productData.idInternal = props.productId;
      saved = await productStore.updateProduct(productData);
      toastStore.success("Product updated!");
    } else {
      delete productData.idInternal;
      saved = await productStore.addProduct(productData);
      toastStore.success("Product added!");
    }
    emit('product-saved', saved);
  } catch (err) {
    console.error(err);
    toastStore.error("Error saving product.");
    emit('product-save-error', err.message);
  }
};
</script>

<style scoped>
.desk-form {
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
.card-title { font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0; }

.card-body { padding: 24px; }

.form-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
.form-section.border-none { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.section-title {
  font-size: 14px; font-weight: 600; color: var(--text-main);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.form-grid {
  display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px;
}
@media (min-width: 768px) {
  .form-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .form-grid { grid-template-columns: repeat(3, 1fr); }
}
.form-grid-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }

.form-group { display: flex; flex-direction: column; }

.form-label {
  font-size: 12px; color: var(--text-muted); margin-bottom: 6px;
  font-weight: 500;
}
.form-label.required::after { content: " *"; color: var(--danger-color); }

.form-input, .form-select, .form-textarea {
  background: var(--input-background);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 14px; color: var(--text-main);
  transition: all 0.2s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  outline: none;
}
.form-input.is-invalid, .form-select.is-invalid { border-color: var(--danger-color); }

.form-error { font-size: 11px; color: var(--danger-color); margin-top: 4px; }

.form-checkbox {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1px solid var(--input-border);
  accent-color: var(--primary-color);
}

.card-footer {
  padding: 16px 24px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  display: flex; justify-content: flex-end; gap: 12px;
}

.btn {
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; border: 1px solid transparent;
}
.btn-primary { background: var(--primary-color); color: white; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: white; border-color: var(--border-color); color: var(--text-main); }
.btn-secondary:hover { background: var(--bg-color); }
</style>
