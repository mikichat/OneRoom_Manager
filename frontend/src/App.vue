<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>OneRoom Manager</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/rooms" v-if="isAuthenticated">Rooms</v-btn>
      <v-btn text to="/tenants" v-if="isAuthenticated">Tenants</v-btn>
      <v-btn text to="/contracts" v-if="isAuthenticated">Contracts</v-btn>
      <v-btn text to="/rent-payments" v-if="isAuthenticated">Rent Payments</v-btn>
      <v-btn text to="/login" v-if="!isAuthenticated">Login</v-btn>
      <v-btn text to="/register" v-if="!isAuthenticated">Register</v-btn>
      <v-btn text @click="logout" v-if="isAuthenticated">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item to="/">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/about">
          <v-list-item-icon>
            <v-icon>mdi-information</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/rooms" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-door</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Room Management</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/tenants" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Tenant Management</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/contracts" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Contract Management</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/rent-payments" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-cash-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Rent Payment Management</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/login" v-if="!isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/register" v-if="!isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Register</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout" v-if="isAuthenticated">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
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

const logout = () => {
  store.dispatch('auth/logout');
  router.push('/login');
};
</script>
