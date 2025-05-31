<template>
  <div class="pos-page">
    <div class="page-header d-flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">🛒 Point of Sale</h1>
      <div>
        <button class="btn btn-sm btn-light" @click="refreshAllData" :disabled="isLoadingData" title="Refresh product and customer lists">
          <span v-if="isLoadingData"><div class="loader-btn-inline"></div></span>
          <span v-else>🔄</span> Refresh Data
        </button>
      </div>
    </div>

    <div class="pos-layout">
      <div class="card product-selection-area">
        <div class="card-header">
          <input
            type="text"
            class="form-control"
            placeholder="🔍 Search products (Name, SKU, Category, Brand)..."
            v-model="productSearchTerm"
            aria-label="Search products"
          />
        </div>
        <div class="card-body pos-product-list-wrapper">
          <div v-if="productStore.isLoading && !initialProductLoadAttempted" class="text-center p-3 text-muted">
            <div class="loader"></div> Loading products...
          </div>
          <div v-else-if="filteredProductsForDisplay.length === 0" class="text-center p-3 text-muted">
            {{ productSearchTerm ? 'No products match your search.' : 'No products available or in stock.' }}
          </div>
          <div v-else class="product-grid">
            <POSProductCard
              v-for="product in filteredProductsForDisplay"
              :key="product.idInternal"
              :product="product"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </div>
      </div>

      <div class="card cart-checkout-area">
        <div class="card-header">Current Sale Cart</div>
        <div class="card-body cart-items-wrapper">
          <div class="form-group">
            <label for="pos-customer-select">Assign to Customer (Optional):</label>
            <div class="d-flex">
              <select id="pos-customer-select" class="form-control form-control-sm" v-model="selectedCustomerId" style="flex-grow: 1;">
                <option :value="null">-- Anonymous Sale --</option>
                <option v-for="customer in customerStore.customers" :key="customer.idInternal" :value="customer.idInternal">
                  {{ customer.name }} ({{ customer.email || customer.phone || 'ID: ...'+customer.idInternal.slice(-6) }})
                </option>
              </select>
              <button v-if="selectedCustomerId" @click="clearCustomerSelection" class="btn btn-xs btn-light ml-1" title="Clear Customer Selection" style="flex-shrink: 0;">✖</button>
            </div>
          </div>
          <hr>
          <ul v-if="cartStore.items.length > 0" class="cart-items-list">
            <li v-for="item in cartStore.items" :key="item.productIdInternal" class="cart-item">
              <div class="item-details">
                <span class="item-name" :title="item.model">{{ item.model }}</span>
                <span class="item-price-each">{{ settingsStore.currencySymbol }}{{ item.priceAtSale.toFixed(2) }} each</span>
              </div>
              <div class="item-controls">
                <input
                  type="number"
                  :value="item.quantity"
                  @change="updateCartItemQuantity(item.productIdInternal, $event.target.value)"
                  min="1"
                  :max="getProductStock(item.productIdInternal)"
                  class="form-control form-control-sm item-quantity-input"
                  aria-label="Item Quantity"
                />
                <span class="item-total-price">{{ settingsStore.currencySymbol }}{{ (item.priceAtSale * item.quantity).toFixed(2) }}</span>
                <button @click="handleRemoveItem(item.productIdInternal)" class="btn btn-sm btn-danger btn-icon" title="Remove Item">&times;</button>
              </div>
            </li>
          </ul>
          <div v-else class="text-center p-3 text-muted">
            Cart is empty. Select products to begin.
          </div>
        </div>
        <div class="card-footer cart-summary-footer">
          <div class="form-group">
            <label for="pos-discount-percentage">Discount (%):</label>
            <input
              type="number"
              id="pos-discount-percentage"
              class="form-control form-control-sm"
              min="0" max="100" step="0.1"
              :value="cartStore.discountPercentage"
              @input="handleDiscountInput(parseFloat($event.target.value))"
            >
          </div>
          <div class="form-group">
            <label for="pos-sale-notes">Sale Notes (Optional):</label>
            <textarea id="pos-sale-notes" class="form-control form-control-sm" rows="2" :value="cartStore.notes" @input="cartStore.setSaleNotes($event.target.value)"></textarea>
          </div>

          <div class="totals-summary">
            <p>Subtotal: <span>{{ settingsStore.currencySymbol }}{{ cartStore.subtotal.toFixed(2) }}</span></p>
            <p v-if="cartStore.discountAmount > 0" class="text-discount">
              Discount ({{ cartStore.discountPercentage.toFixed(1) }}%):
              <span>-{{ settingsStore.currencySymbol }}{{ cartStore.discountAmount.toFixed(2) }}</span>
            </p>
            <h3 class="grand-total">
              TOTAL: <span>{{ settingsStore.currencySymbol }}{{ cartStore.grandTotal.toFixed(2) }}</span>
            </h3>
          </div>
          <div class="button-group mt-3" style="flex-direction: column; gap: 0.5rem;">
            <button
              class="btn btn-success btn-lg w-100"
              @click="handleProcessSale"
              :disabled="cartStore.items.length === 0 || cartStore.isProcessingCheckout"
            >
              <span v-if="cartStore.isProcessingCheckout"><div class="loader-btn-inline"></div> Processing Sale...</span>
              <span v-else>💳 Process Payment & Complete Sale</span>
            </button>
            <button class="btn btn-warning w-100" @click="handleClearCart" :disabled="cartStore.items.length === 0">
              🗑️ Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    <SaleConfirmationModal
      :visible="isSaleConfirmationVisible"
      :sale="lastProcessedSale"
      @close="isSaleConfirmationVisible = false"
      @start-new-sale="startNewSaleAfterConfirmation"
    />

    <div class="card mt-4 calculator-widget">
      <div class="card-header">Quick Calculator</div>
      <div class="card-body">
        <input type="text" v-model="calculatorDisplay" class="form-control form-control-lg text-right mb-2" readonly placeholder="0">
        <div class="calculator-grid">
          <button v-for="btn in calculatorButtons" :key="btn.val + (btn.display || '')" @click="handleCalculatorInput(btn.val)" :class="btn.class">
            {{ btn.display || btn.val }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useCustomerStore } from '@/stores/customerStore';
