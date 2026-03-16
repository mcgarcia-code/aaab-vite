/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CarnetView from '../views/CarnetView.vue';
// 1. Importamos auth desde la carpeta api
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
      // 2. REEMPLAZO: Si ya está logueado, lo mandamos al panel
      if (auth.isLoggedIn()) {
        next('/panel-arbitro');
      } else {
        next();
      }
    }
  },
  
  {
    path: '/panel-arbitro',
    component: () => import('../views/PanelArbitro.vue'),
    meta: { requiresAuth: true }, // Marcamos que requiere estar logueado
    beforeEnter: (to, from, next) => {
      // 3. REEMPLAZO: Si no está logueado, lo mandamos al login
      if (auth.isLoggedIn()) {
        next();
      } else {
        next('/login-arbitro');
      }
    },
    children: [
      { path: '', name: 'PanelInicio', component: () => import('../components/panel/InicioPanel.vue') },
      { path: 'licencia', name: 'PanelLicencia', component: () => import('../components/panel/SolicitarLicencia.vue') },
      { path: 'datos', name: 'PanelDatos', component: () => import('../components/panel/MisDatos.vue') },
      { path: 'disponibilidad', name: 'PanelDisponibilidad', component: () => import('../components/panel/PanelDisponibilidad.vue') },
      { path: 'sanciones', name: 'PanelSanciones', component: () => import('../components/panel/Sanciones.vue') },  
    ]
    },
{    
    path: '/admin',
    component: () => import('../views/AdminPanel.vue'), // Crearemos este archivo ahora
    beforeEnter: (to, from, next) => {
      const user = auth.getUser();
      if (auth.isLoggedIn() && user.rol === 'admin') next();
      else next('/login-arbitro');
    },
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
  component: () => import('../views/DesignacionesAdmin.vue') // Ajusta la ruta a tu archivo
},
  {
  path: '/contactos-celulares',
  name: 'ContactosCelulares',
  component: () => import('../views/ContactosCelularesView.vue') // Ajusta la ruta a tu archivo
},
{
    path: '/coordinadores-base',
    name: 'CoordinadoresBase',
    component: () => import('../views/CoordinadoresDatosView.vue') // Ajusta la ruta a tu archivo
  }
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 };
  },
});

// Guard Global para proteger rutas marcadas con requiresAuth
router.beforeEach((to, from, next) => {
  // 4. REEMPLAZO: Chequeo centralizado
  const estaLogueado = auth.isLoggedIn();
  
  if (to.matched.some(record => record.meta.requiresAuth) && !estaLogueado) {
    next('/login-arbitro');
  } else {
    next();
  }
});

export default router;