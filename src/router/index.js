/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/public/HomeView.vue';
import { auth } from '@/api/auth'; 

const routes = [
  { path: '/', name: 'inicio', component: HomeView },
  { path: '/descargas', name: 'descargas', component: () => import('../views/public/DescargasView.vue') },
  { path: '/escuela-arbitros', name: 'escuelaArbitros', component: () => import('../views/public/EscuelaArbitros.vue') },
  { path: '/preguntas-frecuentes', name: 'faq', component: () => import('../views/public/FaqView.vue') },
  { path: '/designaciones', name: 'designaciones', component: () => import('../views/public/DesignacionesView.vue') },
  { path: '/tribunal-de-etica', name: 'tribunalEtica', component: () => import('../views/public/TribunalEticaView.vue') },
  { path: '/sanciones', name: 'sanciones', component: () => import('../views/public/SancionesView.vue') },
    
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/public/LoginArbitro.vue'),
    beforeEnter: (to, from, next) => {
      if (auth.isLoggedIn()) {
        const user = auth.getUser();
        const rolesStaff = ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'observador'];
        rolesStaff.includes(user?.rol) ? next('/panel-admin') : next('/panel-arbitro');
      } else {
        next();
      }
    }
  },
  
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
      { path: 'ref-flix', name: 'PanelRefFlix', beforeEnter() { window.location.href = 'https://refflix.com.ar' }},
      // --- OBSERVACIONES ---
      { 
        path: 'observaciones', 
        name: 'Observaciones',
        component: () => import('../components/panel-arbitro/observadores/ObservacionesPanel.vue'),
        meta: { roles: ['observador', 'coordinador'] }
      },
      { 
        path: 'observaciones/carga', 
        name: 'ObservacionesCarga', 
        component: () => import('../components/panel-arbitro/observadores/CargaObservaciones.vue'),
        meta: { roles: ['observador', 'coordinador'] }
      },
      { 
        path: 'observaciones/mis-observaciones', 
        name: 'ObservacionesMias', 
        component: () => import('../components/panel-arbitro/observadores/MisObservaciones.vue'),
        meta: { roles: ['observador', 'coordinador'] } 
      },
       // --- OBSERVACIONES ---
      { path: 'indumentaria', name: 'PanelIndumentaria', component: () => import('../components/panel-arbitro/indumentaria/IndumentariaArbitro.vue') },
      
      { 
        path: 'indumentaria/nuevo', 
        name: 'RealizarPedido', 
        component: () => import('../components/panel-arbitro/indumentaria/RealizarPedido.vue') 
      },
      { 
        path: 'indumentaria/mis-pedidos', 
        name: 'MisPedidos', 
        component: () => import('../components/panel-arbitro/indumentaria/MisPedidos.vue') 
      },
    
    ]
  },

{    
    path: '/panel-admin',
    component: () => import('../components/panel-admin/AdminPanel.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'observador'] }, 
    children: [
      { 
        path: '', 
        name: 'AdminInicio', 
        component: () => import('../components/panel-admin/AdminInicio.vue') 
      },

      // --- SECRETARÍA ---
      { 
        path: 'secretaria', 
        name: 'SecretariaAdmin', 
        component: () => import('../components/panel-admin/secretaria/SecretariaAdmin.vue'),
        meta: { roles: ['admin', 'secretario', 'designador'] } 
      },
      { 
        path: 'secretaria/modificacion-datos', 
        name: 'LegajosPersonales', 
        component: () => import('../components/panel-admin/secretaria/LegajosPersonales.vue'),
        meta: { roles: ['admin', 'secretario'] }
      },
      { 
        path: 'secretaria/licencias', 
        name: 'LicenciasAdmin', 
        component: () => import('../components/panel-admin/secretaria/LicenciasAdmin.vue'),
        meta: { roles: ['admin', 'secretario'] }
      },
      { 
        path: 'secretaria/instituciones-cuits', 
        name: 'InstitucionesCuits', 
        component: () => import('../components/panel-admin/secretaria/InstitucionesCuits.vue'),
        meta: { roles: ['admin', 'secretario'] }
      },
      
      { 
        path: 'secretaria/eventos-notificaciones', 
        name: 'GestionEventos', 
        component: () => import('../components/panel-admin/secretaria/GestionEventos.vue'),
        meta: { roles: ['admin', 'secretario'] }
      },

      // --- TRIBUNAL ---
      { 
        path: 'tribunal', 
        name: 'TribunalAdmin',
        component: () => import('../components/panel-admin/etica/TribunalAdmin.vue'),
        meta: { roles: ['admin', 'etica', 'secretario'] }
      },
      { 
        path: 'tribunal/sanciones', 
        name: 'TribunalSanciones', 
        component: () => import('../components/panel-admin/etica/SancionesListado.vue'),
        meta: { roles: ['admin', 'etica', 'secretario'] }
      },
      { 
        path: 'tribunal/cargar-sancion', 
        name: 'TribunalCargar', 
        component: () => import('../components/panel-admin/etica/CargarSanciones.vue'),
        meta: { roles: ['admin', 'etica', 'secretario'] }
      },

      // --- TESORERÍA ---
      { 
        path: 'tesoreria', 
        name: 'TesoreriaAdmin',
        component: () => import('../components/panel-admin/tesoreria/TesoreriaAdmin.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
      { 
        path: 'tesoreria/datos-personales', 
        name: 'DatosPersonales', 
        component: () => import('../components/panel-admin/tesoreria/DatosPersonales.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
      { 
        path: 'tesoreria/aportes', 
        name: 'TesoreriaAportes', 
        component: () => import('../components/panel-admin/tesoreria/Aportes.vue'),
        meta: { roles: ['admin', 'tesorero'] } 
      },
      { 
        path: 'tesoreria/indumentaria', 
        name: 'TesoreriaIndumentaria',
        component: () => import('../components/panel-admin/tesoreria/IndumentariaAdmin.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
      { 
        path: 'tesoreria/indumentaria/stock', 
        name: 'IndumentariaStock', 
        component: () => import('../components/panel-admin/tesoreria/StockIndumentaria.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
      { 
        path: 'tesoreria/indumentaria/pedidos', 
        name: 'IndumentariaPedidos', 
        component: () => import('../components/panel-admin/tesoreria/PedidosRealizados.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
    
    ]
  },
  
  {
    path: '/designaciones-aaab',
    name: 'Designaciones',
    component: () => import('../components/panel-admin/designaciones/DesignacionesAdmin.vue')
  },
  {
    path: '/contactos-celulares',
    name: 'ContactosCelulares',
    component: () => import('../views/public/ContactosCelularesView.vue')
  },
  {
    path: '/instituciones-cuit',
    name: 'InstitucionesCuit',
    component: () => import('../views/public/InstitucionesCuit.vue')
  },
  {
    path: '/coordinadores-base',
    name: 'CoordinadoresBase',
    component: () => import('../views/public/CoordinadoresDatosView.vue')
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

  const rolesStaff = ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'observador'];

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