<template>
  <form @submit.prevent="submitForm" class="card product-detail-form">
    <div class="card-header" v-if="isEditing && product.model">
      Editing: {{ product.model }} ({{product.company}})
    </div>
    <div class="card-header" v-else-if="!isEditing">
      Enter New Product Details
    </div>
    <div class="card-body">
      <div v-if="isLoadingInitialData" class="loader-sm mb-3">Loading product data...</div>

      <fieldset>
        <legend>Core Details</legend>
        <div class="form-grid-3">
          <div class="form-group">
            <label for="product-no">No./SKU:</label>
            <input type="text" id="product-no" v-model.trim="product.no" class="form-control" :class="{'is-invalid': validationErrors.no}">
            <div v-if="validationErrors.no" class="invalid-feedback">{{ validationErrors.no }}</div>
          </div>
          <div class="form-group">
            <label for="product-serial-number">Serial Number:</label>
            <input type="text" id="product-serial-number" v-model.trim="product.serial_number" class="form-control" :class="{'is-invalid': validationErrors.serial_number}">
            <div v-if="validationErrors.serial_number" class="invalid-feedback">{{ validationErrors.serial_number }}</div>
          </div>
          <div class="form-group">
            <label for="product-category">Category:*</label>
            <select id="product-category" v-model="product.category" class="form-control" required :class="{'is-invalid': validationErrors.category}">
              <option value="">-- Select Category --</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop PC">Desktop PC</option>
              <option value="Monitor">Monitor</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Mouse">Mouse</option>
              <option value="Tablet">Tablet</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Printer">Printer</option>
              <option value="Projector">Projector</option>
              <option value="Networking">Networking (Router, Switch)</option>
              <option value="Storage">Storage (HDD, SSD, NAS)</option>
              <option value="Component">Component (CPU, RAM, GPU)</option>
              <option value="Accessory">Accessory (Cables, Bags, etc.)</option>
              <option value="Software">Software</option>
              <option value="Gaming Console">Gaming Console</option>
              <option value="Other Hardware">Other Hardware</option>
            </select>
            <div v-if="validationErrors.category" class="invalid-feedback">{{ validationErrors.category }}</div>
          </div>
          <div class="form-group">
            <label for="product-company">Company/Brand:*</label>
            <input type="text" id="product-company" v-model.trim="product.company" class="form-control" required :class="{'is-invalid': validationErrors.company}">
            <div v-if="validationErrors.company" class="invalid-feedback">{{ validationErrors.company }}</div>
          </div>
          <div class="form-group">
            <label for="product-model">Model:*</label>
            <input type="text" id="product-model" v-model.trim="product.model" class="form-control" required :class="{'is-invalid': validationErrors.model}">
            <div v-if="validationErrors.model" class="invalid-feedback">{{ validationErrors.model }}</div>
          </div>
          <div class="form-group">
            <label for="product-condition">Condition:*</label>
            <select id="product-condition" v-model="product.condition" class="form-control" required :class="{'is-invalid': validationErrors.condition}">
              <option value="New">New</option>
              <option value="Used - Like New">Used - Like New</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
              <option value="Refurbished">Refurbished</option>
              <option value="For Parts">For Parts</option>
            </select>
            <div v-if="validationErrors.condition" class="invalid-feedback">{{ validationErrors.condition }}</div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Stock & Pricing</legend>
        <div class="form-grid-3">
          <div class="form-group">
            <label for="product-quantity">Quantity:*</label>
            <input type="number" id="product-quantity" v-model.number="product.quantity" class="form-control" min="0" required :class="{'is-invalid': validationErrors.quantity}">
            <div v-if="validationErrors.quantity" class="invalid-feedback">{{ validationErrors.quantity }}</div>
          </div>
          <div class="form-group">
            <label for="product-base-price">Base Price ({{ settingsStore.currencySymbol }}):</label>
            <input type="number" id="product-base-price" v-model.number="product.base_price" class="form-control" min="0" step="0.01" placeholder="0.00" :class="{'is-invalid': validationErrors.base_price}">
            <div v-if="validationErrors.base_price" class="invalid-feedback">{{ validationErrors.base_price }}</div>
          </div>
          <div class="form-group">
            <label for="product-selling-price">Selling Price ({{ settingsStore.currencySymbol }}):*</label>
            <input type="number" id="product-selling-price" v-model.number="product.selling_price" class="form-control" min="0" step="0.01" required placeholder="0.00" :class="{'is-invalid': validationErrors.selling_price}">
            <div v-if="validationErrors.selling_price" class="invalid-feedback">{{ validationErrors.selling_price }}</div>
          </div>
          <div class="form-group">
            <label for="product-best-price">Best Price ({{ settingsStore.currencySymbol }}):</label>
            <input type="number" id="product-best-price" v-model.number="product.best_price" class="form-control" min="0" step="0.01" placeholder="0.00" :class="{'is-invalid': validationErrors.best_price}">
            <div v-if="validationErrors.best_price" class="invalid-feedback">{{ validationErrors.best_price }}</div>
          </div>
          <div class="form-group">
            <label for="product-supplier">Supplier/Vendor:</label>
            <input type="text" id="product-supplier" v-model.trim="product.supplier" class="form-control">
          </div>
          <div class="form-group">
            <label for="product-purchase-date">Purchase Date:</label>
            <input type="date" id="product-purchase-date" v-model="product.purchase_date" class="form-control" :class="{'is-invalid': validationErrors.purchase_date}">
            <div v-if="validationErrors.purchase_date" class="invalid-feedback">{{ validationErrors.purchase_date }}</div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Specifications</legend>
        <div class="form-grid-3">
          <div class="form-group"><label for="product-cpu">CPU:</label><input type="text" id="product-cpu" v-model.trim="product.cpu" class="form-control"></div>
          <div class="form-group"><label for="product-gen">Gen:</label><input type="text" id="product-gen" v-model.trim="product.gen" class="form-control"></div>
          <div class="form-group"><label for="product-ram">RAM:</label><input type="text" id="product-ram" v-model.trim="product.ram" class="form-control" placeholder="e.g., 8GB, 16GB DDR5"></div>
          <div class="form-group"><label for="product-hdd">HDD:</label><input type="text" id="product-hdd" v-model.trim="product.hdd" class="form-control" placeholder="e.g., 1TB, N/A"></div>
          <div class="form-group"><label for="product-ssd">SSD:</label><input type="text" id="product-ssd" v-model.trim="product.ssd" class="form-control" placeholder="e.g., 512GB NVMe"></div>
          <div class="form-group"><label for="product-vga-type">VGA Type:</label><input type="text" id="product-vga-type" v-model.trim="product.vga_type" class="form-control"></div>
          <div class="form-group"><label for="product-vga-memory">VGA Memory:</label><input type="text" id="product-vga-memory" v-model.trim="product.vga_memory" class="form-control" placeholder="e.g., 4GB GDDR6"></div>
          <div class="form-group"><label for="product-color">Color Options:</label><input type="text" id="product-color" v-model.trim="product.color" class="form-control" placeholder="e.g., Black, Silver"></div>
          <div class="form-group"><label for="product-dimensions">Dimensions (LxWxH):</label><input type="text" id="product-dimensions" v-model.trim="product.dimensions" class="form-control" placeholder="e.g., 30x20x1.5 cm"></div>
          <div class="form-group"><label for="product-weight">Weight:</label><input type="text" id="product-weight" v-model.trim="product.weight" class="form-control" placeholder="e.g., 1.2kg, 2.5lbs"></div>
          <div class="form-group checkbox-group" style="margin-top: 2rem;">
            <input type="checkbox" id="product-screen-touch" v-model="product.screen_touch" style="width: auto; margin-right: 0.7rem; transform: scale(1.2);">
            <label for="product-screen-touch" style="margin-bottom: 0;">Screen Touch</label>
          </div>
          <div class="form-group"><label for="product-warranty">Warranty Period:</label><input type="text" id="product-warranty" v-model.trim="product.warranty" class="form-control" placeholder="e.g., 1 year, 90 days"></div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Additional Information</legend>
        <div class="form-group">
          <label for="product-image-url">Product Image URL:</label>
          <input type="url" id="product-image-url" v-model.trim="product.image_url" class="form-control" placeholder="https://example.com/image.jpg" :class="{'is-invalid': validationErrors.image_url}">
          <div v-if="validationErrors.image_url" class="invalid-feedback">{{ validationErrors.image_url }}</div>
        </div>
        <div class="form-group">
          <label for="product-description">Description/Notes:</label>
          <textarea id="product-description" v-model.trim="product.description" class="form-control" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label for="product-tags">Tags/Keywords (comma-separated):</label>
          <input type="text" id="product-tags" v-model.trim="product.tags" class="form-control" placeholder="e.g., gaming, ultrabook, office">
        </div>
      </fieldset>
    </div>

    <div class="card-footer button-group" style="justify-content: flex-end;">
      <router-link :to="{ name: 'ProductsList' }" class="btn btn-light">Cancel</router-link>
      <button type="submit" class="btn btn-primary" :disabled="productStore.isLoading">
        <span v-if="productStore.isLoading">{{ isEditing ? 'Updating...' : 'Saving...' }}</span>
        <span v-else>💾 {{ isEditing ? 'Update Product' : 'Save Product' }}</span>
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