import { useCartStore } from '@/stores/cartStore';
// salesStore is used indirectly by cartStore.processCheckout
import { useSettingsStore } from '@/stores/settingsStore';
import { useToastStore } from '@/stores/toastStore';
import POSProductCard from '@/components/pos/POSProductCard.vue';
import SaleConfirmationModal from '@/components/pos/SaleConfirmationModal.vue';

const productStore = useProductStore();
const customerStore = useCustomerStore();
const cartStore = useCartStore();
const settingsStore = useSettingsStore();
const toastStore = useToastStore();

const productSearchTerm = ref('');
const isLoadingData = ref(false); // For initial data load or manual refresh
const initialProductLoadAttempted = ref(false); // To show loader only on first product load

const isSaleConfirmationVisible = ref(false);
const lastProcessedSale = ref(null);

const selectedCustomerId = computed({
  get: () => cartStore.customerId,
  set: (val) => {
    const customer = customerStore.getCustomerById(val);
    cartStore.assignCustomer(customer);
  }
});

const filteredProductsForDisplay = computed(() => {
  if (!productSearchTerm.value) {
    return productStore.availableProductsForPOS.slice(0, 60);
  }
  const lowerSearch = productSearchTerm.value.toLowerCase();
  return productStore.availableProductsForPOS.filter(p =>
    (p.model && p.model.toLowerCase().includes(lowerSearch)) ||
    (p.no && p.no.toLowerCase().includes(lowerSearch)) ||
    (p.category && p.category.toLowerCase().includes(lowerSearch)) ||
    (p.company && p.company.toLowerCase().includes(lowerSearch)) ||
    (p.tags && p.tags.toLowerCase().includes(lowerSearch))
  ).slice(0, 60);
});

