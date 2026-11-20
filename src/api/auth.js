// src/api/auth.js

const USER_TOKEN = 'token_aaab'
const USER_KEY = 'user_aaab'
const LIMITE_INACTIVIDAD = 60 * 60 * 1000 // 60 minutos
const REINICIO_MINIMO = 5000 // el timer se reinicia como mucho cada 5 s (no en cada movimiento del mouse)
const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']

let temporizador = null
let ultimoReinicio = 0
let escuchando = false

const programarCierre = () => {
  clearTimeout(temporizador)
  ultimoReinicio = Date.now()
  temporizador = setTimeout(() => {
    sessionStorage.setItem('aviso_sesion', 'inactividad')
    auth.logout()
  }, LIMITE_INACTIVIDAD)
}

const alHaberActividad = () => {
  if (Date.now() - ultimoReinicio >= REINICIO_MINIMO) programarCierre()
}

export const auth = {
  setUser(userData) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData.arbitro))
    sessionStorage.setItem(USER_TOKEN, userData.token)
    window.dispatchEvent(new Event('storage'))
    this.startInactivityTimer()
  },

  // Actualiza solo los datos del usuario en sesión, sin tocar el token.
  updateUser(arbitro) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(arbitro))
    window.dispatchEvent(new Event('storage'))
  },

  getUser() {
    const user = sessionStorage.getItem(USER_KEY)
    if (!user || user === 'undefined') return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  },

  isLoggedIn() {
    return !!sessionStorage.getItem(USER_TOKEN)
  },

  logout() {
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_TOKEN)
    this.stopInactivityTimer()
    window.dispatchEvent(new Event('storage'))
    window.location.href = '/login-arbitro'
  },

  // Cierra la sesión tras 60 min sin actividad. Los listeners se registran una sola vez.
  startInactivityTimer() {
    programarCierre()
    if (escuchando) return
    EVENTOS_ACTIVIDAD.forEach(evento => window.addEventListener(evento, alHaberActividad, { passive: true }))
    escuchando = true
  },

  stopInactivityTimer() {
    clearTimeout(temporizador)
    EVENTOS_ACTIVIDAD.forEach(evento => window.removeEventListener(evento, alHaberActividad))
    escuchando = false
  },

  // Motivo por el que se cerró la sesión (para mostrarlo en el login una sola vez)
  tomarAvisoSesion() {
    const aviso = sessionStorage.getItem('aviso_sesion')
    sessionStorage.removeItem('aviso_sesion')
    return aviso
  }
}
