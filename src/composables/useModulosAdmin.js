import { ref, computed } from 'vue'
import { api } from '@/api/api'
import { CATEGORIAS_ADMIN, SUBSECCIONES_ADMIN } from '@/config/modulosAdmin'
import { usePermisos } from '@/composables/usePermisos'

// Módulos del panel de gestión filtrados por los permisos del usuario,
// con los contadores de pendientes. Lo usan el menú lateral, el Inicio y los sub-menús.

// Qué muestra cada pendiente en el Inicio (el backend ya devuelve 0 si el usuario no tiene el permiso)
const TIPOS_PENDIENTE = [
  { clave: 'solicitudesDatos', icono: 'bi-person-lines-fill', to: '/panel-admin/secretaria/modificacion-datos', detalle: 'Legajos', singular: 'solicitud de cambio de datos', plural: 'solicitudes de cambio de datos' },
  { clave: 'licencias', icono: 'bi-calendar-date', to: '/panel-admin/secretaria/licencias', detalle: 'Licencias', singular: 'licencia para aprobar', plural: 'licencias para aprobar' },
  { clave: 'reuniones', icono: 'bi-calendar-event', to: '/panel-admin/secretaria/eventos-notificaciones', detalle: 'Eventos', singular: 'reunión para aprobar', plural: 'reuniones para aprobar' },
  { clave: 'rechazos', icono: 'bi-x-octagon', to: '/panel-admin/designaciones/designaciones-rechazadas', detalle: 'Designaciones rechazadas', singular: 'designación rechazada sin resolver', plural: 'designaciones rechazadas sin resolver' },
  { clave: 'observaciones', icono: 'bi-clipboard-data', to: '/panel-admin/desarrollo-arbitral/observaciones', detalle: 'Observaciones realizadas', singular: 'observación para aprobar', plural: 'observaciones para aprobar' },
  { clave: 'informes', icono: 'bi-file-earmark-text', to: '/panel-admin/informes', detalle: 'Informes', singular: 'informe sin revisar', plural: 'informes sin revisar' },
  { clave: 'descargos', icono: 'bi-chat-text', to: '/panel-admin/tribunal/sanciones', detalle: 'Listado de sanciones', singular: 'sanción con descargos nuevos', plural: 'sanciones con descargos nuevos' },
  { clave: 'pedidos', icono: 'bi-bag-check', to: '/panel-admin/tesoreria/indumentaria/pedidos', detalle: 'Indumentaria · Pedidos', singular: 'pedido de indumentaria nuevo', plural: 'pedidos de indumentaria nuevos' },
  { clave: 'inscripcionesCurso', icono: 'bi-person-plus', to: '/panel-admin/curso-arbitros/legajos-curso', detalle: 'Curso · Legajos', singular: 'inscripción nueva al curso', plural: 'inscripciones nuevas al curso' },
  { clave: 'observacionesCurso', icono: 'bi-clipboard-check', to: '/panel-admin/curso-arbitros/observaciones-curso', detalle: 'Curso · Observaciones', singular: 'observación del curso para revisar', plural: 'observaciones del curso para revisar' },
  { clave: 'clasesSinAsistencia', icono: 'bi-calendar-x', to: '/panel-admin/curso-arbitros/cronograma', detalle: 'Curso · Clases y asistencia', singular: 'clase dictada sin asistencia', plural: 'clases dictadas sin asistencia' }
]

// Estado compartido entre componentes
const contadores = ref({})
const cargandoPendientes = ref(false)

export function useModulosAdmin() {
  const { cargarPermisos, tienePermiso, modulos, rol } = usePermisos()

  const contadorDe = (item) => (item.pendiente ? Number(contadores.value[item.pendiente]) || 0 : 0)

  // Depende de modulos/rol para recalcularse cuando llegan los permisos
  const gruposModulos = computed(() => {
    void modulos.value
    void rol.value
    return CATEGORIAS_ADMIN
      .map(cat => ({
        ...cat,
        items: cat.items
          .filter(item => tienePermiso(item.modulo))
          .map(item => ({ ...item, badge: contadorDe(item) || null }))
      }))
      .filter(cat => cat.items.length > 0)
  })

  // Sub-menús (Aportes y pagos, Indumentaria) filtrados por permiso
  const subseccionesDe = (padre) => computed(() => {
    void modulos.value
    void rol.value
    return SUBSECCIONES_ADMIN
      .filter(item => item.padre === padre && tienePermiso(item.modulo))
      .map(item => ({ ...item, badge: contadorDe(item) || null }))
  })

  const pendientes = computed(() =>
    TIPOS_PENDIENTE
      .map(tipo => ({ ...tipo, cantidad: Number(contadores.value[tipo.clave]) || 0 }))
      .filter(tipo => tipo.cantidad > 0)
      .map(tipo => ({
        to: tipo.to,
        icono: tipo.icono,
        detalle: tipo.detalle,
        titulo: `${tipo.cantidad} ${tipo.cantidad === 1 ? tipo.singular : tipo.plural}`
      }))
  )

  // Total de pendientes (se muestra en la pestaña Inicio de la barra inferior)
  const totalPendientes = computed(() =>
    TIPOS_PENDIENTE.reduce((total, tipo) => total + (Number(contadores.value[tipo.clave]) || 0), 0)
  )

  // Una sola consulta con todos los contadores (panel_admin/contarPendientes)
  const cargarPendientes = async () => {
    cargandoPendientes.value = true
    try {
      const res = await api.get({ entity: 'panel_admin', action: 'contarPendientes' })
      if (res?.ok && res.payload) contadores.value = res.payload
    } catch (err) {
      console.error('Error al contar pendientes:', err)
    } finally {
      cargandoPendientes.value = false
    }
  }

  return {
    cargarPermisos,
    tienePermiso,
    gruposModulos,
    subseccionesDe,
    pendientes,
    totalPendientes,
    cargarPendientes,
    cargandoPendientes
  }
}
