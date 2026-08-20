<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="panel-personal animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ── Header ── -->
        <div class="card-header bg-white py-3 border-bottom">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-eye me-1"></i> Observación Arbitral
            </h4>
            <span class="text-muted small d-block mt-1">
              Seguimiento y evaluación de desempeño arbitral
            </span>
          </div>
        </div>

        <div class="card-body p-0 bg-white">

          <!-- ══════════════════════════════════════════════════
               DATOS DEL PARTIDO (se mantiene de la planilla original)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4 border-bottom">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-clipboard-data text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Datos del Partido</h6>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-bold text-uppercase small text-dark">Género *</label>
                <div class="btn-group w-100" role="group">
                  <template v-for="opt in ['Caballeros', 'Damas']" :key="opt">
                    <input type="radio" class="btn-check" :id="'gen-' + opt"
                      :value="opt" v-model="formulario.partido_genero">
                    <label class="btn btn-outline-danger fw-bold" :for="'gen-' + opt">{{ opt }}</label>
                  </template>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label fw-bold text-uppercase small text-dark">Categoría *</label>
                <div class="btn-group w-100" role="group">
                  <template v-for="opt in ['Mayores', 'Inferiores']" :key="opt">
                    <input type="radio" class="btn-check" :id="'cat-' + opt"
                      :value="opt" v-model="formulario.partido_categoria">
                    <label class="btn btn-outline-danger fw-bold" :for="'cat-' + opt">{{ opt }}</label>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="formulario.partido_categoria === 'Mayores'" class="mb-3 animate__animated animate__fadeIn">
              <label class="form-label fw-bold text-uppercase small text-dark">Competencia Mayores *</label>
              <select @change='seleccionarCategoria()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
                <option value="" disabled>Seleccione competencia</option>
                <option v-for="(div, k) in divisionesMayores" :key="k" :value="div.idCategoria">{{ div.division }}</option>
              </select>
            </div>

            <div v-if="formulario.partido_categoria === 'Inferiores'" class="row g-3 mb-3 animate__animated animate__fadeIn">
              <div class="col-12 col-md-8">
                <label class="form-label fw-bold text-uppercase small text-dark">Categoría Específica *</label>
                <select @change='setDivisiones()' v-model="formulario.id_categoria_especifica" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoCategorias">
                  <option value="" disabled>{{ cargandoCategorias ? 'Cargando...' : 'Seleccione Categoría' }}</option>
                  <option v-for="(cat, k) in listas.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label fw-bold text-uppercase small text-dark">Nivel *</label>
                <select @change='seleccionarCategoria()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
                  <option value="" disabled>Nivel</option>
                  <option v-for="opt in listas.divisiones" :key="opt.idCategoria" :value="opt.idCategoria">{{ opt.division }}</option>
                </select>
              </div>
            </div>

            <div v-if="idCategoria" class="mb-3 animate__animated animate__fadeIn">
              <label class="form-label fw-bold text-uppercase small text-dark">Fecha del Partido *</label>
              <input type="date" @change="obtenerPartidos()" v-model="fechaPartido" class="form-control shadow-sm border-secondary-subtle" required>
            </div>

            <div v-if="fechaPartido" class="mb-3 animate__animated animate__fadeIn">
              <label class="form-label fw-bold text-uppercase small text-dark">Partido *</label>
              <select v-model="idPartido" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoPartidos">
                <option value="" disabled>{{ cargandoPartidos ? 'Cargando...' : (partidos.length ? 'Seleccione partido' : 'No hay partidos para esa fecha') }}</option>
                <option v-for="p in partidos" :key="p.id" :value="p.id">{{ p.local }} vs {{ p.visitante }}</option>
              </select>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════
               ARBITRAJE (solo lectura, se obtiene del partido seleccionado)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4 bg-light border-bottom">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-person-badge text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Arbitraje</h6>
            </div>

            <div v-if="!partidoSeleccionado" class="text-muted small fst-italic">
              Seleccioná un partido para ver los árbitros designados.
            </div>

            <div v-else class="row g-3">
              <div class="col-12 col-md-6">
                <div class="card shadow-sm border-light-subtle h-100">
                  <div class="card-body p-3">
                    <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 1</label>
                    <p class="form-control-plaintext fw-bold text-dark m-0">{{ partidoSeleccionado.arbitro_1 || 'Sin designar' }}</p>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6" v-if="partidoSeleccionado.arbitro_2">
                <div class="card shadow-sm border-light-subtle h-100 animate__animated animate__fadeIn">
                  <div class="card-body p-3">
                    <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 2</label>
                    <p class="form-control-plaintext fw-bold text-dark m-0">{{ partidoSeleccionado.arbitro_2 }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════
               PLANILLA DE EVALUACIÓN (Excel)
               ══════════════════════════════════════════════════ -->
          <div class="p-3 p-md-4">
            <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
              <i class="bi bi-file-earmark-spreadsheet text-danger me-2 fs-5"></i>
              <h6 class="fw-bold m-0 text-dark text-uppercase">Planilla de Evaluación</h6>
            </div>

            <div
              class="excel-dropzone"
              :class="{ 'is-dragover': arrastrandoArchivo, 'has-file': archivoObservacion }"
              @dragover.prevent="arrastrandoArchivo = true"
              @dragleave.prevent="arrastrandoArchivo = false"
              @drop.prevent="soltarArchivoObservacion"
              @click="$refs.inputArchivoObservacion.click()"
            >
              <input
                ref="inputArchivoObservacion"
                type="file"
                accept=".xlsx,.xls"
                class="d-none"
                @change="seleccionarArchivoObservacion"
              >

              <template v-if="!archivoObservacion">
                <i class="bi bi-cloud-arrow-up-fill excel-dropzone-icon"></i>
                <p class="m-0 fw-bold text-dark">Arrastrá aquí la planilla de Excel</p>
                <p class="m-0 small text-muted">o hacé clic para seleccionar un archivo (.xlsx, .xls)</p>
              </template>
              <template v-else>
                <i class="bi bi-check-circle-fill excel-dropzone-icon text-success"></i>
                <p class="m-0 fw-bold text-dark">{{ archivoObservacion.name }}</p>
                <p class="m-0 small text-muted">Archivo listo para cargar. Hacé clic para reemplazarlo.</p>
                <button type="button" class="btn btn-light btn-sm rounded-pill px-3 mt-2 border" @click.stop="quitarArchivoObservacion">
                  Quitar archivo
                </button>
              </template>
            </div>

            <div class="d-grid d-sm-flex justify-content-sm-center mt-4">
              <button type="button" class="btn btn-danger fw-bold px-4 py-2 shadow"
                :disabled="procesandoCarga || !archivoObservacion" @click="cargarObservacionExcel">
                <span v-if="procesandoCarga" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-upload me-1"></i>
                {{ procesandoCarga ? 'GUARDANDO...' : 'SUBIR OBSERVACIÓN' }}
              </button>
            </div>
          </div>

          <!-- ── Alerta de soporte ── -->
          <div class="alert alert-warning border-warning-subtle text-dark d-flex align-items-start gap-2 m-3 m-md-4 rounded-3" style="font-size: 0.85rem;">
            <i class="bi bi-info-circle-fill text-dark mt-1 flex-shrink-0"></i>
            <span>
              <strong>Recordá:</strong> adjuntá la planilla de Excel completa de la observación. Se sube junto con los datos del partido y de los árbitros cargados arriba.
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Observación Arbitral | AAAB',
  meta: [
    { name: 'description', content: 'Carga de observaciones arbitrales para partidos de handball.' }
  ]
})

