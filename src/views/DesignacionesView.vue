<script setup>
import { useHead } from '@vueuse/head'
// Se importa la imagen para que Vite la procese correctamente
import designacionesImg from '@/assets/designaciones-mobile.png';

// Título y descripción específicos para la página de DESIGNACIONES
useHead({
  title: 'Designaciones | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Consultá las designaciones de los partidos del fin de semana.',
    },
  ],
})
</script>

<template>
  <div>
    <section class="designaciones-hero text-white d-flex align-items-center justify-content-center">
      <div class="container text-center text-md-start position-relative">
        <div class="row align-items-center">
          <div class="col-md-5 mb-4 mb-md-0">
            <img
              :src="designacionesImg"
              alt="Últimas designaciones en móvil"
              class="img-fluid designaciones-hero-img shadow-lg rounded"
            />
          </div>
          <div class="col-md-7">
            <p class="text-uppercase fw-bold mb-2 opacity-75">ÚLTIMA ACTUALIZACIÓN</p>
            <h1 class="display-4 fw-bold mb-3">TORNEO CLAUSURA 2025</h1>
            <p class="lead mb-4">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los
              partidos del fin de semana.
            </p>
            <p class="mb-4 fs-5">
              <strong>Fecha:</strong>
              <span class="badge bg-danger fs-6 py-2 px-3 ms-2">29 y 30 de Noviembre</span>
            </p>
            <a href="https://docs.google.com/spreadsheets/d/1OEd4D9sjzmG8JdHvOoMA7asPFRuIKe5D/edit?usp=sharing&ouid=110583671843914808563&rtpof=true&sd=true" class="btn btn-danger btn-lg text-uppercase fw-bold">
              <i class="bi bi-cloud-arrow-down-fill me-2"></i> Descargar
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.designaciones-hero {
  min-height: 90vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url('../assets/designaciones-hero.webp');
  background-position: center;
  background-size: cover;
  color: white;
  padding: 4rem 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.designaciones-hero-img {
  max-width: 300px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}
</style>
