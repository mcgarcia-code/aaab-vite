<template>
  <div class="container-fluid py-4 d-flex justify-content-center animate__animated animate__fadeIn">

    <div v-if="cargando" class="loader-full text-center mt-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-white mt-2 fw-bold">Generando credencial oficial...</p>
    </div>

    <div v-else class="w-100 d-flex flex-column gap-4" style="max-width: 750px;">

      <!-- Contenedor Principal del Carnet -->
      <div ref="credencialRef" class="card border-0 shadow-lg position-relative overflow-hidden mx-auto w-100" style="border-radius: 20px;">

        <!-- Marca de agua de fondo -->
        <div class="watermark-center">{{ añoActual }}</div>

        <div class="row g-0 h-100 position-relative z-1">

          <!-- LADO NEGRO (Foto y Estado) -->
          <div class="col-12 col-md-4 d-flex flex-column align-items-center justify-content-center p-4 p-md-5" style="background-color: #1a1a1a;">
            <div class="foto-wrap shadow-lg">
              <img
                class="w-100 h-100 object-fit-cover"
                style="border-radius: 10px;"
                :src="`https://arbitroshandball.com.ar/uploads/carnet-arbitros/${String(arbitro.dni).trim()}.webp?t=${new Date().getTime()}`"
                @error="e => e.target.src = 'https://ui-avatars.com/api/?name=Sin+Foto&background=ef4444&color=fff'"
              >
            </div>

            <div class="badge rounded-pill px-3 py-2 mt-4 d-inline-flex align-items-center gap-2 shadow-sm"
                 :class="arbitro.es_activo == 1 ? 'bg-success' : 'bg-danger'"
                 style="font-size: 0.75rem; letter-spacing: 0.5px;">
              <i :class="arbitro.es_activo == 1 ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              {{ arbitro.es_activo == 1 ? 'ACTIVO' : 'INACTIVO' }}
            </div>
          </div>

          <!-- LADO BLANCO (Información) -->
          <div class="col-12 col-md-8 bg-white d-flex flex-column p-4 p-md-5 text-center text-md-start">

            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4 text-secondary fw-bold small">
              <img :src="logo" alt="Logo AAAB" style="height: 80px; width: auto; object-fit: contain;">
              <span>CREDENCIAL DIGITAL</span>
            </div>

            <div class="d-flex flex-column gap-3 flex-grow-1">
              <div>
                <span class="text-secondary fw-bold d-block mb-1" style="font-size: 0.75rem;">APELLIDO Y NOMBRE</span>
                <h1 class="fw-black text-dark m-0" style="font-size: clamp(1.5rem, 5vw, 2rem); line-height: 1.1;">
                  {{ (arbitro.apellido || '').toUpperCase() }}, {{ arbitro.nombre }}
                </h1>
              </div>

              <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start mt-2">
                <div class="text-center text-md-start">
                  <span class="text-secondary fw-bold d-block mb-1" style="font-size: 0.75rem;">DOCUMENTO</span>
                  <span class="fw-bolder text-dark" style="font-size: 1.4rem;">{{ arbitro.dni }}</span>
                </div>

                <!-- Línea divisoria nativa de Bootstrap (Solo en escritorio) -->
                <div class="vr d-none d-md-block mx-4 text-secondary opacity-25"></div>

                <div class="text-center text-md-start mt-3 mt-md-0">
                  <span class="text-secondary fw-bold d-block mb-1" style="font-size: 0.75rem;">GRUPO</span>
                  <span class="fw-bolder text-danger" style="font-size: 1.4rem;">{{ arbitro.grupo }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-3 mt-4 mt-md-auto pt-4">
              <div class="bg-white p-1 border rounded shadow-sm">
                <qrcode-vue :value="`https://arbitroshandball.com.ar/perfil/${arbitro.dni}`" :size="70" level="H" />
              </div>
              <div class="text-center text-md-start fw-bold" style="font-size: 0.65rem; color: #444; line-height: 1.2;">
                ASOCIACIÓN ARGENTINA<br>DE ÁRBITROS DE HANDBALL
              </div>
              <div class="text-center text-md-end fw-bold text-muted" style="font-size: 0.75rem;">
                VENCE: 31/12/{{ añoActual }}
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Botón Descargar -->
      <div class="d-flex justify-content-center w-100 mt-2">
        <button class="btn btn-danger rounded-pill fw-bold shadow py-3 w-100 d-flex justify-content-center align-items-center btn-download" @click="descargar" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-download me-2"></i>
          {{ procesando ? 'PROCESANDO...' : 'DESCARGAR IMAGEN' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api';
import html2canvas from 'html2canvas';
import QrcodeVue from 'qrcode.vue';
import { useHead } from '@vueuse/head';
import logo from '@/assets/fotos/logo.png';

useHead({
  title: 'Credencial Digital | AAAB',
  meta: [
    { name: 'description', content: 'Accedé a tu credencial digital de la AAAB.' },
    { property: 'og:title', content: 'Credencial Digital | AAAB' },
    { property: 'og:description', content: 'Accedé a tu credencial digital de la AAAB.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const credencialRef = ref(null);
const procesando = ref(false);
const cargando = ref(true);

const arbitro = ref({
  nombre: '',
  apellido: '',
  dni: '',
  grupo: '',
  es_activo: 0
});

const añoActual = new Date().getFullYear();

const cargarDatos = async () => {
  try {
    const res = await api.get({
      entity: 'datos_personales',
      action: 'obtenerPerfil',
    });

    if (res.ok && res.payload) {
      arbitro.value = res.payload;
    }
  } catch (error) {
    console.error("Error al conectar con la API:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarDatos);

const descargar = async () => {
  if (procesando.value || !credencialRef.value) return;
  procesando.value = true;
  try {
    const canvas = await html2canvas(credencialRef.value, {
      useCORS: true,
      scale: 3,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = `Credencial-${arbitro.value.dni}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch (e) {
    console.error(e);
  } finally {
    procesando.value = false;
  }
};
</script>

<style scoped>
/* ====================================================
   ESTILOS ULTRA ESPECÍFICOS Y MARCA DE AGUA
   ==================================================== */
.watermark-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);
  z-index: 0;
  pointer-events: none;
}

.foto-wrap {
  width: clamp(140px, 30vw, 160px);
  height: clamp(140px, 30vw, 160px);
  background: white;
  padding: 8px;
  border-radius: 15px;
}

.fw-black {
  font-weight: 900;
}

/* Efecto hover del botón nativo */
.btn-download {
  max-width: 400px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-download:hover:not(:disabled) {
  background: #a71d2a;
  transform: translateY(-2px);
}

.animate__animated { animation-duration: 0.5s; }

</style>
