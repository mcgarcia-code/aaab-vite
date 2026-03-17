/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CarnetView from '../views/CarnetView.vue';
import { auth } from '@/api/auth'; 

const routes = [
  { path: '/', name: 'inicio', component: HomeView },
  { path: '/descargas', name: 'descargas', component: () => import('../views/DescargasView.vue') },
  { path: '/escuela-arbitros', name: 'escuelaArbitros', component: () => import('../views/EscuelaArbitros.vue') },
  { path: '/preguntas-frecuentes', name: 'faq', component: () => import('../views/FaqView.vue') },
  { path: '/designaciones', name: 'designaciones', component: () => import('../views/DesignacionesView.vue') },
  { path: '/tribunal-de-etica', name: 'tribunalEtica', component: () => import('../views/TribunalEticaView.vue') },
  { path: '/sanciones', name: 'sanciones', component: () => import('../views/SancionesView.vue') },
  { path: '/carnet-digital', name: 'carnetDigital', component: CarnetView },
  
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/LoginArbitro.vue'),
    beforeEnter: (to, from, next) => {
      // Si ya tiene sesión activa, lo redirigimos a su panel correspondiente
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
    meta: { requiresAuth: true, role: 'admin' }, // Agregamos meta para control centralizado
    children: [
      { path: '', name: 'AdminInicio', component: () => import('../components/admin/AdminInicio.vue') },
      { path: 'secretaria', component: () => import('../components/admin/SecretariaAdmin.vue') },
      { path: 'tribunal', component: () => import('../components/admin/TribunalAdmin.vue') },
      { path: 'tesoreria', component: () => import('../components/admin/TesoreriaAdmin.vue') },
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

// Guard Global: Centraliza toda la protección de rutas
router.beforeEach((to, from, next) => {
  const estaLogueado = auth.isLoggedIn();
  const user = auth.getUser();

  // 1. Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!estaLogueado) {
      next('/login-arbitro');
    } 
    // 2. Verificar si la ruta es exclusiva para admin
    else if (to.matched.some(record => record.meta.role === 'admin')) {
      if (user?.rol === 'admin') {
        next();
      } else {
        next('/panel-arbitro'); // Si no es admin, lo mandamos al panel normal
      }
    } 
    else {
      next();
    }
  } else {
    next();
  }
});

export default router;