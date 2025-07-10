import { createRouter, createWebHistory } from 'vue-router';

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
  },
  {
    path: '/tenants',
    name: 'tenant-management',
    component: () => import('../views/TenantManagement.vue'),
  },
  {
    path: '/contracts',
    name: 'contract-management',
    component: () => import('../views/ContractManagement.vue'),
  },
  {
    path: '/rent-payments',
    name: 'rent-payment-management',
    component: () => import('../views/RentPaymentManagement.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
