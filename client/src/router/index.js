// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// Page Components
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
const InventoryPage = () => import('@/pages/InventoryPage.vue');
const TransfersPage = () => import('@/pages/TransfersPage.vue');

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
    path: '/inventory', name: 'Inventory', component: InventoryPage,
    meta: { title: 'Inventory Management', requiresAuth: true }
  },
  {
    path: '/transfers', name: 'Transfers', component: TransfersPage,
    meta: { title: 'Stock Transfers', requiresAuth: true }
  },
  {
    path: '/suppliers', name: 'SuppliersList', component: () => import('../pages/suppliers/SuppliersListPage.vue'),
    meta: { requiresAuth: true, title: 'Suppliers' }
  },
  {
    path: '/suppliers/add', name: 'AddSupplier', component: () => import('../pages/suppliers/AddSupplierPage.vue'),
    meta: { requiresAuth: true, title: 'Add Supplier' }
  },
  {
    path: '/suppliers/edit/:id', name: 'EditSupplier', component: () => import('../pages/suppliers/AddSupplierPage.vue'),
    meta: { requiresAuth: true, title: 'Edit Supplier' }
  },
  {
    path: '/employees', name: 'EmployeesList', component: () => import('../pages/employees/EmployeesListPage.vue'),
    meta: { requiresAuth: true, title: 'Employees' }
  },
  {
    path: '/employees/add', name: 'AddEmployee', component: () => import('../pages/employees/AddEmployeePage.vue'),
    meta: { requiresAuth: true, title: 'Add Employee' }
  },
  {
    path: '/employees/edit/:id', name: 'EditEmployee', component: () => import('../pages/employees/AddEmployeePage.vue'),
    meta: { requiresAuth: true, title: 'Edit Employee' }
  },
  {
    path: '/admin', name: 'Admin', component: () => import('@/pages/AdminPage.vue'),
    meta: { title: 'Admin Dashboard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login', name: 'Login', component: LoginPage,
    meta: { title: 'Login', guestOnly: true }
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

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | ShopERP System` || 'ShopERP System';
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    // Redirect non-admin users trying to access admin routes
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
