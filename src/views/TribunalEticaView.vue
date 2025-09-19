<script setup>
import { ref } from 'vue'

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
    url: 'https://drive.google.com/file/d/1VvhJ4H021zEhU3vpwciaIivIiybHSeSu/view',
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

<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Tribunal de Ética</h1>
        <p class="lead text-white-50">
          Documentación oficial, estatutos y códigos de conducta de la asociación.
        </p>
      </div>

      <div class="row">
        <div v-for="documento in documentos" :key="documento.titulo" class="col-lg-3 col-md-6 mb-4">
          <div class="card h-100 text-center shadow-sm card-hover">
            <div class="card-body d-flex flex-column p-4">
              <div
                class="icon-header bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-3"
              >
                <i :class="documento.icon"></i>
              </div>
              <h5 class="card-title text-uppercase mb-2 text-dark">{{ documento.titulo }}</h5>
              <p class="card-text text-muted flex-grow-1">{{ documento.subtitulo }}</p>
              <div class="mt-auto">
                <RouterLink
                  v-if="documento.titulo === 'Sanciones'"
                  to="/sanciones"
                  class="btn btn-outline-dark"
                >
                  Ver Sanciones
                </RouterLink>
                <a
                  v-else
                  :href="documento.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-outline-dark"
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

<style scoped>
/* Estilos para la sección principal con imagen de fondo oscuro */
.dark-background-section {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('../assets/etica-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}

/* Estilos para las tarjetas de documentos (fondo blanco) */
.card-hover {
  background-color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15) !important;
}

.icon-header {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background-color: var(--bs-danger) !important;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.btn-outline-dark {
  font-weight: bold;
  border-width: 2px;
}
</style>
