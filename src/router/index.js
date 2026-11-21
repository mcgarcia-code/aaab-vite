/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/public/HomeView.vue';
import { auth } from '../api/auth.js';
import { usePermisos } from '@/composables/usePermisos'
import { esAppInstalada } from '@/utils/app'
import { setRutaActual } from '@/composables/useTema'

// Panel que le corresponde a cada usuario
const rutaPanel = (user) => {
  if (user?.rol === 'alumno_curso') return '/panel-curso'
  return user?.esAutoridad ? '/panel-admin' : '/panel-arbitro'
}

// Páginas sin login que sí se usan dentro de la app instalada (el resto del sitio público no)
const PUBLICAS_EN_APP = ['LoginArbitro', 'OlvidePassword', 'RestablecerPassword', 'RegistroArbitro', 'RegistroArbitroCurso']

// --- PUBLIC ---
const routes = [
  { path: '/', name: 'inicio', component: HomeView },
  { path: '/descargas', name: 'descargas', component: () => import('../views/public/DescargasView.vue') },
  { path: '/escuela-arbitros', name: 'escuelaArbitros', component: () => import('../views/public/EscuelaArbitros.vue') },
  { path: '/preguntas-frecuentes', name: 'faq', component: () => import('../views/public/FaqView.vue') },
  { path: '/designaciones', name: 'designaciones', component: () => import('../views/public/DesignacionesView.vue') },
  { path: '/tribunal-de-etica', name: 'tribunalEtica', component: () => import('../views/public/TribunalEticaView.vue') },
  { path: '/sanciones', name: 'sanciones', component: () => import('../views/public/SancionesView.vue') },
  { path: '/glosario', name: 'glosario', component: () => import('../views/public/GlosarioView.vue') },
  { path: '/contactos-celulares', name: 'ContactosCelulares', component: () => import('../views/public/ContactosCelularesView.vue') },
  { path: '/coordinadores-base', name: 'CoordinadoresBase', component: () => import('../views/public/CoordinadoresDatosView.vue') },
  { path: '/registro-arbitro', name: 'RegistroArbitro', component: () => import('../views/public/RegistroArbitro.vue') },
  { path: '/registro-curso-arbitro', name: 'RegistroArbitroCurso', component: () => import('../views/public/RegistroArbitroCurso.vue') },

  // --- LOGIN & RECUPERACIÓN DE CLAVE ---
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/public/LoginArbitro.vue'),
    beforeEnter: (to, from, next) => {
      if (auth.isLoggedIn()) {
        next(rutaPanel(auth.getUser()));
      } else {
        next();
      }
    }
  },
  {
    path: '/olvide-password',
    name: 'OlvidePassword',
    component: () => import('../views/public/OlvidePassword.vue')
  },
  {
    path: '/recuperar-password',
    name: 'RestablecerPassword',
    component: () => import('../views/public/RestablecerPassword.vue')
  },

  // --- PANEL ARBITRO ---
  {
    path: '/panel-arbitro',
    component: () => import('../components/panel-arbitro/PanelArbitro.vue'),
    meta: { requiresAuth: true },
    children: [
      // --- INICIO ---
      { path: '', name: 'PanelInicio', component: () => import('../components/panel-arbitro/InicioPanel.vue') },

      // --- LICENCIAS ---
      { path: 'licencia', name: 'PanelLicencia', component: () => import('../components/panel-arbitro/licencias/SolicitarLicencia.vue') },

      // --- DATOS PERSONALES ---
      { path: 'datos', name: 'PanelDatos', component: () => import('../components/panel-arbitro/datos-personales/MisDatos.vue') },

      // --- DISPONIBILIDAD ---
      { path: 'disponibilidad', name: 'PanelDisponibilidad', component: () => import('../components/panel-arbitro/disponibilidad/PanelDisponibilidad.vue') },

      // --- SANCIONES ---
      { path: 'sanciones', name: 'PanelSanciones', component: () => import('../components/panel-arbitro/sanciones/MisSanciones.vue') },

      // --- CREDENCIAL DIGITAL ---
      { path: 'credencial', name: 'PanelCredencial', component: () => import('../components/panel-arbitro/credencial/CredencialDigital.vue') },

      // --- RENDIMIENTO ---
      { path: 'rendimiento', name: 'PanelRendimiento', component: () => import('../components/panel-arbitro/rendimiento/MiRendimiento.vue') },

      // --- MIS OBSERVACIONES ---
      { path: 'mis-observaciones', name: 'PanelMisObservaciones', component: () => import('../components/panel-arbitro/mis-observaciones/MisObservacionesPartidos.vue') },

      // --- APORTES Y PAGOS ---
      { path: 'aportes', name: 'PanelAportes', component: () => import('../components/panel-arbitro/tesoreria/MisAportes.vue'), meta: { idsPermitidos: [1, 2] } },

      // --- REF-FLIX ---
      { path: 'ref-flix', name: 'PanelRefFlix', beforeEnter() { window.location.href = 'https://refflix.com.ar' } },

      // --- OBSERVACIONES ---
      { path: 'observaciones', name: 'Observaciones', component: () => import('../components/panel-arbitro/observadores/ObservacionesPanel.vue'), meta: { roles: [2, 4] } },
      { path: 'observaciones/carga', name: 'ObservacionesCarga', component: () => import('../components/panel-arbitro/observadores/CargaObservaciones.vue'), meta: { roles: [2, 4] } },
      { path: 'observaciones/mis-observaciones', name: 'ObservacionesMias', component: () => import('../components/panel-arbitro/observadores/MisObservaciones.vue'), meta: { roles: [2, 4] } },
      { path: 'observaciones/observaciones-mini', name: 'ObservacionesMini', component: () => import('../components/panel-arbitro/observadores/ObservacionesMini.vue'), meta: { roles: [2, 4] } },

      // --- COORDINADORES ---
      { path: 'coordinadores', name: 'PanelCoordinadoresAdmin', component: () => import('../components/panel-arbitro/coordinadores/CoordinadoresAdmin.vue'), meta: { roles: [4] } },
      { path: 'coordinadores/resumen-arbitros', name: 'CoordinadoresResumen', component: () => import('../components/panel-arbitro/coordinadores/PlanillaGeneralCoordinadores.vue'), meta: { roles: [4] } },
      { path: 'coordinadores/reuniones-mensuales', name: 'CoordinadoresReuniones', component: () => import('../components/panel-arbitro/coordinadores/ReunionesMensualesCoordinadores.vue'), meta: { roles: [4] } },
      { path: 'coordinadores/disponibilidad-horaria', name: 'CoordinadoresDisponibilidad', component: () => import('../components/panel-arbitro/coordinadores/DisponibilidadHorariaCoordinadores.vue'), meta: { roles: [4] } },
      { path: 'coordinadores/planilla-general-observaciones', name: 'CoordinadoresPlanillaGeneralObservaciones', component: () => import('../components/panel-arbitro/coordinadores/PlanillaGeneralObservacionesCoordinadores.vue'), meta: { roles: [4] } },
      {path: 'coordinadores/informes-coordinadores', name: 'InformesCoordinadores', component: () => import('../components/panel-arbitro/coordinadores/InformesCoordinadores.vue'), meta: { roles: [4] } },

      // --- INDUMENTARIA ---
      { path: 'indumentaria', name: 'PanelIndumentaria', component: () => import('../components/panel-arbitro/indumentaria/IndumentariaArbitro.vue') },
      { path: 'indumentaria/nuevo', name: 'RealizarPedido', component: () => import('../components/panel-arbitro/indumentaria/RealizarPedido.vue') },
      { path: 'indumentaria/mis-pedidos', name: 'MisPedidos', component: () => import('../components/panel-arbitro/indumentaria/MisPedidos.vue') },

      // --- FACTURACION ---
      { path: 'facturacion', name: 'InstitucionesCuit', component: () => import('../components/panel-arbitro/facturacion/InstitucionesCuit.vue') },

      // --- HISTORIAL DE NOTIFICACIONES ---
      { path: 'historial-notificaciones', name: 'HistorialNotificacionesArbitro', component: () => import('../components/panel-arbitro/notificaciones/HistorialNotificaciones.vue') },

      // --- MENÚ (pestaña de la barra inferior en celular) ---
      { path: 'menu', name: 'PanelMenu', component: () => import('../components/panel-arbitro/MenuPanel.vue') },

      // --- CONTACTOS CELULARES (misma vista que la pública /contactos-celulares) ---
      { path: 'contactos-celulares', name: 'PanelContactosCelulares', component: () => import('../views/public/ContactosCelularesView.vue') },

      // --- DELEGADO TÉCNICO ---
      { path: 'aaab-tv', name: 'PanelAaabTv', component: () => import('../components/panel-arbitro/aaab-tv/AaabTv.vue'), meta: { idsPermitidos: [1, 2] } },
      { path: 'delegado-tecnico', name: 'DelegadoTecnico', component: () => import('../components/panel-arbitro/delegado-tecnico/DelegadosTecnicos.vue') },

      // --- DESIGNACIONES ---
      { path: 'designaciones', name: 'DesignacionesArbitro', component: () => import('../components/panel-arbitro/designaciones/MisDesignaciones.vue') },

      // --- EXAMEN ASAMBLEA GENERAL - REUNIÓN MENSUAL ---
      { path: 'examen-asamblea', name: 'ExamenAsamblea', component: () => import('../components/panel-arbitro/examenes/ExamenAsambleaGeneral.vue') },

      // --- PRÁCTICA DEL CATÁLOGO (exámenes de práctica guardados por árbitro) ---
      { path: 'practica-catalogo', name: 'PracticaCatalogo', component: () => import('../components/comunes/practica-catalogo/PracticaCatalogo.vue') },

      // --- INFORMES ---
      { path: 'informes', name: 'InformesArbitro', component: () => import('../components/panel-arbitro/informes/MisInformes.vue') },

    ]
  },

    // --- PANEL CURSO ---
  {
    path: '/panel-curso',
    component: () => import('../components/panel-curso/PanelCurso.vue'),
    meta: { requiresAuth: true, roles: ['alumno_curso'] },
    children: [
      { path: '', name: 'PanelInicioCurso', component: () => import('../components/panel-curso/InicioPanelCurso.vue') },
      { path: 'datos-curso', name: 'PanelDatosCurso', component: () => import('../components/panel-curso/datos-personales-curso/MisDatosCurso.vue') },
      { path: 'credencial-curso', name: 'PanelCredencialCurso', component: () => import('../components/panel-curso/credencial-curso/CredencialDigitalCurso.vue') },
      { path: 'historial-notificaciones', name: 'HistorialNotificacionesCurso', component: () => import('../components/panel-curso/notificaciones-curso/HistorialNotificacionesCurso.vue') },
      { path: 'observaciones-curso', name: 'MisObservacionesCurso', component: () => import('../components/panel-curso/observaciones-curso/MisObservacionesCurso.vue') },
      { path: 'examenes-curso', name: 'MisExamenesCurso', component: () => import('../components/panel-curso/examenes-curso/MisExamenesCurso.vue') },
      { path: 'designaciones-curso', name: 'MisDesignacionesCurso', component: () => import('../components/panel-curso/designaciones-curso/MisDesignacionesCurso.vue') },
      { path: 'rendimiento-curso', name: 'PanelRendimientoCurso', component: () => import('../components/panel-curso/rendimiento-curso/MiRendimientoCurso.vue') },
      { path: 'cuota-curso', name: 'CuotaCurso', component: () => import('../components/panel-curso/tesoreria/CuotaCurso.vue') },
      // --- MENÚ (pestaña de la barra inferior en celular) ---
      { path: 'menu', name: 'PanelMenuCurso', component: () => import('../components/panel-curso/MenuPanelCurso.vue') },
      { path: 'cronograma-curso', name: 'CronogramaCurso', component: () => import('../components/panel-curso/cronograma-curso/CronogramaCurso.vue') },
      // --- PRÁCTICA DEL CATÁLOGO (la misma pantalla que el panel árbitro; se guarda por alumno) ---
      { path: 'practica-catalogo', name: 'PracticaCatalogoCurso', component: () => import('../components/comunes/practica-catalogo/PracticaCatalogo.vue') },

    ]
  },

  // --- PANEL ADMIN ---
  {
    path: '/panel-admin',
    component: () => import('../components/panel-admin/AdminPanel.vue'),
    meta: { requiresAuth: true, soloAutoridad: true },
    children: [
      { path: '', name: 'AdminInicio', component: () => import('../components/panel-admin/AdminInicio.vue') },

      // --- SECRETARÍA ---

      { path: 'secretaria/modificacion-datos', name: 'LegajosPersonales', component: () => import('../components/panel-admin/secretaria/LegajosPersonales.vue'), meta: { modulo: 'secretaria' } },
      { path: 'secretaria/licencias', name: 'LicenciasAdmin', component: () => import('../components/panel-admin/secretaria/LicenciasAdmin.vue'), meta: { modulo: 'secretaria' } },
      { path: 'secretaria/eventos-notificaciones', name: 'GestionEventos', component: () => import('../components/panel-admin/secretaria/GestionEventos.vue'), meta: { modulo: 'secretaria' } },
      { path: 'secretaria/permisos', name: 'PermisosAdmin', component: () => import('../components/panel-admin/secretaria/PermisosAdmin.vue'), meta: { modulo: 'permisos' } },
      { path: 'secretaria/grupos', name: 'GruposAdmin', component: () => import('../components/panel-admin/secretaria/GruposAdmin.vue'), meta: { modulo: 'secretaria' } },
      { path: 'secretaria/solicitudes-institucionales', name: 'SolicitudesInstitucionales', component: () => import('../components/panel-admin/secretaria/SolicitudesInstitucionales.vue'), meta: { modulo: 'secretaria' } },

      // --- DESIGNACIONES ---

      { path: 'designaciones/disponibilidad-licencias', name: 'DisponibilidadLicencias', component: () => import('../components/panel-admin/designaciones/DisponibilidadLicencias.vue'), meta: { modulo: 'designaciones' } },
      { path: 'designaciones/partidos', name: 'CargaPartidos', component: () => import('../components/panel-admin/designaciones/CargaPartidos.vue'), meta: { modulo: 'designaciones' } },
      { path: 'designaciones/designaciones-rechazadas', name: 'DesignacionesRechazadas', component: () => import('../components/panel-admin/designaciones/DesignacionesRechazadas.vue'), meta: { modulo: 'designaciones' }, },

      // --- TRIBUNAL ---

      { path: 'tribunal/sanciones', name: 'TribunalSanciones', component: () => import('../components/panel-admin/etica/SancionesListado.vue'), meta: { modulo: 'etica' } },
      { path: 'tribunal/cargar-sancion', name: 'TribunalCargar', component: () => import('../components/panel-admin/etica/CargarSanciones.vue'), meta: { modulo: 'etica' } },

      // --- TESORERÍA ---

      { path: 'tesoreria/datos-personales', name: 'DatosPersonales', component: () => import('../components/panel-admin/tesoreria/DatosPersonales.vue'), meta: { modulo: 'datos_personales' } },
      { path: 'tesoreria/aportes-pagos', name: 'TesoreriaAportes', component: () => import('../components/panel-admin/tesoreria/AportesPagos.vue'), meta: { modulo: 'tesoreria_aportes' } },
      { path: 'tesoreria/aportes-pagos/valores', name: 'TesoreriaValores', component: () => import('../components/panel-admin/tesoreria/ValoresAporte.vue'), meta: { modulo: 'tesoreria_config' } },
      { path: 'tesoreria/aportes-pagos/recargos', name: 'TesoreriaRecargos', component: () => import('../components/panel-admin/tesoreria/RecargosPorcentaje.vue'), meta: { modulo: 'tesoreria_config' } },
      { path: 'tesoreria/aportes-pagos/movimientos', name: 'TesoreriaMovimientos', component: () => import('../components/panel-admin/tesoreria/MovimientosTesoreria.vue'), meta: { modulo: 'tesoreria_config' } },
      { path: 'tesoreria/aportes-pagos/cierres', name: 'TesoreriaCierres', component: () => import('../components/panel-admin/tesoreria/CierresTesoreria.vue'), meta: { modulo: 'tesoreria_config' } },
      { path: 'tesoreria/aportes-pagos/estado-cuenta', name: 'TesoreriaEstadoCuenta', component: () => import('../components/panel-admin/tesoreria/EstadoCuentaGeneral.vue'), meta: { modulo: 'tesoreria_config' } },
      { path: 'tesoreria/indumentaria', name: 'TesoreriaIndumentaria', component: () => import('../components/panel-admin/tesoreria/IndumentariaAdmin.vue'), meta: { modulo: 'indumentaria' } },
      { path: 'tesoreria/indumentaria/stock', name: 'IndumentariaStock', component: () => import('../components/panel-admin/tesoreria/StockIndumentaria.vue'), meta: { modulo: 'indumentaria' } },
      { path: 'tesoreria/indumentaria/pedidos', name: 'IndumentariaPedidos', component: () => import('../components/panel-admin/tesoreria/PedidosRealizados.vue'), meta: { modulo: 'indumentaria' } },
      { path: 'tesoreria/pagos-curso', name: 'PagosCurso', component: () => import('../components/panel-admin/tesoreria/PagosCurso.vue'), meta: { modulo: 'tesoreria_aportes' } },

      // --- HERRAMIENTAS ---
      { path: 'facturacion', name: 'InstitucionesCuitAdmin', component: () => import('../components/panel-admin/facturacion/InstitucionesCuitAdmin.vue'), meta: { modulo: 'facturacion' } },

      // --- INFORMES ---
      { path: 'informes', name: 'InformesAdmin', component: () => import('../components/panel-admin/informes/InformesAdmin.vue'), meta: { modulo: 'informes' } },

      // --- MENÚ (pestaña de la barra inferior en celular) ---
      { path: 'menu', name: 'AdminMenu', component: () => import('../components/panel-admin/AdminMenu.vue') },

      // --- DESARROLLO ARBITRAL ---

      { path: 'desarrollo-arbitral/aaab-tv', name: 'AaabTvAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/AaabTvAdmin.vue'), meta: { modulo: 'desarrollo' } },
      { path: 'desarrollo-arbitral/observaciones', name: 'ObservacionesAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ObservacionesAdmin.vue'), meta: { modulo: 'desarrollo' } },
      { path: 'desarrollo-arbitral/reuniones-mensuales', name: 'ReunionesAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ReunionesAdmin.vue'), meta: { modulo: 'desarrollo' } },
      { path: 'desarrollo-arbitral/resumen-arbitros', name: 'ResumenArbitrosAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/PlanillaGeneralAdmin.vue'), meta: { modulo: 'desarrollo' } },
      { path: 'desarrollo-arbitral/habilitacion-examenes-asamblea', name: 'HabilitacionExamenesAsamblea', component: () => import('../components/panel-admin/desarrollo-arbitral/HabilitacionExamenesAsamblea.vue'), meta: { modulo: 'desarrollo' } },
      { path: 'desarrollo-arbitral/planilla-general-observaciones', name: 'PlanillaGeneralObservaciones', component: () => import('../components/panel-admin/desarrollo-arbitral/PlanillaGeneralObservacionesAdmin.vue'), meta: { modulo: 'desarrollo' } },

      // --- CURSOS ---

      { path: 'curso-arbitros/legajos-curso', name: 'LegajosCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/LegajosCursoAdmin.vue'), meta: { modulo: 'curso' }},
      { path: 'curso-arbitros/observaciones-curso', name: 'ObservacionesCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/ObservacionesCursoAdmin.vue'), meta: { modulo: 'curso' }},
      { path: 'curso-arbitros/alumnos-regulares', name: 'AlumnosRegularesCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/AlumnosRegularesCursoAdmin.vue'), meta: { modulo: 'curso' }},
      { path: 'curso-arbitros/encuentros-mini', name: 'EncuentrosMiniCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/EncuentrosMiniCursoAdmin.vue'), meta: { modulo: 'curso' }},
      { path: 'curso-arbitros/cronograma', name: 'CronogramaCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/CronogramaCursoAdmin.vue'), meta: { modulo: 'curso' }},
      { path: 'curso-arbitros/examenes-curso', name: 'ExamenesCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/ExamenesCursoAdmin.vue'), meta: { modulo: 'curso' }},


    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const estaLogueado = auth.isLoggedIn();
  const user = auth.getUser();
  const userRole = user?.rol;
  const esAutoridad = !!user?.esAutoridad

  // En la app instalada no hay menú del sitio web: cualquier página pública (Home, Descargas, etc.)
  // lleva al panel, o al login si todavía no se inició sesión
  if (esAppInstalada() && !to.path.startsWith('/panel-') && !PUBLICAS_EN_APP.includes(to.name)) {
    return next(estaLogueado ? rutaPanel(user) : '/login-arbitro')
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!estaLogueado) {
      return next('/login-arbitro');
    }

    // Los alumnos del curso solo usan su panel
    if (userRole === 'alumno_curso' && !to.path.startsWith('/panel-curso')) {
      return next('/panel-curso');
    }

    if (to.path.startsWith('/panel-arbitro') && esAutoridad) {
      return next('/panel-admin');
    }

    if (to.matched.some(record => record.meta.soloAutoridad) && !esAutoridad) {
      return next('/panel-arbitro')
    }

    const matchedRecord = [...to.matched].reverse().find(record => record.meta.roles);
    const rolesPermitidos = matchedRecord ? matchedRecord.meta.roles : null;

    // Se compara como texto: el rol puede venir como número o como string según el endpoint
    const idsPermitidos = [...to.matched].reverse().find(record => record.meta.idsPermitidos)?.meta.idsPermitidos
    const rolValido = !rolesPermitidos || rolesPermitidos.some(rol => String(rol) === String(userRole))
    const idValido = !idsPermitidos || idsPermitidos.some(id => String(id) === String(user?.id))

    if (!rolValido || !idValido) {
      return esAutoridad ? next('/panel-admin') : next('/panel-arbitro');
    }

    const moduloRequerido = [...to.matched].reverse().find(record => record.meta.modulo)?.meta.modulo
    if (moduloRequerido) {
      const { cargarPermisos, tienePermiso } = usePermisos()
      await cargarPermisos()
      if (!tienePermiso(moduloRequerido)) return next('/panel-admin')
    }

    next();
  } else {
    next();
  }
});

// Tema claro/oscuro: solo dentro de los paneles; las páginas públicas quedan con sus colores
router.afterEach((to) => setRutaActual(to.path))

export default router;
