<template>
  <div class="animate__animated animate__fadeIn">
    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Próximamente</h4>
        <p class="text-muted small m-0">Estamos trabajando en nuevas funcionalidades para vos.</p>
      </div>
      
      <div class="card-body p-0">
        <div class="text-center py-5">
          <i class="bi bi-tools text-primary display-1 opacity-25"></i>
          <h5 class="mt-3 fw-bold text-dark">Módulo en Desarrollo</h5>
          <p class="text-muted small px-4">
            Esta sección se encuentra actualmente en proceso de diseño y programación. 
            ¡Muy pronto estará disponible!
          </p>
          <div class="mt-3">
            <span class="badge rounded-pill bg-light text-dark border px-3">En proceso...</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm">
      <div class="d-flex align-items-center">
        <i class="bi bi-info-circle-fill me-3 fs-4 text-dark"></i>
        <div class="small text-dark">
          Este panel se actualiza periódicamente con nuevas herramientas de gestión institucional.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';

useHead({
  title: 'En Desarrollo | AAAB',
  meta: [
    { name: 'description', content: 'Sección en construcción de la Asociación Argentina de Árbitros de Balonmano.' }
  ],
});
</script>

<style scoped>
.card { border-radius: 15px; overflow: hidden; }
.card-header { border-bottom: 1px solid #f1f5f9; }

.text-primary { color: #0d6efd !important; }
.display-1 { font-size: 5rem; }

@media (max-width: 576px) {
  .display-1 { font-size: 3.5rem; }
  .card-header h4 { font-size: 1.2rem; }
}
</style>