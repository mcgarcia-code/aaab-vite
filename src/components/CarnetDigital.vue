<template>
  <div class="carnet-wrapper">
    <div class="search-section mb-5">
      <div class="input-group custom-search shadow-lg">
        <input
          v-model="dniBusqueda"
          type="text"
          class="form-control form-control-lg"
          placeholder="Ingrese DNI del árbitro sin puntos."
          @keyup.enter="buscarArbitro"
        >
        <button class="btn btn-danger px-5 fw-bold" @click="buscarArbitro" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <span v-else><i class="bi bi-search me-2"></i> BUSCAR</span>
        </button>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="arbitro" class="text-center">
        <div ref="carnetRef" class="credential-card mx-auto">
          <div class="cred-left">
            <div class="photo-box">
              <img
                :key="arbitro.dni"
                :src="`https://arbitroshandball.com.ar/assets/carnet-arbitros/${arbitro.dni}.jpg`"
                @error="setFallbackImg"
                alt="Foto Oficial"
              >
            </div>
            <div class="status-badge">
              <i class="bi bi-patch-check-fill me-1"></i> ARBITRO ACTIVO
            </div>
          </div>

          <div class="cred-right text-start">
            <div class="watermark">2026</div>

            <div class="cred-header d-flex align-items-center mb-4">
              <i class="bi bi-shield-check text-danger fs-4 me-2"></i>
              <span class="fw-bold text-secondary letter-spacing-1">CREDENCIAL DIGITAL AAAB</span>
            </div>

            <div class="cred-info">
              <div class="mb-4">
                <label class="text-uppercase small text-muted fw-bold">Apellido y Nombre</label>
                <h2 class="display-name">{{ arbitro.apellido.toUpperCase() }}, {{ arbitro.nombre }}</h2>
              </div>

              <div class="row g-0">
                <div class="col-6">
                  <label class="text-uppercase x-small text-muted fw-bold">Documento</label>
                  <p class="h4 fw-bold mb-0 text-dark">{{ arbitro.dni }}</p>
                </div>
                <div class="col-6 border-start ps-4">
                  <label class="text-uppercase x-small text-muted fw-bold">Grupo</label>
                  <p class="h4 fw-bold mb-0 text-danger">{{ arbitro.grupo }}</p>
                </div>
              </div>
            </div>

            <div class="cred-footer mt-auto d-flex align-items-center justify-content-between w-100">
               <div class="d-flex align-items-center flex-grow-1">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=https://arbitroshandball.com.ar" class="qr-code me-3" alt="QR">
                  <p class="mb-0 x-small fw-bold text-muted line-height-1">
                    ASOCIACIÓN ARGENTINA DE ÁRBITROS<br>DE HANDBALL
                  </p>
               </div>
               <div class="text-end ps-3 border-start ms-2" style="min-width: 110px;">
                 <p class="vencimiento mb-0 text-nowrap text-uppercase">Vence:<br>31/12/2026</p>
               </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <button @click="descargarCarnet" class="btn btn-danger btn-lg rounded-pill px-5 shadow-lg btn-hover-effect" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <span v-else><i class="bi bi-download me-2"></i> DESCARGAR</span>
          </button>
          <p class="text-white-50 small mt-3">
            <i class="bi bi-info-circle me-1"></i> Podes presentar esta credencial digital en la mesa de control.
          </p>
        </div>
      </div>
    </Transition>

    <div v-if="errorMsg" class="alert alert-custom-error mt-4 mx-auto shadow" style="max-width: 550px;">
      <i class="bi bi-exclamation-octagon-fill me-2"></i> {{ errorMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const dniBusqueda = ref('');
const arbitro = ref(null);
const errorMsg = ref('');
const loading = ref(false);
const carnetRef = ref(null);

const buscarArbitro = async () => {
  if (!dniBusqueda.value) return;

  loading.value = true;
  errorMsg.value = '';
  // Reseteamos el estado para forzar la limpieza del carnet anterior
  arbitro.value = null;

  try {
    const dniLimpio = dniBusqueda.value.trim();
    const response = await fetch(`https://arbitroshandball.com.ar/carnet/backend/buscar.php?dni=${dniLimpio}`);
    const res = await response.json();

    if (res.status === 'success') {
      // Normalizamos el DNI para que no contenga puntos o caracteres no numéricos
      res.data.dni = String(res.data.dni).replace(/\D/g, '');

      // Esperamos el siguiente ciclo para inyectar los datos y refrescar la imagen
      await nextTick();
      arbitro.value = res.data;
    } else {
      errorMsg.value = "El DNI ingresado no figura como árbitro activo en el 2026.";
    }
  } catch {
    errorMsg.value = "No se pudo establecer conexión con la base de datos.";
  } finally {
    loading.value = false;
  }
};

const descargarCarnet = async () => {
  if (!carnetRef.value) return;
  loading.value = true;

  try {
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(carnetRef.value, {
      backgroundColor: '#f8f9fa',
      scale: 3,
      useCORS: true,
      logging: false,
      imageTimeout: 0,
      // Dimensiones fijas para el renderizado del canvas
      width: 650,
      height: 380
    });

    const link = document.createElement('a');
    link.download = `Credencial_AAAB_${arbitro.value.dni}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch {
    alert("Error al generar la imagen.");
  } finally {
    loading.value = false;
  }
};

const setFallbackImg = (event) => {
  if (event.target.src.includes('default.png')) return;
  event.target.onerror = null;
  event.target.src = 'https://arbitroshandball.com.ar/assets/carnet-arbitros/default.png';
};
</script>

<style scoped>
.carnet-wrapper {
  padding-bottom: 50px;
}

.credential-card {
  /* Dimensiones fijas para el canvas de html2canvas */
  width: 650px;
  height: 380px;
  background: #fdfdfd;
  border-radius: 20px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.6);
  position: relative;
  border: 1px solid #e0e0e0;
}

.cred-left {
  width: 38%;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
}

.photo-box {
  width: 190px;
  height: 230px;
  background-color: #ffffff;
  padding: 5px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.photo-box img {
  width: 180px !important;
  height: 220px !important;
  object-fit: cover;
  border-radius: 8px;
}

.qr-code {
  width: 70px;
  height: 70px;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.status-badge {
  margin-top: 20px;
  background: #198754;
  color: white;
  padding: 6px 15px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.cred-right {
  width: 62%;
  padding: 35px;
  position: relative;
  display: flex;
  flex-direction: column;
  background-image: radial-gradient(circle at top right, rgba(220, 53, 69, 0.05), transparent);
}

.display-name {
  font-size: 1.9rem;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1.1;
  margin-top: 5px;
}

.watermark {
  position: absolute;
  bottom: -20px;
  right: 10px;
  font-size: 10rem;
  font-weight: 900;
  color: rgba(0,0,0,0.03);
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

.custom-search {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 50px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
}

.line-height-1 { line-height: 1.2; }
.x-small { font-size: 0.65rem; }
.letter-spacing-1 { letter-spacing: 1px; }

.vencimiento {
  font-size: 0.75rem;
  font-weight: bold;
  color: #adb5bd;
  line-height: 1.1;
  text-transform: uppercase;
}

.alert-custom-error {
  background: rgba(220, 53, 69, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid #dc3545;
  color: #fff;
  border-radius: 15px;
  text-align: center;
}

.slide-up-enter-active { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.slide-up-enter-from { opacity: 0; transform: translateY(40px); }

.btn-hover-effect:hover {
  transform: translateY(-3px);
  background-color: #bb2d3b !important;
}

@media (max-width: 768px) {
  /* La visualización en móvil es flexible, pero mantenemos las proporciones para el canvas */
  .credential-card { height: auto; flex-direction: column; max-width: 350px; width: 100%; }
  .cred-left, .cred-right { width: 100%; }
  .cred-right { padding: 25px; }
}
</style>
