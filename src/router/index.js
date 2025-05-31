// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore'; // Import user store for guards

// Page Components (ensure paths are correct)
const DashboardPage = () => import('@/pages/DashboardPage.vue');
const ProductsListPage = () => import('@/pages/products/ProductsListPage.vue');
const AddProductPage = () => import('@/pages/products/AddProductPage.vue');
const CustomersPage = () => import('@/pages/CustomersPage.vue');
const SalesPage = () => import('@/pages/SalesPage.vue');
const ReportsPage = () => import('@/pages/reports/ReportsPage.vue');
const POSPage = () => import('@/pages/POSPage.vue');
const SettingsPage = () => import('@/pages/SettingsPage.vue');
const LoginPage = () => import('@/pages/auth/LoginPage.vue');
const NotFoundPage = () => import('@/pages/NotFoundPage.vue');

const routes = [
  {
    path: '/', name: 'Dashboard', component: DashboardPage,
    meta: { title: 'Dashboard', requiresAuth: true }
  },
  {
    path: '/products', name: 'ProductsList', component: ProductsListPage,
    meta: { title: 'Products', requiresAuth: true }
  },
  {
    path: '/products/add', name: 'AddProduct', component: AddProductPage,
    meta: { title: 'Add New Product', requiresAuth: true }
  },
  {
    path: '/products/edit/:id', name: 'EditProduct', component: AddProductPage, props: true,
    meta: { title: 'Edit Product', requiresAuth: true }
  },
  {
    path: '/customers', name: 'Customers', component: CustomersPage,
    meta: { title: 'Customers', requiresAuth: true }
  },
  {
    path: '/sales', name: 'Sales', component: SalesPage,
    meta: { title: 'Sales History', requiresAuth: true }
  },
  {
    path: '/reports', name: 'Reports', component: ReportsPage,
    meta: { title: 'Reports Center', requiresAuth: true }
  },
  {
    path: '/pos', name: 'POS', component: POSPage,
    meta: { title: 'Point of Sale', requiresAuth: true }
  },
  {
    path: '/settings', name: 'Settings', component: SettingsPage,
    meta: { title: 'Settings', requiresAuth: true }
  },
  {
    path: '/login', name: 'Login', component: LoginPage,
    meta: { title: 'Login', guestOnly: true } // Only accessible if not logged in
  },
  {
    path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage,
    meta: { title: 'Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    else return { top: 0, behavior: 'smooth' };
  }
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | ShopERP System` || 'ShopERP System';

  // Get the user store instance. Pinia is already installed on the app.
  const userStore = useUserStore();

  // userStore.checkAuthStatus() was called in main.js, so isAuthenticated is now reliable.
  const isAuthenticated = userStore.isAuthenticated;

  console.log(`Router Guard: Navigating to ${to.fullPath}. Auth required: ${!!to.meta.requiresAuth}. User isAuth: ${isAuthenticated}`);

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log(`Router Guard: Access DENIED to ${to.fullPath}. Redirecting to login.`);
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isAuthenticated) {
    console.log(`Router Guard: Authenticated user tried to access guest page ${to.fullPath}. Redirecting to dashboard.`);
    next({ name: 'Dashboard' });
  } else {
    next(); // Allow navigation
  }
});

export default router;
