<template>
  <div class="public-wrapper">
    <section class="hero-section">
      <div class="overlay"></div>

      <div class="main-content container relative-z">

        <div class="hero-grid mb-5">
          <div class="text-column animate__animated animate__fadeInLeft">
            <div class="badge-update">
              <span class="material-icons pulse-icon">campaign</span>
              ÚLTIMA ACTUALIZACIÓN
            </div>

            <h1 class="main-title fw-bold text-white">{{ designacionPrincipal.torneo }}</h1>

            <p class="subtitle text-white-50">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los partidos del fin de semana. Revisá tu horario y sede.
            </p>

            <div class="info-card shadow-sm">
              <div class="info-icon">
                <span class="material-icons">event</span>
              </div>
              <div class="info-text">
                <span class="info-label">Jornada / Fecha</span>
                <span class="info-value">{{ designacionPrincipal.fecha }}</span>
              </div>
            </div>

            <a
              :href="designacionPrincipal.link"
              target="_blank"
              class="btn-download shadow-lg"
              :class="{ 'disabled-link': designacionPrincipal.link === '#' }"
            >
              <span class="material-icons">cloud_download</span>
              <span>Descargar Designaciones</span>
            </a>
          </div>

          <div class="image-column animate__animated animate__fadeInRight">
            <img
              :src="designacionesImg"
              alt="Designaciones en tu celular"
              class="hero-img shadow-lg"
            />
          </div>
        </div>

        <div v-if="historialDesignaciones.length > 0" class="history-section animate__animated animate__fadeInUp animate__delay-1s mt-5 pt-4 border-top border-secondary">
          <div class="text-center text-md-start mb-4">
            <h3 class="fw-bold text-white mb-1">Historial de Designaciones</h3>
            <p class="text-white-50 small">Consultá los archivos de las jornadas anteriores.</p>
          </div>

          <div class="row g-3">
            <div v-for="(item, index) in historialDesignaciones" :key="index" class="col-12 col-md-6 col-lg-3">
              <div class="history-card h-100 p-3 rounded-3 d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                  <span class="material-icons text-danger me-2" style="font-size: 20px;">history</span>
                  <span class="text-white fw-bold" style="font-size: 0.9rem;">{{ item.fecha }}</span>
                </div>
                <h6 class="text-white-50 fw-bold mb-3 flex-grow-1" style="font-size: 0.85rem; line-height: 1.4;">
                  {{ item.torneo }}
                </h6>
                <a
                  :href="item.link"
                  target="_blank"
                  class="btn btn-outline-light btn-sm w-100 fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2"
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
      // Tu endpoint de backend debería devolver un array con las últimas 5 (ordenadas por fecha DESC)
      action: 'obtenerHistorialDesignaciones'
    });

    if (res.payload && Array.isArray(res.payload) && res.payload.length > 0) {
      // La primera [0] es la más reciente y va al Hero principal
      designacionPrincipal.value = res.payload[0];

      // Del índice [1] en adelante (hasta 4 más) van al historial
      historialDesignaciones.value = res.payload.slice(1, 5);
    } else if (res.payload && !Array.isArray(res.payload)) {
      // Fallback: Por si tu backend todavía devuelve un solo objeto y no lo actualizaste a array
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
   1. BASE (MOBILE FIRST - CELULARES POR DEFECTO)
   ==================================================== */

.public-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #000000;
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
  align-items: center; /* Centrado vertical para todo el bloque */
  justify-content: center;
  padding: 80px 15px 60px 15px; /* Más padding arriba para navbar si existe */
}

/* Capa oscura sobre la imagen de fondo */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.85) 100%);
  z-index: 1;
}

/* Asegura que el contenido quede por encima del overlay oscuro */
.relative-z {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
}

.hero-grid {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
}

/* --- Columna de Texto --- */
.text-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.badge-update {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
}

.pulse-icon {
  font-size: 16px;
  color: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.main-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
  max-width: 90%;
}

/* --- Tarjeta de Información (Fecha) --- */
.info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 35px;
  width: 100%;
  max-width: 350px;
}

.info-icon {
  background: #ef4444;
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-icon .material-icons { font-size: 24px; }

.info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.info-label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.info-value { font-size: 1.1rem; color: #ffffff; font-weight: bold; }

/* --- Botón de Descarga --- */
.btn-download {
  background: #ef4444;
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  width: 100%;
  max-width: 350px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn-download:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.4) !important;
  color: white;
}

.disabled-link {
  background: #475569 !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
  pointer-events: none;
}

/* --- Columna de Imagen --- */
.image-column {
  display: flex;
  justify-content: center;
  width: 100%;
}

.hero-img {
  width: 100%;
  max-width: 280px;
  border-radius: 16px;
  transform: perspective(800px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.5s ease;
}

.hero-img:hover {
  transform: perspective(800px) rotateY(0deg) rotateX(0deg);
}

/* --- Tarjetas del Historial --- */
.history-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.history-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-3px);
}

.border-secondary {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px hacia arriba)
   ==================================================== */
@media (min-width: 768px) {
  .hero-section { padding: 80px 40px; }
  .hero-grid { flex-direction: row; justify-content: space-between; margin-bottom: 80px !important; }
  .text-column { align-items: flex-start; text-align: left; width: 55%; }
  .main-title { font-size: 3.5rem; }
  .subtitle { max-width: 100%; font-size: 1.2rem; }
  .info-card { margin-left: 0; }
  .btn-download { width: auto; min-width: 280px; }
  .image-column { width: 45%; justify-content: flex-end; }
  .hero-img { max-width: 350px; }
}

@media (min-width: 1024px) {
  .main-title { font-size: 4rem; }
  .hero-img { max-width: 400px; }
}
</style>
