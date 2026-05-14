<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Header con margen responsivo -->
    <div class="dashboard-header mb-4 mb-md-5 mt-4 text-start">
      <div class="d-flex align-items-center justify-content-start gap-3">
        <div class="main-icon-container flex-shrink-0">
          <i class="bi bi-bag-check text-danger"></i>
        </div>
        <div>
          <h4 class="fw-bold text-white m-0 fs-5 fs-md-4">Gestión de Indumentaria</h4>
          <p class="text-white opacity-75 m-0 small">Administración de stock y pedidos de árbitros</p>
        </div>
      </div>
    </div>

    <div class="row g-3 g-md-4">

      <!-- Módulo Stock -->
      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/indumentaria/stock" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 p-4 p-md-3 bg-white w-100 h-100 shadow-sm">

            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-box-seam"></i>
            </div>

            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 1.1rem;">Stock</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.85rem;">Control de talles, ingresos y cantidades disponibles.</p>
            </div>

            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Módulo Pedidos -->
      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/indumentaria/pedidos" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 p-4 p-md-3 bg-white w-100 h-100 shadow-sm">

            <div class="icon-box position-relative flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-list-check"></i>
              <!-- Punto de notificación -->
              <span v-if="pedidosNuevos > 0" class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle animate__animated animate__pulse animate__infinite">
                <span class="visually-hidden">Nuevos pedidos</span>
              </span>
            </div>

            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark d-flex align-items-center gap-2 flex-wrap" style="font-size: 1.1rem;">
                Pedidos Realizados
                <span v-if="pedidosNuevos > 0" class="badge bg-danger rounded-pill px-2 py-1 shadow-sm" style="font-size: 0.6rem;">
                  {{ pedidosNuevos }} NUEVO{{ pedidosNuevos > 1 ? 'S' : '' }}
                </span>
              </h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.85rem;">Listado de solicitudes, estados de entrega y pendientes.</p>
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
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ====================================================
   TARJETAS DE NAVEGACIÓN
   ==================================================== */
.modern-menu-card {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Adaptación fluida del tamaño del ícono */
.icon-box {
  width: clamp(48px, 10vw, 52px);
  height: clamp(48px, 10vw, 52px);
  background: #fef2f2;
  color: #dc2626;
  border-radius: 14px;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  transition: all 0.3s ease;
}

.card-arrow {
  transition: all 0.3s ease;
}

/* --- EFECTOS HOVER --- */
.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06) !important;
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

.animate__animated { animation-duration: 0.5s; }

</style>
