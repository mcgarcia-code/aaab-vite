export const ROLES_ADMIN = [
  { valor: 'admin', etiqueta: 'Administrador' },
  { valor: 'secretario', etiqueta: 'Secretaría' },
  { valor: 'etica', etiqueta: 'Tribunal de Ética' },
  { valor: 'designador', etiqueta: 'Designaciones' },
  { valor: 'coordinador general', etiqueta: 'Coordinador General' },
  { valor: 'tesorero', etiqueta: 'Tesorería' },
  { valor: 'indumentaria', etiqueta: 'Indumentaria' },
  { valor: 'curso', etiqueta: 'Curso de Árbitros' },
  { valor: 'facturacion', etiqueta: 'Facturación' },
  { valor: 'informes', etiqueta: 'Informes' },
]

export const MODULOS_ADMIN = [
  { clave: 'secretaria', categoria: 'Secretaría General', etiqueta: 'Legajos, licencias, eventos, grupos y solicitudes' },
  { clave: 'permisos', categoria: 'Secretaría General', etiqueta: 'Permisos (usuarios del panel)' },
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

export const CATEGORIAS_ADMIN = [
  {
    categoria: 'Secretaría General',
    icono: 'bi bi-pc-display-horizontal',
    items: [
      { modulo: 'secretaria', to: '/panel-admin/secretaria/modificacion-datos', title: 'Legajos', icon: 'bi bi-people', desc: 'Actualizar información personal y disponibilidad de los árbitros.' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/licencias', title: 'Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Gestionar las licencias y permisos de inasistencia.' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/eventos-notificaciones', title: 'Eventos', icon: 'bi bi-bell', desc: 'Gestionar avisos, reuniones y noticias para los árbitros.', badgeReuniones: true },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/grupos', title: 'Grupos', icon: 'bi bi-people-fill', desc: 'Administrar grupos de árbitros' },
      { modulo: 'secretaria', to: '/panel-admin/secretaria/solicitudes-institucionales', title: 'Solicitudes Institucionales', icon: 'bi bi-envelope-paper', desc: 'Gestionar solicitudes de coordinadores.' },
      { modulo: 'permisos', to: '/panel-admin/secretaria/permisos', title: 'Permisos', icon: 'bi bi-person-lock', desc: 'Crear usuarios del panel y asignarles su rol.' },
    ]
  },
  {
    categoria: 'Tribunal de Ética',
    icono: 'bi bi-shield-exclamation',
    items: [
      { modulo: 'etica', to: '/panel-admin/tribunal/sanciones', title: 'Listado de Sanciones', icon: 'bi bi-journal-text', desc: 'Consultar, editar o dar de baja sanciones vigentes e históricas.' },
      { modulo: 'etica', to: '/panel-admin/tribunal/cargar-sancion', title: 'Cargar Sanción', icon: 'bi bi-shield-plus', desc: 'Registrar una nueva resolución disciplinaria en el legajo del árbitro.' }
    ]
  },
  {
    categoria: 'Designaciones Arbitrales',
    icono: 'bi bi-calendar4-week',
    items: [
      { modulo: 'designaciones', to: '/panel-admin/designaciones/disponibilidad-licencias', title: 'Disponibilidad y Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Chequear disponibilidad y licencias de árbitros.' },
      { modulo: 'designaciones', to: '/panel-admin/designaciones/partidos', title: 'Carga y visualización de partidos', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar partidos asignados y pendientes.' },
      { modulo: 'designaciones', to: '/panel-admin/designaciones/designaciones-rechazadas', title: 'Designaciones Rechazadas', icon: 'bi bi-graph-up-arrow', desc: 'Visualizar designaciones rechazadas.', badgeRechazos: true }
    ]
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    items: [
      { modulo: 'datos_personales', to: '/panel-admin/tesoreria/datos-personales', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { modulo: 'tesoreria_aportes', to: '/panel-admin/tesoreria/aportes-pagos', title: 'Aportes y Pagos', icon: 'bi bi-cash-coin', desc: 'Registrar cobros de cuotas y aportes mensuales.' },
      { modulo: 'indumentaria', to: '/panel-admin/tesoreria/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-check', desc: 'Control de inventario, talles y entrega de pedidos.' }
    ]
  },
  {
    categoria: 'Coordinador de Desarrollo Arbitral',
    icono: 'bi bi-person-workspace',
    items: [
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/observaciones', title: 'Observaciones realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/reuniones-mensuales', title: 'Reuniones Mensuales', icon: 'bi bi-calendar-event', desc: 'Registro de presentes y ausentes en reuniones mensuales.' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/resumen-arbitros', title: 'Planilla General de Árbitros', icon: 'bi bi-graph-up-arrow', desc: 'Administración de exámenes teóricos/físicos.' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/habilitacion-examenes-asamblea', title: 'Habilitación Exámenes Asambleas y Reuniones', icon: 'bi bi-shield-check', desc: 'Elegí qué grupos quedan habilitados para rendir el examen teórico.' },
      { modulo: 'desarrollo', to: '/panel-admin/desarrollo-arbitral/planilla-general-observaciones', title: 'Planilla General de Observaciones', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar todas las observaciones realizadas a los árbitros.' }
    ]
  },
  {
    categoria: 'Curso de Árbitros',
    icono: 'bi bi-file-person-fill',
    items: [
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/legajos-curso', title: 'Legajos', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/alumnos-regulares', title: 'Alumnos Regulares', icon: 'bi bi-person-check-fill', desc: 'Asistencia a clases, encuentros de mini y exámenes de cada alumno.' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/encuentros-mini', title: 'Encuentros de Mini', icon: 'bi bi-people-fill', desc: 'Convocar aspirantes del curso anual y tomar asistencia.' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/cronograma', title: 'Clases y Asistencia', icon: 'bi bi-calendar3-week', desc: 'Clases del curso, asistencia y exámenes online por clase.' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/observaciones-curso', title: 'Observaciones Realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { modulo: 'curso', to: '/panel-admin/curso-arbitros/examenes-curso', title: 'Exámenes', icon: 'bi bi-journal-check', desc: 'Gestionar exámenes y resultados del curso.' }
    ]
  },
  {
    categoria: 'Herramientas',
    icono: 'bi bi-tools',
    items: [
      { modulo: 'facturacion', to: '/panel-admin/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Administrar datos fiscales y entidades vinculadas.' },
      { modulo: 'informes', to: '/panel-admin/informes', title: 'Informes', icon: 'bi bi-file-earmark-text', desc: 'Gestionar informes arbitrales.' }
    ]
  }
]
