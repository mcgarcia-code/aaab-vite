import { ref, computed } from 'vue'
import { api } from '@/api/api'

// Notificaciones del panel del curso (tabla notificaciones_curso_arbitro).
// Lo usan PanelCurso.vue (campana) y HistorialNotificacionesCurso.vue.

export const ICONOS_NOTIFICACION = {
  success: { icono: 'bi-check-circle', bg: 'bg-success' },
  danger: { icono: 'bi-exclamation-octagon', bg: 'bg-danger' },
  warning: { icono: 'bi-exclamation-triangle', bg: 'bg-warning' },
  info: { icono: 'bi-info-circle', bg: 'bg-primary' },
}

export function useNotificacionesCurso() {
  const notificaciones = ref([])
  const cargando = ref(false)

  const noLeidas = computed(() => notificaciones.value.filter(n => !n.leida))

  const cargar = async () => {
    cargando.value = true
    try {
      const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMisNotificacionesCurso', payload: {} })
      if (res?.ok) notificaciones.value = res.payload || []
    } catch (e) {
      console.error('notificaciones curso:', e)
    } finally {
      cargando.value = false
    }
  }

  const marcarLeidas = async () => {
    try {
      const res = await api.post({ entity: 'perfil_curso_arbitro', action: 'marcarMisNotificacionesLeidasCurso', payload: {} })
      if (res?.ok) notificaciones.value.forEach(n => { n.leida = true })
    } catch (e) {
      console.error('marcar notificaciones curso:', e)
    }
  }

  return { notificaciones, noLeidas, cargando, cargar, marcarLeidas }
}
