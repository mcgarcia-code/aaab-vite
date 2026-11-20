// src/api/auth.js
import { esAppInstalada } from '@/utils/app'

const USER_TOKEN = 'token_aaab'
const USER_KEY = 'user_aaab'
const LIMITE_INACTIVIDAD = 60 * 60 * 1000 // 60 minutos
const REINICIO_MINIMO = 5000 // el timer se reinicia como mucho cada 5 s (no en cada movimiento del mouse)
const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']

// Dónde vive la sesión:
// - Navegador: sessionStorage → se cierra al cerrar la pestaña y por 60 min de inactividad.
// - App instalada: localStorage → queda abierta como cualquier app del celular, hasta "Cerrar sesión".
const EN_APP = esAppInstalada()
const almacen = () => (EN_APP ? localStorage : sessionStorage)

const leerClave = (clave) => {
  try {
    return almacen().getItem(clave)
  } catch {
    return null
  }
}

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
    almacen().setItem(USER_KEY, JSON.stringify(userData.arbitro))
    almacen().setItem(USER_TOKEN, userData.token)
    window.dispatchEvent(new Event('storage'))
    this.startInactivityTimer()
  },

  // Actualiza solo los datos del usuario en sesión, sin tocar el token.
  updateUser(arbitro) {
    almacen().setItem(USER_KEY, JSON.stringify(arbitro))
    window.dispatchEvent(new Event('storage'))
  },

  getUser() {
    const user = leerClave(USER_KEY)
    if (!user || user === 'undefined') return null
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  },

  getToken() {
    return leerClave(USER_TOKEN)
  },

  isLoggedIn() {
    return !!leerClave(USER_TOKEN)
  },

  logout() {
    try {
      almacen().removeItem(USER_KEY)
      almacen().removeItem(USER_TOKEN)
    } catch {
      // Sin almacenamiento: no hay nada guardado que borrar
    }
    this.stopInactivityTimer()
    window.dispatchEvent(new Event('storage'))
    window.location.href = '/login-arbitro'
  },

  // Cierra la sesión tras 60 min sin actividad (solo en el navegador; en la app la sesión queda abierta).
  // Los listeners se registran una sola vez.
  startInactivityTimer() {
    if (EN_APP) return
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
