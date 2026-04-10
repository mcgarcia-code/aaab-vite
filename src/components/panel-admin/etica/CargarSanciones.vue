<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">

    <div class="text-center mb-4">
      <i class="bi bi-shield-exclamation text-danger main-icon"></i>
      <h2 class="fw-bold text-white mt-2">Tribunal de Ética</h2>
      <p class="small text-white m-0">Carga de sanciones disciplinarias</p>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-md-11 col-lg-10">
        <div class="menu-card-static shadow-lg">
          <div class="row g-3">

            <!-- Árbitro -->
            <div class="col-12">
              <label class="fw-bold text-dark small mb-1">Árbitro</label>
              <select v-model="nuevaSancion.id_arbitro" class="form-select custom-input">
                <option value="">Seleccione un árbitro...</option>
                <option v-for="a in arbitros" :key="a.id" :value="a.id">
                  {{ a.apellido }}, {{ a.nombre }}
                </option>
              </select>
            </div>

            <!-- Artículo -->
            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Artículo</label>
              <input v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42" class="form-control custom-input">
            </div>

            <!-- Sanción -->
            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Sanción</label>
              <input v-model="nuevaSancion.sancion" placeholder="Ej: 2 fechas" class="form-control custom-input">
            </div>

            <!-- Motivo -->
            <div class="col-12">
              <label class="fw-bold text-dark small mb-1">Motivo / Descripción</label>
              <textarea v-model="nuevaSancion.motivo" rows="3" class="form-control custom-input" placeholder="Describí el motivo de la sanción..."></textarea>
            </div>

            <!-- Desde -->
            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Desde</label>
              <input type="date" v-model="nuevaSancion.desde" class="form-control custom-input">
            </div>

            <!-- Hasta o Indefinido -->
            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Hasta</label>
              <input
                type="date"
                v-model="nuevaSancion.hasta"
                class="form-control custom-input"
                :disabled="nuevaSancion.es_indefinido == 1"
              >
              <div class="form-check mt-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="chkIndefinido"
                  v-model="nuevaSancion.es_indefinido"
                  :true-value="1"
                  :false-value="0"
                  @change="() => { if (nuevaSancion.es_indefinido) nuevaSancion.hasta = '' }"
                >
                <label class="form-check-label small text-muted" for="chkIndefinido">
                  Sanción indefinida
                </label>
              </div>
            </div>

            <!-- Mensaje y botón -->
            <div class="col-12 mt-4">
              <div v-if="mensaje.texto" :class="['alert py-2 mb-3 text-center small', 'alert-' + mensaje.tipo]">
                {{ mensaje.texto }}
              </div>
              <button @click="guardarSancion" :disabled="cargando" class="btn-send shadow-sm">
                {{ cargando ? 'GUARDANDO...' : 'REGISTRAR SANCIÓN' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Cargar Sanción | AAAB',
  meta: [
    { name: 'description', content: 'Carga de sanciones disciplinarias del Tribunal de Ética.' },
    { property: 'og:title', content: 'Tribunal de Ética | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' },
  ],
});

const arbitros  = ref([]);
const cargando  = ref(false);
const mensaje   = ref({ texto: '', tipo: '' });

const sancionVacia = () => ({
  id_arbitro:   '',
  articulo:     '',
  sancion:      '',
  motivo:       '',
  desde:        '',
  hasta:        '',
  es_indefinido: 0,
});

const nuevaSancion = ref(sancionVacia());

/* ── Cargar lista de árbitros ── */
const cargarArbitros = async () => {
  try {
    // getArbitros no requiere parámetros extras
    const data = await api.get({ entity: 'arbitros', action: 'getArbitros' });
    arbitros.value = Array.isArray(data) ? data : (data.payload ?? []);
  } catch (err) {
    console.error('Error cargando árbitros:', err);
  }
};

/* ── Guardar sanción ── */
const guardarSancion = async () => {
  if (!nuevaSancion.value.id_arbitro || !nuevaSancion.value.desde) {
    mensaje.value = { texto: 'Seleccioná un árbitro y la fecha de inicio.', tipo: 'warning' };
    return;
  }
  if (!nuevaSancion.value.motivo.trim()) {
    mensaje.value = { texto: 'El motivo es obligatorio.', tipo: 'warning' };
    return;
  }

  cargando.value = true;
  try {
    await api.post({
      entity:  'sanciones',
      action:  'crear_sancion',
      payload: nuevaSancion.value,
    });
    mensaje.value = { texto: '✔ Sanción registrada correctamente.', tipo: 'success' };
    nuevaSancion.value = sancionVacia();
  } catch {
    mensaje.value = { texto: 'Error al conectar con el servidor.', tipo: 'danger' };
  } finally {
    cargando.value = false;
    setTimeout(() => (mensaje.value.texto = ''), 4000);
  }
};

onMounted(cargarArbitros);
</script>

<style scoped>
.menu-card-static {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  border-bottom: 6px solid #dc2626;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4) !important;
  margin: 0 auto;
  max-width: 1200px;
}

.main-icon {
  font-size: 3.5rem;
  filter: drop-shadow(0 0 10px rgba(220,38,38,0.3));
}

.text-danger { color: #dc2626 !important; }

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}
.custom-input:focus {
  background-color: #fff;
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220,38,38,0.15);
  outline: none;
}
.custom-input:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
}

.btn-send {
  width: 100%;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.btn-send:hover:not(:disabled) {
  transform: translateY(-4px);
  background-color: #b91c1c;
  box-shadow: 0 8px 20px rgba(220,38,38,0.4);
}
.btn-send:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.alert-success { background-color: #dcfce7; color: #166534; border-radius: 12px; border: none; }
.alert-danger  { background-color: #fee2e2; color: #991b1b; border-radius: 12px; border: none; }
.alert-warning { background-color: #fef9c3; color: #854d0e; border-radius: 12px; border: none; }

@media (max-width: 768px) {
  .menu-card-static { padding: 25px; }
  .main-icon { font-size: 2.8rem; }
}
</style>