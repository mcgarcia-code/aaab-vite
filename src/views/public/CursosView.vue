<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-5">Cursos de Árbitros</h1>
        <p class="lead text-white-50 mb-0">Explora nuestros próximos cursos y capacitaciones.</p>
      </div>

      <div class="row justify-content-center g-4">
        <div v-for="(curso, index) in cursos" :key="index" class="col-12 col-md-6 col-lg-5">
          <div class="card h-100 border-0 rounded-4 overflow-hidden course-card shadow-lg">

            <div class="position-relative">
              <img :src="curso.image" class="card-img-top" :alt="curso.title" style="height: 220px; object-fit: cover;" />
              <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.4));"></div>
            </div>

            <div class="card-body p-4 d-flex flex-column">
              <h5 class="card-title fw-bold text-dark mb-2">{{ curso.title }}</h5>
              <p class="card-text text-secondary small mb-4 flex-grow-1">{{ curso.description }}</p>

              <div class="d-flex flex-column gap-3 mb-4 bg-light p-3 rounded-3 border border-light-subtle">
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-calendar text-danger"></i> Inicio
                  </span>
                  <span class="fw-bold text-dark text-end">{{ curso.startDate }}</span>
                </div>

                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-clock text-danger"></i> Duración
                  </span>
                  <span class="fw-bold text-dark">{{ curso.duration }}</span>
                </div>

                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt text-danger"></i> Modalidad
                  </span>
                  <span class="fw-bold text-dark">{{ curso.modality }}</span>
                </div>
              </div>

              <div class="d-flex gap-2 mt-auto pt-2">
                <a
                  :href="curso.detailsLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-light fw-bold flex-grow-1 border shadow-sm"
                  style="font-size: 0.9rem;"
                >
                  Más detalles
                </a>
                <a
                  :href="curso.enrollLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-danger fw-bold flex-grow-1 shadow-sm"
                  style="font-size: 0.9rem;"
                >
                  Inscribirme
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
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de CURSOS
useHead({
  title: 'Cursos de Árbitros | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Capacitate con nuestros cursos intensivos y regulares para todos los niveles.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Cursos de Árbitros | AAAB',
    },
    {
      property: 'og:description',
      content: 'Capacitate con nuestros cursos intensivos y regulares para todos los niveles.',
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


// Se mueven los datos que estaban en data() a un ref()
const cursos = ref([
  {
    title: 'Curso Regular',
    description:
      'Destinado a todos aquellos que quieran incorporarse a nuestra plantilla arbitral y que tengan conocimientos básicos del deporte.',
    // Se usa la nueva sintaxis de Vite para cargar la imagen
    image: new URL('../../assets/fotos/curso-basico.webp', import.meta.url).href,
    startDate: 'Próximamente - Abril 2026',
    duration: '3 Meses',
    modality: 'Presencial',
    detailsLink: 'https://drive.google.com/file/d/1p7sOlohNfBTtwqtOBVq0xBLHeZ71VVdl/view',
    enrollLink:
      'https://docs.google.com/forms/d/e/1FAIpQLSfewUFdFlKz1r0TkfmNONFDK97gB0t5kXaUzuoXq_laSEq9gw/closedform',
  },
  {
    title: 'Curso Intensivo',
    description:
      'Destinado a jugadores/as activos de Fe.Me.Bal de Liga de Honor ORO, Liga de Honor PLATA, Inferiores A y Técnicos nivel 3 o 2 de Fe.Me.Bal.',
    // Se usa la nueva sintaxis de Vite para cargar la imagen
    image: new URL('../../assets/fotos/curso-avanzado.webp', import.meta.url).href,
    startDate: '18 de Febrero 2026',
    duration: '2 semanas',
    modality: 'Presencial',
    detailsLink: 'https://drive.google.com/file/d/1CY5RgpKwIjWkbj7_qVdWjGEPEAoLNfCo/view',
    enrollLink:
      'https://docs.google.com/forms/d/e/1FAIpQLScQQ3HnL4-rWnC-EtkJNphun3DTz_f0os_sxouF-FLwLiPkLQ/closedform',
  },
  // Puedes añadir más cursos aquí
])

// La función getImageUrl() ya no es necesaria
</script>

<style scoped>
/* ====================================================
   FONDO Y SECCIÓN PRINCIPAL
   ==================================================== */
.dark-background-section {
  /* Usamos un color oscuro con opacidad para que el texto resalte sobre la foto */
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/cursos-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   EFECTO DE TARJETAS
   ==================================================== */
.course-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.4) !important;
}

.animate__animated {
  animation-duration: 0.8s;
}

</style>
