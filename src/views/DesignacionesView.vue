<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import axios from 'axios'
import designacionesImg from '@/assets/designaciones-mobile.png'

// Variables reactivas para los datos que cambian
const torneo = ref('Cargando...')
const fechaDesignacion = ref('...')
const linkDescarga = ref('#')

// SEO Dinámico
useHead({
  title: 'Designaciones | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Consultá las designaciones de los partidos del fin de semana.',
    },
  ],
})

// Función para obtener los datos
const fetchDesignaciones = async () => {
  try {
    // Apuntamos a un archivo JSON que subiremos a la carpeta public de tu hosting
    const response = await axios.get('/data/config.json');
    torneo.value = response.data.torneo;
    fechaDesignacion.value = response.data.fecha;
    linkDescarga.value = response.data.link;
  } catch (error) {
    console.error("Error cargando designaciones", error);
  }
}

onMounted(fetchDesignaciones);
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
            <h1 class="display-4 fw-bold mb-3">{{ torneo }}</h1>
            <p class="lead mb-4">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los
              partidos del fin de semana.
            </p>
            <p class="mb-4 fs-5">
              <strong>Fecha:</strong>
              <span class="badge bg-danger fs-6 py-2 px-3 ms-2">{{ fechaDesignacion }}</span>
            </p>
            <a :href="linkDescarga" target="_blank" class="btn btn-danger btn-lg text-uppercase fw-bold">
              <i class="bi bi-cloud-arrow-down-fill me-2"></i> Descargar
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Tu CSS se mantiene igual */
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
