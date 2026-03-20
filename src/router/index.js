/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { auth } from '@/api/auth'; 

const routes = [
  { path: '/', name: 'inicio', component: HomeView },
  { path: '/descargas', name: 'descargas', component: () => import('../views/DescargasView.vue') },
  { path: '/escuela-arbitros', name: 'escuelaArbitros', component: () => import('../views/EscuelaArbitros.vue') },
  { path: '/preguntas-frecuentes', name: 'faq', component: () => import('../views/FaqView.vue') },
  { path: '/designaciones', name: 'designaciones', component: () => import('../views/DesignacionesView.vue') },
  { path: '/tribunal-de-etica', name: 'tribunalEtica', component: () => import('../views/TribunalEticaView.vue') },
  { path: '/sanciones', name: 'sanciones', component: () => import('../views/SancionesView.vue') },
    
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/LoginArbitro.vue'),
    beforeEnter: (to, from, next) => {
      if (auth.isLoggedIn()) {
        const user = auth.getUser();
        const rolesStaff = ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'observador'];
        rolesStaff.includes(user?.rol) ? next('/admin') : next('/panel-arbitro');
      } else {
        next();
      }
    }
  },
  
  {
    path: '/panel-arbitro',
    component: () => import('../views/PanelArbitro.vue'),
    meta: { requiresAuth: true }, 
    children: [
      { path: '', name: 'PanelInicio', component: () => import('../components/panel/InicioPanel.vue') },
      { path: 'licencia', name: 'PanelLicencia', component: () => import('../components/panel/SolicitarLicencia.vue') },
      { path: 'datos', name: 'PanelDatos', component: () => import('../components/panel/MisDatos.vue') },
      { path: 'disponibilidad', name: 'PanelDisponibilidad', component: () => import('../components/panel/PanelDisponibilidad.vue') },
      { path: 'sanciones', name: 'PanelSanciones', component: () => import('../components/panel/Sanciones.vue') },
      { path: 'credencial', name: 'PanelCredencial', component: () => import('../components/panel/CredencialDigital.vue') },  
    ]
  },

  {    
    path: '/admin',
    component: () => import('../views/AdminPanel.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'secretario', 'etica', 'tesorero', 'designador', 'coordinador general', 'observador'] }, 
    children: [
      { 
        path: '', 
        name: 'AdminInicio', 
        component: () => import('../components/admin/AdminInicio.vue') 
      },
      { 
        path: 'secretaria', 
        name: 'SecretariaAdmin', 
        component: () => import('../components/admin/SecretariaAdmin.vue'),
        meta: { roles: ['admin', 'secretario', 'designador'] } 
      },
            { 
              path: 'secretaria/modificacion-datos', 
              name: 'MoficacionDatos', 
              component: () => import('../components/admin/ModificacionDatos.vue'),
              meta: { roles: ['admin', 'secretario'] }
            },
            { 
              path: 'secretaria/licencias', 
              name: 'LicenciasAdmin', 
              component: () => import('../components/admin/LicenciasAdmin.vue'),
              meta: { roles: ['admin', 'secretario'] }
            },
      { 
        path: 'tribunal', 
        name: 'TribunalAdmin', 
        component: () => import('../components/admin/TribunalAdmin.vue'),
        meta: { roles: ['admin', 'etica', 'secretario'] } 
      },
      { 
        path: 'tesoreria', 
        name: 'TesoreriaAdmin', 
        component: () => import('../components/admin/TesoreriaAdmin.vue'),
        meta: { roles: ['admin', 'tesorero'] } 
      },
      { 
        path: 'observaciones', 
        name: 'ObservacionesAdmin', 
        component: () => import('../components/admin/ObservacionesAdmin.vue'),
        meta: { roles: ['admin', 'observador', 'coordinador general','secretario'] } 
      }
    ]
  }, 
  
  {
    path: '/designaciones-aaab',
    name: 'Designaciones',
    component: () => import('../views/DesignacionesAdmin.vue')
  },
  {
    path: '/contactos-celulares',
    name: 'ContactosCelulares',
    component: () => import('../views/ContactosCelularesView.vue')
  },
  {
    path: '/instituciones-cuit',
    name: 'InstitucionesCuit',
    component: () => import('../views/InstitucionesCuit.vue')
  },
  {
    path: '/coordinadores-base',
    name: 'CoordinadoresBase',
    component: () => import('../views/CoordinadoresDatosView.vue')
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
      return next('/admin');
    }

    const matchedRecord = [...to.matched].reverse().find(record => record.meta.roles);
    const rolesPermitidos = matchedRecord ? matchedRecord.meta.roles : null;

    if (rolesPermitidos) {
      if (rolesPermitidos.includes(userRole)) {
        next();
      } else {
        rolesStaff.includes(userRole) ? next('/admin') : next('/panel-arbitro');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;