<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-5">Centro de Descargas</h1>
        <p class="lead text-white-50">
          Selecciona una categoría para ver los documentos disponibles.
        </p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="accordion" id="downloadsAccordion">

            <div
              v-for="(categoria, index) in categorias"
              :key="categoria.titulo"
              class="accordion-item border-0 rounded-4 shadow-sm mb-3 overflow-hidden"
            >
              <h2 class="accordion-header" :id="'heading' + index">
                <button
                  class="accordion-button collapsed bg-white p-4 shadow-none border-0"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + index"
                  aria-expanded="false"
                  :aria-controls="'collapse' + index"
                >
                  <div class="d-flex align-items-center">
                    <i :class="[categoria.icon, 'text-danger fs-2 me-3']"></i>
                    <div>
                      <h5 class="fw-bold mb-1 text-dark">{{ categoria.titulo }}</h5>
                      <span class="small text-muted d-block lh-sm">{{ categoria.subtitulo }}</span>
                    </div>
                  </div>
                </button>
              </h2>

              <div
                :id="'collapse' + index"
                class="accordion-collapse collapse"
                :aria-labelledby="'heading' + index"
                data-bs-parent="#downloadsAccordion"
              >
                <div class="accordion-body bg-white pt-0 pb-4 px-3 px-md-5">
                  <div class="list-group list-group-flush border-top pt-2 mt-1 border-light-subtle">

                    <a
                      v-for="doc in categoria.documentos"
                      :key="doc.nombre"
                      :href="doc.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="list-group-item list-group-item-action d-flex align-items-center py-3 border-0 rounded-3 mb-1 document-link"
                    >
                      <div class="bg-danger-subtle text-danger me-3 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 42px; height: 42px; border-radius: 50%;">
                        <i class="bi bi-download fs-5"></i>
                      </div>

                      <span class="fw-bold text-dark flex-grow-1">{{ doc.nombre }}</span>

                      <i class="bi bi-chevron-right text-muted small opacity-50 d-none d-sm-block"></i>
                    </a>

                  </div>
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
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de DESCARGAS
useHead({
  title: 'Descargas | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Accedé a reglamentos, planillas y todo el material oficial actualizado.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Descargas | AAAB',
    },
    {
      property: 'og:description',
      content: 'Accedé a reglamentos, planillas y todo el material oficial actualizado.',
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
// Los datos que estaban en data() ahora son un ref()
const categorias = ref([
  // NUEVA CATEGORÍA: CARNET DIGITAL
  /*{
    titulo: 'Árbitros habilitados',
    subtitulo: 'Consultá si un árbitro esta activo o inactivo.',
    icon: 'bi bi-person-vcard-fill', // Icono de Bootstrap
    documentos: [
      {
        nombre: 'Accedé al Carnet Digital',
        url: '/carnet-digital', // Cambia esto por la ruta que definiste en tu router
      },
    ],
  },*/
  {
    titulo: 'Material útil para árbitros.',
    subtitulo: 'Guías, aranceles y herramientas para tu labor.',
    icon: 'bi bi-tools',
    documentos: [
      {
        nombre: 'Aranceles Arbitrales',
        url: 'https://drive.google.com/file/d/1V63gp4oYWYVRAxWFJiFdi8v69tyF4r-q/view?usp=sharing',
      },
      {
        nombre: 'Función Tablero Casa del Handball',
        url: 'https://drive.google.com/file/d/1Xl7G0SitpSAMvm6T-Jgy42VjjB3VScv5/view?usp=sharing',
      },
      {
        nombre: 'Tutorial Nuevo Sistema Fe.Me.Bal',
        url: 'https://drive.google.com/file/d/1ZOFbUhhp6qnECW6dlfAKjrC9LHOgRDRq/view?usp=drive_link',
      },
      {
        nombre: 'Reglamento Casa del Handball',
        url: 'https://drive.google.com/file/d/1spcog4TH7nVlETl1NkrQQoPnTmTP5R0S/view?usp=drive_link',
      },
    ],
  },
  {
    titulo: 'Informes y planillas',
    subtitulo: 'Todo lo necesario para tus reportes de partidos.',
    icon: 'bi bi-clipboard2-data-fill',
    documentos: [
      {
        nombre: 'Formato de Informes',
        url: 'https://docs.google.com/document/d/1PSyCvikda54EiD8C3cWMIDOl2jl1_UFD-ZMUEWe36yw/edit?usp=drive_link',
      },
      {
        nombre: 'Borrador Planilla de Observación',
        url: 'https://drive.google.com/file/d/1-NcTS6K9wJ_uzfRqG14ShldpcjSidVTB/view?usp=drive_link',
      },
      {
        nombre: 'Planilla de Observación Final',
        url: 'https://docs.google.com/spreadsheets/d/1POiK2JSYPxr0hjnJHSn8n6bCS7TFwUxW/edit?usp=drive_link&ouid=110583671843914808563&rtpof=true&sd=true',
      },
      {
        nombre: 'Performance Arbitral',
        url: 'https://drive.google.com/file/d/1U6UDK4Zn3zdF11a0ssw-GtKJHScuPcvh/view?usp=drive_link',
      },
    ],
  },
  {
    titulo: 'Catálogo de preguntas y respuestas',
    subtitulo: 'Documentos oficiales de la IHF.',
    icon: 'bi bi-patch-question-fill',
    documentos: [
      {
        nombre: 'Catálogo IHF Español',
        url: 'https://drive.google.com/file/d/1eh384p7w8QAQx0YmqR6I1e2IiXCid5TF/view?usp=sharing',
      },
      {
        nombre: 'Catálogo IHF Inglés',
        url: 'https://drive.google.com/file/d/1sGmXprM9veBXIjZop7jox0jKvk_42N1k/view?usp=drive_link',
      },
    ],
  },
  {
    titulo: 'Reglamentos',
    subtitulo: 'Reglamentos oficiales de Handball y Beach Handball.',
    icon: 'bi bi-book-half',
    documentos: [
      { nombre: 'Handball Indoor Español', url: 'https://drive.google.com/file/d/1b6xNn6LXfTXewmJ3lc3XwzVKGfZU92dF/view?usp=drive_link' },
      {
        nombre: 'Handball Indoor Inglés',
        url: 'https://drive.google.com/file/d/12gS1Xxik5Ej_cCqKBetwid3PKJa8MvWv/view?usp=drive_link',
      },
      { nombre: 'Beach Handball Español', url: '#' },
      {
        nombre: 'Beach Handball Inglés',
        url: 'https://drive.google.com/file/d/1n-f_W3bQ5H_gCah2SYMpqB8ZF5p3nbCD/view?usp=drive_link',
      },
      {
        nombre: 'Mini, Infantiles y Menores',
        url: 'https://drive.google.com/file/d/1ui87QUfCC0w6UDhR7KOK-qpjgiL9TbVc/view?usp=drive_link',
      },
    ],
  },
  {
    titulo: 'Examen Físico',
    subtitulo: 'Material y procedimientos para tu evaluación física.',
    icon: 'bi bi-heart-pulse-fill',
    documentos: [
      {
        nombre: 'Audio Yoyo-Test',
        url: 'https://drive.google.com/file/d/13EFnGk5Bx3_2OkFCXG1EvgCewCIxJpn3/view',
      },
      { nombre: 'Protoloco Yoyo-Test',
        url: 'https://docs.google.com/document/d/1w_QvpaQ-gBBmiqH8F2bb9skxbypj7t7q/edit?usp=sharing&ouid=110583671843914808563&rtpof=true&sd=true'
      },
    ],
  },
  {
    titulo: 'Facturación ARCA',
    subtitulo: 'Información y guías para tu facturación.',
    icon: 'bi bi-receipt-cutoff',
    documentos: [
      {
        nombre: 'Charla sobre Monotributo',
        url: 'https://drive.google.com/file/d/1GWO-a8bh8tPg-nltri-snSiBV1Znk9b2/view',
      },
      {
        nombre: 'Inscripción Monotributo',
        url: 'https://drive.google.com/file/d/1VEN0N7GFwlFJoojm1Ne2KxpxUGyxR5nr/view',
      },
      {
        nombre: 'Instructivo Facturación',
        url: 'https://drive.google.com/file/d/1FVrVSnGIU9rHeSOxzkn7X4xK9wIWmv2N/view',
      },
    ],
  },
  {
    titulo: 'Procedimientos',
    subtitulo: 'Manuales y datos útiles para tu desempeño arbitral.',
    icon: 'bi bi-folder-check',
    documentos: [
      {
        nombre: 'Manual de Prodecimientos Administrativos - Mini Handball',
        url: 'https://drive.google.com/file/d/1oTxWmSdxERSN1K2mrZIAMAWVn0sAiIWm/view?usp=sharing',
      },
      {
        nombre: 'Manual de Procedimientos Administrativos - General',
        url: 'https://drive.google.com/file/d/1kNsMf0UeZWLcnTbcdYpeHl38iaRFUfhu/view?usp=sharing',
      },
      {
        nombre: 'E-mails Institucionales',
        url: 'https://drive.google.com/file/d/1nQ1-5qFoWVLcKWIaE5UU1QjDETkPg4S2/view?usp=sharing',
      },
    ],
  },
])
</script>

<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.dark-background-section {
  /* Usamos un color oscuro azulado para mantener consistencia con el panel */
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/descargas-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   AJUSTES DEL ACORDEÓN DE BOOTSTRAP
   ==================================================== */
/* Evitar el color de fondo azul de Bootstrap al abrir el acordeón */
.accordion-button:not(.collapsed) {
  background-color: #ffffff !important;
  color: inherit;
  box-shadow: none;
}

/* Flecha del acordeón sutil */
.accordion-button::after {
  filter: opacity(0.5);
}

/* ====================================================
   EFECTOS HOVER DOCUMENTOS
   ==================================================== */
.document-link {
  transition: all 0.2s ease;
}

.document-link:hover {
  background-color: #f8fafc !important; /* Gris ultra claro */
  transform: translateX(8px); /* Desplazamiento moderno hacia la derecha */
}

/* Animación de entrada general */
.animate__animated {
  animation-duration: 0.8s;
}
</style>
