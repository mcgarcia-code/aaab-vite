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
        user?.rol === 'admin' ? next('/admin') : next('/panel-arbitro');
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
    meta: { requiresAuth: true, role: 'admin' }, 
    children: [
      { 
        path: '', 
        name: 'AdminInicio', 
        component: () => import('../components/admin/AdminInicio.vue') 
      },
      { 
        path: 'secretaria', 
        name: 'AdminSecretaria', 
        component: () => import('../components/admin/SecretariaAdmin.vue') 
      },
      { 
        path: 'tribunal', 
        name: 'AdminTribunal', 
        component: () => import('../components/admin/TribunalAdmin.vue') 
      },
      { 
        path: 'tesoreria', 
        name: 'AdminTesoreria', 
        component: () => import('../components/admin/TesoreriaAdmin.vue') 
      },
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

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!estaLogueado) {
      next('/login-arbitro');
      return;
    } 

    // REDIRECCIÓN LÓGICA: Si es admin y va a la ruta de árbitros, lo mandamos a /admin
    if (to.path.startsWith('/panel-arbitro') && user?.rol === 'admin') {
      next('/admin');
      return;
    }

    if (to.matched.some(record => record.meta.role === 'admin')) {
      if (user?.rol === 'admin') {
        next();
      } else {
        next('/panel-arbitro');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;