import { computed, unref } from 'vue'

// Módulos del panel del curso de árbitros, agrupados por categoría.
// Los usan el menú lateral (escritorio), la pestaña Menú (celular) y el Inicio.
// El título y la descripción coinciden con lo que muestra cada sección al entrar.
// Datos personales y Credencial están en el perfil (menú lateral / pestaña Menú).

export const ITEM_REGISTRO_ARBITRO = {
  to: { path: '/registro-arbitro', query: { desdeCurso: 1 } },
  ruta: '/registro-arbitro',
  title: 'Registrarme como árbitro',
  icon: 'bi bi-patch-check-fill',
  desc: '¡Aprobaste el curso! Completá tu registro'
}

const GRUPOS = [
  {
    categoria: 'Actividad',
    icono: 'bi bi-person-raised-hand',
    items: [
      { to: '/panel-curso/cronograma-curso', title: 'Cronograma', icon: 'bi bi-calendar3-week', desc: 'Clases de tu curso' },
      { to: '/panel-curso/designaciones-curso', title: 'Designaciones', icon: 'bi bi-calendar2-check', desc: 'Encuentros de mini convocados' },
      { to: '/panel-curso/rendimiento-curso', title: 'Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Asistencia, mini y promedio' },
      { to: '/panel-curso/observaciones-curso', title: 'Observaciones recibidas', icon: 'bi bi-eye', desc: 'De encuentros de mini y amistosos' }
    ]
  },
  {
    categoria: 'Exámenes',
    icono: 'bi bi-journal-check',
    items: [
      { to: '/panel-curso/examenes-curso', title: 'Exámenes', icon: 'bi bi-journal-text', desc: 'Notas de los exámenes del curso' }
    ]
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    items: [
      { to: '/panel-curso/cuota-curso', title: 'Cuota del curso', icon: 'bi bi-cash-coin', desc: 'Estado de tus pagos' }
    ]
  }
]

// Accesos de uso más frecuente (etiquetas cortas para que no se corten en el celular)
const ACCESOS_RAPIDOS = [
  { to: '/panel-curso/cronograma-curso', title: 'Cronograma', icon: 'bi bi-calendar3-week' },
  { to: '/panel-curso/designaciones-curso', title: 'Designaciones', icon: 'bi bi-calendar2-check' },
  { to: '/panel-curso/examenes-curso', title: 'Exámenes', icon: 'bi bi-journal-text' },
  { to: '/panel-curso/rendimiento-curso', title: 'Rendimiento', icon: 'bi bi-graph-up-arrow' }
]

// Título de cada sección para el header (por nombre de ruta)
export const TITULOS_SECCION_CURSO = {
  PanelDatosCurso: 'Datos personales',
  PanelCredencialCurso: 'Credencial digital',
  HistorialNotificacionesCurso: 'Notificaciones',
  MisObservacionesCurso: 'Observaciones recibidas',
  MisExamenesCurso: 'Exámenes',
  MisDesignacionesCurso: 'Designaciones',
  PanelRendimientoCurso: 'Rendimiento',
  CuotaCurso: 'Cuota del curso',
  CronogramaCurso: 'Cronograma',
  PanelMenuCurso: 'Menú'
}

// estado: estado del aspirante (ref o valor). Si aprobó, se suma "Registrarme como árbitro"
export function useModulosCurso(estado) {
  const aprobado = computed(() => unref(estado) === 'aprobado')

  const gruposModulos = computed(() => (aprobado.value
    ? [{ categoria: 'Próximo paso', icono: 'bi bi-star-fill', items: [ITEM_REGISTRO_ARBITRO] }, ...GRUPOS]
    : GRUPOS))

  return { gruposModulos, accesosRapidos: ACCESOS_RAPIDOS, aprobado }
}