// Function to clear validation errors MUST be defined before it's used by loadProductForEditing (called by watch immediate)
const clearValidationErrors = () => {
  for (const key in validationErrors) {
    delete validationErrors[key];
  }
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
  clearValidationErrors(); // Now defined above
  if (props.productId) {
    isLoadingInitialData.value = true;
    if (productStore.products.length === 0 && !productStore.isLoading) {
      await productStore.fetchProducts();
    }
    const existingProduct = productStore.getProductById(props.productId);
    if (existingProduct) {
      product.value = { ...getInitialProductState(), ...existingProduct };
    } else {
      console.error(`ProductForm: Product with ID ${props.productId} not found for editing.`);
      toastStore.error("Product not found for editing. It may have been deleted.", 5000, true);
      emit('product-save-error', "Product not found.");
      product.value = getInitialProductState(); // Keep form blank or show an error state
    }
    isLoadingInitialData.value = false;
  } else {
    product.value = getInitialProductState();
  }
};

onMounted(() => {
  // loadProductForEditing is called by the watcher with immediate: true
});

watch(() => props.productId, (newId, oldId) => {
  if (newId !== oldId || (newId && !product.value.idInternal && !isEditing.value)) {
    // also reload if new form for editing an already set productId and product form is not yet populated
    loadProductForEditing();
  }
}, { immediate: true });


