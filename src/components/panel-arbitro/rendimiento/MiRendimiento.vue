<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center">
            <i class="bi bi-graph-up-arrow me-2"></i> Mi Rendimiento
          </h4>
          <p class="text-muted small m-0 mt-1">Seguimiento de desempeño, exámenes y observaciones de campo.</p>
        </div>
      </div>

      <div class="card-body p-0">
        <div class="text-center py-5">
          <i class="bi bi-graph-up-arrow text-primary display-1 opacity-25"></i>
          <h5 class="mt-3 fw-bold text-dark">Módulo en Desarrollo</h5>
          <p class="text-muted small px-4">
            Próximamente podrás visualizar aquí tus <strong>estadísticas</strong>, resultados de <strong>exámenes</strong> teóricos y las <strong>observaciones</strong> técnicas de tus partidos.
          </p>
          <div class="mt-3">
            <span class="badge rounded-pill bg-light text-dark border px-3">Versión 2.0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
      <div class="d-flex align-items-center">
        <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
        <div class="small text-dark lh-sm">
          Los datos de rendimiento son cargados por la AAAB y nuestros Observadores Oficiales.
          Si tenés dudas sobre tus registros actuales, contactate con la coordinación técnica.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';

// Título y descripción específicos para SEO y WhatsApp
useHead({
  title: 'Mi Rendimiento | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Consulta tus estadísticas, exámenes y observaciones de desempeño arbitral.',
    },
    {
      property: 'og:title',
      content: 'Mi Rendimiento | AAAB',
    },
    {
      property: 'og:description',
      content: 'Consulta tus estadísticas, exámenes y observaciones de desempeño arbitral.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png',
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
});
</script>

<style scoped>
/* ====================================================
   1. ESTILOS BASE Y COMPONENTES
   ==================================================== */
.card { background: #ffffff; }
.text-primary { color: #0d6efd !important; }
.display-1 { font-size: 5rem; font-weight: bold; }

/* ====================================================
   2. 📱 RESPONSIVE DESIGN
   ==================================================== */
@media (max-width: 768px) {
    .card-header h4 { font-size: 1.2rem !important; }
    .display-1 { font-size: 3.5rem; }
}

.animate__animated { animation-duration: 0.5s; }
</style>
