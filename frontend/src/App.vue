<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>OneRoom Manager</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/rooms" v-if="isAdmin">Rooms</v-btn>
      <v-btn text to="/tenants" v-if="isAdmin">Tenants</v-btn>
      <v-btn text to="/contracts" v-if="isAdmin">Contracts</v-btn>
      <v-btn text to="/rent-payments" v-if="isAdmin">Rent Payments</v-btn>
      <v-btn text to="/dashboard" v-if="isAuthenticated">Dashboard</v-btn>
      <v-btn text to="/reports/monthly-income" v-if="isAuthenticated">Monthly Income Report</v-btn>
      <v-btn text to="/room-options" v-if="isAdmin">Room Options</v-btn>
      <v-btn text to="/login" v-if="!isAuthenticated">Login</v-btn>
      <v-btn text to="/register" v-if="!isAuthenticated">Register</v-btn>
      <v-btn text @click="logout" v-if="isAuthenticated">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item to="/">
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item to="/about">
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rooms" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-door</v-icon>
          </template>
          <v-list-item-title>Room Management</v-list-item-title>
        </v-list-item>
        <v-list-item to="/tenants" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title>Tenant Management</v-list-item-title>
        </v-list-item>
        <v-list-item to="/contracts" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-file-document</v-icon>
          </template>
          <v-list-item-title>Contract Management</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rent-payments" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-cash-multiple</v-icon>
          </template>
          <v-list-item-title>Rent Payment Management</v-list-item-title>
        </v-list-item>
        <v-list-item to="/dashboard" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/reports/monthly-income" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-chart-bar</v-icon>
          </template>
          <v-list-item-title>Monthly Income Report</v-list-item-title>
        </v-list-item>
        <v-list-item to="/room-options" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Room Option Management</v-list-item-title>
        </v-list-item>
        <v-list-item to="/login" v-if="!isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-login</v-icon>
          </template>
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item to="/register" v-if="!isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-account-plus</v-icon>
          </template>
          <v-list-item-title>Register</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn text @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const drawer = ref(false);
const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isAdmin = computed(() => store.state.auth.user && store.state.auth.user.role === 'admin');
const snackbar = computed(() => store.state.snackbar);

const logout = () => {
  store.dispatch('auth/logout');
  router.push('/login');
};
</script>
