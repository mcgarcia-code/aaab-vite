<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="dashboard-header mb-5 text-center text-md-start">
        <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
          <div class="main-icon-container">
            <i class="bi bi-bag-fill text-danger"></i>
          </div>
          <div>
            <h4 class="fw-bold text-white m-0">Mi Indumentaria</h4>
            <p class="small text-white opacity-75 m-0">Gestioná tu equipamiento oficial de la asociación</p>
          </div>
        </div>
      </div>

      <div class="row g-3 g-md-4 justify-content-center w-100 mx-0">
        
        <div class="col-12 col-md-6">
          <RouterLink to="/panel-arbitro/indumentaria/nuevo" class="text-decoration-none h-100 d-block">
            <div class="modern-menu-card shadow-sm">
              <div class="icon-box">
                <i class="bi bi-cart-plus"></i>
              </div>
              <div class="card-text">
                <h5 class="fw-bold mb-1">Solicitar Indumentaria</h5>
                <p class="extra-small m-0 text-muted">Realizar un nuevo pedido de indumentaria oficial.</p>
              </div>
              <div class="card-arrow">
                <i class="bi bi-chevron-right"></i>
              </div>
            </div>
          </RouterLink>
        </div>

        <div class="col-12 col-md-6">
          <RouterLink to="/panel-arbitro/indumentaria/mis-pedidos" class="text-decoration-none h-100 d-block">
            <div class="modern-menu-card shadow-sm">
              <div class="icon-box">
                <i class="bi bi-list-check"></i>
              </div>
              <div class="card-text">
                <h5 class="fw-bold mb-1">Mis Pedidos</h5>
                <p class="extra-small m-0 text-muted">Consultar el historial y estado de tus solicitudes.</p>
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
import { useHead } from '@vueuse/head'
useHead({
  title: 'Indumentaria | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de indumentaria oficial para los árbitros de la AAAB.' }
  ],
})
</script>

<style scoped>
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
  cursor: pointer; /* <--- ESTA ES LA LÍNEA QUE TENÉS QUE AGREGAR */
}
.icon-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fef2f2;
  color: #dc2626;      /* Rojo AAAB */
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
  border-color: #f87171; /* Rojo suave */
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}

.modern-menu-card:hover .icon-box { background: #dc2626; color: white; }

@media (max-width: 768px) {
  .modern-menu-card { padding: 8px 24px; }
  .dashboard-header { margin-bottom: 30px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>