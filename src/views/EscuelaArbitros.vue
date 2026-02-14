<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Escuela de Formación Arbitral | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Programa de formación integral anual para árbitros de handball.',
    },
  ],
})

const materias = ref([
  {
    title: 'Aspectos Reglamentarios',
    icon: 'bi-book',
    description: 'Estudio profundo de las 18 reglas del Reglamento de Handball.',
    details: 'Exámenes parciales y examen final integrador (75% aprobación) .'
  },
  {
    title: 'Preparación Física',
    icon: 'bi-lightning-charge',
    description: 'Entrenamiento específico anual para alcanzar los estándares de rendimiento exigidos.',
    details: 'Evaluación mediante Shuttle Run Test (Mujeres 8.5 / Hombres 9.5).'
  },
  {
    title: 'Análisis de Video y Gestoformas',
    icon: 'bi-camera-video',
    description: 'Taller de gestoformas y video-tests para unificación de criterios.',
    details: 'Aprobación mediante el 50% de los video-tests realizados.'
  },
  {
    title: 'Espacios de Encuentro',
    icon: 'bi-people',
    description: 'Charlas con psicólogos deportivos, árbitros referentes y entrenadores de formativas.',
    details: 'Módulo formativo sin examen (Asistencia obligatoria del 75%).'
  }
])

const totalModulos = computed(() => materias.value.length + 1)

const cuerpoDocente = ref([
  { name: 'Nombre Apellido', role: 'Director Académico', bio: 'Árbitro Nacional / Instructor Federativo.', icon: 'bi-person-badge' },
  { name: 'Nombre Apellido', role: 'Preparador Físico', bio: 'Prof. de Educación Física especializado en alto rendimiento.', icon: 'bi-person-badge' },
  { name: 'Especialistas', role: 'Staff Invitado', bio: 'Psicólogos deportivos y Entrenadores de Liga de Honor.', icon: 'bi-mortarboard' }
])

const faqs = ref([
  { q: '¿Qué sucede si desapruebo un módulo?', a: 'Podés recursar únicamente la materia adeudada el año siguiente abonando el derecho de examen correspondiente.', icon: 'bi-patch-question' },
  { q: '¿Es obligatorio ser jugador?', a: 'No, pero se requiere conocimiento básico del deporte (ex-jugadores, estudiantes de Ed. Física, etc.).', icon: 'bi-info-circle' },
  { q: '¿Cuál es la política de cuotas?', a: 'Se abonan de Abril a Noviembre. En caso de abandono, las cuotas abonadas no son reembolsables.', icon: 'bi-credit-card' }
])

const infoInscripcion = ref({
  title: 'Ciclo Lectivo 2026',
  description: 'Nuestro programa anual está destinado a quienes posean conocimientos básicos (jugadores, ex-jugadores o estudiantes de Ed. Física) que deseen incorporarse a nuestra plantilla arbitral.',
  image: new URL('../assets/curso-avanzado.webp', import.meta.url).href,
  startDate: 'Abril 2026',
  duration: 'Anual (Abril a Noviembre)',
  modality: 'Presencial',
  detailsLink: '#',
  enrollLink: '#',
})
</script>

