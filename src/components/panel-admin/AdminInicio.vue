<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Margen responsivo: mb-4 en móvil, mb-5 en PC -->
    <div class="dashboard-header mb-4 mb-md-5 mt-4 text-center text-md-start">
      <h3 class="text-white fw-bold mb-1 fs-4 fs-md-3" style="letter-spacing: -0.5px;">¡Bienvenido al Panel de Gestión!</h3>
      <p class="text-white opacity-75 m-0 small">Seleccioná un módulo para gestionar la AAAB</p>
    </div>

    <div class="row g-3 g-md-4">
      <div class="col-12 col-sm-6 col-lg-4" v-for="item in filteredMenu" :key="item.title">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">

          <!-- Manejamos padding (p-4 p-md-3) y flexbox nativamente -->
          <div class="modern-card d-flex align-items-center gap-3 p-4 p-md-3 w-100 h-100 bg-white shadow-sm">

            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i :class="item.icon"></i>
            </div>

            <div class="flex-grow-1">
              <h5 class="m-0 fw-bold text-dark fs-6">{{ item.title }}</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.85rem;">{{ item.desc }}</p>
            </div>

            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>

          </div>

        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { auth } from '@/api/auth';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

const user = auth.getUser();
const userRole = user ? user.rol : null;

useHead({
  title: 'Panel de Gestión | AAAB',
});

const menuItems = [
  {
    to: '/panel-admin/secretaria',
    title: 'Secretaría',
    icon: 'bi bi-pc-display-horizontal',
    desc: 'Datos personales y licencias.',
    rolesPermitidos: ['admin', 'secretario', 'designador', 'etica']
  },
  {
    to: '/panel-admin/tribunal',
    title: 'Tribunal de Ética',
    icon: 'bi bi-shield-exclamation',
    desc: 'Sanciones y resoluciones.',
    rolesPermitidos: ['admin', 'etica', 'secretario', 'designador']
  },
  {
    to: '/panel-admin/tesoreria',
    title: 'Tesorería',
    icon: 'bi bi-cash-stack',
    desc: 'Contabilidad y stock de ropa.',
    rolesPermitidos: ['admin', 'tesorero','secretario', 'designador',]
  },
  {
    to: '/panel-admin/designaciones',
    title: 'Designaciones',
    icon: 'bi bi-calendar4-week',
    desc: 'Disponibilidad, licencias y partidos',
    rolesPermitidos: ['admin', 'designador', 'secretario']
  },
  {
    to: '/panel-admin/desarrollo-arbitral',
    title: 'Desarrollo Arbitral',
    icon: 'bi bi-person-workspace',
    desc: 'Capacitaciones y evaluaciones.',
    rolesPermitidos: ['admin', 'coordinador general', 'secretario']
  },
    {
    to: '/panel-admin/facturacion',
    title: 'Facturación',
    icon: 'bi bi-receipt',
    desc: 'Administrar datos fiscales y entidades vinculadas',
    rolesPermitidos: ['admin', 'secretario', 'facturacion', 'tesorero']
  },
];

const filteredMenu = computed(() => {
  return menuItems.filter(item => {
    if (userRole === 'admin') return true;
    return item.rolesPermitidos && item.rolesPermitidos.includes(userRole);
  });
});
</script>

<style scoped>
/* Tarjeta Moderna Horizontal */
.modern-card {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Caja de Icono (Tamaño responsivo automático con clamp) */
.icon-box {
  width: clamp(48px, 10vw, 56px);
  height: clamp(48px, 10vw, 56px);
  background: #fef2f2;
  color: #dc2626; /* Rojo AAAB */
  border-radius: 16px;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  transition: all 0.3s ease;
}

/* Flecha derecha */
.card-arrow {
  transition: all 0.3s ease;
}

/* --- EFECTOS INTERACTIVOS (HOVER) --- */
.modern-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06) !important;
}

.modern-card:hover .icon-box {
  background: #dc2626;
  color: #ffffff;
}

.modern-card:hover .card-arrow {
  color: #dc2626;
  transform: translateX(5px);
}

.animate__animated { animation-duration: 0.5s; }

</style>
