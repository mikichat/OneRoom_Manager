<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>원룸 관리 매니저</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/" v-if="isAuthenticated">홈</v-btn>
      <v-btn text to="/dashboard" v-if="isAuthenticated">대시보드</v-btn>
      <v-btn text to="/buildings" v-if="isAdmin">건물 관리</v-btn>
      <v-btn text to="/rooms" v-if="isAdmin">호실 관리</v-btn>
      <v-btn text to="/tenants" v-if="isAdmin">임차인 관리</v-btn>
      <v-btn text to="/contracts" v-if="isAdmin">계약 관리</v-btn>
      <v-btn text to="/rent-payments" v-if="isAdmin">임대료 관리</v-btn>
      <v-btn text to="/reports/monthly-income" v-if="isAuthenticated">월별 수익 보고서</v-btn>
      <v-btn text to="/room-options" v-if="isAdmin">호실 옵션 관리</v-btn>
      <v-btn text to="/login" v-if="!isAuthenticated">로그인</v-btn>
      <v-btn text to="/register" v-if="!isAuthenticated">회원가입</v-btn>
      <v-btn text @click="logout" v-if="isAuthenticated">로그아웃</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item to="/">
          <template v-slot:prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>홈</v-list-item-title>
        </v-list-item>
        <v-list-item to="/dashboard" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>대시보드</v-list-item-title>
        </v-list-item>
        <v-list-item to="/buildings" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-office-building</v-icon>
          </template>
          <v-list-item-title>건물 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rooms" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-door</v-icon>
          </template>
          <v-list-item-title>호실 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/tenants" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title>임차인 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/contracts" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-file-document</v-icon>
          </template>
          <v-list-item-title>계약 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rent-payments" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-cash-multiple</v-icon>
          </template>
          <v-list-item-title>임대료 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/reports/monthly-income" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-chart-bar</v-icon>
          </template>
          <v-list-item-title>월별 수익 보고서</v-list-item-title>
        </v-list-item>
        <v-list-item to="/room-options" v-if="isAdmin">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>호실 옵션 관리</v-list-item-title>
        </v-list-item>
        <v-list-item to="/about">
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <v-list-item-title>정보</v-list-item-title>
        </v-list-item>
        <v-list-item to="/login" v-if="!isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-login</v-icon>
          </template>
          <v-list-item-title>로그인</v-list-item-title>
        </v-list-item>
        <v-list-item to="/register" v-if="!isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-account-plus</v-icon>
          </template>
          <v-list-item-title>회원가입</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout" v-if="isAuthenticated">
          <template v-slot:prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>로그아웃</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn text @click="snackbar.show = false">닫기</v-btn>
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
