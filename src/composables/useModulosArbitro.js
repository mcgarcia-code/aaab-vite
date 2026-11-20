import { computed } from 'vue'
import { auth } from '@/api/auth'

// Módulos del Panel Árbitro, agrupados por categoría.
// Los usan la lista del Inicio (celular) y el menú lateral (escritorio).
// El título y la descripción coinciden con lo que muestra cada sección al entrar.

const CATEGORIAS = [
  { categoria: 'Actividad Arbitral', icono: 'bi bi-person-raised-hand' },
  { categoria: 'Exámenes', icono: 'bi bi-journal-check' },
  { categoria: 'Administración', icono: 'bi bi-folder2' },
  { categoria: 'Tesorería', icono: 'bi bi-cash-stack' },
  { categoria: 'Herramientas', icono: 'bi bi-tools' }
]

const MODULOS = [
  // Actividad arbitral: lo más usado primero
  { to: '/panel-arbitro/designaciones', title: 'Designaciones', icon: 'bi bi-calendar4-week', desc: 'Partidos, horarios y canchas', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history', desc: 'Cargá tus días y horarios', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/rendimiento', title: 'Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Asistencia a reuniones y exámenes', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/mis-observaciones', title: 'Observaciones recibidas', icon: 'bi bi-eye', desc: 'Devoluciones de tus partidos', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/coordinadores', title: 'Coordinadores', icon: 'bi bi-people-fill', desc: 'Exámenes y reuniones', rolesPermitidos: [4], categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/observaciones', title: 'Observaciones realizadas', icon: 'bi bi-clipboard-check', desc: 'Cargá y revisá las tuyas', rolesPermitidos: [2, 4], categoria: 'Actividad Arbitral' },

  { to: '/panel-arbitro/examen-asamblea', title: 'Exámenes', icon: 'bi bi-journal-check', desc: 'Rendí los teóricos online', categoria: 'Exámenes' },

  { to: '/panel-arbitro/licencia', title: 'Licencias', icon: 'bi bi-calendar-check', desc: 'Avisá tus inasistencias', categoria: 'Administración' },
  { to: '/panel-arbitro/sanciones', title: 'Tribunal de Ética', icon: 'bi bi-shield-exclamation', desc: 'Consultá tus sanciones', categoria: 'Administración' },
  { to: '/panel-arbitro/informes', title: 'Informes', icon: 'bi bi-file-earmark-text', desc: 'Revisá y editá tus informes', categoria: 'Administración' },

  { to: '/panel-arbitro/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-fill', desc: 'Hacé y seguí tus pedidos', categoria: 'Tesorería' },
  { to: '/panel-arbitro/aportes', title: 'Aportes', icon: 'bi bi-cash-coin', desc: 'Estado de tus pagos', categoria: 'Tesorería', idsPermitidos: [1, 2] },

  { to: '/panel-arbitro/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Datos fiscales de clubes', categoria: 'Herramientas' },
  { href: 'https://refflix.com.ar', title: 'Ref-Flix', icon: 'bi bi-cast', desc: 'Plataforma de videos', categoria: 'Herramientas' },
  // En prueba: solo los ID 1 y 2 (la ruta tiene la misma restricción)
  { to: '/panel-arbitro/aaab-tv', title: 'AAAB TV', icon: 'bi bi-camera-reels', desc: 'Análisis de partidos y clips', categoria: 'Herramientas', idsPermitidos: [1, 2] },
  { to: '/panel-arbitro/delegado-tecnico', title: 'Delegado técnico', icon: 'bi bi-person-bounding-box', desc: 'Planilla digital', categoria: 'Herramientas' },
  { to: '/panel-arbitro/contactos-celulares', title: 'Contactos', icon: 'bi bi-telephone-fill', desc: 'Celulares de árbitros', categoria: 'Herramientas' }
]

// Accesos de uso más frecuente (etiquetas cortas para que no se corten en el celular)
const ACCESOS_RAPIDOS = [
  { to: '/panel-arbitro/examen-asamblea', title: 'Exámenes', icon: 'bi bi-journal-check' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history' },
  { to: '/panel-arbitro/licencia', title: 'Licencias', icon: 'bi bi-calendar-check' },
  { to: '/panel-arbitro/rendimiento', title: 'Rendimiento', icon: 'bi bi-graph-up-arrow' }
]

export function useModulosArbitro() {
  // Solo los módulos que el árbitro logueado puede ver (por rol o por id)
  const modulosPermitidos = computed(() => {
    const sesion = auth.getUser()
    if (!sesion) return []
    return MODULOS.filter((item) =>
      (!item.rolesPermitidos || item.rolesPermitidos.includes(sesion.rol)) &&
      (!item.idsPermitidos || item.idsPermitidos.includes(sesion.id))
    )
  })

  const gruposModulos = computed(() =>
    CATEGORIAS
      .map(cat => ({
        ...cat,
        items: modulosPermitidos.value.filter(item => item.categoria === cat.categoria)
      }))
      .filter(grupo => grupo.items.length > 0)
  )

  return { gruposModulos, accesosRapidos: ACCESOS_RAPIDOS }
}