const getProductStock = (productIdInternal) => {
  const product = productStore.getProductById(productIdInternal);
  return product ? product.quantity : 0;
};

const handleAddToCart = (product) => {
  const result = cartStore.addItem(product);
  if (!result.success) {
    toastStore.warning(result.message || "Could not add item to cart.", 3000);
  }
};

const updateCartItemQuantity = (productIdInternal, newQuantityValue) => {
  const newQuantity = parseInt(newQuantityValue);
  if (isNaN(newQuantity)) {
    // If input becomes NaN (e.g., user deletes content), find current quantity to avoid issues
    const currentItem = cartStore.findItemInCart(productIdInternal);
    if (currentItem) {
      // Force re-render of input by slightly changing items array - not ideal but can work
      // A better way is to bind input to a local ref and update store on blur/valid change
      console.warn("Invalid quantity input, resetting to current or 1 if possible");
    }
    return;
  }
  const result = cartStore.updateItemQuantity(productIdInternal, newQuantity);
  if (!result.success) {
    toastStore.warning(result.message || "Could not update quantity.", 3000);
  }
};

const handleRemoveItem = (productIdInternal) => {
  const item = cartStore.findItemInCart(productIdInternal);
  if (item) {
    cartStore.removeItem(productIdInternal);
    toastStore.info(`${item.model} removed from cart.`, 2000);
  }
};

const handleClearCart = () => {
  if (cartStore.items.length === 0) return;
  if (window.confirm('Are you sure you want to clear all items from the cart?')) {
    cartStore.clearCart();
    toastStore.info('Cart cleared.');
  }
};

const handleDiscountInput = (value) => {
  const discount = parseFloat(value);
  if (isNaN(discount)) { // If user clears input, treat as 0
    cartStore.applyDiscount(0);
    return;
  }
  const result = cartStore.applyDiscount(discount);
  if (!result.success && discount !== cartStore.discountPercentage) {
    toastStore.warning(result.message || "Invalid discount value.", 3000);
  }
};

const handleProcessSale = async () => {
  if (cartStore.items.length === 0) {
    toastStore.warning('Cart is empty. Add products to proceed.');
    return;
  }
  // Double check stock before processing
  for (const item of cartStore.items) {
    const productInStore = productStore.getProductById(item.productIdInternal);
    if (!productInStore || item.quantity > productInStore.quantity) {
      toastStore.error(`Stock for ${item.model} is no longer sufficient (Available: ${productInStore?.quantity || 0}). Please adjust cart.`, 5000, true);
      return; // Stop processing
    }
  }

  const result = await cartStore.processCheckout();

  if (result.success && result.saleRecord) {
    lastProcessedSale.value = result.saleRecord;
    isSaleConfirmationVisible.value = true;
    // Toast for success is optional as modal is shown
  } else {
    toastStore.error(result.message || 'Sale processing failed. Please try again.', 5000, true);
  }
};

const startNewSaleAfterConfirmation = () => {
  productSearchTerm.value = '';
  // Cart is cleared by cartStore.processCheckout -> cartStore.clearCart
  // Customer selection is also cleared by cartStore.clearCart
  console.log("POSPage: Starting new sale after confirmation.");
};

const clearCustomerSelection = () => {
  selectedCustomerId.value = null; // Triggers computed setter
};

const refreshAllData = async () => {
  isLoadingData.value = true;
  toastStore.info("Refreshing product and customer data...", 2000);
  try {
    await Promise.all([
      productStore.fetchProducts(),
      customerStore.fetchCustomers()
    ]);
    toastStore.success("Data refreshed!", 2000);
  } catch (error) {
    toastStore.error("Failed to refresh data.", 3000);
    console.error("Error refreshing POS data:", error);
  } finally {
    isLoadingData.value = false;
  }
};