const notificar = inject('notificar')

const procesandoCarga = ref(false)
const cargandoCategorias = ref(false)

// Observador tomado de la sesión iniciada (no se pide en el formulario)
const observador = ref(auth.getUser() || {})

const divisionesMayores = ref([])

const listas = reactive({
  divisiones_categorias: [],
  divisiones: []
})

// -------------------- ESTADO --------------------
const formulario = reactive({
  partido_genero: '',
  partido_categoria: '',
  inf_nivel: '',
  id_categoria_especifica: '',
  categoria: ''
})

const idCategoria = ref(null)

const fechaPartido = ref('')
const cargandoPartidos = ref(false)
const partidos = ref([])
const idPartido = ref(null)

// Partido completo seleccionado: de ahí se leen los árbitros designados (solo lectura)
const partidoSeleccionado = computed(() => partidos.value.find(p => p.id === idPartido.value) || null)

const archivoObservacion = ref(null)
const arrastrandoArchivo = ref(false)
const ACEPTA_EXCEL = /\.(xlsx|xls)$/i

const asignarArchivoObservacion = (file) => {
  if (!file) return
  if (!ACEPTA_EXCEL.test(file.name)) {
    notificar({ titulo: 'Archivo inválido', mensaje: 'Seleccioná un archivo de Excel (.xlsx o .xls).', tipo: 'warning' })
    return
  }
  archivoObservacion.value = file
}

const seleccionarArchivoObservacion = (event) => {
  asignarArchivoObservacion(event.target.files[0] || null)
  event.target.value = ''
}

const soltarArchivoObservacion = (event) => {
  arrastrandoArchivo.value = false
  asignarArchivoObservacion(event.dataTransfer.files[0] || null)
}

const quitarArchivoObservacion = () => { archivoObservacion.value = null }

