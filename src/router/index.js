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
    component: () => import('../views/PanelArbitro.vue'),
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('user_aaab')) next();
      else next('/login-arbitro');
    },
    children: [
      {
        path: '', 
        name: 'PanelInicio',
        component: () => import('../components/panel/InicioPanel.vue')
      },
      {
        path: 'licencia', 
        name: 'PanelLicencia',
        component: () => import('../components/panel/SolicitarLicencia.vue')
      },
      {
        path: 'datos', 
        name: 'PanelDatos',
        component: () => import('../components/panel/MisDatos.vue')
      },
      {
        path: 'disponibilidad',
        name: 'PanelDisponibilidad',
        component: () => import('../components/panel/Disponibilidad.vue')
      },
      {
        path: 'sanciones',
        name: 'PanelSanciones',
        component: () => import('../components/panel/Sanciones.vue')
      }
    ]
  }, // <--- Aquí faltaba esta coma
  {
    path: '/gestion-privada-arbitros',
    name: 'AdminArbitros',
    component: () => import('../views/AdminArbitros.vue')
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
  const estaLogueado = !!localStorage.getItem('user_aaab');
  if (to.matched.some(record => record.meta.requiresAuth) && !estaLogueado) {
    next('/login-arbitro');
  } else {
    next();
  }
});

export default router;