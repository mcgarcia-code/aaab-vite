/* eslint-disable no-unused-vars */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Vite por defecto llama a la vista de inicio "HomeView"

const routes = [
  {
    path: '/',
    name: 'inicio', // El nombre de la ruta puede seguir siendo "inicio"
    component: HomeView, // Cargamos la página de inicio directamente
  },
  {
    path: '/descargas',
    name: 'descargas',
    // Las demás páginas se cargan con lazy loading
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
  },
]

const router = createRouter({
  // Se actualiza la sintaxis de BASE_URL para Vite
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Esta función ya estaba correcta
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 }
  },
})

export default router
