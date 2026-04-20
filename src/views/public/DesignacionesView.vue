<template>
  <div class="public-wrapper">
    <section class="hero-section">
      <div class="overlay"></div>

      <div class="hero-content container">
        <div class="hero-grid">

          <div class="text-column animate__animated animate__fadeInLeft">
            <div class="badge-update">
              <span class="material-icons pulse-icon">campaign</span>
              ÚLTIMA ACTUALIZACIÓN
            </div>

            <h1 class="main-title">{{ torneo }}</h1>

            <p class="subtitle">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los partidos del fin de semana. Revisá tu horario y sede.
            </p>

            <div class="info-card shadow-sm">
              <div class="info-icon">
                <span class="material-icons">event</span>
              </div>
              <div class="info-text">
                <span class="info-label">Jornada / Fecha</span>
                <span class="info-value">{{ fechaDesignacion }}</span>
              </div>
            </div>

            <a
              :href="linkDescarga"
              target="_blank"
              class="btn-download shadow-lg"
              :class="{ 'disabled-link': linkDescarga === '#' }"
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
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import designacionesImg from '@/assets/fotos/designaciones-mobile.png'

const torneo = ref('Cargando información...')
const fechaDesignacion = ref('...')
const linkDescarga = ref('#')

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
      action: 'obtenerUltimaDesignacion'
    });

    if (res.payload) {
      torneo.value = res.payload.torneo;
      fechaDesignacion.value = res.payload.fecha;
      linkDescarga.value = res.payload.link;
    }
  } catch (error) {
    console.error("Error cargando designaciones", error);
    torneo.value = "Información no disponible";
    fechaDesignacion.value = "Próximamente";
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
  align-items: center;
  justify-content: center;
  padding: 40px 15px;
}

/* Capa oscura sobre la imagen de fondo */
.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  /* MODIFICADO: Degradado tirando fuertemente a negro oscuro */
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 15, 15, 0.85) 100%);
  z-index: 1;
}

.hero-content {
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
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 15px;
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.subtitle {
  font-size: 1.1rem;
  color: #cbd5e1;
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
  /* MODIFICADO: Borde blanco eliminado según lo solicitado */
  transform: perspective(800px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.5s ease;
}

.hero-img:hover {
  transform: perspective(800px) rotateY(0deg) rotateX(0deg);
}

/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px hacia arriba)
   ==================================================== */
@media (min-width: 768px) {
  .hero-section { padding: 0 40px; }
  .hero-grid { flex-direction: row; justify-content: space-between; }
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
