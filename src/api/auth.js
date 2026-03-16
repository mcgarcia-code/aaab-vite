// src/api/auth.js

const USER_KEY = 'user_aaab';
const INACTIVITY_LIMIT = 60 * 60 * 1000; 
let inactivityTimeout;

// Definimos la función de reset fuera para que addEventListener y removeEventListener 
// apunten exactamente al mismo lugar en memoria.
const resetHandler = () => {
  auth.startInactivityTimer();
};

export const auth = {
  setUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    window.dispatchEvent(new Event('storage')); 
    this.startInactivityTimer();
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // FUNCIÓN CLAVE PARA QUE LOS CAMBIOS SE VEAN
  async refreshUserData() {
    const user = this.getUser();
    if (!user) return null;

    try {
      // Ajusta esta URL a tu API real
      const response = await fetch(`https://tu-api.com/arbitros/${user.dni}`);
      if (!response.ok) throw new Error('Error al obtener datos');
      
      const nuevosDatos = await response.json();
      this.setUser(nuevosDatos); // Actualiza el localStorage con lo nuevo del admin
      return nuevosDatos;
    } catch (error) {
      console.error("Error sincronizando datos:", error);
      return user; // Si falla la red, devolvemos lo que tenemos
    }
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    this.stopInactivityTimer();
    window.location.href = '/login-arbitro';
  },

  startInactivityTimer() {
    // 1. Limpiamos el timeout anterior
    clearTimeout(inactivityTimeout);

    // 2. Seteamos el nuevo timeout
    inactivityTimeout = setTimeout(() => {
      alert("Tu sesión ha expirado por inactividad.");
      this.logout();
    }, INACTIVITY_LIMIT);

    // 3. Escuchamos eventos para resetear el timer
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetHandler));
  },

  stopInactivityTimer() {
    clearTimeout(inactivityTimeout);
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.removeEventListener(event, resetHandler));
  }
};