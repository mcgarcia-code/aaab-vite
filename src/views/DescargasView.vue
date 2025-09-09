<script setup>
import { ref } from 'vue'

// Los datos que estaban en data() ahora son un ref()
const categorias = ref([
  {
    titulo: 'Material útil para árbitros',
    subtitulo: 'Guías, aranceles y herramientas para tu labor.',
    icon: 'bi bi-tools',
    documentos: [
      {
        nombre: 'Aranceles Arbitrales 2025',
        url: 'https://drive.google.com/file/d/1Q1zZt2go59F2oUwPk8tpKUpQUDVBYQlU/view?usp=sharing',
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
        url: 'https://docs.google.com/document/d/13ZOhx1FsbbT09jp1QObL25IXxrEw_luH/edit?usp=sharing&ouid=110583671843914808563&rtpof=true&sd=true',
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
      { nombre: 'Handball Indoor Español', url: '#' },
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
      { nombre: 'Protoloco Yoyo-Test', url: '#' },
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
        nombre: 'Manual de Prodecimientos Administrativos de Mini Handball',
        url: 'https://drive.google.com/file/d/1QLcULE_tfzCLVmZVXntHkSZBAK5LGMnM/view',
      },
      {
        nombre: 'Datos Útiles 2025',
        url: 'https://drive.google.com/file/d/1ksZE-mSO-iaFJWg2LtVdDTYI6syB0Jmq/view',
      },
      {
        nombre: 'Cuestiones Admnistrativas',
        url: 'https://drive.google.com/file/d/1y-h80-Iqtc3bUI_BuBhR8ywbV2JgscXP/view',
      },
    ],
  },
])
</script>

<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Centro de Descargas</h1>
        <p class="lead text-white-50">
          Selecciona una categoría para ver los documentos disponibles.
        </p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="accordion accordion-flush" id="downloadsAccordion">
            <div
              v-for="(categoria, index) in categorias"
              :key="categoria.titulo"
              class="accordion-item"
            >
              <h2 class="accordion-header" :id="'heading' + index">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + index"
                  aria-expanded="false"
                  :aria-controls="'collapse' + index"
                >
                  <i :class="[categoria.icon, 'category-icon me-3']"></i>
                  <div>
                    <span class="category-title">{{ categoria.titulo }}</span>
                    <small class="category-subtitle d-block">{{ categoria.subtitulo }}</small>
                  </div>
                </button>
              </h2>
              <div
                :id="'collapse' + index"
                class="accordion-collapse collapse"
                :aria-labelledby="'heading' + index"
                data-bs-parent="#downloadsAccordion"
              >
                <div class="accordion-body">
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="doc in categoria.documentos"
                      :key="doc.nombre"
                      class="list-group-item"
                    >
                      <a
                        :href="doc.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="document-link"
                      >
                        <i class="bi bi-download me-2"></i>
                        {{ doc.nombre }}
                      </a>
                    </li>
                  </ul>
                </div>
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
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('../assets/descargas-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}

.accordion-item {
  background-color: #ffffff;
  border: none;
  border-radius: 0.5rem !important;
  margin-bottom: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.accordion-button {
  font-weight: 600;
  color: #343a40;
  background-color: #ffffff;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: var(--bs-danger);
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.category-icon {
  font-size: 1.8rem;
  color: var(--bs-danger);
}

.category-title {
  font-size: 1.1rem;
}

.category-subtitle {
  font-size: 0.85rem;
  font-weight: 400;
  color: #6c757d;
}

.accordion-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.document-link {
  display: block;
  padding: 0.75rem 0;
  color: #212529;
  text-decoration: none;
  transition: color 0.2s;
}

.document-link:hover {
  color: var(--bs-danger);
}

.document-link i {
  color: var(--aaab-primary);
}
</style>
