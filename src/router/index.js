/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
// 1. Importación estática para carga instantánea
import CarnetView from '../views/CarnetView.vue';
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
  // --- NUEVA RUTA ESCUELA DE ARBITROS ---
  {
    path: '/escuela-arbitros',
    name: 'escuelaArbitros',
    component: () => import('../views/EscuelaArbitros.vue'),
  },
  // --------------------------------------
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
    path: '/carnet-digital',
    name: 'carnetDigital',
    // 2. Usamos el componente importado directamente
    component: CarnetView,
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
        redirect: { name: 'arbitroPerfil' },
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

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
