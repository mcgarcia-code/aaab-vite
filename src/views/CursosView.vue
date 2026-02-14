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
  ],
})


// Se mueven los datos que estaban en data() a un ref()
const cursos = ref([
  {
    title: 'Curso Regular',
    description:
      'Destinado a todos aquellos que quieran incorporarse a nuestra plantilla arbitral y que tengan conocimientos básicos del deporte.',
    // Se usa la nueva sintaxis de Vite para cargar la imagen
    image: new URL('../assets/fotos/curso-basico.webp', import.meta.url).href,
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
    image: new URL('../assets/fotos/curso-avanzado.webp', import.meta.url).href,
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

<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Cursos de Árbitros</h1>
        <p class="lead text-white-50">Explora nuestros próximos cursos y capacitaciones.</p>
      </div>

      <div class="row justify-content-center g-4">
        <div v-for="(curso, index) in cursos" :key="index" class="col-md-6 col-lg-5">
          <div class="card h-100 course-card">
            <img :src="curso.image" class="card-img-top" :alt="curso.title" />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title fw-bold text-dark">{{ curso.title }}</h5>
              <p class="card-text text-muted mb-3">{{ curso.description }}</p>
              <ul class="list-group list-group-flush mb-4 flex-grow-1">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-calendar me-2"></i>Fecha Inicio:</span>
                  <span class="fw-bold text-dark">{{ curso.startDate }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-clock me-2"></i>Duración:</span>
                  <span class="fw-bold text-dark">{{ curso.duration }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-geo-alt me-2"></i>Modalidad:</span>
                  <span class="fw-bold text-dark">{{ curso.modality }}</span>
                </li>
              </ul>
              <div class="mt-auto d-flex justify-content-between">
                <a
                  :href="curso.detailsLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-outline-secondary me-2"
                  >Más detalles</a
                >
                <a
                  :href="curso.enrollLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-danger"
                  >Inscribirme</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Código CSS limpio y sin caracteres invisibles */
.dark-background-section {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('../assets/fotos/cursos-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}

.course-card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.15);
}

.card-img-top {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  height: 200px;
  object-fit: cover;
}

.list-group-item {
  border-color: rgba(0, 0, 0, 0.05);
  padding-left: 0;
  padding-right: 0;
}

.list-group-item i {
  color: var(--aaab-primary); /* Usamos el color primario global */
}

.btn-danger {
  background-color: var(--bs-danger);
  border-color: var(--bs-danger);
}
</style>
