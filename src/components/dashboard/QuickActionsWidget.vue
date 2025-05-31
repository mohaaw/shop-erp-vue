<template>
  <div class="quick-actions-widget card">
    <div class="card-header">Quick Actions</div>
    <div class="card-body">
      <div class="actions-grid">
        <router-link to="/pos" class="action-button btn btn-primary">
          <span v-html="icons.pos"></span> New Sale (POS)
        </router-link>
        <router-link :to="{ name: 'Customers', query: { action: 'add' } }" class="action-button btn btn-secondary">
          <span v-html="icons.addCustomer"></span> Add Customer
        </router-link>
        <router-link to="/sales" class="action-button btn btn-secondary">
          <span v-html="icons.viewSales"></span> View Sales
        </router-link>
        <router-link :to="{ path: '/products', query: { filter: 'lowstock' } }" class="action-button btn btn-warning">
          <span v-html="icons.lowStock"></span> Low Stock Items
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const icons = {
  pos: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  addCustomer: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>`,
  viewSales: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  lowStock: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v2m0 4h.01M2.45 16.85A10 10 0 0012 22a10 10 0 009.55-5.15M2.45 7.15A10 10 0 0112 2a10 10 0 019.55 5.15"/></svg>`
};
</script>

<style scoped>
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
}
.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  text-align: center;
  font-size: 0.9rem;
  height: 90px;
  text-decoration: none;
  border-radius: var(--border-radius);
}
.action-button span[v-html] :deep(svg) {
  width: 24px;
  height: 24px;
  margin-bottom: var(--space-xs);
}
.btn-primary span[v-html] :deep(svg) { stroke: var(--text-on-primary); }
.btn-secondary span[v-html] :deep(svg) { stroke: var(--text-color-inverted); }
[data-theme="light"] .btn-secondary span[v-html] :deep(svg) { stroke: var(--text-color-inverted); }
[data-theme="dark"] .btn-secondary span[v-html] :deep(svg) { stroke: var(--text-color-inverted); }
.btn-warning span[v-html] :deep(svg) { stroke: var(--text-on-primary); }
[data-theme="light"] .btn-warning span[v-html] :deep(svg) { stroke: var(--text-color); }
</style>
