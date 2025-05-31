<template>
  <div class="modal-backdrop" v-if="visible" @click.self="closeModal">
    <div class="modal-content card">
      <div class="modal-header">
        <h3>{{ isEditing ? 'Edit Customer Information' : '✨ Add New Customer' }}</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <form @submit.prevent="submitForm">
        <div class="card-body" style="max-height: 70vh; overflow-y: auto;">
          <div v-if="formError && !Object.keys(validationErrors).length" class="form-alert alert-danger mb-3">{{ formError }}</div>

          <input type="hidden" v-model="editableCustomer.idInternal">

          <fieldset>
            <legend>Basic Information</legend>
            <div class="form-grid-2">
              <div class="form-group">
                <label for="customer-name">Name:*</label>
                <input type="text" id="customer-name" v-model.trim="editableCustomer.name" class="form-control" required :class="{'is-invalid': validationErrors.name}">
                <div v-if="validationErrors.name" class="invalid-feedback">{{ validationErrors.name }}</div>
              </div>
              <div class="form-group">
                <label for="customer-email">Email:</label>
                <input type="email" id="customer-email" v-model.trim="editableCustomer.email" class="form-control" :class="{'is-invalid': validationErrors.email}">
                <div v-if="validationErrors.email" class="invalid-feedback">{{ validationErrors.email }}</div>
              </div>
              <div class="form-group">
                <label for="customer-phone">Phone:</label>
                <input type="tel" id="customer-phone" v-model.trim="editableCustomer.phone" class="form-control" :class="{'is-invalid': validationErrors.phone}">
                <div v-if="validationErrors.phone" class="invalid-feedback">{{ validationErrors.phone }}</div>
              </div>
              <div class="form-group">
                <label for="customer-type">Customer Type:</label>
                <select id="customer-type" v-model="editableCustomer.customer_type" class="form-control">
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Business">Business</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Contact & Notes</legend>
            <div class="form-group">
              <label for="customer-address">Address:</label>
              <textarea id="customer-address" v-model.trim="editableCustomer.address" class="form-control" rows="3" placeholder="Street, City, State, Zip, Country"></textarea>
            </div>
            <div class="form-group">
              <label for="customer-notes">Notes:</label>
              <textarea id="customer-notes" v-model.trim="editableCustomer.notes" class="form-control" rows="3"></textarea>
            </div>
          </fieldset>

        </div>
        <div class="card-footer button-group" style="justify-content: flex-end;">
          <button type="button" class="btn btn-light" @click="closeModal">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="customerStore.isLoading">
            💾 {{ customerStore.isLoading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Save Customer') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue';
import { useCustomerStore } from '@/stores/customerStore';
import { useToastStore } from '@/stores/toastStore';

const props = defineProps({
  visible: Boolean,
  customerId: String
});
const emit = defineEmits(['close', 'customer-saved']);

const customerStore = useCustomerStore();
const toastStore = useToastStore();
const formError = ref(null); // For general form error not tied to a field
const validationErrors = reactive({});

const getInitialCustomerState = () => ({
  idInternal: null, name: '', email: '', phone: '',
  customer_type: 'Regular', address: '', notes: '',
  date_joined: new Date().toISOString().split('T')[0]
});

const editableCustomer = ref(getInitialCustomerState());
const isEditing = computed(() => !!props.customerId && !!editableCustomer.value.idInternal);

watch(() => props.visible, (newVal) => {
  clearValidationErrors();
  formError.value = null;
  if (newVal) {
    if (props.customerId) {
      const existingCustomer = customerStore.getCustomerById(props.customerId);
      if (existingCustomer) {
        editableCustomer.value = { ...getInitialCustomerState(), ...existingCustomer };
      } else {
        console.error(`Customer with ID ${props.customerId} not found.`);
        toastStore.error("Customer not found for editing.", 5000, true);
        editableCustomer.value = getInitialCustomerState();
      }
    } else {
      editableCustomer.value = getInitialCustomerState();
    }
  }
});

const closeModal = () => emit('close');

const clearValidationErrors = () => {
  for (const key in validationErrors) {
    delete validationErrors[key];
  }
};

const validateForm = () => {
  clearValidationErrors();
  let isValid = true;
  if (!editableCustomer.value.name || editableCustomer.value.name.length < 2) {
    validationErrors.name = "Customer name is required (min 2 characters).";
    isValid = false;
  }
  // Basic email validation regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (editableCustomer.value.email && !emailPattern.test(editableCustomer.value.email)) {
    validationErrors.email = "Please enter a valid email address.";
    isValid = false;
  }
  // Basic phone validation (example: allow numbers, spaces, hyphens, parens, +)
  const phonePattern = /^[+\-\d\s()]*$/;
  if (editableCustomer.value.phone && !phonePattern.test(editableCustomer.value.phone)) {
    validationErrors.phone = "Phone number contains invalid characters.";
    isValid = false;
  }

  if (!isValid) {
    toastStore.error("Please correct the highlighted errors.", 4000);
  }
  return isValid;
};

const submitForm = async () => {
  formError.value = null; // Clear general form error
  if (!validateForm()) {
    return;
  }

  try {
    const customerDataToSave = { ...editableCustomer.value };
    let savedCustomer;

    if (isEditing.value) {
      savedCustomer = await customerStore.updateCustomer(customerDataToSave);
      toastStore.success(`Customer "${savedCustomer.name}" updated successfully!`);
    } else {
      if (customerDataToSave.idInternal === null) delete customerDataToSave.idInternal;
      savedCustomer = await customerStore.addCustomer(customerDataToSave);
      toastStore.success(`Customer "${savedCustomer.name}" added successfully!`);
    }
    emit('customer-saved', savedCustomer);
    closeModal();
  } catch (error) {
    console.error("Customer form submission error:", error);
    const message = customerStore.error || error.message || "An unexpected error occurred.";
    formError.value = message; // Show general error if API call failed
    toastStore.error(`Error saving customer: ${message}`, 5000, true);
  }
};
</script>

<style scoped>
/* Modal styles are assumed to be largely covered by ProductForm's modal styles or main.css */
/* Specific adjustments: */
.modal-content { max-width: 650px; }
.form-alert.alert-danger {
  color: var(--danger-color); background-color: #f8d7da; border-color: #f5c6cb;
  padding: var(--space-md); border: 1px solid transparent; border-radius: var(--border-radius);
  margin-bottom: var(--space-lg);
}
[data-theme="dark"] .form-alert.alert-danger { background-color: #52262a; border-color: #8B3A3F; color: #ffacac;}
/* Validation feedback styles are in main.css */
.modal-content .card-footer {
  background-color: var(--bg-color-offset);
  border-top: 1px solid var(--border-color);
  padding: var(--space-md) 2.5rem;
}
.button-group { margin-top: 0; }
</style>
