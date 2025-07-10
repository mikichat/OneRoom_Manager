import { createStore } from 'vuex';
import auth from './modules/auth';

export default createStore({
  state: {
    snackbar: {
      show: false,
      message: '',
      color: 'success',
    },
  },
  mutations: {
    SHOW_SNACKBAR(state, payload) {
      state.snackbar.show = true;
      state.snackbar.message = payload.message;
      state.snackbar.color = payload.color || 'success';
    },
    HIDE_SNACKBAR(state) {
      state.snackbar.show = false;
      state.snackbar.message = '';
    },
  },
  actions: {
    showSnackbar({ commit }, payload) {
      commit('SHOW_SNACKBAR', payload);
    },
    hideSnackbar({ commit }) {
      commit('HIDE_SNACKBAR');
    },
  },
  modules: {
    auth,
  },
});