// -------------------- CARGA DE CATÁLOGOS (igual a la planilla original) --------------------
const pedirCategoriasEspecificas = async () => {
  if (!formulario.partido_genero || !formulario.partido_categoria) return
  cargandoCategorias.value = true
  listas.divisiones = []
  formulario.id_categoria_especifica = ''
  try {
    const res = await api.get({
      entity: 'observaciones',
      action: 'obtenerCategorias',
      payload: { genero: formulario.partido_genero, tipo: formulario.partido_categoria }
    })
    if (res.ok) {
      if (formulario.partido_categoria === 'Mayores') {
        divisionesMayores.value = res.payload[0]?.divisiones || []
      } else {
        listas.divisiones_categorias = res.payload
      }
    }
  } catch (error) {
    console.error('Error pidiendo listado:', error)
  } finally {
    cargandoCategorias.value = false
  }
}

const setDivisiones = () => {
  listas.divisiones = listas.divisiones_categorias[formulario.id_categoria_especifica].divisiones
}

const seleccionarCategoria = async () => {
  idCategoria.value = formulario.inf_nivel
  fechaPartido.value = ''
  partidos.value = []
  idPartido.value = null
}

const obtenerPartidos = async () => {
  partidos.value = []
  idPartido.value = null
  if (!fechaPartido.value || !idCategoria.value) return
  cargandoPartidos.value = true
  try {
    const r = await api.get({
      entity: 'designaciones',
      action: 'obtenerPartidos',
      payload: { 
        fecha: fechaPartido.value, 
        idCategoria: idCategoria.value
      }
    })
    if (r.ok) {
      partidos.value = r.payload
    }
  } catch (error) {
    console.error('Error pidiendo partidos:', error)
  } finally {
    cargandoPartidos.value = false
  }
}

watch(() => [formulario.partido_genero, formulario.partido_categoria], () => {
  pedirCategoriasEspecificas()
})

// -------------------- ARMADO DE DATOS DEL PARTIDO --------------------
const armarDatosPartido = () => {
  const datos = { ...formulario }
  // El observador es un árbitro en actividad: usamos los datos de su sesión
  datos.id_arbitro = observador.value.id ?? null
  datos.observador = `${observador.value.apellido ?? ''}, ${observador.value.nombre ?? ''}`.trim()
  if (formulario.partido_categoria === 'Mayores') {
    datos.categoria = 'Mayores'
  } else if (formulario.id_categoria_especifica !== '') {
    datos.categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria
  }
  datos.id_categoria = idCategoria.value
  datos.fecha_partido = fechaPartido.value
  datos.id_partido = idPartido.value
  // Los árbitros son de solo lectura: se extraen del partido designado
  datos.id_arb1 = partidoSeleccionado.value?.id_arb1 ?? null
  datos.id_arb2 = partidoSeleccionado.value?.id_arb2 ?? null
  return datos
}

const reiniciarFormulario = () => {
  Object.assign(formulario, {
    partido_genero: '', partido_categoria: '', inf_nivel: '', id_categoria_especifica: '',
    categoria: ''
  })
  idCategoria.value = null
  fechaPartido.value = ''
  partidos.value = []
  idPartido.value = null
  archivoObservacion.value = null
  arrastrandoArchivo.value = false
}

// -------------------- SUBIR OBSERVACIÓN (Excel) --------------------
const cargarObservacionExcel = async () => {
  if (!archivoObservacion.value) {
    notificar({ titulo: 'Dato Faltante', mensaje: 'Seleccioná el archivo de Excel para continuar.', tipo: 'warning' })
    return
  }
  procesandoCarga.value = true
  try {
    const formData = new FormData()
    formData.append('archivo', archivoObservacion.value)
    formData.append('datos', JSON.stringify(armarDatosPartido()))

    const res = await api.postFile({ 
      entity: 'observaciones', 
      action: 'cargarObservacionExcel', 
      payload: formData 
    })

    if (res && res.ok) {
      notificar({ titulo: '¡Observación guardada!', mensaje: 'La observación se registró correctamente.', tipo: 'success' })
      reiniciarFormulario()
    } else {
      notificar({ titulo: 'Error al guardar', mensaje: res?.message || 'No se pudo procesar el envío.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    procesandoCarga.value = false
  }
}
</script>

<style scoped>
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}
.panel-personal {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}
.animate__animated {
  animation-duration: 0.4s;
}

/* Zona de arrastrar y soltar el Excel de la observación */
.excel-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: 0.2s;
}
.excel-dropzone:hover { border-color: #dc3545; background: #fff8f8; }
.excel-dropzone.is-dragover { border-color: #dc3545; background: #fff8f8; transform: scale(1.01); }
.excel-dropzone.has-file { border-style: solid; border-color: #198754; background: #f0fdf4; }
.excel-dropzone-icon { font-size: 42px; color: #94a3b8; margin-bottom: 10px; }
.excel-dropzone.is-dragover .excel-dropzone-icon,
.excel-dropzone:hover .excel-dropzone-icon { color: #dc3545; }
.excel-dropzone.has-file .excel-dropzone-icon { color: #198754; }
</style>
