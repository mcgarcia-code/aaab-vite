<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-5">Tribunal de Ética</h1>
        <p class="lead text-white-50">
          Documentación oficial, estatutos y códigos de conducta de la asociación.
        </p>
      </div>

      <div class="row justify-content-center g-4">
        <div v-for="documento in documentos" :key="documento.titulo" class="col-12 col-md-6 col-lg-3">
          <div class="card h-100 text-center border-0 shadow-sm rounded-4 document-card">
            <div class="card-body d-flex flex-column p-4">

              <div class="bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle shadow-sm" style="width: 80px; height: 80px;">
                <i :class="[documento.icon, 'fs-1']"></i>
              </div>

              <h5 class="fw-bold text-dark text-uppercase mb-2">{{ documento.titulo }}</h5>
              <p class="card-text text-muted small flex-grow-1">{{ documento.subtitulo }}</p>

              <div class="mt-4">
                <RouterLink
                  v-if="documento.titulo === 'Sanciones'"
                  to="/sanciones"
                  class="btn btn-outline-dark fw-bold rounded-pill w-100 shadow-sm border-2"
                >
                  Ver Sanciones
                </RouterLink>
                <a
                  v-else
                  :href="documento.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-outline-dark fw-bold rounded-pill w-100 shadow-sm border-2"
                >
                  Descargar
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import { ref } from 'vue'

// Título y descripción específicos para la página de Tribunal de Ética
useHead({
  title: 'Sanciones y Tribunal de Ética | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Consultá estatutos, sanciones y todos los documentos disciplinarios.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Sanciones y Tribunal de Ética | AAAB',
    },
    {
      property: 'og:description',
      content: 'Consultá estatutos, sanciones y todos los documentos disciplinarios.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})
const documentos = ref([
  {
    titulo: 'Sanciones',
    subtitulo: 'Listado oficial de sanciones.',
    url: '/sanciones',
    icon: 'bi bi-exclamation-octagon-fill',
  },
  {
    titulo: 'Estatuto',
    subtitulo: 'Estatuto oficial de la AAAB.',
    url: 'https://drive.google.com/file/d/1-ATROmuyXRnS4l4DqGLUldm8X5-6q6jI/view?usp=sharing',
    icon: 'bi bi-journal-check',
  },
  {
    titulo: 'Reglamento Interno',
    subtitulo: 'Normas de funcionamiento interno.',
    url: 'https://drive.google.com/file/d/1ZH1tDSP8eid4wgWBJCXHJT-RviyiBXeF/view',
    icon: 'bi bi-house-gear-fill',
  },
  {
    titulo: 'Código de Penas',
    subtitulo: 'Detalle de penalizaciones.',
    url: 'https://drive.google.com/file/d/10H0SgH_J6f2r2l1Fwvs8W9ooLD5tuirP/view',
    icon: 'bi bi-shield-slash-fill',
  },
])
</script>

<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.dark-background-section {
  /* Fondo oscuro azulado alineado con la identidad del sitio */
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/etica-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   EFECTOS HOVER (TARJETAS)
   ==================================================== */
.document-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.document-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.4) !important;
}

/* Animación de entrada general */
.animate__animated {
  animation-duration: 0.8s;
}
</style>
