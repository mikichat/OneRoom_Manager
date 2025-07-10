import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Import MDI font

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi', // 'mdi' is the default value
  },
});

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app');
