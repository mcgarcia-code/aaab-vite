<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 w-100 mx-auto mb-4" style="border-radius: 12px; overflow: hidden;">

      <div class="card-header bg-white py-3 border-bottom">
        <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
          <i class="bi bi-eye me-1"></i> Observación Arbitral
        </h4>
        <p class="text-muted small m-0 mt-1">Seguimiento y evaluación de desempeño arbitral</p>
      </div>

      <div class="card-body p-0 bg-white">
        <form @submit.prevent="enviarFormulario">

          <!-- Reemplazamos .sacf-section por paddings nativos -->
          <section class="p-3 p-md-4 p-lg-5 border-bottom">
            <h2 class="section-title">Datos del Partido</h2>

            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label-custom">Género *</label>
                <div class="custom-radio-group">
                  <button type="button" v-for="opt in ['Caballeros', 'Damas']"
                    :key="opt" :class="{ active: formulario.partido_genero === opt }"
                    @click="formulario.partido_genero = opt">
                    {{ opt }}
                  </button>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label-custom">Categoría *</label>
                <div class="custom-radio-group">
                  <button type="button" v-for="opt in ['Mayores', 'Inferiores']"
                    :key="opt" :class="{ active: formulario.partido_categoria === opt }"
                    @click="formulario.partido_categoria = opt">
                    {{ opt }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="formulario.partido_categoria === 'Mayores'" class="mb-3 anim-fade">
              <label class="form-label-custom">Competencia Mayores *</label>
              <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="sacf-input" required>
                <option value="" disabled>Seleccione competencia</option>
                <option v-for="(div, k) in listas.divisiones_categorias[0].divisiones" :key="k" :value="div">{{ div }}</option>
              </select>
            </div>

            <div v-if="formulario.partido_categoria === 'Inferiores'" class="row g-3 mb-3 anim-fade">
              <div class="col-12 col-md-8">
                <label class="form-label-custom">Categoría Específica *</label>
                <select @change='setDivisiones()' v-model="formulario.id_categoria_especifica" class="sacf-input" required :disabled="cargandoCategorias">
                  <option value="" disabled>{{ cargandoCategorias ? 'Cargando...' : 'Seleccione Categoría' }}</option>
                  <option v-for="(cat, k) in listas.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label-custom">Nivel *</label>
                <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="sacf-input" required>
                  <option value="" disabled>Nivel</option>
                  <option v-for="opt in listas.divisiones" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label-custom">Equipos *</label>
              <!-- Reemplazamos .grid-2 por row y col -->
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <select v-model="formulario.eq1_id" class="sacf-input" required>
                    <option value="" disabled>Local</option>
                    <option v-for="(eq, k) in listas.equipos" :key="k" :value="k">{{ eq.club }}</option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <select v-model="formulario.eq2_id" class="sacf-input" required>
                    <option value="" disabled>Visitante</option>
                    <option v-for="(eq, k) in listas.equipos" :key="k" :value="k">{{ eq.club }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mt-2">
              <label class="form-label-custom">Fecha del partido</label>
              <input
                type="date"
                v-model="formulario.fecha_partido"
                class="form-control form-control-lg custom-input-date shadow-none"
              >
            </div>
          </section>

          <!-- bg-light reemplaza a bg-light-soft -->
          <section class="p-3 p-md-4 p-lg-5 border-bottom bg-light">
            <h2 class="section-title">Arbitraje</h2>
            <div class="mb-4">
              <label class="form-label-custom">Cantidad de Árbitros *</label>
              <div class="custom-radio-group mini" style="max-width: 200px;">
                <button type="button" :class="{ active: formulario.ref_count === '1' }" @click="formulario.ref_count = '1'">1</button>
                <button type="button" :class="{ active: formulario.ref_count === '2' }" @click="formulario.ref_count = '2'">2</button>
              </div>
            </div>

            <div class="row g-3 g-md-4">
              <div class="col-12 col-md-6">
                <!-- Reemplazamos .referee-box por utilidades -->
                <div class="bg-white p-3 p-md-4 rounded-4 border shadow-sm h-100">
                  <label class="fw-bold mb-2 text-dark small">ÁRBITRO 1</label>
                  <select v-model="formulario.ref1_id" class="sacf-input mb-0" required>
                    <option value="" disabled>Seleccione Árbitro</option>
                    <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{arb.apellido}}, {{ arb.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="col-12 col-md-6" v-if="formulario.ref_count === '2'">
                <div class="bg-white p-3 p-md-4 rounded-4 border shadow-sm anim-fade h-100">
                  <label class="fw-bold mb-2 text-dark small">ÁRBITRO 2</label>
                  <select v-model="formulario.ref2_id" class="sacf-input mb-0" required>
                    <option value="" disabled>Seleccione Árbitro</option>
                    <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{arb.apellido}}, {{ arb.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section class="p-3 p-md-4 p-lg-5">
            <h2 class="section-title">Evaluación Final</h2>
            <div class="mb-4">
              <label class="form-label-custom">Comentarios / Observaciones *</label>
              <textarea v-model="formulario.comentarios" rows="4" class="sacf-input" placeholder="Detalle la actuación..." required></textarea>
            </div>

            <div class="mb-4">
              <label class="form-label-custom mt-4">Puntaje Performance (Base) *</label>
              <!-- Usamos d-flex responsivo en lugar de .perf-scale-container -->
              <div class="d-flex flex-column flex-md-row gap-3 gap-md-2 w-100">
                <!-- Agregamos flex-row y flex-md-column al item para cambiar la orientación de sus hijos -->
                <div v-for="opcion in perfScoreOptions" :key="opcion.value"
                  class="perf-opt-item d-flex flex-row flex-md-column align-items-center justify-content-md-center w-100 p-3 p-md-4"
                  :class="[{ 'is-active': formulario.perf_score == opcion.value }, 'tone-' + opcion.tone]"
                  @click="formulario.perf_score = opcion.value">
                  <div class="perf-num">{{ opcion.value }}</div>
                  <div class="perf-desc ms-3 ms-md-0 mt-md-2 text-start text-md-center">{{ opcion.label }}</div>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label-custom mt-4">Dificultad del Encuentro *</label>
              <select v-model="formulario.diff_mult" class="sacf-input" required>
                <option value="" disabled>Seleccione dificultad</option>
                <option v-for="d in listas.dificultades" :key="d.valor" :value="d.valor">
                  x {{ d.valor }} - {{ d.leyenda }}
                </option>
              </select>
            </div>

            <div class="total-score-card anim-fade" v-if="formulario.perf_score">
              <div class="d-flex flex-column">
                <span class="text-uppercase small opacity-75">Puntaje Final</span>
                <span class="fw-light small">Cálculo automático AAAB</span>
              </div>
              <strong>{{ puntajeCalculado }}</strong>
            </div>
          </section>

          <footer class="p-4 bg-white border-top">
            <button
              type="submit"
              class="btn btn-danger w-100 fw-bold py-3 shadow"
              :disabled="procesando"
            >
              <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
              {{ procesando ? 'ENVIANDO...' : 'CONFIRMAR Y GUARDAR' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Observación Arbitral | AAAB',
  meta: [
    { name: 'description', content: 'Carga de observaciones arbitrales para partidos de handball.' }
  ],
});

const notificar = inject('notificar');

const procesando = ref(false);
const cargandoCategorias = ref(false);

const listas = reactive({
  categorias_especificas: [],
  divisiones: [],
  dificultades: [],
  arbitros: [],
  grupos: [],
  equipos: []
})

const formulario = reactive({
  partido_genero: '',
  partido_categoria: '',
  inf_nivel: '',
  id_categoria_especifica: '',
  categoria: '',
  eq_nombre1:'',
  eq_nombre2:'',
  eq1_id: '',
  eq2_id: '',
  ref_count: '1',
  ref1_id: '',
  ref2_id: '',
  comentarios: '',
  perf_score: null,
  fecha_partido: null,
  diff_mult: ''
})

const perfScoreOptions = [
  { value: '7', label: 'Muy bien', tone: 'green' },
  { value: '6', label: 'Bien', tone: 'green' },
  { value: '5', label: 'Adecuado - Bien', tone: 'lgreen' },
  { value: '4', label: 'Adecuado', tone: 'yellow' },
  { value: '3', label: 'Debajo de adecuado', tone: 'yellow' },
  { value: '2', label: 'Insuficiente', tone: 'red' },
  { value: '1', label: 'Mal', tone: 'red' }
]

const pedirCategoriasEspecíficas = async () => {
  if (!formulario.partido_genero) return
  if (!formulario.partido_categoria) return

  cargandoCategorias.value = true
  listas.divisiones = []
  listas.categorias_especificas = []
  formulario.id_categoria_especifica = ''

  try {
    const res = await api.get({
      entity: 'observaciones',
      action: 'obtenerCategorias',
      payload: {
        genero: formulario.partido_genero,
        tipo: formulario.partido_categoria,
      }
    })

    if (res.ok) {

      listas.divisiones_categorias = res.payload
      /*
      listas.divisiones = res.payload.divisiones
      listas.categorias_especificas = res.payload.categorias
      */
    }
  } catch (error) {
    console.error("Error pidiendo listado:", error)
  } finally {
    cargandoCategorias.value = false
  }
};

const setDivisiones = () => {
  console.log(formulario.id_categoria_especifica)
  listas.divisiones = listas.divisiones_categorias[formulario.id_categoria_especifica].divisiones
}

const obtenerEquipos = async () => {
  let categoria = ''
  if (formulario.id_categoria_especifica != '') {
    categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria
  }
  const r = await api.get({
    entity: 'observaciones',
    action: 'obtenerEquipos',
    payload: {
      genero: formulario.partido_genero,
      tipo: formulario.partido_categoria,
      categoria: categoria,
      division: formulario.inf_nivel
    }
  })
  listas.equipos = r.payload
}

watch(() => [formulario.partido_genero, formulario.partido_categoria], () => {
  pedirCategoriasEspecíficas()
});

const cargarCatalogosBase = async () => {
  try {
    const [resD, resA, resG] = await Promise.all([
      api.get({ entity: 'observaciones', action: 'obtenerDificultades' }),
      api.get({ entity: 'arbitros', action: 'getArbitros' }),
      api.get({ entity: 'arbitros', action: 'obtenerGrupos' })
    ]);
    if (resD.ok) listas.dificultades = resD.payload
    if (resA.ok) listas.arbitros = resA.payload
    if (resG.ok) listas.grupos = resG.payload
  } catch (e) { console.error(e); }
};

onMounted(cargarCatalogosBase);

const puntajeCalculado = computed(() => {
  const perf = parseFloat(formulario.perf_score) || 0;
  const mult = parseFloat(formulario.diff_mult) || 0;
  return (perf * mult).toFixed(2);
});

const enviarFormulario = async () => {
  if (!formulario.perf_score) {
    notificar({ titulo: 'Dato Faltante', mensaje: 'Debes asignar un puntaje de performance.', tipo: 'danger' });
    return;
  }

  procesando.value = true;
  formulario.categoria = formulario.partido_categoria == 'Mayores' ? 'Mayores' : listas.divisiones_categorias[formulario.id_categoria_especifica].categoria
  formulario.eq_nombre1 = listas.equipos[formulario.eq1_id].club
  formulario.eq_nombre2 = listas.equipos[formulario.eq2_id].club
  formulario.eq1_id = listas.equipos[formulario.eq1_id].eq_id
  formulario.eq2_id = listas.equipos[formulario.eq2_id].eq_id
  try {
    const res = await api.post({
      entity: 'observaciones',
      action: 'guardarObservacion',
      payload: { ...formulario, puntaje_final: puntajeCalculado.value }
    });

    if (res.ok) {
      notificar({
        titulo: '¡Observación Guardada!',
        mensaje: 'La evaluación se ha registrado correctamente en el sistema.',
        tipo: 'success'
      });
      reiniciarFormulario();
    } else {
      notificar({
        titulo: 'Error al Guardar',
        mensaje: res.message || 'No se pudo procesar el envío.',
        tipo: 'danger'
      });
    }
  } catch{
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' });
  } finally {
    procesando.value = false;
  }
};

const reiniciarFormulario = () => {
  Object.assign(formulario, {
    partido_genero: '', partido_categoria: '', inf_nivel: '', id_categoria_especifica: '',
    equipo_1: '', equipo_2: '', ref_count: '1', ref1_nombre: '', ref1_group: '',
    ref2_nombre: '', ref2_group: '', comentarios: '', perf_score: null, diff_mult: ''
  });
  window.scrollTo(0, 0);
};
</script>

<style scoped>
/* ====================================================
   1. SECCIONES Y CONTENEDORES
   ==================================================== */
.section-title {
  font-size: 0.85rem;
  color: #dc2626;
  text-transform: uppercase;
  border-left: 5px solid #dc2626;
  padding-left: 14px;
  margin-bottom: 30px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.total-score-card {
  margin-top: 35px;
  padding: 30px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px;
}

.total-score-card strong {
  font-size: 2.8rem;
  color: #ff4d4d;
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.5);
}

/* ====================================================
   2. FORMULARIOS E INPUTS
   ==================================================== */
.form-label-custom {
  display: block;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 0.75rem;
  color: #000000;
  text-transform: uppercase;
}

.sacf-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #e2e8f0;
  color: #1e293b;
}

.sacf-input:focus {
  border-color: #dc2626;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15);
  outline: none;
}

.custom-radio-group {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 14px;
}

.custom-radio-group button {
  flex: 1;
  border: none;
  padding: 12px;
  cursor: pointer;
  background: transparent;
  font-weight: 700;
  color: #000000;
  border-radius: 10px;
  transition: 0.2s;
}

.custom-radio-group button.active {
  background: #dc2626;
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-danger {
  background-color: #dc2626 !important;
  border: none;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c !important;
}

/* ====================================================
   3. ESCALA DE RENDIMIENTO (PERFORMANCE SCALE)
   ==================================================== */
.perf-num {
  font-size: 1.7rem;
  font-weight: 900;
  min-width: 55px;
  color: #0f172a;
  text-align: center;
}

.perf-desc {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  line-height: 1.3;
}

/* Base (Celulares) */
.perf-opt-item {
  border: 2px solid #f1f5f9;
  border-radius: 14px;
  cursor: pointer;
  background: #fff;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 6px solid #cbd5e1;
}

.perf-opt-item:hover {
  transform: translateX(8px);
  border-color: #cbd5e1;
}

.perf-opt-item.is-active {
  border-color: #dc2626;
  background: #fff8f8;
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.15);
}

.tone-green { border-left-color: #10b981; }
.tone-lgreen { border-left-color: #84cc16; }
.tone-yellow { border-left-color: #f59e0b; }
.tone-red { border-left-color: #ef4444; }

/* Escritorio: Adaptación del borde y la animación hover */
@media (min-width: 768px) {
  .perf-opt-item {
    border-left: 2px solid #f1f5f9;
    border-bottom: 6px solid #cbd5e1;
  }
  .perf-opt-item:hover {
    transform: translateY(-8px);
  }
  .perf-opt-item.is-active {
    border-bottom-color: #dc2626;
    transform: translateY(-10px);
  }
  .tone-green { border-bottom-color: #10b981; }
  .tone-lgreen { border-bottom-color: #84cc16; }
  .tone-yellow { border-bottom-color: #f59e0b; }
  .tone-red { border-bottom-color: #ef4444; }
}

/* ====================================================
   4. ANIMACIONES
   ==================================================== */
.anim-fade {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
