<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    
    <!-- HEADER DEL MÓDULO -->
    <div class="dashboard-header mb-5 text-center text-md-start">
      <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
        <div class="main-icon-container">
          <i class="bi bi-calendar4-week text-danger"></i>
        </div>
        <div>
          <h2 class="fw-bold text-white m-0">Designaciones</h2>
          <p class="small text-white opacity-75 m-0">Disponibilidad, partidos y licencias</p>
        </div>
      </div>
    </div>

    <!-- GRILLA DE OPCIONES (ESTILO NEO-BENTO HORIZONTAL - FORMATO DE 3) -->
    <div class="row g-3 g-md-4 justify-content-center">
      <div v-for="item in opcionesDesignaciones" :key="item.title" class="col-12 col-md-6 col-xl-4">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card shadow-sm">
            
            <!-- ICONO CON FONDO SUAVE -->
            <div class="icon-box">
              <i :class="item.icon"></i>
            </div>
            
            <!-- TEXTO DE LA TARJETA -->
            <div class="card-text">
              <h5 class="fw-bold mb-1">{{ item.title }}</h5>
              <p class="extra-small m-0 text-muted">{{ item.desc }}</p>
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
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Administra y controla los aspectos internos de la asociación desde un panel centralizado.' },
    { property: 'og:title', content: 'Designaciones | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const opcionesDesignaciones = [
  { 
    to: '/panel-admin/designaciones/disponibilidad-licencias', 
    title: 'Disponibilidad y Licencias', 
    icon: 'bi bi-calendar-date-fill', 
    desc: 'Chequear disponibilidad y licencias de árbitros.' 
  },
];
</script>

<style scoped>
/* Icono Principal del Header */
.main-icon-container {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tarjeta Moderna Horizontal (Neo-Bento) */
.modern-menu-card {
  background: white;
  border-radius: 20px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.icon-box {
  width: 52px;
  height: 52px;
  min-width: 52px;
  background: #fef2f2; /* Rojo muy suave */
  color: #dc2626;      /* Rojo AAAB */
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.card-text {
  flex: 1;
}

.card-text h5 {
  font-size: 1.05rem;
  color: #1e293b;
  margin: 0;
}

.extra-small {
  font-size: 0.8rem;
  line-height: 1.3;
}

.card-arrow {
  color: #cbd5e1;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

/* --- EFECTOS HOVER --- */
.modern-menu-card:hover {
  transform: translateY(-5px);
  border-color: #fca5a5;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
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

/* Ajustes Responsive */
@media (max-width: 768px) {
  .dashboard-header { margin-bottom: 30px; }
  .modern-menu-card { padding: 18px; }
  .icon-box { width: 48px; height: 48px; min-width: 48px; font-size: 1.3rem; }
  .card-text h5 { font-size: 1rem; }
}
</style>



