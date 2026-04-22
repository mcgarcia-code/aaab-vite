<template>
  <div class="container-fluid py-4 d-flex justify-content-center animate__animated animate__fadeIn">

    <div v-if="cargando" class="loader-full text-center mt-5">
      <div class="spinner-border text-light"></div>
      <p class="text-light mt-2 fw-bold">Generando credencial oficial...</p>
    </div>

    <div v-else class="content w-100 d-flex flex-column gap-4" style="max-width: 720px;">

      <div ref="credencialRef" class="credencial-card">
        <div class="watermark-center">{{ añoActual }}</div>

        <div class="side-black">
          <div class="foto-wrap">
            <img
              class="foto-arbitro"
              :src="`https://arbitroshandball.com.ar/api/uploads/carnet-arbitros/${String(arbitro.dni).trim()}.webp?t=${new Date().getTime()}`"
              @error="e => e.target.src = 'https://ui-avatars.com/api/?name=Sin+Foto&background=ef4444&color=fff'"
            >
          </div>
          <div :class="['status-badge', arbitro.es_activo == 1 ? 'bg-active' : 'bg-inactive']">
            <i :class="arbitro.es_activo == 1 ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
            {{ arbitro.es_activo == 1 ? 'ACTIVO' : 'INACTIVO' }}
          </div>
        </div>

        <div class="side-white">
          <div class="header-top">
            <img :src="logo" alt="Logo AAAB" class="logo-credencial">
            <span>CREDENCIAL DIGITAL</span>
          </div>

          <div class="info-vertical">
            <div class="info-group">
              <span class="label">APELLIDO Y NOMBRE</span>
              <h1 class="name">{{ (arbitro.apellido || '').toUpperCase() }}, {{ arbitro.nombre }}</h1>
            </div>

            <div class="info-row-parallel">
              <div class="info-group">
                <span class="label">DOCUMENTO</span>
                <span class="val">{{ arbitro.dni }}</span>
              </div>
              <div class="info-group border-separator ms-md-auto">
                <span class="label">GRUPO</span>
                <span class="val text-danger fw-bold">{{ arbitro.grupo }}</span>
              </div>
            </div>
          </div>

          <div class="footer-card">
            <div class="qr-container shadow-sm">
              <qrcode-vue :value="`https://arbitroshandball.com.ar/perfil/${arbitro.dni}`" :size="70" level="H" />
            </div>
            <div class="aaab-info">ASOCIACIÓN ARGENTINA<br>DE ÁRBITROS DE HANDBALL</div>
            <div class="expire">VENCE: 31/12/{{ añoActual }}</div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="btn-download shadow" @click="descargar" :disabled="procesando">
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
   1. BASE MOBILE-FIRST (Celulares por defecto)
   ==================================================== */
.credencial-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  max-width: 340px;
  margin: 0 auto;
  border: none;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  position: relative;
}

.watermark-center {
  position: absolute;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.04);
  z-index: 0;
  pointer-events: none;
}

.side-black {
  background: #1a1a1a;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  z-index: 1;
}

.foto-wrap {
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 15px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.foto-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.status-badge {
  color: white;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
}
.bg-active { background: #198754; }
.bg-inactive { background: #dc3545; }

.side-white {
  width: 100%;
  padding: 30px 25px;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
  text-align: center;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 20px;
  color: #666;
}

.logo-credencial {
  height: 90px;
  width: auto;
  object-fit: contain;
}

.info-vertical { display: flex; flex-direction: column; gap: 20px; flex-grow: 1; }
.info-row-parallel { display: flex; flex-direction: column; align-items: center; gap: 15px; }

.label { color: #adb5bd; font-size: 0.7rem; font-weight: bold; display: block; margin-bottom: 3px; }
.name { font-weight: 900; font-size: 1.8rem; line-height: 1.1; color: #1a1a1a; margin: 0; }
.val { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; }
.border-separator { border-left: none; }

.footer-card { margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.qr-container { background: white; padding: 4px; border: 1px solid #eee; border-radius: 8px; }
.aaab-info { font-size: 0.6rem; font-weight: bold; line-height: 1.2; color: #444; max-width: 120px; text-align: center; }
.expire { font-size: 0.7rem; font-weight: bold; color: #adb5bd; text-align: center; }

/* --- ACCIONES --- */
.actions-section { display: flex; justify-content: center; width: 100%; margin-top: 10px; }

.btn-download {
  background: #dc3545; color: white; border: none; padding: 16px 40px; border-radius: 50px;
  font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; max-width: 400px;
}
.btn-download:hover:not(:disabled) { background: #a71d2a; transform: translateY(-2px); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }

/* ====================================================
   2. DESKTOP (A partir de 651px)
   ==================================================== */
@media (min-width: 651px) {
  .credencial-card {
    flex-direction: row;
    min-height: 420px;
    max-width: none;
  }

  .watermark-center { font-size: 11rem; left: 70%; top: 50%; }
  .side-black { width: 35%; padding: 20px; }
  .side-white { width: 65%; padding: 30px 35px; text-align: left; }
  .header-top { justify-content: flex-start; }

  .info-row-parallel { flex-direction: row; align-items: center; gap: 0; }
  .border-separator { border-left: 1px solid #dee2e6; padding-left: 1.5rem !important; }

  .footer-card { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 0; }
  .aaab-info { text-align: left; }
  .expire { text-align: right; }
}
</style>