<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-4">Escuela de Formación Arbitral</h1>
        <p class="lead text-white-50">Hacia la profesionalización integral del arbitraje de handball.</p>
      </div>

      <div class="row g-4 justify-content-center mb-5">
        <div class="col-lg-5">
          <div class="card h-100 course-card">
            <img :src="infoInscripcion.image" class="card-img-top" alt="Escuela de Árbitros" />
            <div class="card-body d-flex flex-column text-dark">
              <h3 class="card-title fw-bold">{{ infoInscripcion.title }}</h3>
              <p class="card-text text-muted mb-4">{{ infoInscripcion.description }}</p>

              <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-calendar-check me-2 text-danger"></i>Inicio:</span>
                  <span class="fw-bold">{{ infoInscripcion.startDate }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-clock me-2 text-danger"></i>Duración:</span>
                  <span class="fw-bold">{{ infoInscripcion.duration }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="bi bi-geo-alt me-2 text-danger"></i>Modalidad:</span>
                  <span class="fw-bold">{{ infoInscripcion.modality }}</span>
                </li>
              </ul>

              <div class="mt-auto">
                <div class="alert alert-secondary small mb-3">
                  <i class="bi bi-info-circle me-2"></i>
                  Para aprobar se deben completar los {{ totalModulos }} módulos.
                </div>
                <div class="d-flex justify-content-between">
                  <a :href="infoInscripcion.detailsLink" target="_blank" class="btn btn-outline-secondary w-100 me-2">Ver Programa</a>
                  <a :href="infoInscripcion.enrollLink" target="_blank" class="btn btn-danger btn-enroll w-100">Inscribirme</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="row g-3">
            <div v-for="(materia, index) in materias" :key="index" class="col-md-6">
              <div class="card h-100 border-0 shadow-sm bg-light materia-card">
                <div class="card-body text-dark">
                  <div class="d-flex align-items-center mb-2">
                    <i :class="['bi', materia.icon, 'fs-3 me-2 text-danger']"></i>
                    <h5 class="card-title fw-bold mb-0">{{ materia.title }}</h5>
                  </div>
                  <p class="card-text text-muted small mb-2">{{ materia.description }}</p>
                  <p class="fw-bold text-danger x-small mb-0" style="font-size: 0.8rem;">
                    <i class="bi bi-check2-circle me-1 text-success"></i>{{ materia.details }}
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="card border-0 bg-danger text-white shadow">
                <div class="card-body d-flex align-items-center p-4">
                  <div class="flex-shrink-0">
                    <i class="bi bi-arrow-right-circle-fill display-5 text-white ms-3"></i>
                  </div>
                  <div class="flex-grow-1 ms-4">
                    <h5 class="fw-bold mb-1">Práctica Arbitral Supervisada</h5>
                    <p class="mb-0 small text-white fw-bold">
                      Experiencia arbitral en encuentros de Mini Handball, amistosos en receso invernal y pretemporada de verano del año siguiente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-12 mb-4">
          <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block section-title">Cuerpo Docente</h2>
        </div>
        <div v-for="profe in cuerpoDocente" :key="profe.name" class="col-md-4 mb-4">
          <div class="card bg-dark border-secondary h-100 docente-card">
            <div class="card-body text-center p-4">
              <div class="mb-3 text-danger">
                <i :class="['bi', profe.icon, 'display-5']"></i>
              </div>
              <h5 class="fw-bold text-white mb-1">{{ profe.name }}</h5>
              <p class="text-danger small fw-bold mb-3 text-uppercase">{{ profe.role }}</p>
              <p class="card-text text-white-50 small italic">"{{ profe.bio }}"</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-12 mb-4">
          <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block section-title">Preguntas Frecuentes</h2>
        </div>
        <div class="col-lg-10 mx-auto">
          <div class="row">
            <div v-for="(faq, index) in faqs" :key="index" class="col-md-6 mb-4">
              <div class="card h-100 faq-card border-secondary text-white shadow-sm">
                <div class="card-body d-flex p-4">
                  <div class="me-3">
                    <i :class="['bi', faq.icon, 'fs-3 text-danger']"></i>
                  </div>
                  <div>
                    <h6 class="fw-bold text-white mb-2">{{ faq.q }}</h6>
                    <p class="text-white-50 small mb-0">{{ faq.a }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> </div> </template>

<style scoped>
.dark-background-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('../assets/cursos-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.course-card {
  border: none;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0,0,0,0.2);
}

.card-img-top {
  border-radius: 1rem 1rem 0 0;
  height: 250px;
  object-fit: cover;
}

.list-group-item {
  background-color: transparent;
  padding: 0.75rem 0;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  padding: 0.6rem;
  font-weight: bold;
}

.btn-enroll {
  transition: all 0.3s ease;
}
.btn-enroll:hover {
  background-color: #b02a37 !important;
  border-color: #a52834 !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

.materia-card {
  transition: all 0.3s ease;
}
.materia-card:hover {
  transform: translateY(-5px);
  background-color: #ffffff !important;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
}

.docente-card {
  transition: all 0.3s ease;
  border-radius: 15px;
}
.docente-card:hover {
  transform: translateY(-5px);
  border-color: #dc3545 !important;
  box-shadow: 0 10px 20px rgba(220, 53, 69, 0.2) !important;
}

.faq-card {
  background-color: rgba(33, 37, 41, 0.7) !important;
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.faq-card:hover {
  transform: translateY(-5px);
  border-color: #dc3545 !important;
}

.section-title {
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 1.5rem;
}

.italic {
  font-style: italic;
}

.x-small {
  color: #6c757d;
}
</style>
