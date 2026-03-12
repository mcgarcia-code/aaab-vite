<script setup>
import { ref, onMounted } from 'vue';
import html2canvas from 'html2canvas';
import QrcodeVue from 'qrcode.vue';

// Corregido: Definimos las props sin asignarlas a una variable que no usamos
defineProps({
  mostrar: Boolean
});

const emit = defineEmits(['cerrar']);

const arbitro = ref({ nombre: '', apellido: '', dni: '', grupo: '', es_activo: 0 });
const añoActual = new Date().getFullYear();

onMounted(() => {
  const userJson = localStorage.getItem('user_aaab');
  if (userJson) {
    const datos = JSON.parse(userJson);
    arbitro.value = {
      nombre: datos.nombre || '',
      apellido: datos.apellido || '',
      dni: datos.dni || '',
      grupo: datos.grupo || '',
      es_activo: datos.es_activo 
    };
  }
});

const descargar = () => {
  setTimeout(async () => {
    const elemento = document.getElementById('credencial-render');
    
    try {
      const canvas = await html2canvas(elemento, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `Credencial-${arbitro.value.dni}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
  }, 400);
};
</script>

<template>
  <div v-if="mostrar" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-container animate__animated animate__fadeInDown animate__faster">
      
      <div id="credencial-render" class="credencial-card">
        
        <div class="watermark-center">{{ añoActual }}</div>

        <div class="side-black">
          <div class="foto-wrap">
            <img 
              class="foto-arbitro"
              :src="`https://arbitroshandball.com.ar/assets/carnet-arbitros/${arbitro.dni}.webp?t=${new Date().getTime()}`" 
              @error="e => e.target.src = 'https://arbitroshandball.com.ar/assets/carnet-arbitros/default.webp'"
            >
          </div>
          
          <div :class="['status-badge', arbitro.es_activo == 1 ? 'bg-active' : 'bg-inactive']">
            <i :class="arbitro.es_activo == 1 ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
            {{ arbitro.es_activo == 1 ? 'ARBITRO ACTIVO' : 'ARBITRO INACTIVO' }}
          </div>
        </div>

        <div class="side-white">
          <div class="header-top">
            <i class="bi bi-shield-check text-danger"></i> 
            <span>CREDENCIAL DIGITAL AAAB</span>
          </div>

          <div class="info-vertical">
            <div class="info-group">
              <span class="label">APELLIDO Y NOMBRE</span>
              <h1 class="name">{{ arbitro.apellido.toUpperCase() }}, {{ arbitro.nombre }}</h1>
            </div>

            <div class="info-row-parallel">
              <div class="info-group">
                <span class="label">DOCUMENTO</span>
                <span class="val">{{ arbitro.dni }}</span>
              </div>
              <div class="info-group border-separator ps-4">
                <span class="label">GRUPO</span>
                <span class="val text-danger fw-bold">{{ arbitro.grupo }}</span>
              </div>
            </div>
          </div>

          <div class="footer-card">
            <div class="qr-container">
              <qrcode-vue value="https://arbitroshandball.com.ar" :size="80" level="H" />
            </div>
            <div class="aaab-info">
              ASOCIACIÓN ARGENTINA<br>DE ÁRBITROS DE HANDBALL
            </div>
            <div class="expire">
              VENCE:<br>31/12/{{ añoActual }}
            </div>
          </div>
        </div>
      </div>

      <div class="actions mt-4 d-flex flex-column align-items-center">
        <button class="btn-download shadow" @click="descargar">
          <i class="bi bi-download me-2"></i> DESCARGAR CREDENCIAL
        </button>
        <button class="btn-close-text" @click="emit('cerrar')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- MODAL Y ESTRUCTURA --- */
.modal-overlay { 
  position: fixed; top: 0; left: 0; 
  width: 100%; height: 100%; 
  background: rgba(0,0,0,0.85); 
  display: flex; justify-content: center; align-items: center; 
  z-index: 9999; 
}

.modal-container { 
  max-width: 720px; 
  width: 95%; 
  max-height: 90vh;
  overflow-y: auto;
}

/* --- TARJETA --- */
.credencial-card { 
  display: flex; 
  background: white; 
  border-radius: 20px; 
  overflow: hidden; 
  min-height: 420px; 
  border: 5px solid white; 
  box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
  position: relative; 
}

.watermark-center {
  position: absolute;
  top: 50%;
  left: 70%; 
  transform: translate(-50%, -50%);
  font-size: 11rem;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.04);
  z-index: 0;
  pointer-events: none;
}

/* --- COLUMNA NEGRA --- */
.side-black { 
  background: #1a1a1a; 
  width: 35%; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  padding: 20px; 
  z-index: 1; 
}

.foto-wrap { 
  width: 180px; height: 180px; 
  background: white; 
  border-radius: 15px; 
  padding: 10px; 
  margin-bottom: 25px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
}

.foto-wrap img { 
  width: 100%; height: 100%; 
  object-fit: cover; 
  border-radius: 10px; 
}

.status-badge { 
  color: white; padding: 8px 18px; 
  border-radius: 50px; 
  font-weight: bold; font-size: 0.8rem; 
  display: flex; align-items: center; gap: 8px; 
  white-space: nowrap;
}

.bg-active { background: #198754; } 
.bg-inactive { background: #dc3545; } 

/* --- COLUMNA BLANCA --- */
.side-white { 
  width: 65%; 
  padding: 30px 45px; 
  position: relative; 
  text-align: left; 
  display: flex; flex-direction: column; 
  z-index: 1; 
}

.header-top { 
  display: flex; align-items: center; gap: 10px; 
  font-weight: bold; font-size: 0.9rem; 
  margin-bottom: 20px; color: #666;
}

.info-vertical { 
  display: flex; flex-direction: column; 
  gap: 25px; 
  flex-grow: 1; 
}

.info-row-parallel {
  display: flex;
  align-items: center;
}

.label { 
  color: #adb5bd; 
  font-size: 0.75rem; 
  font-weight: bold; 
  display: block; 
  margin-bottom: 5px;
}

.name { 
  font-weight: 900; font-size: 2rem; 
  line-height: 1.1; margin: 0; color: #1a1a1a; 
}

.val { 
  font-size: 1.6rem; 
  font-weight: 800; 
  color: #1a1a1a; 
}

.border-separator { border-left: 1px solid #dee2e6; }

/* --- FOOTER --- */
.footer-card { 
  margin-top: auto; 
  display: flex; align-items: flex-end; justify-content: space-between; 
}

.qr-container {
  background: white;
  padding: 5px;
  border: 1px solid #eee;
}

.aaab-info { 
  font-size: 0.65rem; font-weight: bold; 
  line-height: 1.2; color: #444; 
}

.expire { 
  font-size: 0.75rem; font-weight: bold; 
  color: #adb5bd; text-align: right; 
}

/* --- BOTONES --- */
.btn-download { 
  background: #dc3545; color: white; border: none; 
  padding: 16px 60px; border-radius: 50px; 
  font-weight: bold; font-size: 1.1rem; 
  cursor: pointer; transition: 0.2s; 
}

.btn-download:hover { background: #a71d2a; transform: scale(1.02); }

.btn-close-text { 
  cursor: pointer; margin-top: 20px; 
  color: white; background: none; border: none; 
  text-decoration: underline; opacity: 0.8; 
}

/* --- RESPONSIVE --- */
@media (max-width: 650px) {
  .credencial-card {
    flex-direction: column;
    height: auto;
    width: 320px;
    margin: 0 auto;
  }

  .side-black, .side-white {
    width: 100%;
  }

  .info-row-parallel {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .border-separator {
    border-left: none;
    padding-left: 0 !important;
  }

  .footer-card {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    text-align: center;
  }

  .expire, .aaab-info {
    text-align: center;
  }

  .watermark-center {
    font-size: 6rem;
    left: 50%;
    top: 75%;
  }
}
</style>