<template>
  <div class="not-found-page text-center">
    <h1 class="display-1">404</h1>
    <h2>Oops! Page Not Found.</h2>
    <p class="lead">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
    <router-link to="/" class="btn btn-primary mt-3">Go to Dashboard</router-link>
  </div>
</template>

<script setup>
// No specific script logic needed for this simple page
</script>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px); /* Adjust based on your header/footer height if layout applies */
  padding: var(--space-xl);
}
.display-1 {
  font-size: 6rem;
  font-weight: 700;
  color: var(--text-tertiary);
  margin-bottom: var(--space-sm);
}
h2 {
  font-size: 2rem;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}
.lead {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 500px;
  margin-bottom: var(--space-lg);
}
</style>
