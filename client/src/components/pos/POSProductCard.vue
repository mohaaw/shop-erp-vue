<template>
  <div
    class="product-item-pos card"
    @click="product.quantity > 0 && emit('add-to-cart', product)"
    :class="{ 'disabled': product.quantity <= 0 }"
    :title="product.quantity <= 0 ? `${product.model} - Out of stock` : `Add ${product.model} to cart. Price: ${settingsStore.currencySymbol}${product.selling_price.toFixed(2)}. Stock: ${product.quantity}`"
    tabindex="0"
    @keypress.enter.space="product.quantity > 0 && emit('add-to-cart', product)"
    role="button"
    :aria-disabled="product.quantity <= 0"
    :aria-label="`Add ${product.model} to cart`"
  >
    <div class="pos-product-image-wrapper">
      <img
        v-if="product.image_url && !imageError"
        :src="product.image_url"
        :alt="product.model"
        class="pos-product-img"
        @error="handleImageError"
      >
      <div v-else class="pos-product-img-placeholder">
        📦
      </div>
    </div>
    <div class="pos-product-details">
      <strong class="product-name" :title="product.model">{{ product.model }}</strong>
      <small class="product-brand">{{ product.company || 'N/A' }}</small>
      <div class="product-price-stock">
        <span class="price">{{ settingsStore.currencySymbol }}{{ (product.selling_price || 0).toFixed(2) }}</span>
        <span class="stock" :class="{'low-stock': product.quantity > 0 && product.quantity <= settingsStore.lowStockThreshold, 'no-stock': product.quantity <= 0}">
          Stock: {{ product.quantity }}
        </span>
      </div>
    </div>
    <div class="product-tooltip-on-hover">
      <strong>{{ product.model }}</strong><br>
      SKU: {{ product.no || product.sku || 'N/A' }} <br>
      Category: {{ product.category || 'N/A' }} <br>
      <span v-if="product.description">
            {{ product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') }}
        </span>
      <span v-else>No description.</span>
    </div>
  </div>
</template>

<script setup>
// ... your script setup code for POSProductCard ...
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['add-to-cart']);
const settingsStore = useSettingsStore();
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped>
/* ... your styles for POSProductCard ... */
.product-item-pos {
  border: 1px solid var(--border-color);
  padding: var(--space-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--card-bg-color);
  min-height: 200px;
  justify-content: space-between;
}
.product-item-pos:hover:not(.disabled) {
  border-color: var(--primary-color);
  box-shadow: var(--box-shadow);
  transform: translateY(-2px);
}
.product-item-pos.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-color-offset);
}
.product-item-pos.disabled:hover {
  border-color: var(--border-color);
  box-shadow: none;
  transform: none;
}

.pos-product-image-wrapper {
  width: 120px;
  height: 120px;
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-color-offset);
}
.pos-product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.pos-product-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--text-color-muted);
  border-radius: var(--border-radius-sm);
}

.pos-product-details {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 var(--space-xs);
}
.product-name {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--space-xs);
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.product-brand {
  font-size: 0.8em;
  color: var(--text-color-muted);
  margin-bottom: var(--space-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-price-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: auto;
  font-size: 0.9em;
}
.price {
  font-weight: bold;
  color: var(--primary-color);
}
.stock {
  color: var(--text-color-muted);
  font-size: 0.85em;
}
.stock.low-stock { color: var(--warning-color); font-weight: bold; }
.stock.no-stock { color: var(--danger-color); font-weight: bold; }

.product-tooltip-on-hover {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  background-color: var(--nav-bg-color);
  color: var(--nav-text-color);
  border-radius: var(--border-radius);
  padding: var(--space-md);
  font-size: 0.85em;
  z-index: 1000;
  box-shadow: var(--box-shadow-strong);
  width: 280px;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  bottom: calc(100% + 5px);
  text-align: left;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, transform 0.2s ease-in-out;
  white-space: normal;
}
.product-item-pos:hover .product-tooltip-on-hover {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
