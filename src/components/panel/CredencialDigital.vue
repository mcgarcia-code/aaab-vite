<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api'; 
import html2canvas from 'html2canvas';
import QrcodeVue from 'qrcode.vue';
import { useRouter } from 'vue-router';
import { useHead } from '@vueuse/head'
import logo from '@/assets/fotos/logo.png'

// Título y descripción específicos para la página de Credencial Digital AAAB
useHead({
  title: 'Credencial Digital | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Accedé a tu credencial digital de la AAAB.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Credencial Digital | AAAB',
    },
    {
      property: 'og:description',
      content: 'Accedé a tu credencial digital de la AAAB.',
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

const router = useRouter();
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
  const userRaw = sessionStorage.getItem('user_aaab');
  if (!userRaw) {
    router.push('/login');
    return;
  }

  const user = JSON.parse(userRaw);
  
  try {
    const res = await api.get({
      entity: 'datos_personales', // Esto hará que api.php busque credencial.php
      action: 'obtenerPerfil',
      payload: JSON.stringify({ dni: user.dni })
    });

    if (res.ok && res.payload) {
      arbitro.value = res.payload;
    } else {
      arbitro.value = user;
    }
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    arbitro.value = user;
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

<template>
  <div class="page-container">
    <div v-if="cargando" class="loader-full">
      <div class="spinner-border text-light"></div>
      <p class="text-light mt-2">Generando credencial oficial...</p>
    </div>

    <div v-else class="content animate__animated animate__fadeIn">
      
      <div ref="credencialRef" class="credencial-card">
        <div class="watermark-center">{{ añoActual }}</div>

        <div class="side-black">
          <div class="foto-wrap">
            <img 
              class="foto-arbitro"
              :src="`https://arbitroshandball.com.ar/resources/carnet-arbitros/${arbitro.dni}.webp?t=${new Date().getTime()}`" 
              @error="e => e.target.src = 'https://arbitroshandball.com.ar/resources/carnet-arbitros/default.webp'"
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
              <div class="info-group border-separator ps-4 ms-auto-md">
                <span class="label">GRUPO</span>
                <span class="val text-danger fw-bold">{{ arbitro.grupo }}</span>
              </div>
            </div>
          </div>

          <div class="footer-card">
            <div class="qr-container">
              <qrcode-vue :value="`https://arbitroshandball.com.ar/perfil/${arbitro.dni}`" :size="70" level="H" />
            </div>
            <div class="aaab-info">ASOCIACIÓN ARGENTINA<br>DE ÁRBITROS DE HANDBALL</div>
            <div class="expire">VENCE: 31/12/{{ añoActual }}</div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button class="btn-download shadow" @click="descargar" :disabled="procesando">
          <i class="bi me-2" :class="procesando ? 'bi-hourglass-split' : 'bi-download'"></i> 
          {{ procesando ? 'PROCESANDO...' : 'DESCARGAR IMAGEN' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  /* Fondo azul oscuro profesional */
  background: #0f172a; 
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loader-full {
  text-align: center;
}

.content {
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* --- TARJETA --- */
.credencial-card { 
  display: flex; 
  background: white; 
  border-radius: 20px; 
  overflow: hidden; 
  min-height: 420px; 
  border: none; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.3); 
  position: relative; 
}

.watermark-center {
  position: absolute; top: 50%; left: 70%; transform: translate(-50%, -50%);
  font-size: 11rem; font-weight: 900; color: rgba(0, 0, 0, 0.04); z-index: 0; pointer-events: none;
}

.side-black { 
  background: #1a1a1a; width: 35%; display: flex; flex-direction: column; 
  align-items: center; justify-content: center; padding: 20px; z-index: 1; 
}

.foto-wrap { 
  width: 160px; height: 160px; background: white; border-radius: 15px; 
  padding: 8px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
}

.foto-wrap img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }

.status-badge { color: white; padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 6px; }

.bg-active { background: #198754; } 
.bg-inactive { background: #dc3545; } 

.side-white { width: 65%; padding: 30px 35px; position: relative; display: flex; flex-direction: column; z-index: 1; text-align: left; }

.header-top { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 0.85rem; margin-bottom: 20px; color: #666; }

.info-vertical { display: flex; flex-direction: column; gap: 20px; flex-grow: 1; }

.info-row-parallel { display: flex; align-items: center; }

.label { color: #adb5bd; font-size: 0.7rem; font-weight: bold; display: block; margin-bottom: 3px; }

.name { font-weight: 900; font-size: 1.8rem; line-height: 1.1; color: #1a1a1a; margin: 0; }

.val { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; }

.border-separator { border-left: 1px solid #dee2e6; }

.footer-card { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; }

.qr-container { background: white; padding: 4px; border: 1px solid #eee; }

.aaab-info { font-size: 0.6rem; font-weight: bold; line-height: 1.2; color: #444; max-width: 120px; }

.expire { font-size: 0.7rem; font-weight: bold; color: #adb5bd; text-align: right; }

/* --- ACCIONES --- */
.actions-section { display: flex; justify-content: center; }

.btn-download { 
  background: #dc3545; color: white; border: none; padding: 16px 40px; border-radius: 50px; 
  font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; max-width: 400px;
}

.btn-download:hover:not(:disabled) { background: #a71d2a; transform: translateY(-2px); }

.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }

/* Estilo para el nuevo logo */
.logo-credencial {
  height: 90px; /* Ajusta el tamaño según necesites */
  width: auto;
  object-fit: contain;
}

/* Ajuste opcional para centrarlo mejor en el header */
.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 20px;
  color: #666;
}

/* --- RESPONSIVE --- */
@media (max-width: 650px) {
  .page-container { padding: 15px; }
  .credencial-card { flex-direction: column; min-height: auto; max-width: 340px; margin: 0 auto; }
  .side-black { width: 100%; padding: 30px 20px; }
  .side-white { width: 100%; padding: 30px 25px; text-align: center; }
  .header-top { justify-content: center; }
  .info-row-parallel { flex-direction: column; align-items: center; gap: 15px; }
  .border-separator { border-left: none; padding-left: 0 !important; }
  .footer-card { flex-direction: column; align-items: center; gap: 15px; }
  .expire, .aaab-info { text-align: center; }
  .watermark-center { font-size: 6rem; left: 50%; top: 75%; }
}
</style>