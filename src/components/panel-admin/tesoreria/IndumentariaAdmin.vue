<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">
      
    <div class="dashboard-header mb-5 text-start">
      <div class="d-flex align-items-center justify-content-start gap-3">
        <div class="main-icon-container">
          <i class="bi bi-bag-check text-danger"></i>
        </div>
        <div>
          <h4 class="fw-bold text-white m-0">Gestión de Indumentaria</h4>
          <p class="small text-white opacity-75 m-0">Administración de stock y pedidos de árbitros</p>
        </div>
      </div>
    </div>

    <div class="row g-3 g-md-4">
      
      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/indumentaria/stock" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card shadow-sm">
            <div class="icon-box">
              <i class="bi bi-box-seam"></i>
            </div>
            <div class="card-text">
              <h5 class="fw-bold mb-1">Stock</h5>
              <p class="extra-small m-0 text-muted">Control de talles, ingresos y cantidades disponibles.</p>
            </div>
            <div class="card-arrow">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/indumentaria/pedidos" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card shadow-sm">
            
            <div class="icon-box position-relative">
              <i class="bi bi-list-check"></i>
              <span v-if="pedidosNuevos > 0" class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle animate__animated animate__pulse animate__infinite">
                <span class="visually-hidden">Nuevos pedidos</span>
              </span>
            </div>
            
            <div class="card-text">
              <h5 class="fw-bold mb-1 d-flex align-items-center gap-2 flex-wrap">
                Pedidos Realizados
                <span v-if="pedidosNuevos > 0" class="badge bg-danger rounded-pill px-2 py-1 shadow-sm" style="font-size: 0.65rem;">
                  {{ pedidosNuevos }} NUEVO{{ pedidosNuevos > 1 ? 'S' : '' }}
                </span>
              </h5>
              <p class="extra-small m-0 text-muted">Listado de solicitudes, estados de entrega y pendientes.</p>
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
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';

useHead({
  title: 'Gestión de Indumentaria | AAAB',
  meta: [
    { name: 'description', content: 'Administración de stock y pedidos de indumentaria para árbitros AAAB.' },
    { property: 'og:title', content: 'Gestión de Indumentaria | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

// Variable reactiva para guardar la cantidad de pedidos nuevos
const pedidosNuevos = ref(0);

// Función silenciosa para contar los pedidos en estado "creado"
const cargarNotificaciones = async () => {
  try {
    const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidos' });
    if (res.ok && res.payload) {
      pedidosNuevos.value = res.payload.filter(p => p.estado && p.estado.toLowerCase() === 'creado').length;
    }
  } catch (error) {
    console.error("Error cargando notificaciones:", error);
  }
};

onMounted(() => {
  cargarNotificaciones();
});
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
  backdrop-filter: blur(5px);
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
  .card-text h5 { font-size: 1rem; }
}

.animate__animated { animation-duration: 0.5s; }
</style>