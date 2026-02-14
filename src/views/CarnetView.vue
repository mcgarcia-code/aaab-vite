<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Credencial Digital</h1>
        <p class="lead text-white-50">
          Ingresá tu DNI para validar tu condición de árbitro activo.
        </p>
      </div>

      <CarnetDigital />

      <div class="text-center mt-4">
        <router-link to="/descargas" class="btn btn-outline-light btn-sm">
          <i class="bi bi-arrow-left"></i> Volver a Descargas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import CarnetDigital from '@/components/CarnetDigital.vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Credencial Digital | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Validación de credencial digital para árbitros de handball.',
    },
  ],
});
</script>

<style scoped>
/* Reutilizamos tu estilo de fondo oscuro para que sea igual al resto del sitio */
.dark-background-section {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('../assets/fotos/descargas-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}
</style>
