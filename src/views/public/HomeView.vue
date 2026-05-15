<template>
  <div class="animate__animated animate__fadeIn">

    <section class="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden" :style="{ backgroundImage: `url(${heroBg})` }">
      <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(0,0,0,0.6) 100%); z-index: 1;"></div>

      <div class="container position-relative text-center text-white z-2">
        <h1 class="display-4 display-md-2 fw-bold mb-4 text-shadow" style="letter-spacing: -1px;">
          ASOCIACIÓN ARGENTINA <br class="d-none d-md-block" />
          ÁRBITROS DE BALONMANO
        </h1>
        <p class="lead mb-5 text-white-50 mx-auto" style="max-width: 600px;">
          Formación, excelencia y pasión por el arbitraje.
        </p>
        <RouterLink to="/escuela-arbitros" class="btn btn-danger btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg hero-btn">
          Escuela de Árbitros
        </RouterLink>
      </div>
    </section>

    <section class="container my-5 py-5">
      <div class="row g-4 text-center justify-content-center">

        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-4 feature-card bg-white">
            <div class="mb-3">
              <i class="bi bi-award-fill text-danger" style="font-size: 3.5rem;"></i>
            </div>
            <h4 class="fw-bold text-dark mb-3">Formación</h4>
            <p class="text-muted small mb-0">
              Capacitate con nuestra Escuela de Formación Arbitral para todos los niveles.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-4 feature-card bg-white">
            <div class="mb-3">
              <i class="bi bi-cloud-arrow-down-fill text-danger" style="font-size: 3.5rem;"></i>
            </div>
            <h4 class="fw-bold text-dark mb-3">Centro de Descargas</h4>
            <p class="text-muted small mb-0">
              Accedé a reglamentos, planillas y todo el material oficial actualizado.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 p-4 feature-card bg-white">
            <div class="mb-3">
              <i class="bi bi-shield-check text-danger" style="font-size: 3.5rem;"></i>
            </div>
            <h4 class="fw-bold text-dark mb-3">Tribunal de Ética</h4>
            <p class="text-muted small mb-0">
              Consultá estatutos, resoluciones y todos los documentos disciplinarios.
            </p>
          </div>
        </div>

      </div>
    </section>

    <section class="cta-parallax position-relative d-flex align-items-center justify-content-center py-5" :style="{ backgroundImage: `url(${ctaBg})` }">
      <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 z-1"></div>

      <div class="container position-relative z-2 text-center text-white py-5">
        <h2 class="display-5 fw-bold mb-3 text-shadow">CATÁLOGO ONLINE</h2>
        <p class="lead mb-5 text-white mx-auto" style="max-width: 700px;">
          ¿Querés dominar el catálogo y las reglas del Handball? Este es el lugar perfecto para practicar. Accedé al catálogo 100% virtual, tanto en inglés como en español y perfeccioná tus conocimientos.
        </p>
        <a href="https://arbitroshandball.com.ar/catalogo/" target="_blank" rel="noopener noreferrer" class="btn btn-outline-light btn-lg px-5 py-3 fw-bold rounded-pill shadow-sm hero-btn">
          Ingresá al Catálogo
        </a>
      </div>
    </section>

    <section class="container my-5 py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold text-dark">Últimas Designaciones</h2>
        <p class="text-muted">Consultá las designaciones para los próximos encuentros.</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden feature-card">
            <div class="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 bg-light border-start border-danger border-5">

              <div class="d-flex flex-column flex-md-row align-items-center gap-3 text-center text-md-start">
                <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 55px; height: 55px;">
                  <i class="bi bi-calendar-check fs-4"></i>
                </div>
                <div>
                  <h5 class="fw-bold text-dark mb-1">¡Designaciones Disponibles!</h5>
                  <p class="text-muted small mb-0">
                    Las designaciones ya están publicadas.
                  </p>
                </div>
              </div>

              <RouterLink to="/designaciones" class="btn btn-danger fw-bold rounded-pill px-4 py-2 flex-shrink-0 shadow-sm hero-btn">
                Ver ahora
              </RouterLink>

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
import axios from 'axios'

// 1. Importación de imágenes para procesamiento de Vite
import heroBg from '../../assets/fotos/hero-background.webp'
import ctaBg from '../../assets/fotos/imagen-cta.webp'

// Variable reactiva para la fecha que viene del JSON
const fechaDesignacion = ref('...')

// --- TÍTULOS DINÁMICOS PARA SEO ---
useHead({
  title: 'Inicio | Asociación Argentina de Árbitros de Balonmano (AAAB)',
  meta: [
    {
      name: 'description',
      content: 'Sitio oficial de la Asociación Argentina de Árbitros de Balonmano. Consultá las últimas designaciones, sanciones, reglamentos y todo el material de formación.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Inicio | AAAB',
    },
    {
      property: 'og:description',
      content: 'Sitio oficial de la Asociación Argentina de Árbitros de Balonmano. Consultá las últimas designaciones, sanciones, reglamentos y todo el material de formación.',
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

// Función para obtener la fecha desde el archivo de configuración
const fetchFecha = async () => {
  try {
    /** * SE AGREGA EL TIMESTAMP (?v=...)
     * Esto obliga al navegador a pedir el archivo real al servidor
     * en lugar de usar una versión vieja guardada en caché.
     */
    const response = await axios.get(`/data/config.json?v=${new Date().getTime()}`);
    fechaDesignacion.value = response.data.fecha;
  } catch (error) {
    console.error("Error cargando la fecha en el inicio", error);
    // Valor por defecto por si falla la carga
    fechaDesignacion.value = 'Próximamente';
  }
}

onMounted(fetchFecha);
</script>


<style scoped>
/* ====================================================
   HERO & PARALLAX SECTIONS
   ==================================================== */
.hero-section {
  height: 90vh;
  min-height: 500px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  /* Efecto Parallax opcional también en el Hero */
  background-attachment: fixed;
}

.cta-parallax {
  min-height: 450px;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* ====================================================
   UTILIDADES Y EFECTOS
   ==================================================== */
.text-shadow {
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 1px solid #f1f5f9 !important; /* Borde ultra suave por defecto */
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1) !important;
  border-color: #fca5a5 !important; /* Se tiñe el borde de rojo sutil */
}

.hero-btn {
  transition: all 0.3s ease;
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(220, 53, 69, 0.4) !important;
}
</style>
