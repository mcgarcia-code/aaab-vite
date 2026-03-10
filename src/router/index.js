/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CarnetView from '../views/CarnetView.vue';

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
    path: '/escuela-arbitros',
    name: 'escuelaArbitros',
    component: () => import('../views/EscuelaArbitros.vue'),
  },
  {
    path: '/preguntas-frecuentes',
    name: 'faq',
    component: () => import('../views/FaqView.vue')
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
    path: '/carnet-digital',
    name: 'carnetDigital',
    component: CarnetView,
  },
  {
    path: '/login-arbitro',
    name: 'LoginArbitro',
    component: () => import('../views/LoginArbitro.vue'),
    // Si ya está logueado, lo mandamos al panel
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user_aaab')) {
        next('/panel-arbitro');
      } else {
        next();
      }
    }
  },
  {
    path: '/panel-arbitro',
    name: 'PanelArbitro',
    component: () => import('../views/PanelArbitro.vue'),
    beforeEnter: (to, from, next) => {
      const user = localStorage.getItem('user_aaab');
      if (user) {
        next();
      } else {
        next('/login-arbitro');
      }
    }
  },
  {
    path: '/gestion-privada-arbitros',
    name: 'AdminArbitros',
    component: () => import('../views/AdminArbitros.vue')
  },
  
  /* ESTA SECCIÓN NO SE USA POR EL MOMENTO
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
  */
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 };
  },
});

// Guardia global para rutas con meta: { requiresAuth: true }
router.beforeEach((to, from, next) => {
  const estaLogueado = !!localStorage.getItem('user_aaab');

  if (to.matched.some(record => record.meta.requiresAuth) && !estaLogueado) {
    next('/login-arbitro');
  } else {
    next();
  }
});

export default router;