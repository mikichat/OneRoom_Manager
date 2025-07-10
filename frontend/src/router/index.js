import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/rooms',
    name: 'room-management',
    component: () => import('../views/RoomManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tenants',
    name: 'tenant-management',
    component: () => import('../views/TenantManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contracts',
    name: 'contract-management',
    component: () => import('../views/ContractManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rent-payments',
    name: 'rent-payment-management',
    component: () => import('../views/RentPaymentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isAuthenticated']) {
      next({ name: 'login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
