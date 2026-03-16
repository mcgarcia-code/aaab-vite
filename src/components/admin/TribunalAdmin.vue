<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL_BE = 'https://arbitroshandball.com.ar/api/api.php';
const API_URL_ARBITROS = 'https://arbitroshandball.com.ar/api/acciones.php';

const arbitros = ref([]);
const cargando = ref(false);
const mensaje = ref({ texto: '', tipo: '' });

const nuevaSancion = ref({
  id_arbitro: '', motivo: '', articulo: '', sancion_detalle: '', fecha_desde: '', fecha_hasta: ''
});

const cargarArbitros = async () => {
  try {
    const res = await axios.get(API_URL_ARBITROS);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { console.error("Error:", err); }
};

const guardarSancion = async () => {
  if (!nuevaSancion.value.id_arbitro || !nuevaSancion.value.fecha_desde) {
    alert("Por favor completa el árbitro y la fecha de inicio.");
    return;
  }
  cargando.value = true;
  try {
    await axios.post(API_URL_BE, {
      entity: 'sanciones',
      action: 'crear_sancion',
      payload: nuevaSancion.value
    });
    mensaje.value = { texto: 'Sanción registrada correctamente', tipo: 'success' };
    Object.keys(nuevaSancion.value).forEach(k => nuevaSancion.value[k] = '');
    setTimeout(() => mensaje.value.texto = '', 3000);
  } catch {
    mensaje.value = { texto: 'Error al conectar con el servidor', tipo: 'danger' };
  } finally { cargando.value = false; }
};

onMounted(cargarArbitros);
</script>

<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    
    <div class="text-center mb-4">
      <i class="bi bi-shield-exclamation text-danger main-icon"></i>
      <h2 class="fw-bold text-dark mt-2">Tribunal de Ética</h2>
      <p class="small text-muted m-0">Carga de sanciones disciplinarias</p>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="menu-card-static shadow">
          <div class="row g-3">
            
            <div class="col-12">
              <label class="fw-bold text-dark small mb-1">Árbitro</label>
              <select v-model="nuevaSancion.id_arbitro" class="form-select custom-input">
                <option value="">Seleccione un árbitro...</option>
                <option v-for="a in arbitros" :key="a.id" :value="a.id">
                  {{ a.apellido }}, {{ a.nombre }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Artículo</label>
              <input v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42" class="form-control custom-input">
            </div>

            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Sanción</label>
              <input v-model="nuevaSancion.sancion_detalle" placeholder="Ej: 2 fechas" class="form-control custom-input">
            </div>

            <div class="col-12">
              <label class="fw-bold text-dark small mb-1">Motivo / Descripción</label>
              <textarea v-model="nuevaSancion.motivo" rows="2" class="form-control custom-input"></textarea>
            </div>

            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Desde</label>
              <input type="date" v-model="nuevaSancion.fecha_desde" class="form-control custom-input">
            </div>

            <div class="col-md-6">
              <label class="fw-bold text-dark small mb-1">Hasta</label>
              <input type="date" v-model="nuevaSancion.fecha_hasta" class="form-control custom-input">
            </div>

            <div class="col-12 mt-4">
              <div v-if="mensaje.texto" :class="['alert py-2 mb-3 text-center small alert-' + mensaje.tipo]">
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

<style scoped>
/* ESTILOS CLONADOS DE INICIOPANEL */
.menu-card-static {
  background: #ffffff;
  border-radius: 15px;
  padding: 30px;
  border-bottom: 4px solid #dc2626; /* El rojo exacto de tu hover */
}

.main-icon {
  font-size: 2.8rem;
}

.text-danger { color: #dc2626 !important; }

.custom-input {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.9rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.custom-input:focus {
  background-color: #fff;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  outline: none;
}

/* Botón con el mismo estilo que tus cards */
.btn-send {
  width: 100%;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-3px);
  background-color: #b91c1c;
  box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
}

.btn-send:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.alert-success { background-color: #dcfce7; color: #166534; border-radius: 12px; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border-radius: 12px; }

@media (max-width: 768px) {
  .menu-card-static { padding: 20px; }
  .main-icon { font-size: 2.2rem; }
}
</style>