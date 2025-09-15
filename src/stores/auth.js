import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null, // No almacenamos token, ya que está en la cookie
  },
  mutations: {
    setAuth(state, { user }) {
      state.user = user;
    },
    clearAuth(state) {
      state.user = null;
    },
  },
  actions: {
    login({ commit }, { user }) {
      commit('setAuth', { user });
    },
    logout({ commit }) {
      commit('clearAuth');
      // Borrar cookie en el frontend
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api; domain=arbitroshandball.com.ar; secure; SameSite=Strict';
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user, // Depende de user, no de token
    user: (state) => state.user,
  },
});