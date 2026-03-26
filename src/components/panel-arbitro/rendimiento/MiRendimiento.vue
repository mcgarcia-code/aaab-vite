<template>
  <div class="animate__animated animate__fadeIn">
    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Mi Rendimiento</h4>
        <p class="text-muted small m-0">Seguimiento de desempeño, exámenes y observaciones de campo.</p>
      </div>
      
      <div class="card-body p-0">
        <div class="text-center py-5">
          <i class="bi bi-graph-up-arrow text-primary display-1 opacity-25"></i>
          <h5 class="mt-3 fw-bold text-dark">Módulo en Desarrollo</h5>
          <p class="text-muted small px-4">
            Próximamente podrás visualizar aquí tus <strong>estadísticas</strong>, resultados de <strong>exámenes</strong> teóricos y las <strong>observaciones</strong> técnicas de tus partidos.
          </p>
          <div class="mt-3">
            <span class="badge rounded-pill bg-light text-dark border">Versión 2.0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm">
      <div class="d-flex">
        <i class="bi bi-info-square-fill me-3 fs-4 text-dark"></i>
        <div class="small text-dark">
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

// Por ahora no necesitamos lógica de fetch ya que es un "Próximamente"
</script>

<style scoped>
/* Respetando tus estilos base */
.card { border-radius: 15px; overflow: hidden; }
.card-header { border-bottom: 1px solid #f1f5f9; }

/* Estilos de la alerta y textos */
.text-primary { color: #0d6efd !important; }
.display-1 { font-size: 5rem; }

/* Optimización para mobile */
@media (max-width: 576px) {
  .display-1 { font-size: 3.5rem; }
  .card-header h4 { font-size: 1.2rem; }
}
</style>