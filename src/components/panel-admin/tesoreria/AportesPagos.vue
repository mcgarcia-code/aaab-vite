<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Header con margen responsivo -->
    <div class="dashboard-header mb-4 mb-md-5 mt-4 text-start">
      <div class="d-flex align-items-center justify-content-start gap-3">
        <div class="main-icon-container flex-shrink-0">
          <i class="bi bi-cash-coin text-danger"></i>
        </div>
        <div>
          <h4 class="fw-bold text-white m-0 fs-5 fs-md-4">Aportes y Pagos</h4>
          <p class="text-white opacity-75 m-0 small">Valores, recargos, movimientos y cierres mensuales de tesorería</p>
        </div>
      </div>
    </div>

    <div class="row g-3 g-md-4">

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/aportes-pagos/valores" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 bg-white w-100 h-100 shadow-sm">
            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-currency-dollar"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 0.95rem;">Valores y Porcentaje</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">Valor de partido por categoría, pagos a observadores/mesa/delegado y % de aporte.</p>
            </div>
            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/aportes-pagos/recargos" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 bg-white w-100 h-100 shadow-sm">
            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 0.95rem;">Recargos de Porcentaje</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">Recargos individuales sobre el aporte de un árbitro.</p>
            </div>
            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/aportes-pagos/movimientos" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 bg-white w-100 h-100 shadow-sm">
            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-list-check"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 0.95rem;">Movimientos</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">Generar aportes del período, ver el detalle y cargar ajustes manuales.</p>
            </div>
            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/aportes-pagos/cierres" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 bg-white w-100 h-100 shadow-sm">
            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 0.95rem;">Cierre Mensual</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">Cerrar el período y consultar el historial de cierres realizados.</p>
            </div>
            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-md-6">
        <RouterLink to="/panel-admin/tesoreria/aportes-pagos/estado-cuenta" class="text-decoration-none h-100 d-block">
          <div class="modern-menu-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 bg-white w-100 h-100 shadow-sm">
            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i class="bi bi-people"></i>
            </div>
            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 0.95rem;">Estado de Cuenta General</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">Saldo de todos los árbitros: último cierre y pendiente sin cerrar.</p>
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
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Aportes y Pagos | AAAB',
  meta: [
    { name: 'description', content: 'Administración de valores, recargos, movimientos y cierres de tesorería.' },
    { property: 'og:title', content: 'Aportes y Pagos | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});
</script>

<style scoped>
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

.modern-menu-card {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.icon-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 16px;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.card-arrow {
  transition: all 0.3s ease;
}

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
