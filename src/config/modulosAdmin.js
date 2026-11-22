export const ROL_ADMIN = 'admin'

const ETIQUETAS_CARGO = {
  'admin': 'Administrador',
  'secretario': 'Secretaría',
  'etica': 'Tribunal de Ética',
  'designador': 'Designaciones',
  'coordinador general': 'Coordinador General',
  'tesorero': 'Tesorería',
  'indumentaria': 'Indumentaria',
  'curso': 'Curso de Árbitros',
  'facturacion': 'Facturación',
  'informes': 'Informes',
}

export const etiquetaRol = (rol) => {
  const clave = String(rol || '').trim().toLowerCase()
  if (!clave) return 'Sin cargo'
  if (ETIQUETAS_CARGO[clave]) return ETIQUETAS_CARGO[clave]
  return clave.replace(/(^|\s)\S/g, letra => letra.toUpperCase())
}

export const MODULOS_ADMIN = [
  { clave: 'secretaria', categoria: 'Secretaría General', etiqueta: 'Legajos, licencias, eventos, grupos y solicitudes' },
  { clave: 'permisos', categoria: 'Secretaría General', etiqueta: 'Permisos (usuarios del panel)' },
  { clave: 'gestion_reuniones', categoria: 'Secretaría General', etiqueta: 'Aprobar reuniones, asignar disertantes y ver la asistencia de todos los grupos' },
  { clave: 'etica', categoria: 'Tribunal de Ética', etiqueta: 'Sanciones' },
  { clave: 'designaciones', categoria: 'Designaciones Arbitrales', etiqueta: 'Disponibilidad, partidos y rechazos' },
  { clave: 'datos_personales', categoria: 'Tesorería', etiqueta: 'Datos personales' },
  { clave: 'tesoreria_aportes', categoria: 'Tesorería', etiqueta: 'Aportes, pagos y pagos del curso' },
  { clave: 'tesoreria_config', categoria: 'Tesorería', etiqueta: 'Valores, recargos, movimientos, cierres y estado de cuenta' },
  { clave: 'indumentaria', categoria: 'Tesorería', etiqueta: 'Indumentaria, stock y pedidos' },
  { clave: 'desarrollo', categoria: 'Coordinador de Desarrollo Arbitral', etiqueta: 'Observaciones, reuniones, planillas y exámenes' },
  { clave: 'curso', categoria: 'Curso de Árbitros', etiqueta: 'Curso de árbitros completo' },
  { clave: 'facturacion', categoria: 'Herramientas', etiqueta: 'Facturación' },
  { clave: 'informes', categoria: 'Herramientas', etiqueta: 'Informes' },
]

// Módulos del panel por categoría. El título y la descripción (desc) son
// los mismos que muestra cada sección al entrar (header + descripción).
// pendiente: qué contador de panel_admin/contarPendientes se muestra en rojo junto al módulo.
export const CATEGORIAS_ADMIN = [
  {
    categoria: 'Secretaría General',
    icono: 'bi bi-pc-display-horizontal',
    items: [
      { modulo: 'secretaria', to: '/panel-admin/secretaria/modificacion-datos', title: 'Legajos', icon: 'bi bi-people', desc: 'Datos y disponibilidad de los árbitros', pendiente: 'solicitudesDatos' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/licencias', title: 'Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Licencias e inasistencias', pendiente: 'licencias' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/eventos-notificaciones', title: 'Eventos', icon: 'bi bi-bell', desc: 'Avisos, reuniones y noticias', pendiente: 'reuniones' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/grupos', title: 'Grupos', icon: 'bi bi-people-fill', desc: 'Grupos de árbitros' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/solicitudes-institucionales', title: 'Solicitudes institucionales', icon: 'bi bi-envelope-paper', desc: 'Pedidos de los coordinadores' },
      { modulo: 'permisos', to: '/panel-admin/secretaria/permisos', title: 'Permisos', icon: 'bi bi-person-lock', desc: 'Usuarios del panel y sus roles' }
    ]
  },
  {
    categoria: 'Tribunal de Ética',
    icono: 'bi bi-shield-exclamation',
    items: [
      { modulo: 'etica', to: '/panel-admin/tribunal/sanciones', title: 'Listado de sanciones', icon: 'bi bi-journal-text', desc: 'Sanciones vigentes e históricas', pendiente: 'descargos' },
      { modulo: 'etica', to: '/panel-admin/tribunal/cargar-sancion', title: 'Cargar sanción', icon: 'bi bi-shield-plus', desc: 'Nueva resolución disciplinaria' }
    ]
  },
  {
    categoria: 'Designaciones Arbitrales',
    icono: 'bi bi-calendar4-week',
    items: [
      { modulo: 'designaciones', to: '/panel-admin/designaciones/disponibilidad-licencias', title: 'Disponibilidad y licencias', icon: 'bi bi-calendar-date-fill', desc: 'Quién puede dirigir cada fecha' },
      { modulo: 'designaciones', to: '/panel-admin/designaciones/partidos', title: 'Partidos', icon: 'bi bi-clipboard2-data-fill', desc: 'Cargá y asigná partidos' },
      { modulo: 'designaciones', to: '/panel-admin/designaciones/designaciones-rechazadas', title: 'Designaciones rechazadas', icon: 'bi bi-x-octagon', desc: 'Rechazos de los árbitros', pendiente: 'rechazos' }
    ]
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    items: [
      { modulo: 'datos_personales', to: '/panel-admin/tesoreria/datos-personales', title: 'Datos personales', icon: 'bi bi-person-lines-fill', desc: 'Datos de los miembros' },
      { modulo: 'tesoreria_aportes', to: '/panel-admin/tesoreria/aportes-pagos', title: 'Aportes y pagos', icon: 'bi bi-cash-coin', desc: 'Valores, movimientos y cierres' },
      { modulo: 'indumentaria', to: '/panel-admin/tesoreria/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-check', desc: 'Stock y pedidos', pendiente: 'pedidos' }
    ]
  },
  {
    categoria: 'Coordinador de Desarrollo Arbitral',
    icono: 'bi bi-person-workspace',
    items: [
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/observaciones', title: 'Observaciones realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Seguimiento de las observaciones', pendiente: 'observaciones' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/reuniones-mensuales', title: 'Reuniones mensuales', icon: 'bi bi-calendar-event', desc: 'Presentes y ausentes' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/resumen-arbitros', title: 'Planilla general de árbitros', icon: 'bi bi-table', desc: 'Asambleas, recuperatorios y reuniones' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/habilitacion-examenes-asamblea', title: 'Habilitación de exámenes', icon: 'bi bi-shield-check', desc: 'Grupos habilitados para rendir' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/planilla-general-observaciones', title: 'Planilla general de observaciones', icon: 'bi bi-clipboard2-data-fill', desc: 'Observaciones de todos los árbitros' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/aaab-tv', title: 'AAAB TV', icon: 'bi bi-camera-reels', desc: 'Clips pendientes y visibilidad' }
    ]
  },
  {
    categoria: 'Curso de Árbitros',
    icono: 'bi bi-file-person-fill',
    items: [
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/legajos-curso', title: 'Legajos del curso', icon: 'bi bi-person-lines-fill', desc: 'Inscriptos del curso', pendiente: 'inscripcionesCurso' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/alumnos-regulares', title: 'Alumnos regulares', icon: 'bi bi-person-check-fill', desc: 'Asistencia, mini y exámenes' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/encuentros-mini', title: 'Encuentros de Mini', icon: 'bi bi-people-fill', desc: 'Convocatoria y asistencia' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/cronograma', title: 'Clases y asistencia', icon: 'bi bi-calendar3-week', desc: 'Cronograma y exámenes por clase', pendiente: 'clasesSinAsistencia' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/observaciones-curso', title: 'Observaciones del curso', icon: 'bi bi-clipboard-data-fill', desc: 'Observaciones de los aspirantes', pendiente: 'observacionesCurso' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/examenes-curso', title: 'Exámenes del curso', icon: 'bi bi-journal-check', desc: 'Exámenes y resultados' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/practicas-catalogo', title: 'Práctica del catálogo', icon: 'bi bi-ui-checks-grid', desc: 'Aspirantes que practican' }
    ]
  },
  {
    categoria: 'Herramientas',
    icono: 'bi bi-tools',
    items: [
      { modulo: 'facturacion', to: '/panel-admin/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Datos fiscales de clubes' },
      { modulo: 'informes', to: '/panel-admin/informes', title: 'Informes', icon: 'bi bi-file-earmark-text', desc: 'Informes arbitrales', pendiente: 'informes' }
    ]
  }
]