onMounted(async () => {
  isLoadingData.value = true;
  initialProductLoadAttempted.value = true; // Mark that we are trying to load products
  const promises = [];
  // Fetch only if data is not present or an error occurred previously
  if (!productStore.products.length || productStore.error) promises.push(productStore.fetchProducts());
  if (!customerStore.customers.length || customerStore.error) promises.push(customerStore.fetchCustomers());

  if (promises.length > 0) {
    await Promise.all(promises);
  }
  isLoadingData.value = false;
  // cartStore.clearCart(); // Clear cart from previous sessions on POS page load
});

// Calculator Logic
const calculatorDisplay = ref('');
const calculatorButtons = [
  { val: '7' }, { val: '8' }, { val: '9' }, { val: '/', class: 'operator' },
  { val: '4' }, { val: '5' }, { val: '6' }, { val: '*', class: 'operator' },
  { val: '1' }, { val: '2' }, { val: '3' }, { val: '-', class: 'operator' },
  { val: '0' }, { val: '.' }, { val: 'C', class: 'clear', display: 'C' }, { val: '+', class: 'operator' },
  { val: '=', class: 'equals col-span-4', display: '=' },
];
let calcCurrentInput = ''; let calcPreviousInput = ''; let calcOperation = null;
const handleCalculatorInput = (value) => {
  if (value === 'C') { calcCurrentInput = ''; calcPreviousInput = ''; calcOperation = null; calculatorDisplay.value = ''; }
  else if (value === '=') {
    if (calcPreviousInput !== '' && calcCurrentInput !== '' && calcOperation) {
      let result; const prev = parseFloat(calcPreviousInput); const current = parseFloat(calcCurrentInput);
      try {
        switch (calcOperation) {
          case '+': result = prev + current; break; case '-': result = prev - current; break;
          case '*': result = prev * current; break; case '/': result = current === 0 ? NaN : prev / current; break;
          default: return;
        }
        if (isNaN(result) || !isFinite(result)) { calculatorDisplay.value = 'Error'; }
        else { calculatorDisplay.value = parseFloat(result.toFixed(8)).toString(); }
      } catch { calculatorDisplay.value = 'Error'; }
      calcCurrentInput = calculatorDisplay.value === 'Error' ? '' : calculatorDisplay.value;
      calcPreviousInput = ''; calcOperation = null;
    }
  } else if (['+', '-', '*', '/'].includes(value)) {
    if (calcCurrentInput === '' && calcPreviousInput === '') return;
    if (calcCurrentInput !== '') { if (calcPreviousInput !== '' && calcOperation) { handleCalculatorInput('='); } calcPreviousInput = calcCurrentInput; calcCurrentInput = ''; }
    calcOperation = value; calculatorDisplay.value = calcPreviousInput + ' ' + calcOperation;
  } else {
    if (calculatorDisplay.value === 'Error') calculatorDisplay.value = '';
    if (value === '.' && calcCurrentInput.includes('.')) return;
    calcCurrentInput += value; calculatorDisplay.value = (calcPreviousInput ? calcPreviousInput + ' ' + (calcOperation || '') + ' ' : '') + calcCurrentInput;
  }
};
</script>

