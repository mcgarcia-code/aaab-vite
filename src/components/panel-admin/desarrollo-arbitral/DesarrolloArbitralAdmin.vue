<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Cabecera del Dashboard -->
    <div class="dashboard-header mb-5 text-start">
      <div class="d-flex align-items-center justify-content-start gap-3">
        <div class="main-icon-container">
          <!-- Ícono principal actualizado para Desarrollo Arbitral -->
          <i class="bi bi-graph-up-arrow text-danger"></i>
        </div>
        <div>
          <h4 class="fw-bold text-white m-0">Desarrollo Arbitral</h4>
          <p class="small text-white opacity-75 m-0">Seguimiento, evaluaciones y rendimiento</p>
        </div>
      </div>
    </div>

    <!-- Contenedor de Tarjetas -->
    <div class="row g-3 g-md-4">
      <div v-for="item in opcionesDesarrollo" :key="item.title" class="col-12 col-md-6">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card shadow-sm">

            <div class="icon-box">
              <i :class="item.icon"></i>
            </div>

            <div class="card-text">
              <h5 class="fw-bold mb-1">{{ item.title }}</h5>
              <p class="extra-small m-0 text-muted">{{ item.desc }}</p>
            </div>

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
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

// Actualización de Meta Tags
useHead({
  title: 'Desarrollo Arbitral | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de observaciones y exámenes de árbitros.' }
  ],
});

// Array actualizado con las 2 tarjetas requeridas
const opcionesDesarrollo = [
  {
    to: '/panel-admin/desarrollo-arbitral/observaciones', // Puedes ajustar esta ruta
    title: 'Observaciones realizadas',
    icon: 'bi bi-clipboard-data-fill',
    desc: 'Registro y seguimiento de las observaciones arbitrales.'
  },
  {
    to: '/panel-admin/desarrollo-arbitral/examenes', // Puedes ajustar esta ruta
    title: 'Exámenes generales',
    icon: 'bi bi-journal-check',
    desc: 'Administración de resultados y exámenes teóricos/físicos.'
  }
];
</script>

<style scoped>
/* ====================================================
   ESTILOS DE LA CABECERA
   ==================================================== */
.main-icon-container {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ====================================================
   TARJETAS DE NAVEGACIÓN
   ==================================================== */
.modern-menu-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 15px;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

.icon-box {
  width: 52px;
  height: 52px;
  min-width: 52px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.card-text {
  flex: 1;
  min-width: 0;
}

.card-text h5 {
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0;
}

.extra-small {
  font-size: 0.85rem;
  line-height: 1.3;
}

.card-arrow {
  color: #cbd5e1;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

/* --- EFECTOS HOVER --- */
.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}

.modern-menu-card:hover .icon-box {
  background: #dc2626;
  color: white;
  transform: scale(1.05);
}

.modern-menu-card:hover .card-arrow {
  color: #dc2626;
  transform: translateX(4px);
}

/* ====================================================
   📱 RESPONSIVE DESIGN
   ==================================================== */
@media (max-width: 768px) {
  .modern-menu-card {
    padding: 18px;
    min-height: 120px;
  }
  .dashboard-header { margin-bottom: 30px !important; }
  .icon-box { width: 48px; height: 48px; min-width: 48px; font-size: 1.3rem; }

  .dashboard-header h4 { font-size: 1.25rem !important; }
  .dashboard-header p { font-size: 0.85rem !important; }
}

.animate__animated { animation-duration: 0.5s; }
</style>
