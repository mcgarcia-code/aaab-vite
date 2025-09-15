/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import store from "../stores/auth";

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: HomeView,
  },
  {
    path: '/descargas',
    name: 'descargas',
    component: () => import('../views/DescargasView.vue'),
  },
  {
    path: '/cursos',
    name: 'cursos',
    component: () => import('../views/CursosView.vue'),
  },
  {
    path: '/designaciones',
    name: 'designaciones',
    component: () => import('../views/DesignacionesView.vue'),
  },
  {
    path: '/tribunal-de-etica',
    name: 'tribunalEtica',
    component: () => import('../views/TribunalEticaView.vue'),
  },
  {
    path: '/sanciones',
    name: 'sanciones',
    component: () => import('../views/SancionesView.vue'),
  },
  {
    path: '/arbitro',
    name: 'arbitro',
    component: () => import('../views/ArbitroView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'designaciones',
        name: 'arbitroDesignaciones',
        component: () => import('../views/arbitro/ArbitroDesignaciones.vue'),
      },
      {
        path: 'licencias',
        name: 'arbitroLicencias',
        component: () => import('../views/arbitro/ArbitroLicencias.vue'),
      },
      {
        path: 'perfil',
        name: 'arbitroPerfil',
        component: () => import('../views/arbitro/ArbitroPerfil.vue'),
      },
      {
        path: '',
        redirect: { name: 'arbitroPerfil' }, // Redirigir /arbitros a /arbitros/perfil
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 };
  },
});

// Guardia de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});
export default router;
