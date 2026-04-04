// src/api/auth.js

const USER_TOKEN = 'token_aaab'
const USER_KEY = 'user_aaab';
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutos
let inactivityTimeout;

// Función auxiliar para resetear el timer (fuera para poder remover el listener)
const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
const resetHandler = () => auth.startInactivityTimer();

export const auth = {
  setUser(userData) {
    // CAMBIO: Ahora usamos sessionStorage
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData.arbitro))
    sessionStorage.setItem(USER_TOKEN, userData.token)
    window.dispatchEvent(new Event('storage'));
    this.startInactivityTimer()
  },

  getUser() {
    // CAMBIO: Ahora buscamos en sessionStorage
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!sessionStorage.getItem(USER_TOKEN);
  },

  logout() {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_TOKEN)
    this.stopInactivityTimer();
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login-arbitro';
  },

  startInactivityTimer() {
    clearTimeout(inactivityTimeout);

    inactivityTimeout = setTimeout(() => {
      alert("Tu sesión ha expirado por inactividad.");
      this.logout();
    }, INACTIVITY_LIMIT);

    // Agregamos listeners si no estaban
    events.forEach(event => window.addEventListener(event, resetHandler));
  },

  stopInactivityTimer() {
    clearTimeout(inactivityTimeout);
    events.forEach(event => window.removeEventListener(event, resetHandler));
  }
};