<style scoped>
/* Styles from the previous POSPage.vue version, ensure they are complete and correct */
.page-title { margin-bottom: 0; }
.pos-layout { display: grid; grid-template-columns: minmax(320px, 2.5fr) minmax(350px, 1.5fr); gap: var(--space-lg); min-height: 75vh; }
.product-selection-area .card-header, .cart-checkout-area .card-header { padding: var(--space-sm) var(--space-md); }
.product-selection-area .card-header input { font-size: 0.95rem; }
.pos-product-list-wrapper { max-height: calc(75vh - 120px); overflow-y: auto; padding: var(--space-sm); }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-md); }
.cart-items-wrapper { max-height: calc(70vh - 280px); overflow-y: auto; padding-bottom: var(--space-md); }
.cart-items-list { list-style: none; padding: 0; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) 0; border-bottom: 1px dashed var(--bg-tertiary); font-size: 0.9rem; }
.cart-item:last-child { border-bottom: none; }
.item-details { flex-grow: 1; padding-right: var(--space-sm); }
.item-name { display: block; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.item-price-each { font-size: 0.8em; color: var(--text-color-muted); }
.item-controls { display: flex; align-items: center; gap: var(--space-xs); flex-shrink: 0; }
.item-quantity-input { width: 55px; text-align: center; padding: var(--space-xs); font-size: 0.9rem; height: auto; }
.item-total-price { min-width: 70px; text-align: right; font-weight: 500; }
.cart-summary-footer { background-color: var(--bg-color-offset); padding-bottom: var(--space-md); }
.totals-summary p { display: flex; justify-content: space-between; margin-bottom: var(--space-xs); font-size: 0.95rem; }
.totals-summary p span { font-weight: 500; }
.grand-total { font-size: 1.4rem !important; font-weight: bold; color: var(--primary-color); border-top: 1px solid var(--border-color); padding-top: var(--space-sm); margin-top: var(--space-sm); }
.grand-total span { color: var(--primary-color); }
.form-control-sm { padding: 0.5rem 0.75rem; font-size: 0.9rem; height: auto; }
textarea.form-control-sm { min-height: 50px; }
.loader-btn-inline { width: 1em; height: 1em; border-width: 2px; border-style: solid; border-color: currentColor currentColor currentColor transparent; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 0.5em; animation: spin 0.6s linear infinite; }
.btn-primary .loader-btn-inline, .btn-success .loader-btn-inline { border-left-color: var(--text-on-primary); border-bottom-color: var(--text-on-primary); }
[data-theme="dark"] .btn-primary .loader-btn-inline, [data-theme="dark"] .btn-success .loader-btn-inline { border-left-color: var(--text-on-primary); border-bottom-color: var(--text-on-primary); }
.btn-xs { padding: 0.25rem 0.5rem; font-size: 0.75rem; }

.calculator-widget .card-header { font-size: 1.1rem; padding: var(--space-sm) var(--space-md); }
.calculator-widget .card-body { padding: var(--space-md); }
.calculator-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-sm); }
.calculator-grid button { padding: var(--space-md); font-size: 1.1em; background-color: var(--bg-color-offset); border: 1px solid var(--border-color); color: var(--text-color); border-radius: var(--border-radius-sm); cursor: pointer; transition: background-color 0.2s; }
.calculator-grid button:hover { background-color: var(--border-color); }
.calculator-grid button.operator { background-color: var(--secondary-color); color: var(--text-color-inverted); }
[data-theme="dark"] .calculator-grid button.operator { background-color: #5a5a5a; }
.calculator-grid button.operator:hover { background-color: #333; }
[data-theme="dark"] .calculator-grid button.operator:hover { background-color: #6a6a6a; }
.calculator-grid button.equals { background-color: var(--primary-color); color: var(--text-on-primary); }
.calculator-grid button.equals:hover { background-color: var(--primary-hover-color); }
.calculator-grid button.clear { background-color: var(--danger-color); color: white; }
.calculator-grid button.col-span-4 { grid-column: span 4; }

@media (max-width: 992px) {
  .pos-layout { grid-template-columns: 1fr; }
  .product-selection-area { margin-bottom: var(--space-lg); }
  .pos-product-list-wrapper { max-height: 40vh; }
  .cart-items-wrapper { max-height: 35vh; }
  .cart-summary-footer { padding-bottom: var(--space-sm); }
}
.text-muted { color: var(--text-color-muted); }
.p-5 { padding: calc(var(--space-xl) * 1.25); }
.p-3 { padding: var(--space-md); }
.text-discount { color: var(--danger-color); } /* For discount text */
.loader { margin-bottom: 0.5rem; }
</style>
