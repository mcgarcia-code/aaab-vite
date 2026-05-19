<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 w-100 bg-white border-start border-danger border-5">

      <div class="card-header bg-white py-3 border-bottom border-light-subtle">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-tools"></i> Sección en Construcción
            </h4>
            <p class="text-muted small m-0 mt-1">Estamos trabajando para brindarte nuevas herramientas de gestión.</p>
          </div>
        </div>
      </div>

      <div class="card-body p-5">
        <div class="text-center py-4">
          <div class="mb-4">
            <i class="bi bi-cone-striped text-danger opacity-25 display-1"></i>
          </div>

          <h2 class="fw-bold text-dark mb-3">¡Próximamente!</h2>
          <p class="text-muted mx-auto mb-4" style="max-width: 500px;">
            Este módulo se encuentra actualmente en **desarrollo técnico**. Muy pronto podrás acceder a nuevas funcionalidades diseñadas para mejorar tu experiencia en la plataforma.
          </p>

          <div class="d-flex justify-content-center gap-2 align-items-center">
            <span class="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2">
              <i class="bi bi-cpu me-1"></i> Sistema v3.0
            </span>
            <span class="badge rounded-pill bg-dark text-white px-3 py-2">
              <i class="bi bi-clock-history me-1"></i> En Proceso
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert bg-light border border-light-subtle rounded-4 shadow-sm p-4 mx-auto w-100">
      <div class="d-flex align-items-center">
        <div class="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center me-3" style="min-width: 50px; height: 50px;">
          <i class="bi bi-info-circle-fill text-danger fs-4"></i>
        </div>
        <div class="text-dark small lh-sm">
          <strong>¿Necesitás información urgente?</strong><br>
          Si buscabas datos específicos que no están disponibles actualmente, comunicate con la
          <a href="mailto:soporte@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">Coordinación Técnica</a> de la AAAB.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';

// SEO e Identidad de la página
useHead({
  title: 'Sección en Construcción | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Módulo en desarrollo del sistema de gestión AAAB.',
    },
    {
      property: 'og:title',
      content: 'En Construcción | AAAB',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png',
    }
  ],
});
</script>

<style scoped>
/* Transiciones suaves */
.animate__animated {
  animation-duration: 0.7s;
}

/* Ajustes para el ícono gigante */
.display-1 {
  font-size: 6rem;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.05));
}

/* Responsivo */
@media (max-width: 768px) {
  .display-1 {
    font-size: 4rem;
  }
  h2 {
    font-size: 1.5rem;
  }
}
</style>
