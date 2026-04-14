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
  background: white; border-radius: 20px;
  padding: 20px; display: flex; align-items: center; gap: 16px;
  border: 1px solid #f1f5f9; transition: all 0.3s ease; height: 100%;
}

.icon-box {
  width: 52px; height: 52px; min-width: 52px;
  background: #fef2f2; color: #dc2626;
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
}

.card-text { flex: 1; }
.card-text h5 { font-size: 1.05rem; color: #1e293b; margin: 0; }
.extra-small { font-size: 0.8rem; line-height: 1.3; }
.card-arrow { color: #cbd5e1; font-size: 1.2rem; }

.modern-menu-card:hover {
  transform: translateY(-5px); border-color: #fca5a5;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

@media (max-width: 768px) {
  .modern-menu-card { padding: 8px 24px; }
  .dashboard-header { margin-bottom: 30px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>