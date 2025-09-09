<script setup>
// 1. Se importan las imágenes de fondo para que Vite las procese
import heroBg from '../assets/hero-background.webp'
import ctaBg from '../assets/imagen-cta.webp'
</script>

<template>
  <div>
    <section class="hero-section" :style="{ backgroundImage: `url(${heroBg})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content text-center text-white">
        <h1 class="display-4 fw-bold mb-4">
          ASOCIACIÓN ARGENTINA <br />
          ÁRBITROS DE BALONMANO
        </h1>
        <p class="lead mb-5">Formación, excelencia y pasión por el arbitraje.</p>
        <RouterLink to="/cursos" class="btn btn-danger btn-lg">Ver Cursos</RouterLink>
      </div>
    </section>

    <section class="container my-5 py-5">
      <div class="row text-center">
        <div class="col-md-4 mb-4">
          <div class="feature-card">
            <i class="bi bi-award-fill feature-icon"></i>
            <h3 class="fw-bold mt-3">Formación</h3>
            <p class="text-muted">
              Capacítate con nuestros cursos intensivos y regulares para todos los niveles.
            </p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="feature-card">
            <i class="bi bi-cloud-arrow-down-fill feature-icon"></i>
            <h3 class="fw-bold mt-3">Centro de Descargas</h3>
            <p class="text-muted">
              Accede a reglamentos, planillas y todo el material oficial actualizado.
            </p>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="feature-card">
            <i class="bi bi-shield-check feature-icon"></i>
            <h3 class="fw-bold mt-3">Tribunal de Ética</h3>
            <p class="text-muted">
              Consulta estatutos, sanciones y todos los documentos disciplinarios.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section
      class="cta-parallax text-center text-white d-flex align-items-center justify-content-center"
      :style="{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${ctaBg})`,
      }"
    >
      <div class="container">
        <h2 class="display-4 fw-bold">CATÁLOGO ONLINE</h2>
        <p class="lead my-4">
          ¿Querés dominar el catálogo y las reglas del Handball? Este es el lugar perfecto para
          practicar. Accede al catálogo 100% virtual, tanto en inglés como en español y perfecciona
          tus conocimientos.
        </p>
        <a
          href="https://arbitroshandball.com.ar/catalogo/"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline-light btn-lg"
        >
          Ingresá
        </a>
      </div>
    </section>

    <section class="container my-5 py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold">Últimas Designaciones</h2>
        <p class="lead text-muted">Consulta las designaciones para los próximos encuentros.</p>
      </div>
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="alert alert-info text-center" role="alert">
            <p class="mb-0">
              Las designaciones del <strong>30 y 31 de Agosto</strong> ya están disponibles.
            </p>
            <RouterLink to="/designaciones" class="alert-link">Ver ahora</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* SECCIÓN 1: HERO */
.hero-section {
  position: relative;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* La imagen ahora se aplica desde el template */
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2;
}
.hero-content {
  position: relative;
  z-index: 3;
}
/* SECCIÓN 2: CARACTERÍSTICAS */
.feature-card {
  padding: 2rem;
  transition: transform 0.3s;
}
.feature-card:hover {
  transform: translateY(-10px);
}
.feature-icon {
  font-size: 4rem;
  color: var(--bs-danger);
}
/* SECCIÓN 3: CALL TO ACTION PARALLAX */
.cta-parallax {
  min-height: 400px;
  /* La imagen ahora se aplica desde el template */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
