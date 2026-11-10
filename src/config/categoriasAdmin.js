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

export const CATEGORIAS_ADMIN = [
  {
    categoria: 'Secretaría General',
    icono: 'bi bi-pc-display-horizontal',
    rolesPermitidos: ['admin', 'etica', 'secretario', 'designador', 'coordinador general'],
    items: [
      { to: '/panel-admin/secretaria/modificacion-datos', title: 'Legajos', icon: 'bi bi-people', desc: 'Actualizar información personal y disponibilidad de los árbitros.' },
      { to: '/panel-admin/secretaria/licencias', title: 'Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Gestionar las licencias y permisos de inasistencia.' },
      { to: '/panel-admin/secretaria/eventos-notificaciones', title: 'Eventos', icon: 'bi bi-bell', desc: 'Gestionar avisos, reuniones y noticias para los árbitros.', badgeReuniones: true },
      { to: '/panel-admin/secretaria/grupos', title: 'Grupos', icon: 'bi bi-people-fill', desc: 'Administrar grupos de árbitros' },
      { to: '/panel-admin/secretaria/solicitudes-institucionales', title: 'Solicitudes Institucionales', icon: 'bi bi-envelope-paper', desc: 'Gestionar solicitudes de coordinadores.' },
      { to: '/panel-admin/secretaria/permisos', title: 'Permisos', icon: 'bi bi-person-lock', desc: 'Crear usuarios del panel y asignarles su rol.', rolesPermitidos: ['admin', 'secretario'] },
    ]
  },
  {
    categoria: 'Tribunal de Ética',
    icono: 'bi bi-shield-exclamation',
    rolesPermitidos: ['admin', 'etica', 'secretario', 'designador'],
    items: [
      { to: '/panel-admin/tribunal/sanciones', title: 'Listado de Sanciones', icon: 'bi bi-journal-text', desc: 'Consultar, editar o dar de baja sanciones vigentes e históricas.' },
      { to: '/panel-admin/tribunal/cargar-sancion', title: 'Cargar Sanción', icon: 'bi bi-shield-plus', desc: 'Registrar una nueva resolución disciplinaria en el legajo del árbitro.' }
    ]
  },
  {
    categoria: 'Designaciones Arbitrales',
    icono: 'bi bi-calendar4-week',
    rolesPermitidos: ['admin', 'designador', 'secretario','coordinador general', 'etica'],
    items: [
      { to: '/panel-admin/designaciones/disponibilidad-licencias', title: 'Disponibilidad y Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Chequear disponibilidad y licencias de árbitros.' },
      { to: '/panel-admin/designaciones/partidos', title: 'Carga y visualización de partidos', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar partidos asignados y pendientes.' },
      { to: '/panel-admin/designaciones/designaciones-rechazadas', title: 'Designaciones Rechazadas', icon: 'bi bi-graph-up-arrow', desc: 'Visualizar designaciones rechazadas.', badgeRechazos: true }
    ]
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    rolesPermitidos: ['admin', 'tesorero', 'secretario', 'designador', 'indumentaria'],
    items: [
      { to: '/panel-admin/tesoreria/datos-personales', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { to: '/panel-admin/tesoreria/aportes-pagos', title: 'Aportes y Pagos', icon: 'bi bi-cash-coin', desc: 'Registrar cobros de cuotas y aportes mensuales.' },
      { to: '/panel-admin/tesoreria/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-check', desc: 'Control de inventario, talles y entrega de pedidos.' }
    ]
  },
  {
    categoria: 'Coordinador de Desarrollo Arbitral',
    icono: 'bi bi-person-workspace',
    rolesPermitidos: ['admin', 'coordinador general', 'secretario', 'designador'],
    items: [
      { to: '/panel-admin/desarrollo-arbitral/observaciones', title: 'Observaciones realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { to: '/panel-admin/desarrollo-arbitral/reuniones-mensuales', title: 'Reuniones Mensuales', icon: 'bi bi-calendar-event', desc: 'Registro de presentes y ausentes en reuniones mensuales.' },
      { to: '/panel-admin/desarrollo-arbitral/resumen-arbitros', title: 'Planilla General de Árbitros', icon: 'bi bi-graph-up-arrow', desc: 'Administración de exámenes teóricos/físicos.' },
      { to: '/panel-admin/desarrollo-arbitral/habilitacion-examenes-asamblea', title: 'Habilitación Exámenes Asambleas y Reuniones', icon: 'bi bi-shield-check', desc: 'Elegí qué grupos quedan habilitados para rendir el examen teórico.' },
      { to: '/panel-admin/desarrollo-arbitral/planilla-general-observaciones', title: 'Planilla General de Observaciones', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar todas las observaciones realizadas a los árbitros.' }
    ]
  },
  {
    categoria: 'Curso de Árbitros',
    icono: 'bi bi-file-person-fill',
    rolesPermitidos: ['admin', 'secretario', 'curso'],
    items: [
      { to: '/panel-admin/curso-arbitros/legajos-curso', title: 'Legajos', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { to: '/panel-admin/curso-arbitros/alumnos-regulares', title: 'Alumnos Regulares', icon: 'bi bi-person-check-fill', desc: 'Asistencia a clases, encuentros de mini y exámenes de cada alumno.' },
      { to: '/panel-admin/curso-arbitros/encuentros-mini', title: 'Encuentros de Mini', icon: 'bi bi-people-fill', desc: 'Convocar aspirantes del curso anual y tomar asistencia.' },
      { to: '/panel-admin/curso-arbitros/cronograma', title: 'Clases y Asistencia', icon: 'bi bi-calendar3-week', desc: 'Clases del curso, asistencia y exámenes online por clase.' },
      { to: '/panel-admin/curso-arbitros/observaciones-curso', title: 'Observaciones Realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { to: '/panel-admin/curso-arbitros/examenes-curso', title: 'Exámenes', icon: 'bi bi-journal-check', desc: 'Gestionar exámenes y resultados del curso.' }
    ]
  },
  {
    categoria: 'Herramientas',
    icono: 'bi bi-tools',
    rolesPermitidos: ['admin', 'secretario', 'facturacion', 'tesorero', 'informes', 'etica'],
    items: [
      { to: '/panel-admin/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Administrar datos fiscales y entidades vinculadas.' },
      { to: '/panel-admin/informes', title: 'Informes', icon: 'bi bi-file-earmark-text', desc: 'Gestionar informes arbitrales.' }
    ]
  }
]
