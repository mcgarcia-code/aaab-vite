// src/api/auth.js

const USER_KEY = 'user_aaab';
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 60 minutos en milisegundos
let inactivityTimeout;

export const auth = {
  // Guarda al árbitro y arranca el timer
  setUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    window.dispatchEvent(new Event('storage')); 
    this.startInactivityTimer(); // Iniciar timer al loguearse
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem(USER_KEY);
  },

  // Limpia todo y cierra sesión
  logout() {
    localStorage.removeItem(USER_KEY);
    this.stopInactivityTimer(); // Limpiar eventos
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login-arbitro';
  },

  // --- LÓGICA DE INACTIVIDAD ---

  startInactivityTimer() {
    this.stopInactivityTimer(); // Limpiar si ya había uno corriendo

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        alert("Tu sesión ha expirado por inactividad (60 minutos).");
        this.logout();
      }, INACTIVITY_LIMIT);
    };

    // Eventos que reinician el contador de 60 min
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Iniciar el primer contador
  },

  stopInactivityTimer() {
    clearTimeout(inactivityTimeout);
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.removeEventListener(event, resetTimer));
  }
};

// Referencia interna para el removeEventListener
function resetTimer() {
  auth.startInactivityTimer();
}