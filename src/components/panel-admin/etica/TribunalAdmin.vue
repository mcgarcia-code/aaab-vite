<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="dashboard-header mb-5 text-center text-md-start">
        <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
          <div class="main-icon-container">
            <i class="bi bi-shield-exclamation text-danger"></i>
          </div>
          <div>
            <h4 class="fw-bold text-white m-0">Tribunal de Ética</h4>
            <p class="small text-white opacity-75 m-0">Gestión de medidas disciplinarias y resoluciones oficiales</p>
          </div>
        </div>
      </div>

      <div class="row g-3 g-md-4 justify-content-center w-100 mx-0">
        <div v-for="item in opcionesTribunal" :key="item.title" class="col-12 col-md-6">
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
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Tribunal de Ética | AAAB',
  meta: [
    { name: 'description', content: 'Panel centralizado para la gestión de sanciones y ética profesional.' },
    { property: 'og:title', content: 'Tribunal de Ética | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const opcionesTribunal = [
  { 
    to: '/panel-admin/tribunal/sanciones', 
    title: 'Listado de Sanciones', 
    icon: 'bi bi-journal-text', 
    desc: 'Consultar, editar o dar de baja sanciones vigentes e históricas.' 
  },
  { 
    to: '/panel-admin/tribunal/cargar-sancion', 
    title: 'Cargar Sanción', 
    icon: 'bi bi-shield-plus', 
    desc: 'Registrar una nueva resolución disciplinaria en el legajo del árbitro.' 
  }
];
</script>

<style scoped>
/* ====================================================
   WRAPPERS GENERALES
   ==================================================== */
.full-screen-wrapper { 
  position: relative; 
  width: 99vw; 
  min-height: 100vh; 
  height: auto !important; 
  margin-left: 50%; 
  transform: translateX(-50%); 
  padding: 20px; 
  padding-bottom: 120px; 
}

.admin-panel { 
  width: 100%; 
  max-width: 100%; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif; 
  background-color: #0f172a; 
  min-height: 100vh; 
  padding: 20px;
}

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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Tarjeta Moderna Horizontal (Neo-Bento) */
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
  border-color: #f87171; /* Rojo suave */
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

/* Ajustes Responsive */
@media (max-width: 768px) {
  .dashboard-header { margin-bottom: 30px; }
  .modern-menu-card { padding: 18px; }
  .icon-box { width: 48px; height: 48px; min-width: 48px; font-size: 1.3rem; }
  .card-text h5 { font-size: 1rem; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>

