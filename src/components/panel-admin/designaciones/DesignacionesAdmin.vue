<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="dashboard-header mb-5 text-start">
        <div class="d-flex align-items-center justify-content-start gap-3">
          <div class="main-icon-container">
            <i class="bi bi-calendar4-week text-danger"></i>
          </div>
          <div>
            <h4 class="fw-bold text-white m-0">Designaciones</h4>
            <p class="small text-white opacity-75 m-0">Disponibilidad, partidos y licencias</p>
          </div>
        </div>
      </div>

      <div class="row g-3 g-md-4 justify-content-start w-100 mx-0">
        <div v-for="item in opcionesDesignaciones" :key="item.title" class="col-12 col-md-6">
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
  title: 'Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de disponibilidad y licencias.' }
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

/* Tarjeta Moderna Horizontal */
.modern-menu-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  height: 100%;
  min-height: 115px; /* Misma proporción que los otros menús */
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

/* --- PAGINACIÓN (Estilos pedidos) --- */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

/* Ajustes Responsive */
@media (max-width: 768px) {
  .modern-menu-card { 
    padding: 18px; 
    min-height: 120px; /* Tamaño uniforme para mobile */
  }
  .dashboard-header { margin-bottom: 30px; }
  .icon-box { width: 48px; height: 48px; min-width: 48px; font-size: 1.3rem; }
  
  /* Fuentes específicas para móvil */
  .dashboard-header h4 { font-size: 1.25rem !important; }
  .dashboard-header p { font-size: 0.85rem !important; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>