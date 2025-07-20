import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Import MDI font
import apiClient from './api'; // Import apiClient

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi', // 'mdi' is the default value
  },
});

// Check for token and fetch user data on app initialization
const token = localStorage.getItem('token');
if (token) {
  apiClient.get('/auth/user') // Assuming you have an endpoint to get user info by token
    .then(response => {
      store.commit('auth/SET_USER', response.data.user);
    })
    .catch(error => {
      console.error('Error fetching user data on app init:', error);
      store.commit('auth/SET_TOKEN', null); // Clear invalid token
      store.commit('auth/SET_USER', null);
    });
}

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app');
