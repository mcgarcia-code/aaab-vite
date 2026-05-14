<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-5">Escuela de Formación Arbitral</h1>
        <p class="lead text-white-50">Hacia la profesionalización integral del arbitraje de handball.</p>
      </div>

      <div class="row g-4 justify-content-center mb-5">

        <div class="col-lg-5">
          <div class="card h-100 border-0 rounded-4 shadow-lg course-card overflow-hidden">
            <div class="position-relative">
              <img :src="infoInscripcion.image" class="card-img-top" alt="Escuela de Árbitros" style="height: 250px; object-fit: cover;" />
              <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));"></div>
            </div>

            <div class="card-body p-4 d-flex flex-column text-dark">
              <h3 class="card-title fw-bold mb-2">{{ infoInscripcion.title }}</h3>
              <p class="card-text text-muted mb-4 flex-grow-1">{{ infoInscripcion.description }}</p>

              <div class="d-flex flex-column gap-3 mb-4 bg-light p-3 rounded-3 border border-light-subtle">
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-check text-danger"></i> Inicio
                  </span>
                  <span class="fw-bold text-dark">{{ infoInscripcion.startDate }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-clock text-danger"></i> Duración
                  </span>
                  <span class="fw-bold text-dark">{{ infoInscripcion.duration }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center small">
                  <span class="text-muted fw-bold d-flex align-items-center gap-2">
                    <i class="bi bi-geo-alt text-danger"></i> Modalidad
                  </span>
                  <span class="fw-bold text-dark">{{ infoInscripcion.modality }}</span>
                </div>
              </div>

              <div class="mt-auto">
                <div class="alert alert-secondary small d-flex align-items-center gap-2 mb-3 shadow-sm border-secondary-subtle">
                  <i class="bi bi-info-circle-fill text-secondary fs-5"></i>
                  <span>Para aprobar se deben completar los <strong>{{ totalModulos }} módulos</strong>.</span>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <a :href="infoInscripcion.detailsLink" target="_blank" class="btn btn-light border shadow-sm w-100 btn-sm py-2 fw-bold">Ver Programa</a>
                  </div>
                  <div class="col-6">
                    <a :href="infoInscripcion.scheduleLink" target="_blank" class="btn btn-light border shadow-sm w-100 btn-sm py-2 fw-bold">Cronograma Anual</a>
                  </div>
                  <div class="col-12 mt-2">
                    <a :href="infoInscripcion.enrollLink" target="_blank" class="btn btn-danger btn-enroll w-100 py-2 fw-bold shadow-sm">INSCRIBIRME</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="row g-3">
            <div v-for="(materia, index) in materias" :key="index" class="col-md-6">
              <div class="card h-100 border-0 rounded-4 shadow-sm bg-light materia-card">
                <div class="card-body p-4 text-dark d-flex flex-column">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i :class="['bi', materia.icon, 'fs-3 text-danger']"></i>
                    <h5 class="card-title fw-bold mb-0 lh-sm">{{ materia.title }}</h5>
                  </div>
                  <p class="card-text text-muted small mb-3 flex-grow-1">{{ materia.description }}</p>
                  <p class="fw-bold text-dark small mb-0 mt-auto d-flex align-items-center gap-1">
                    <i class="bi bi-check2-circle text-success fs-6"></i> {{ materia.details }}
                  </p>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4">
              <div class="card border-0 bg-danger rounded-4 text-white shadow-lg p-2">
                <div class="card-body d-flex flex-column flex-sm-row align-items-center gap-4 text-center text-sm-start">
                  <div class="flex-shrink-0">
                    <i class="bi bi-arrow-right-circle-fill display-5 opacity-75"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-2">Práctica Arbitral Supervisada</h5>
                    <p class="mb-0 small text-white opacity-75 fw-bold">
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
        <div class="col-12 mb-4 text-center">
          <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block text-uppercase" style="letter-spacing: 1px;">Cuerpo Docente</h2>
        </div>

        <div v-for="profe in cuerpoDocente" :key="profe.name" class="col-lg-6 mb-3">
          <div class="card bg-dark border-secondary rounded-4 h-100 docente-horizontal-card">
            <div class="card-body d-flex align-items-center p-4 gap-3">
              <div class="flex-shrink-0">
                <img
                  :src="profe.image"
                  :alt="profe.name"
                  class="rounded-circle border border-2 border-danger shadow-sm"
                  style="width: 75px; height: 75px; object-fit: cover;"
                />
              </div>
              <div>
                <h5 class="fw-bold text-white mb-0">{{ profe.name }}</h5>
                <p class="text-danger small fw-bold mb-2 text-uppercase">{{ profe.role }}</p>
                <p class="card-text text-white-50 small mb-0 fst-italic">"{{ profe.bio }}"</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8 mx-auto mt-4">
          <div class="card bg-dark border-danger rounded-4 h-100 docente-horizontal-card shadow-lg">
            <div class="card-body d-flex flex-column flex-sm-row align-items-center p-4 gap-4">
              <div class="flex-shrink-0 d-none d-sm-flex align-items-center justify-content-center bg-dark border border-danger text-danger rounded-circle" style="width: 60px; height: 60px;">
                <i :class="['bi', staffInvitado.icon, 'fs-2']"></i>
              </div>
              <div class="text-center text-sm-start">
                <h5 class="fw-bold text-white mb-0">{{ staffInvitado.name }}</h5>
                <p class="text-danger small fw-bold mb-2 text-uppercase">{{ staffInvitado.role }}</p>
                <p class="card-text text-white-50 small mb-0 fst-italic">"{{ staffInvitado.bio }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5 pt-4">
        <div class="col-12 mb-4 text-center">
          <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block text-uppercase" style="letter-spacing: 1px;">Preguntas Frecuentes</h2>
        </div>
        <div class="col-lg-10 mx-auto">
          <div class="accordion accordion-flush rounded-4 overflow-hidden shadow-lg" id="faqAccordion" data-bs-theme="dark">
            <div v-for="(faq, index) in faqs" :key="index" class="accordion-item border-secondary bg-dark">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed fw-bold py-3"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + index"
                >
                  <i :class="['bi', faq.icon, 'me-3 text-danger fs-5']"></i>
                  {{ faq.q }}
                </button>
              </h2>
              <div :id="'collapse' + index" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body text-white-50 small lh-lg">
                  {{ faq.a }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

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
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Escuela de Formación Arbitral | AAAB',
    },
    {
      property: 'og:description',
      content: 'Programa de formación integral anual para árbitros de handball.',
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
    description: 'Taller de gestoformas, silbato y video-tests para unificación de criterios.',
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
  {
    name: 'Mariana García',
    role: 'Aspectos Reglamentarios, Práctica Arbitral',
    bio: 'Árbitra Internacional / Profesora de Ed. Física',
    image: new URL('../../assets/fotos/mariana-garcia.webp', import.meta.url).href
  },
  {
    name: 'Marcelo La Delfa',
    role: 'Aspectos Reglamentarios, Taller de Silbato y Gestoformas, Práctica Arbitral',
    bio: 'Árbitro Nacional / Profesor de Ed. Física',
    image: new URL('../../assets/fotos/marcelo-ladelfa.webp', import.meta.url).href
  },
  {
    name: 'María Inés Paolantoni',
    role: 'Aspectos Reglamentarios, Análisis de Video',
    bio: 'Árbitra Internacional / Abogada',
    image: new URL('../../assets/fotos/ines-paolantoni.webp', import.meta.url).href
  },
  {
    name: 'Tomas Moreno',
    role: 'Preparador Físico',
    bio: 'Árbitro Local / Profesor de Ed. Física especializado en alto rendimiento deportivo',
    image: new URL('../../assets/fotos/tomas-moreno.webp', import.meta.url).href
  },
  {
    name: 'Facundo Altamirano',
    role: 'Preparador Físico',
    bio: 'Árbitro Regional / Profesor de Ed. Física',
    image: new URL('../../assets/fotos/facundo-altamirano.webp', import.meta.url).href
  },
  {
    name: 'Mariela Policano',
    role: 'Análisis de Video, Encuentros de Mini Handball',
    bio: 'Árbitra Local',
    image: new URL('../../assets/fotos/mariela-policano.webp', import.meta.url).href
  },
  {
    name: 'Bárbara Fernández',
    role: 'Encuentros de Mini Handball',
    bio: 'Árbitra Nacional',
    image: new URL('../../assets/fotos/barbara-fernandez.webp', import.meta.url).href
  },
  {
    name: 'Nicolás Cimiotto',
    role: 'Encuentros de Mini Handball',
    bio: 'Árbitro Local / Técnico Químico',
    image: new URL('../../assets/fotos/nicolas-cimiotto.webp', import.meta.url).href
  }
])

const staffInvitado = ref({
  name: 'Espacios de Encuentro',
  role: 'Staff Invitado',
  bio: 'Psicólogos deportivos, Árbitros Referentes y Entrenadores de Formativas',
  icon: 'bi-mortarboard'
})

const faqs = ref([
  { q: '¿Qué días, en qué horario y dónde se cursa?', a: 'Las clases se dictan los días Martes de 19:30 a 21:30 horas en el ISEF N°2 Federico W. Dickens - Curapaligue 1150.', icon: 'bi-clock-history' },
  { q: '¿Cuáles son los requisitos de edad para inscribirse?', a: 'Se requiere un mínimo de 18 años cumplidos al año siguiente del curso y un máximo de menos de 50 años al momento de la inscripción.', icon: 'bi-person-badge' },
  { q: '¿Qué sucede si desapruebo un módulo?', a: 'Podés recursar únicamente la materia adeudada el año siguiente abonando el derecho de examen correspondiente.', icon: 'bi-patch-question' },
  { q: '¿Es obligatorio ser jugador?', a: 'No, pero se requiere conocimiento básico (ex-jugadores, estudiantes de Ed. Física, entrenadores, etc.).', icon: 'bi-info-circle' },
  { q: '¿Cuál es el régimen de asistencia requerido?', a: 'Se exige un mínimo del 75% de asistencia a las clases presenciales, entrenamientos y charlas obligatorias.', icon: 'bi-calendar-check' },
  { q: '¿Cuál es la política de cuotas?', a: 'Se abonan 8 cuotas de Abril a Noviembre. En caso de abandono, los pagos realizados no son reembolsables.', icon: 'bi-credit-card' },
  { q: '¿Cuándo se realizan las prácticas de arbitraje?', a: 'Se realizan encuentros de Mini Handball durante el ciclo lectivo y etapas de prácticas intensivas en partidos amistosos durante el receso invernal (julio) y la pretemporada (febrero).', icon: 'bi-arrow-right-circle'},
  { q: '¿Cómo se evalúa la preparación física?', a: 'Se califica como Aprobado/Desaprobado mediante el Shuttle Run Test (Mujeres estadío 8.5 / Hombres estadío 9.5).', icon: 'bi-lightning-charge' },
  { q: '¿Existe un compromiso ético al inscribirse?', a: 'Sí, el aspirante se compromete al respeto absoluto hacia el colectivo arbitral en ejercicio y al correcto manejo de su imagen en redes sociales.', icon: 'bi-shield-check' }
])

const infoInscripcion = ref({
  title: 'Ciclo Lectivo 2026',
  description: 'Nuestro programa anual está destinado a personas con conocimientos básicos y experiencia en el Handball, que deseen incorporarse a nuestra plantilla arbitral',
  image: new URL('../../assets/fotos/curso-avanzado.webp', import.meta.url).href,
  startDate: 'Abril 2026',
  duration: 'Anual (Abril a Noviembre)',
  modality: 'Presencial',
  detailsLink: 'https://drive.google.com/file/d/13cOvOnxxG1P3zoDBx4IrlUMbFdOO37hq/view?usp=sharing',
  enrollLink: 'https://forms.gle/TxrzdSs1if8pX8n99',
  scheduleLink: 'https://drive.google.com/file/d/1jb5t2ek3zIwSaXVFr4sR-ZMh8QeDMi1z/view?usp=sharing',
})
</script>


<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.dark-background-section {
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/cursos-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   EFECTOS HOVER (TARJETAS)
   ==================================================== */
.course-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.4) !important;
}

.materia-card {
  transition: all 0.3s ease;
}
.materia-card:hover {
  transform: translateY(-5px);
  background-color: #ffffff !important;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
}

.docente-horizontal-card {
  transition: all 0.3s ease;
}
.docente-horizontal-card:hover {
  transform: translateX(10px);
  border-color: #dc3545 !important;
}

/* ====================================================
   BOTONES
   ==================================================== */
.btn-enroll {
  transition: all 0.3s ease;
}
.btn-enroll:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4) !important;
}

/* Animación de entrada general */
.animate__animated {
  animation-duration: 0.8s;
}

</style>
