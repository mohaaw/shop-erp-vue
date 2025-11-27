<template>
  <div class="color-picker">
    <label class="color-picker-label">
      <span class="label-text">{{ label }}</span>
      <span v-if="description" class="label-description">{{ description }}</span>
    </label>
    
    <div class="color-input-group">
      <div class="color-preview" :style="{ backgroundColor: modelValue }"></div>
      
      <input
        type="color"
        :value="modelValue"
        @input="handleColorChange"
        class="color-input"
      />
      
      <input
        type="text"
        :value="modelValue"
        @input="handleTextInput"
        @blur="validateAndUpdate"
        class="hex-input"
        placeholder="#000000"
        maxlength="7"
      />
    </div>
  </div>
</template>

<script setup>


const props = defineProps({
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const handleColorChange = (event) => {
  emit('update:modelValue', event.target.value.toUpperCase());
};

const handleTextInput = (event) => {
  let value = event.target.value;
  // Auto-add # if missing
  if (value && !value.startsWith('#')) {
    value = '#' + value;
  }
  event.target.value = value.toUpperCase();
};

const validateAndUpdate = (event) => {
  let value = event.target.value.toUpperCase();
  
  // Validate hex color format
  if (/^#[0-9A-F]{6}$/i.test(value)) {
    emit('update:modelValue', value);
  } else {
    // Reset to current value if invalid
    event.target.value = props.modelValue;
  }
};
</script>

<style scoped>
.color-picker {
  margin-bottom: 1.5rem;
}

.color-picker-label {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.label-text {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.label-description {
  font-size: 0.85rem;
  color: var(--text-color-muted);
  margin-top: 0.25rem;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius);
  border: 2px solid var(--border-color);
  box-shadow: var(--box-shadow-sm);
  flex-shrink: 0;
}

.color-input {
  width: 60px;
  height: 50px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: calc(var(--border-radius) - 2px);
}

.hex-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--bg-color);
  color: var(--text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.hex-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

[data-theme="dark"] .hex-input:focus {
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
}
</style>
