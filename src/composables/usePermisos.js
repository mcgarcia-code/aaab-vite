import { ref, readonly } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'

const modulos = ref([])
const rol = ref(null)
let tokenCargado = null
let cargaEnCurso = null

const tokenActual = () => sessionStorage.getItem('token_aaab')

const cargarPermisos = async (forzar = false) => {
  const token = tokenActual()
  if (!token) {
    modulos.value = []
    rol.value = null
    tokenCargado = null
    return modulos.value
  }
  if (!forzar && tokenCargado === token) return modulos.value
  if (!forzar && cargaEnCurso) return cargaEnCurso

  cargaEnCurso = (async () => {
    try {
      const res = await api.get({ entity: 'usuarios_admin', action: 'misPermisos', payload: {} })
      if (res?.ok) {
        modulos.value = Array.isArray(res.payload?.modulos) ? res.payload.modulos : []
        rol.value = res.payload?.rol ?? auth.getUser()?.rol ?? null
        tokenCargado = token
      } else {
        modulos.value = []
        rol.value = auth.getUser()?.rol ?? null
      }
    } catch (err) {
      console.error('Error al cargar permisos:', err)
      modulos.value = []
      rol.value = auth.getUser()?.rol ?? null
    } finally {
      cargaEnCurso = null
    }
    return modulos.value
  })()
  return cargaEnCurso
}

const tienePermiso = (modulo) => {
  if (!modulo) return true
  if (rol.value === 'admin') return true
  return modulos.value.includes(modulo)
}

export function usePermisos() {
  return {
    modulos: readonly(modulos),
    rol: readonly(rol),
    cargarPermisos,
    tienePermiso
  }
}
