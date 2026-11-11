// Perfil del aspirante compartido en todo el panel del curso.
// PanelCurso.vue lo carga una sola vez con proveerPerfilCurso(); las vistas hijas lo toman con usePerfilCurso().
import { ref, provide, inject } from 'vue'
import { api } from '@/api/api'

const CLAVE_PERFIL = Symbol('perfilCurso')

const crearPerfil = () => {
  const perfil = ref(null)
  let cargaEnCurso = null

  // Pide el perfil al servidor (si ya hay una carga en curso, espera esa misma)
  const cargar = () => {
    if (cargaEnCurso) return cargaEnCurso
    cargaEnCurso = api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiPerfilCurso', payload: {} })
      .then((res) => {
        if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus datos')
        perfil.value = res.payload
        return perfil.value
      })
      .finally(() => { cargaEnCurso = null })
    return cargaEnCurso
  }

  // Devuelve el perfil ya cargado o lo carga si todavía no llegó
  const asegurar = async () => perfil.value || cargar()

  return { perfil, cargar, asegurar }
}

export function proveerPerfilCurso() {
  const estado = crearPerfil()
  provide(CLAVE_PERFIL, estado)
  return estado
}

export function usePerfilCurso() {
  return inject(CLAVE_PERFIL, null) || crearPerfil()
}