const validateForm = () => {
  clearValidationErrors();
  let isValid = true;
  if (!product.value.category) { validationErrors.category = "Category is required."; isValid = false; }
  if (!product.value.company) { validationErrors.company = "Company/Brand is required."; isValid = false; }
  if (!product.value.model) { validationErrors.model = "Model is required."; isValid = false; }
  if (!product.value.condition) { validationErrors.condition = "Condition is required."; isValid = false; }

  if (product.value.quantity === null || isNaN(product.value.quantity) || product.value.quantity < 0) {
    validationErrors.quantity = "Quantity must be a non-negative number."; isValid = false;
  }
  if (product.value.selling_price === null || isNaN(product.value.selling_price) || product.value.selling_price < 0) {
    validationErrors.selling_price = "Selling Price must be a non-negative number."; isValid = false;
  }
  if (product.value.base_price !== null && product.value.base_price !== '' && (isNaN(product.value.base_price) || product.value.base_price < 0)) {
    validationErrors.base_price = "Base Price, if entered, must be a non-negative number."; isValid = false;
  }
  if (product.value.best_price !== null && product.value.best_price !== '' && (isNaN(product.value.best_price) || product.value.best_price < 0)) {
    validationErrors.best_price = "Best Price, if entered, must be a non-negative number."; isValid = false;
  }
  const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;
  if (product.value.image_url && !urlPattern.test(product.value.image_url)) {
    validationErrors.image_url = "Please enter a valid Image URL or leave empty."; isValid = false;
  }

  if (!isValid) {
    toastStore.error("Please correct the highlighted errors in the form.", 4000);
  }
  return isValid;
};

const submitForm = async () => {
  clearValidationErrors(); // Clear previous specific field errors
  productStore.error = null; // Clear general store error

  if (!validateForm()) {
    emit('product-save-error', "Validation failed. See field errors.");
    return;
  }

  const productDataToSave = { ...product.value };
  productDataToSave.base_price = (productDataToSave.base_price === '' || productDataToSave.base_price === null) ? 0 : parseFloat(productDataToSave.base_price);
  productDataToSave.best_price = (productDataToSave.best_price === '' || productDataToSave.best_price === null) ? 0 : parseFloat(productDataToSave.best_price);
  productDataToSave.selling_price = parseFloat(productDataToSave.selling_price) || 0;
  productDataToSave.quantity = parseInt(productDataToSave.quantity, 10) || 0;

  try {
    let savedProduct;
    if (isEditing.value) {
      productDataToSave.idInternal = props.productId;
      savedProduct = await productStore.updateProduct(productDataToSave);
      toastStore.success(`Product "${savedProduct.model}" updated successfully!`);
    } else {
      if (productDataToSave.idInternal === null) delete productDataToSave.idInternal;
      savedProduct = await productStore.addProduct(productDataToSave);
      toastStore.success(`Product "${savedProduct.model}" added successfully!`);
    }
    emit('product-saved', savedProduct);
  } catch (error) {
    console.error("Form submission error in ProductForm:", error);
    const message = productStore.error || error.message || "An unexpected error occurred.";
    // Display error at top of form is removed, relying on toast
    toastStore.error(`Error saving product: ${message}`, 5000, true);
    emit('product-save-error', message);
  }
};
</script>

<style scoped>
/* Styles from previous ProductForm.vue, plus validation styles from main.css will apply */
.product-detail-form .card-footer { background-color: var(--bg-color-offset); border-top: 1px solid var(--border-color); }
.loader-sm { text-align: center; padding: var(--space-md); color: var(--text-color-muted); font-style: italic; }
/* Global form alert is removed, relying on toasts and field errors */
.checkbox-group label { margin-bottom: 0; font-weight: normal; color: var(--text-color); }
.checkbox-group input[type="checkbox"] { accent-color: var(--primary-color); }
</style>
