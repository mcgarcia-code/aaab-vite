import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // El único estado que nos importa es saber si es admin o no.
  const isAdmin = ref(false)

  // Esta función la llamarás desde tu futura página de login
  function login() {
    // TODO: Aquí, en el futuro, harás una llamada a tu API con un usuario y contraseña.
    // Si la respuesta es correcta, pondrás isAdmin.value = true
    isAdmin.value = true
    console.log('Acceso de administrador concedido (simulación).')
  }

  function logout() {
    isAdmin.value = false
  }

  return { isAdmin, login, logout }
})
