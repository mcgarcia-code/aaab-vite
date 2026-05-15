<template>
  <div class="public-wrapper">
    <section class="hero-section">
      <div class="overlay"></div>

      <div class="container position-relative z-2">

        <div class="row align-items-center g-5 mb-5 pt-4">

          <div class="col-12 col-md-7 text-center text-md-start animate__animated animate__fadeInLeft">

            <div class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 fw-bold small mb-4">
              <span class="material-icons pulse-icon" style="font-size: 16px;">campaign</span>
              ÚLTIMA ACTUALIZACIÓN
            </div>

            <h1 class="display-5 display-md-3 fw-bold text-white mb-3 text-shadow">
              {{ designacionPrincipal.torneo }}
            </h1>

            <p class="lead text-white-50 mb-4 mx-auto mx-md-0" style="max-width: 90%;">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los partidos del fin de semana. Revisá tu horario y sede.
            </p>

            <div class="bg-white border rounded-4 p-3 d-inline-flex align-items-center text-start gap-3 mb-4 shadow-sm w-100" style="max-width: 350px;">
              <div class="bg-danger text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px;">
                <span class="material-icons fs-4">event</span>
              </div>
              <div>
                <span class="d-block small fw-bold text-muted text-uppercase mb-1">Fecha</span>
                <span class="d-block fs-5 text-dark fw-bold lh-1">{{ designacionPrincipal.fecha }}</span>
              </div>
            </div>

            <div>
              <a
                :href="designacionPrincipal.link"
                target="_blank"
                class="btn btn-danger btn-lg fw-bold px-4 py-3 d-inline-flex align-items-center justify-content-center gap-2 shadow-lg w-100 btn-download"
                style="max-width: 350px;"
                :class="{ 'disabled-link': designacionPrincipal.link === '#' }"
              >
                <span class="material-icons">cloud_download</span>
                <span>Descargar Designaciones</span>
              </a>
            </div>

          </div>

          <div class="col-12 col-md-5 text-center text-md-end animate__animated animate__fadeInRight">
            <img
              :src="designacionesImg"
              alt="Designaciones en tu celular"
              class="img-fluid hero-img shadow-lg"
              style="max-width: 320px;"
            />
          </div>
        </div>

        <div v-if="historialDesignaciones.length > 0" class="animate__animated animate__fadeInUp animate__delay-1s mt-5 pt-5 border-top border-secondary border-opacity-50">

          <div class="text-center text-md-start mb-4">
            <h3 class="fw-bold text-white mb-1">Historial de Designaciones</h3>
            <p class="text-white-50 small">Consultá los archivos de las jornadas anteriores.</p>
          </div>

          <div class="row g-3">
            <div v-for="(item, index) in historialDesignaciones" :key="index" class="col-12 col-md-6 col-lg-3">
              <div class="card h-100 border-0 rounded-4 p-3 shadow-sm history-card">
                <div class="d-flex align-items-center mb-2">
                  <span class="material-icons text-danger me-2 fs-5">history</span>
                  <span class="text-dark fw-bold small">{{ item.fecha }}</span>
                </div>
                <h6 class="text-danger fw-bold mb-3 flex-grow-1 small lh-sm">
                  {{ item.torneo }}
                </h6>
                <a
                  :href="item.link"
                  target="_blank"
                  class="btn btn-outline-dark btn-sm w-100 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 mt-auto"
                >
                  <span class="material-icons" style="font-size: 16px;">download</span> Descargar
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import designacionesImg from '@/assets/fotos/designaciones-mobile.png'

// Estado principal para la última designación
const designacionPrincipal = ref({
  torneo: 'Cargando información...',
  fecha: '...',
  link: '#'
})

// Estado para el historial (las anteriores a la principal)
const historialDesignaciones = ref([])

useHead({
  title: 'Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Consultá las designaciones de los partidos del fin de semana.' },
    { property: 'og:title', content: 'Designaciones | AAAB' },
    { property: 'og:description', content: 'Consultá las designaciones de los partidos del fin de semana.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const fetchDesignaciones = async () => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerHistorialDesignaciones'
    });

    if (res.payload && Array.isArray(res.payload) && res.payload.length > 0) {
      designacionPrincipal.value = res.payload[0];
      historialDesignaciones.value = res.payload.slice(1, 5);
    } else if (res.payload && !Array.isArray(res.payload)) {
      designacionPrincipal.value = {
        torneo: res.payload.torneo,
        fecha: res.payload.fecha,
        link: res.payload.link
      };
      historialDesignaciones.value = [];
    }
  } catch (error) {
    console.error("Error cargando designaciones", error);
    designacionPrincipal.value.torneo = "Información no disponible";
    designacionPrincipal.value.fecha = "Próximamente";
  }
}

onMounted(fetchDesignaciones);
</script>

<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.public-wrapper {
  width: 100%;
  min-height: 100vh;
  /* Fondo institucional azulado */
  background-color: #0f172a;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  background-image: url('../../assets/fotos/designaciones-hero.webp');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0 60px 0;
}

/* Capa de degradado oscuro azulado sobre la imagen de fondo */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  /* Mismo tono azul oscuro (15, 23, 42) con un sutil degradado de opacidad */
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%);
  z-index: 1;
}

.text-shadow {
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

/* ====================================================
   ANIMACIONES Y EFECTOS
   ==================================================== */
.pulse-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.hero-img {
  border-radius: 16px;
  transform: perspective(800px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.5s ease;
}

.hero-img:hover {
  transform: perspective(800px) rotateY(0deg) rotateX(0deg);
}

.btn-download {
  transition: all 0.3s ease;
}

.btn-download:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.4) !important;
}

.disabled-link {
  background: #475569 !important;
  color: #94a3b8 !important;
  border-color: #475569 !important;
  cursor: not-allowed;
  pointer-events: none;
}

.history-card {
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0 !important;
}

.history-card:hover {
  border-color: #ef4444 !important;
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2) !important;
}
</style>