// Secciones a las que se entra desde otra (Aportes y pagos, Indumentaria).
// También las usan esos menús, así título y descripción coinciden.
export const SUBSECCIONES_ADMIN = [
  { modulo: 'tesoreria_config', padre: '/panel-admin/tesoreria/aportes-pagos', to: '/panel-admin/tesoreria/aportes-pagos/valores', title: 'Valores y porcentaje', icon: 'bi bi-currency-dollar', desc: 'Valor por categoría, pagos y % de aporte' },
  { modulo: 'tesoreria_config', padre: '/panel-admin/tesoreria/aportes-pagos', to: '/panel-admin/tesoreria/aportes-pagos/recargos', title: 'Recargos de porcentaje', icon: 'bi bi-graph-up-arrow', desc: 'Recargos individuales sobre el aporte' },
  { modulo: 'tesoreria_config', padre: '/panel-admin/tesoreria/aportes-pagos', to: '/panel-admin/tesoreria/aportes-pagos/movimientos', title: 'Movimientos', icon: 'bi bi-list-check', desc: 'Aportes del período y ajustes' },
  { modulo: 'tesoreria_config', padre: '/panel-admin/tesoreria/aportes-pagos', to: '/panel-admin/tesoreria/aportes-pagos/cierres', title: 'Cierre mensual', icon: 'bi bi-calendar-check', desc: 'Cerrar el período e historial' },
  { modulo: 'tesoreria_config', padre: '/panel-admin/tesoreria/aportes-pagos', to: '/panel-admin/tesoreria/aportes-pagos/estado-cuenta', title: 'Estado de cuenta general', icon: 'bi bi-people', desc: 'Saldo de todos los árbitros' },
  { modulo: 'indumentaria', padre: '/panel-admin/tesoreria/indumentaria', to: '/panel-admin/tesoreria/indumentaria/stock', title: 'Stock', icon: 'bi bi-box-seam', desc: 'Talles, ingresos y cantidades' },
  { modulo: 'indumentaria', padre: '/panel-admin/tesoreria/indumentaria', to: '/panel-admin/tesoreria/indumentaria/pedidos', title: 'Pedidos', icon: 'bi bi-list-check', desc: 'Solicitudes y entregas', pendiente: 'pedidos' },
  { modulo: 'tesoreria_aportes', to: '/panel-admin/tesoreria/pagos-curso', title: 'Pagos del curso', icon: 'bi bi-mortarboard', desc: 'Pagos de los aspirantes' }
]

// Título y descripción de la sección actual (para el header y la descripción)
export const buscarSeccionAdmin = (ruta) => {
  const path = String(ruta || '').replace(/\/+$/, '')
  for (const cat of CATEGORIAS_ADMIN) {
    const item = cat.items.find(i => i.to === path)
    if (item) return item
  }
  return SUBSECCIONES_ADMIN.find(i => i.to === path) || null
}
