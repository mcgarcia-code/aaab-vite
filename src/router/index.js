/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/public/HomeView.vue';
import { auth } from '@/api/auth';

// --- PUBLIC ---
const routes = [
  { path: '/', name: 'inicio', component: HomeView },
  { path: '/descargas', name: 'descargas', component: () => import('../views/public/DescargasView.vue') },
  { path: '/escuela-arbitros', name: 'escuelaArbitros', component: () => import('../views/public/EscuelaArbitros.vue') },
  { path: '/preguntas-frecuentes', name: 'faq', component: () => import('../views/public/FaqView.vue') },
  { path: '/designaciones', name: 'designaciones', component: () => import('../views/public/DesignacionesView.vue') },
  { path: '/tribunal-de-etica', name: 'tribunalEtica', component: () => import('../views/public/TribunalEticaView.vue') },
  { path: '/sanciones', name: 'sanciones', component: () => import('../views/public/SancionesView.vue') },
  { path: '/contactos-celulares', name: 'ContactosCelulares', component: () => import('../views/public/ContactosCelularesView.vue') },
  { path: '/coordinadores-base', name: 'CoordinadoresBase', component: () => import('../views/public/CoordinadoresDatosView.vue') },

  // --- LOGIN & RECUPERACIÓN DE CLAVE ---
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/public/LoginArbitro.vue'),
    beforeEnter: (to, from, next) => {
      if (auth.isLoggedIn()) {
        const user = auth.getUser();
        const rolesStaff = ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'facturacion', 'curso'];
        rolesStaff.includes(user?.rol) ? next('/panel-admin') : next('/panel-arbitro');
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
      { path: '', name: 'PanelInicio', component: () => import('../components/panel-arbitro/InicioPanel.vue') },
      { path: 'licencia', name: 'PanelLicencia', component: () => import('../components/panel-arbitro/licencias/SolicitarLicencia.vue') },
      { path: 'datos', name: 'PanelDatos', component: () => import('../components/panel-arbitro/datos-personales/MisDatos.vue') },
      { path: 'disponibilidad', name: 'PanelDisponibilidad', component: () => import('../components/panel-arbitro/disponibilidad/PanelDisponibilidad.vue') },
      { path: 'sanciones', name: 'PanelSanciones', component: () => import('../components/panel-arbitro/sanciones/Sanciones.vue') },
      { path: 'credencial', name: 'PanelCredencial', component: () => import('../components/panel-arbitro/credencial/CredencialDigital.vue') },
      { path: 'rendimiento', name: 'PanelRendimiento', component: () => import('../components/panel-arbitro/rendimiento/MiRendimiento.vue') },
      { path: 'aportes', name: 'PanelAportes', component: () => import('../components/panel-arbitro/tesoreria/MisAportes.vue') },
      { path: 'ref-flix', name: 'PanelRefFlix', beforeEnter() { window.location.href = 'https://refflix.com.ar' } },
      { path: 'observaciones', name: 'Observaciones', component: () => import('../components/panel-arbitro/observadores/ObservacionesPanel.vue') },
      { path: 'observaciones/carga', name: 'ObservacionesCarga', component: () => import('../components/panel-arbitro/observadores/CargaObservaciones.vue') },
      { path: 'observaciones/mis-observaciones', name: 'ObservacionesMias', component: () => import('../components/panel-arbitro/observadores/MisObservaciones.vue') },
      { path: 'observaciones/observaciones-mini', name: 'ObservacionesMini', component: () => import('../components/panel-arbitro/observadores/ObservacionesMini.vue') },
      { path: 'coordinadores', name: 'PanelCoordinadores', component: () => import('../components/panel-arbitro/coordinadores/CoordinadoresAdmin.vue') },
      { path: 'indumentaria', name: 'PanelIndumentaria', component: () => import('../components/panel-arbitro/indumentaria/IndumentariaArbitro.vue') },
      { path: 'indumentaria/nuevo', name: 'RealizarPedido', component: () => import('../components/panel-arbitro/indumentaria/RealizarPedido.vue') },
      { path: 'indumentaria/mis-pedidos', name: 'MisPedidos', component: () => import('../components/panel-arbitro/indumentaria/MisPedidos.vue') },
      { path: 'facturacion', name: 'InstitucionesCuit', component: () => import('../components/panel-arbitro/facturacion/InstitucionesCuit.vue') },
      { path: 'historial-notificaciones', name: 'HistorialNotificacionesArbitro', component: () => import('../components/panel-arbitro/notificaciones/HistorialNotificaciones.vue') },
      { path: 'delegado-tecnico', name: 'DelegadoTecnico', component: () => import('../components/panel-arbitro/delegado-tecnico/DelegadosTecnicos.vue') }
    ]
  },

    // --- PANEL CURSO ---
  {
    path: '/panel-curso',
    component: () => import('../components/panel-curso/PanelCurso.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'PanelInicioCurso', component: () => import('../components/panel-curso/InicioPanelCurso.vue') },
      { path: 'datos-curso', name: 'PanelDatosCurso', component: () => import('../components/panel-curso/datos-personales-curso/MisDatosCurso.vue') },
      { path: 'credencial-curso', name: 'PanelCredencialCurso', component: () => import('../components/panel-curso/credencial-curso/CredencialDigitalCurso.vue') },
      { path: 'rendimiento-curso', name: 'PanelRendimientoCurso', component: () => import('../components/panel-curso/rendimiento-curso/MiRendimientoCurso.vue') },
      { path: 'cuota-curso', name: 'CuotaCurso', component: () => import('../components/panel-curso/tesoreria/CuotaCurso.vue') },
      { path: 'historial-notificaciones', name: 'HistorialNotificacionesCurso', component: () => import('../components/panel-curso/notificaciones-curso/HistorialNotificacionesCurso.vue') },

    ]
  },

  // --- PANEL ADMIN ---
  {
    path: '/panel-admin',
    component: () => import('../components/panel-admin/AdminPanel.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'facturacion', 'curso'] },
    children: [
      { path: '', name: 'AdminInicio', component: () => import('../components/panel-admin/AdminInicio.vue') },

      // --- SECRETARÍA ---
      { path: 'secretaria', name: 'SecretariaAdmin', component: () => import('../components/panel-admin/secretaria/SecretariaAdmin.vue'), meta: { roles: ['admin', 'secretario', 'designador', 'etica'] } },
      { path: 'secretaria/modificacion-datos', name: 'LegajosPersonales', component: () => import('../components/panel-admin/secretaria/LegajosPersonales.vue'), meta: { roles: ['admin', 'secretario', 'designador', 'etica'] } },
      { path: 'secretaria/licencias', name: 'LicenciasAdmin', component: () => import('../components/panel-admin/secretaria/LicenciasAdmin.vue'), meta: { roles: ['admin', 'secretario', 'designador', 'etica'] } },
      { path: 'secretaria/eventos-notificaciones', name: 'GestionEventos', component: () => import('../components/panel-admin/secretaria/GestionEventos.vue'), meta: { roles: ['admin', 'secretario', 'designador', 'etica'] } },


      // --- DESIGNACIONES ---
      { path: 'designaciones', name: 'DesignacionesAdmin', component: () => import('../components/panel-admin/designaciones/DesignacionesAdmin.vue'), meta: { roles: ['admin', 'secretario', 'designador'] } },
      { path: 'designaciones/disponibilidad-licencias', name: 'DisponibilidadLicencias', component: () => import('../components/panel-admin/designaciones/DisponibilidadLicencias.vue'), meta: { roles: ['admin', 'secretario', 'designador'] } },

      // --- TRIBUNAL ---
      { path: 'tribunal', name: 'TribunalAdmin', component: () => import('../components/panel-admin/etica/TribunalAdmin.vue'), meta: { roles: ['admin', 'etica', 'secretario', 'designador'] } },
      { path: 'tribunal/sanciones', name: 'TribunalSanciones', component: () => import('../components/panel-admin/etica/SancionesListado.vue'), meta: { roles: ['admin', 'etica', 'secretario', 'designador'] } },
      { path: 'tribunal/cargar-sancion', name: 'TribunalCargar', component: () => import('../components/panel-admin/etica/CargarSanciones.vue'), meta: { roles: ['admin', 'etica', 'secretario', 'designador'] } },

      // --- TESORERÍA ---
      { path: 'tesoreria', name: 'TesoreriaAdmin', component: () => import('../components/panel-admin/tesoreria/TesoreriaAdmin.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/datos-personales', name: 'DatosPersonales', component: () => import('../components/panel-admin/tesoreria/DatosPersonales.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/aportes-pagos', name: 'TesoreriaAportes', component: () => import('../components/panel-admin/tesoreria/AportesPagos.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/indumentaria', name: 'TesoreriaIndumentaria', component: () => import('../components/panel-admin/tesoreria/IndumentariaAdmin.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/indumentaria/stock', name: 'IndumentariaStock', component: () => import('../components/panel-admin/tesoreria/StockIndumentaria.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/indumentaria/pedidos', name: 'IndumentariaPedidos', component: () => import('../components/panel-admin/tesoreria/PedidosRealizados.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },
      { path: 'tesoreria/pagos-curso', name: 'PagosCurso', component: () => import('../components/panel-admin/tesoreria/PagosCurso.vue'), meta: { roles: ['admin', 'tesorero', 'secretario', 'designador'] } },

      // --- FACTURACION ---
      { path: 'facturacion', name: 'InstitucionesCuitAdmin', component: () => import('../components/panel-admin/facturacion/InstitucionesCuitAdmin.vue'), meta: { roles: ['admin', 'secretario', 'tesorero', 'facturacion'] } },

      // --- DESARROLLO ARBITRAL ---
      { path: 'desarrollo-arbitral', name: 'DesarrolloArbitralAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/DesarrolloArbitralAdmin.vue'), meta: { roles: ['admin', 'coordinador general', 'secretario'] } },
      { path: 'desarrollo-arbitral/observaciones', name: 'ObservacionesAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ObservacionesAdmin.vue'), meta: { roles: ['admin', 'coordinador general', 'secretario'] } },
      { path: 'desarrollo-arbitral/examenes', name: 'ExamenesGeneralesAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ExamenesGeneralesAdmin.vue'), meta: { roles: ['admin', 'coordinador general', 'secretario'] } },
      { path: 'desarrollo-arbitral/reuniones', name: 'ReunionesAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ReunionesAdmin.vue'), meta: { roles: ['admin', 'coordinador general', 'secretario'] } },
      { path: 'desarrollo-arbitral/resumen-arbitros', name: 'ResumenArbitrosAdmin', component: () => import('../components/panel-admin/desarrollo-arbitral/ResumenArbitrosAdmin.vue'), meta: { roles: ['admin', 'coordinador general', 'secretario'] } },

      // --- CURSOS ---
      { path: 'curso-arbitros', name: 'CursoArbitrosAdmin', component: () => import('../components/panel-admin/curso-arbitros/CursoArbitrosAdmin.vue'), meta: { roles: ['admin', 'secretario', 'curso'] } },
      { path: 'curso-arbitros/legajos-curso', name: 'LegajosCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/LegajosCursoAdmin.vue'), meta: { roles: ['admin', 'secretario', 'curso'] }},
      { path: 'curso-arbitros/observaciones-curso', name: 'ObservacionesCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/ObservacionesCursoAdmin.vue'), meta: { roles: ['admin', 'secretario', 'curso'] }},
      { path: 'curso-arbitros/examenes-curso', name: 'ExamenesCursoAdmin', component: () => import('../components/panel-admin/curso-arbitros/ExamenesCursoAdmin.vue'), meta: { roles: ['admin', 'secretario', 'curso'] }},


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

router.beforeEach((to, from, next) => {
  const estaLogueado = auth.isLoggedIn();
  const user = auth.getUser();
  const userRole = user?.rol;

  const rolesStaff = ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'facturacion', 'curso'];

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!estaLogueado) {
      return next('/login-arbitro');
    }

    if (to.path.startsWith('/panel-arbitro') && rolesStaff.includes(userRole)) {
      return next('/panel-admin');
    }

    const matchedRecord = [...to.matched].reverse().find(record => record.meta.roles);
    const rolesPermitidos = matchedRecord ? matchedRecord.meta.roles : null;

    if (rolesPermitidos) {
      if (rolesPermitidos.includes(userRole)) {
        next();
      } else {
        rolesStaff.includes(userRole) ? next('/panel-admin') : next('/panel-arbitro');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
