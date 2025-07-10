import apiClient from '../../api';

const auth = {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    SET_USER(state, user) {
      state.user = user;
    },
  },
  actions: {
    async register({ commit }, user) {
      const response = await apiClient.post('/auth/register', user);
      return response.data;
    },
    async login({ commit }, user) {
      const response = await apiClient.post('/auth/login', user);
      commit('SET_TOKEN', response.data.token);
      commit('SET_USER', response.data.user); // 사용자 정보 저장
      return response.data;
    },
    logout({ commit }) {
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
};

export default auth;
