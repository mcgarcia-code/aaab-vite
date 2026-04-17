<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="dashboard-header mb-5 text-center text-md-start">
      <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
        <div class="main-icon-container">
          <i class="bi bi-eye text-danger"></i>
        </div>
        <div>
          <h4 class="fw-bold text-white m-0">Observaciones</h4>
          <p class="small text-white opacity-75 m-0">Gestioná la carga y visualización de evaluaciones arbitrales</p>
        </div>
      </div>
    </div>

    <div class="row g-3 g-md-4 justify-content-center">
      <div v-for="item in opcionesObservaciones" :key="item.title" class="col-12 col-md-6">
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

useHead({
  title: 'Observaciones | AAAB',
  meta: [
    { name: 'description', content: 'Módulo para cargar y visualizar observaciones.' }
  ],
});

const opcionesObservaciones = [
  {
    to: '/panel-arbitro/observaciones/carga',
    title: 'Cargar Observaciones',
    icon: 'bi bi-cloud-upload',
    desc: 'Registrar nuevas evaluaciones con detalles y categorías.'
  },
  {
    to: '/panel-arbitro/observaciones/mis-observaciones',
    title: 'Mis Observaciones',
    icon: 'bi bi-envelope-check',
    desc: 'Visualizar el historial de observaciones realizadas por vos.'
  }
];
</script>

<style scoped>
/* ====================================================
   1. ESTILOS BASE Y COMPONENTES
   ==================================================== */
.main-icon-container {
  width: 60px; height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; border: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-menu-card {
  background: white;
  border-radius: 16px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.icon-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 16px;
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
.card-text h5 { font-size: 0.95rem; color: #1e293b; }
.extra-small { font-size: 0.75rem; }
.card-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; align-self: center; }

.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}

.modern-menu-card:hover .icon-box { background: #dc2626; color: white; }

/* ====================================================
   2. 📱 RESPONSIVE DESIGN
   ==================================================== */
@media (max-width: 768px) {
  .modern-menu-card { padding: 12px 20px; }
  .dashboard-header { margin-bottom: 30px !important; }
}

.animate__animated { animation-duration: 0.5s; }
</style>
