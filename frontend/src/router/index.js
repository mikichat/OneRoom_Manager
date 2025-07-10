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
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/tenants',
    name: 'tenant-management',
    component: () => import('../views/TenantManagement.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/contracts',
    name: 'contract-management',
    component: () => import('../views/ContractManagement.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/rent-payments',
    name: 'rent-payment-management',
    component: () => import('../views/RentPaymentManagement.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/monthly-income',
    name: 'monthly-income-report',
    component: () => import('../views/ReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/room-options',
    name: 'room-option-management',
    component: () => import('../views/RoomOptionManagement.vue'),
    meta: { requiresAuth: true, requiredRoles: ['admin'] }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const user = store.state.auth.user; // Vuex 스토어에서 사용자 정보 가져오기

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login' });
    } else {
      if (to.meta.requiredRoles) {
        // Check if user role is included in requiredRoles
        if (user && to.meta.requiredRoles.includes(user.role)) {
          next();
        } else {
          // User does not have the required role, redirect to dashboard or an error page
          next({ name: 'dashboard' }); // 또는 권한 없음 페이지
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
