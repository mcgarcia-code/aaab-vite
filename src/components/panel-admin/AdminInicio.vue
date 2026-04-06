<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">
    
    <!-- HEADER DE BIENVENIDA -->
    <div class="dashboard-header mb-5">
      <h3 class="text-white">¡Bienvenido al Panel de Gestión!</h3>
      <p class="text-white">Seleccioná un módulo para gestionar la AAAB</p>
    </div>

    <!-- GRILLA DE MENÚ -->
    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-4" v-for="item in filteredMenu" :key="item.title">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
          <div class="modern-card">
            
            <!-- ICONO CON FONDO SUAVE -->
            <div class="icon-box">
              <i :class="item.icon"></i>
            </div>
            
            <!-- TEXTO DE LA TARJETA -->
            <div class="card-body-text">
              <h5 class="card-title">{{ item.title }}</h5>
              <p class="card-desc">{{ item.desc }}</p>
            </div>

            <!-- INDICADOR DE ACCIÓN -->
            <div class="card-arrow">
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
    rolesPermitidos: ['admin', 'secretario', 'designador'] 
  },
  { 
    to: '/panel-admin/tribunal', 
    title: 'Tribunal de Ética', 
    icon: 'bi bi-shield-exclamation', 
    desc: 'Sanciones y resoluciones.',
    rolesPermitidos: ['admin', 'etica', 'secretario'] 
  },
  { 
    to: '/panel-admin/tesoreria', 
    title: 'Tesorería', 
    icon: 'bi bi-cash-stack', 
    desc: 'Contabilidad y stock de ropa.',
    rolesPermitidos: ['admin', 'tesorero'] 
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
    rolesPermitidos: ['admin', 'secretario', 'facturacion'] 
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
/* Estilos del Header */
.dashboard-header h3 {
  font-size: 1.75rem;
  letter-spacing: -0.5px;
}

/* Tarjeta Moderna Horizontal */
.modern-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

/* Caja de Icono */
.icon-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #f8fafc; /* Gris muy claro */
  color: #dc2626;      /* Rojo AAAB */
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

/* Contenido de texto */
.card-body-text {
  flex: 1;
}

.card-title {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a; /* Azul muy oscuro casi negro */
}

.card-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b; /* Gris intermedio */
  line-height: 1.4;
}

/* Flecha derecha */
.card-arrow {
  color: #cbd5e1;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

/* --- EFECTOS INTERACTIVOS (HOVER) --- */

.modern-card:hover {
  border-color: #f87171; /* Rojo suave */
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}

.modern-card:hover .icon-box {
  background: #dc2626;
  color: #ffffff;
  transform: scale(1.1) rotate(-5deg);
}

.modern-card:hover .card-arrow {
  color: #dc2626;
  transform: translateX(5px);
}

/* Responsive */
@media (max-width: 768px) {
  .modern-card {
    padding: 20px;
  }
  .icon-box {
    width: 48px;
    height: 48px;
    min-width: 48px;
    font-size: 1.2rem;
  }
}
</style>