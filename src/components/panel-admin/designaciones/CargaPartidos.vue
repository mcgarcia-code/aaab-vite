<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Carga de Designaciones
            </h4>
            <span class="text-muted small d-block mt-1">
              Total: {{ designaciones.length }} partidos en {{ canchas.length }} canchas
            </span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="abrirModalCarga" class="btn btn-primary shadow-sm py-2 d-flex align-items-center gap-2 text-white">
              <span class="material-icons fs-6">upload_file</span>
              <span class="fw-bold d-none d-md-inline small">Cargar Excel</span>
            </button>

            <button
              @click="solicitarEliminarTodo"
              class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2"
              :disabled="designaciones.length === 0"
            >
              <span class="material-icons text-danger fs-6">delete_sweep</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Eliminar Todo</span>
            </button>

            <button
              @click="mostrarModalPublicar = true"
              class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white"
              :disabled="designaciones.length === 0"
            >
              <span class="material-icons fs-6">cloud_upload</span>
              <span class="fw-bold d-none d-md-inline small">Publicar</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-light">

          <div v-if="cargando" class="text-center py-5">
            <span class="spinner-border text-danger"></span>
            <p class="text-muted mt-3 m-0 fw-bold small">Cargando designaciones...</p>
          </div>

          <div v-else-if="designaciones.length === 0" class="text-center p-5 bg-white rounded shadow-sm border">
            <span class="material-icons text-muted opacity-50 d-block mb-2 fs-1">upload_file</span>
            <p class="text-muted m-0 fw-bold">No hay designaciones cargadas.</p>
            <p class="text-muted small mt-1 mb-0">Usá el botón "Cargar Excel" para importar la planilla de partidos.</p>
          </div>

          <div v-else class="row g-3">
            <div v-for="c in canchas" :key="c.nombre" class="col-12 col-md-6 col-xl-4">
              <div class="card shadow-sm border-light-subtle h-100 rounded-3">

                <div class="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 rounded-top-3">
                  <div class="d-flex align-items-center gap-2">
                    <span class="material-icons text-danger fs-5">stadium</span>
                    <span class="fw-bold text-dark text-uppercase" style="font-size: 0.9rem;">{{ c.nombre }}</span>
                  </div>
                  <span class="badge bg-danger rounded-pill">{{ c.partidos.length }}</span>
                </div>

                <div class="card-body p-2">
                  <div
                    v-for="p in c.partidos"
                    :key="p.id"
                    class="border-bottom border-light-subtle py-2 px-2 small"
                  >
                    <div class="d-flex justify-content-between text-muted mb-1" style="font-size: 0.7rem;">
                      <span class="fw-bold">{{ p.fecha }}</span>
                      <span class="fw-bold">{{ p.horario }}</span>
                    </div>
                    <div class="text-dark fw-bold mb-1">{{ p.local }} <span class="text-muted fw-normal">vs</span> {{ p.visitante }}</div>
                    <div class="text-muted" style="font-size: 0.7rem;">{{ p.categoria_division }}</div>
                    <div class="d-flex flex-wrap gap-1 mt-1">
                      <span class="badge text-bg-light border" style="font-size: 0.65rem;">
                        <span class="material-icons align-middle me-1" style="font-size: 10px;">sports</span>{{ p.arbitro_1 || 'Sin asignar' }}
                      </span>
                      <span class="badge text-bg-light border" style="font-size: 0.65rem;">
                        <span class="material-icons align-middle me-1" style="font-size: 10px;">sports</span>{{ p.arbitro_2 || 'Sin asignar' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="card-footer bg-white border-top py-2 px-3 rounded-bottom-3">
                  <button @click="abrirEdicionCancha(c)" class="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <span class="material-icons fs-6">edit</span> Editar Cancha
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <ModalBase
      :show="mostrarModalCarga"
      titulo="Cargar Designaciones desde Excel"
      icono="upload_file"
      colorIcono="bg-primary text-white"
      maxWidth="600px"
      @close="cerrarModalCarga"
    >
      <div class="alert alert-warning small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>Cargar un nuevo archivo <strong>reemplaza</strong> todas las designaciones actuales.</span>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Archivo Excel</label>
        <input
          @change="manejarArchivoExcel"
          type="file"
          class="form-control shadow-none border-secondary-subtle"
          accept=".xlsx,.xls"
        >
        <div class="form-text small">
          Columnas esperadas: FECHA, CANCHA, CATEGORIA, HORARIO, LOCAL, VISITANTE, ARBITRO 1, ARBITRO 2.
        </div>
      </div>

      <div v-if="partidosImportados.length > 0" class="alert alert-success small py-2 px-3 mb-0">
        Se leyeron <strong>{{ partidosImportados.length }}</strong> partidos
        ({{ sinMatch }} árbitros sin coincidencia en el padrón).
      </div>

      <template #footer>
        <button
          @click="cerrarModalCarga"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="subiendoExcel"
        >
          Cancelar
        </button>
        <button
          @click="confirmarCargaExcel"
          class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="subiendoExcel || partidosImportados.length === 0"
        >
          <span v-if="subiendoExcel" class="spinner-border spinner-border-sm me-2"></span>
          {{ subiendoExcel ? 'Cargando...' : 'Cargar Partidos' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalEdicion"
      :titulo="'Editar Cancha: ' + canchaEditando"
      icono="edit_location_alt"
      colorIcono="bg-danger text-white"
      maxWidth="950px"
      @close="cerrarEdicion"
    >
      <div class="mb-3">
        <label class="form-label small fw-bold">Nombre de la Cancha</label>
        <input
          v-model="nombreCanchaEdit"
          type="text"
          class="form-control shadow-none border-secondary-subtle text-uppercase"
        >
      </div>

      <div
        v-for="(p, idx) in partidosEdit"
        :key="p.id || 'nuevo-' + idx"
        class="border rounded-3 p-3 mb-3 bg-light position-relative"
      >
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge bg-danger">Partido {{ idx + 1 }}</span>
          <button @click="quitarPartido(idx)" class="btn btn-outline-danger btn-sm py-0 px-2" title="Eliminar partido">
            <span class="material-icons fs-6 align-middle">delete</span>
          </button>
        </div>

        <div class="row g-2">
          <div class="col-6 col-md-3">
            <label class="form-label small fw-bold mb-1">Fecha</label>
            <input v-model="p.fecha" type="text" class="form-control form-control-sm shadow-none" placeholder="Ej: 18/04/2026">
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label small fw-bold mb-1">Horario</label>
            <input v-model="p.horario" type="text" class="form-control form-control-sm shadow-none" placeholder="Ej: 14:00">
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold mb-1">Categoría / División</label>
            <input v-model="p.categoria_division" type="text" class="form-control form-control-sm shadow-none" placeholder="Ej: PRIMERA CABALLEROS A">
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold mb-1">Local</label>
            <input v-model="p.local" type="text" class="form-control form-control-sm shadow-none">
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold mb-1">Visitante</label>
            <input v-model="p.visitante" type="text" class="form-control form-control-sm shadow-none">
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold mb-1">Árbitro 1</label>
            <select
              :value="valorSelectArbitro(p, 1)"
              @change="cambiarArbitro(p, 1, $event.target.value)"
              class="form-select form-select-sm shadow-none"
            >
              <option value="">— Sin asignar —</option>
              <option v-if="p.arbitro_1 && !p.id_arb1" value="__texto__">{{ p.arbitro_1 }} (texto del Excel)</option>
              <option v-for="a in arbitros" :key="'a1-' + a.id" :value="String(a.id)">
                {{ a.apellido }}, {{ a.nombre }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label small fw-bold mb-1">Árbitro 2</label>
            <select
              :value="valorSelectArbitro(p, 2)"
              @change="cambiarArbitro(p, 2, $event.target.value)"
              class="form-select form-select-sm shadow-none"
            >
              <option value="">— Sin asignar —</option>
              <option v-if="p.arbitro_2 && !p.id_arb2" value="__texto__">{{ p.arbitro_2 }} (texto del Excel)</option>
              <option v-for="a in arbitros" :key="'a2-' + a.id" :value="String(a.id)">
                {{ a.apellido }}, {{ a.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <button @click="agregarPartido" class="btn btn-outline-primary btn-sm fw-bold w-100 d-flex align-items-center justify-content-center gap-2">
        <span class="material-icons fs-6">add_circle</span> Agregar Partido
      </button>

      <template #footer>
        <button
          @click="cerrarEdicion"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="guardando"
        >
          Cancelar
        </button>
        <button
          @click="guardarCancha"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="guardando"
        >
          <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalPublicar"
      titulo="Publicar Designaciones"
      icono="publish"
      colorIcono="bg-danger text-white"
      maxWidth="600px"
      @close="mostrarModalPublicar = false"
    >
      <div class="alert alert-info small py-2 px-3 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill"></i>
        <span>Se generará la planilla Excel con los <strong>{{ designaciones.length }}</strong> partidos cargados (con las modificaciones hechas) y quedará visible para el público.</span>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Torneo</label>
        <input
          v-model="formPublicar.torneo"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: TORNEO APERTURA"
        >
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Fecha</label>
        <input
          v-model="formPublicar.fecha"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: 18 y 19 de Abril"
        >
      </div>

      <template #footer>
        <button
          @click="mostrarModalPublicar = false"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="publicando"
        >
          Cancelar
        </button>
        <button
          @click="publicarDesignaciones"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="publicando"
        >
          <span v-if="publicando" class="spinner-border spinner-border-sm me-2"></span>
          {{ publicando ? 'Publicando...' : 'Publicar Ahora' }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>


<script setup>
import { ref, onMounted, computed, reactive, inject } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Carga de Designaciones | AAAB',
  meta: [
    { name: 'description', content: 'Cargá, editá y publicá las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:title', content: 'Carga de Designaciones | AAAB' },
    { property: 'og:description', content: 'Cargá, editá y publicá las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const notificar = inject('notificar')

const designaciones = ref([])
const arbitros = ref([])
const soloActivos = ref(false)
const cargando = ref(false)

const mostrarModalCarga = ref(false)
const subiendoExcel = ref(false)
const partidosImportados = ref([])
const sinMatch = ref(0)

const mostrarModalEdicion = ref(false)
const canchaEditando = ref('')
const nombreCanchaEdit = ref('')
const partidosEdit = ref([])
const idsEliminados = ref([])
const guardando = ref(false)

const mostrarModalPublicar = ref(false)
const publicando = ref(false)
const formPublicar = reactive({
  torneo: '',
  fecha: ''
})

/* ====================================================
   CARGA INICIAL
   ==================================================== */
const cargarDesignaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'obtenerDesignaciones'
    })
    if ((res.ok || res.success) && res.payload) designaciones.value = res.payload
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar las designaciones.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: soloActivos.value }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

/* ====================================================
   AGRUPADO POR CANCHA
   ==================================================== */
const canchas = computed(() => {
  const mapa = {}
  designaciones.value.forEach(p => {
    const nombre = (p.cancha || 'SIN CANCHA').trim()
    if (!mapa[nombre]) mapa[nombre] = []
    mapa[nombre].push(p)
  })

  return Object.keys(mapa)
    .sort((a, b) => a.localeCompare(b))
    .map(nombre => ({
      nombre,
      partidos: mapa[nombre].sort((a, b) => String(a.horario || '').localeCompare(String(b.horario || '')))
    }))
})

/* ====================================================
   IMPORTACION DE EXCEL
   ==================================================== */
const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

const mapearCabecera = (texto) => {
  const t = normalizarTexto(texto).replace(/[^a-z0-9]/g, '')
  if (t.includes('fecha')) return 'fecha'
  if (t.includes('cancha')) return 'cancha'
  if (t.includes('categoria') || t.includes('division')) return 'categoria_division'
  if (t.includes('horario') || t === 'hora') return 'horario'
  if (t.includes('local')) return 'local'
  if (t.includes('visitante')) return 'visitante'
  if (t.includes('arbitro1') || t === 'arbitroa' || t.includes('arbitrouno')) return 'arbitro_1'
  if (t.includes('arbitro2') || t === 'arbitrob' || t.includes('arbitrodos')) return 'arbitro_2'
  return null
}

const formatearFechaExcel = (valor) => {
  if (typeof valor === 'number') return XLSX.SSF.format('dd/mm/yyyy', valor)
  return String(valor || '').trim()
}

const formatearHorarioExcel = (valor) => {
  if (typeof valor === 'number') return XLSX.SSF.format('hh:mm', valor)
  return String(valor || '').trim()
}

const buscarIdArbitro = (nombreCelda) => {
  const buscado = normalizarTexto(nombreCelda)
  if (!buscado) return null

  const encontrado = arbitros.value.find(a => {
    const apellidoNombre = normalizarTexto(`${a.apellido} ${a.nombre}`)
    const nombreApellido = normalizarTexto(`${a.nombre} ${a.apellido}`)
    const apellidoComaNombre = normalizarTexto(`${a.apellido}, ${a.nombre}`)
    return buscado === apellidoNombre || buscado === nombreApellido || buscado === apellidoComaNombre
  })

  return encontrado ? encontrado.id : null
}

const abrirModalCarga = () => {
  partidosImportados.value = []
  sinMatch.value = 0
  mostrarModalCarga.value = true
}

const cerrarModalCarga = () => {
  mostrarModalCarga.value = false
  partidosImportados.value = []
  sinMatch.value = 0
}

const manejarArchivoExcel = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
      const hoja = workbook.Sheets[workbook.SheetNames[0]]
      const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' })

      if (filas.length < 2) {
        notificar({ titulo: 'Atención', mensaje: 'El archivo no tiene datos.', tipo: 'warning' })
        return
      }

      // Buscar la fila de cabecera (la primera que tenga CANCHA y LOCAL)
      let indiceCabecera = -1
      let mapaColumnas = {}

      for (let i = 0; i < Math.min(filas.length, 10); i++) {
        const mapa = {}
        filas[i].forEach((celda, col) => {
          const campo = mapearCabecera(celda)
          if (campo && mapa[campo] === undefined) mapa[campo] = col
        })
        if (mapa.cancha !== undefined && mapa.local !== undefined) {
          indiceCabecera = i
          mapaColumnas = mapa
          break
        }
      }

      if (indiceCabecera === -1) {
        notificar({ titulo: 'Atención', mensaje: 'No se encontraron las columnas esperadas (CANCHA, LOCAL, etc.) en el archivo.', tipo: 'warning' })
        return
      }

      const partidos = []
      let contadorSinMatch = 0

      for (let i = indiceCabecera + 1; i < filas.length; i++) {
        const fila = filas[i]
        const leer = (campo) => mapaColumnas[campo] !== undefined ? fila[mapaColumnas[campo]] : ''

        const cancha = String(leer('cancha') || '').trim()
        const local = String(leer('local') || '').trim()
        const visitante = String(leer('visitante') || '').trim()

        if (!cancha && !local && !visitante) continue

        const arbitro1 = String(leer('arbitro_1') || '').trim()
        const arbitro2 = String(leer('arbitro_2') || '').trim()
        const idArb1 = buscarIdArbitro(arbitro1)
        const idArb2 = buscarIdArbitro(arbitro2)

        if (arbitro1 && !idArb1) contadorSinMatch++
        if (arbitro2 && !idArb2) contadorSinMatch++

        partidos.push({
          fecha: formatearFechaExcel(leer('fecha')),
          cancha: cancha.toUpperCase(),
          categoria_division: String(leer('categoria_division') || '').trim(),
          horario: formatearHorarioExcel(leer('horario')),
          local,
          visitante,
          arbitro_1: arbitro1,
          arbitro_2: arbitro2,
          id_arb1: idArb1,
          id_arb2: idArb2
        })
      }

      if (partidos.length === 0) {
        notificar({ titulo: 'Atención', mensaje: 'No se leyeron partidos válidos del archivo.', tipo: 'warning' })
        return
      }

      partidosImportados.value = partidos
      sinMatch.value = contadorSinMatch
    } catch (err) {
      console.error('Error al leer Excel:', err)
      notificar({ titulo: 'Error', mensaje: 'No se pudo leer el archivo Excel.', tipo: 'danger' })
    }
  }
}

const confirmarCargaExcel = async () => {
  if (partidosImportados.value.length === 0) return

  subiendoExcel.value = true
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'cargarDesignaciones',
      payload: { partidos: partidosImportados.value }
    })

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || `Se cargaron ${partidosImportados.value.length} partidos.`, tipo: 'success' })
      cerrarModalCarga()
      await cargarDesignaciones()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al guardar los partidos.', tipo: 'danger' })
  } finally {
    subiendoExcel.value = false
  }
}

/* ====================================================
   EDICION POR CANCHA (MODAL)
   ==================================================== */
const abrirEdicionCancha = (cancha) => {
  canchaEditando.value = cancha.nombre
  nombreCanchaEdit.value = cancha.nombre
  partidosEdit.value = cancha.partidos.map(p => ({ ...p }))
  idsEliminados.value = []
  mostrarModalEdicion.value = true
}

const cerrarEdicion = () => {
  mostrarModalEdicion.value = false
  partidosEdit.value = []
  idsEliminados.value = []
}

const agregarPartido = () => {
  const base = partidosEdit.value[0]
  partidosEdit.value.push({
    id: null,
    fecha: base ? base.fecha : '',
    cancha: nombreCanchaEdit.value,
    categoria_division: '',
    horario: '',
    local: '',
    visitante: '',
    arbitro_1: '',
    arbitro_2: '',
    id_arb1: null,
    id_arb2: null
  })
}

const quitarPartido = (idx) => {
  const partido = partidosEdit.value[idx]
  if (partido.id) idsEliminados.value.push(partido.id)
  partidosEdit.value.splice(idx, 1)
}

const valorSelectArbitro = (p, numero) => {
  const id = numero === 1 ? p.id_arb1 : p.id_arb2
  const nombre = numero === 1 ? p.arbitro_1 : p.arbitro_2
  if (id) return String(id)
  if (nombre) return '__texto__'
  return ''
}

const cambiarArbitro = (p, numero, valor) => {
  if (valor === '__texto__') return

  if (valor === '') {
    if (numero === 1) { p.arbitro_1 = ''; p.id_arb1 = null }
    else { p.arbitro_2 = ''; p.id_arb2 = null }
    return
  }

  const arbitro = arbitros.value.find(a => String(a.id) === valor)
  if (!arbitro) return

  const nombreCompleto = `${arbitro.apellido} ${arbitro.nombre}`.toUpperCase()
  if (numero === 1) { p.arbitro_1 = nombreCompleto; p.id_arb1 = arbitro.id }
  else { p.arbitro_2 = nombreCompleto; p.id_arb2 = arbitro.id }
}

const guardarCancha = async () => {
  if (!nombreCanchaEdit.value.trim()) {
    notificar({ titulo: 'Atención', mensaje: 'La cancha tiene que tener un nombre.', tipo: 'warning' })
    return
  }

  guardando.value = true
  try {
    const partidos = partidosEdit.value.map(p => ({
      ...p,
      cancha: nombreCanchaEdit.value.trim().toUpperCase()
    }))

    const res = await api.post({
      entity: 'designaciones',
      action: 'guardarPartidosCancha',
      payload: {
        partidos,
        eliminados: idsEliminados.value
      }
    })

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Se guardaron los cambios de la cancha.', tipo: 'success' })
      cerrarEdicion()
      await cargarDesignaciones()
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al guardar cancha:', err)
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al guardar los cambios.', tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

/* ====================================================
   ELIMINAR TODO
   ==================================================== */
const solicitarEliminarTodo = () => {
  notificar({
    titulo: 'Eliminar Designaciones',
    mensaje: '¿Estás segura que deseas eliminar todos los partidos cargados? Esta acción no se puede deshacer.',
    tipo: 'warning',
    alConfirmar: () => eliminarTodo()
  })
}

const eliminarTodo = async () => {
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'eliminarDesignaciones',
      payload: {}
    })

    if (res.ok || res.success) {
      designaciones.value = []
      notificar({ titulo: 'Éxito', mensaje: 'Se eliminaron todas las designaciones.', tipo: 'success' })
    } else {
      throw new Error('Error del servidor')
    }
  } catch (err) {
    console.error('Error al eliminar designaciones:', err)
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al eliminar las designaciones.', tipo: 'danger' })
  }
}

/* ====================================================
   PUBLICAR
   ==================================================== */
const generarExcelPublicacion = () => {
  const filas = []

  canchas.value.forEach(c => {
    c.partidos.forEach(p => {
      filas.push({
        FECHA: p.fecha,
        CANCHA: p.cancha,
        CATEGORIA: p.categoria_division,
        HORARIO: p.horario,
        LOCAL: p.local,
        VISITANTE: p.visitante,
        'ARBITRO 1': p.arbitro_1,
        'ARBITRO 2': p.arbitro_2
      })
    })
  })

  const ws = XLSX.utils.json_to_sheet(filas)
  ws['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 28 }, { wch: 10 },
    { wch: 25 }, { wch: 25 }, { wch: 28 }, { wch: 28 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Designaciones')

  const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' })
  return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64
}

const publicarDesignaciones = async () => {
  if (!formPublicar.torneo || !formPublicar.fecha) {
    notificar({ titulo: 'Atención', mensaje: 'Completá el torneo y la fecha.', tipo: 'warning' })
    return
  }

  publicando.value = true
  try {
    const archivoBase64 = generarExcelPublicacion()

    const res = await api.post({
      entity: 'designaciones',
      action: 'subirDesignaciones',
      payload: {
        torneo: formPublicar.torneo,
        fecha: formPublicar.fecha,
        archivoBase64,
        nombreArchivo: 'designaciones.xlsx'
      }
    })

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Las designaciones ya están visibles para el público.', tipo: 'success' })
      mostrarModalPublicar.value = false
      formPublicar.torneo = ''
      formPublicar.fecha = ''
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor al publicar designaciones.')
    }
  } catch (err) {
    console.error('Error al publicar:', err)
    notificar({ titulo: 'Error', mensaje: err.message || 'Hubo un problema al publicar las designaciones.', tipo: 'danger' })
  } finally {
    publicando.value = false
  }
}

onMounted(async () => {
  await cargarArbitros()
  await cargarDesignaciones()
})
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

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated {
  animation-duration: 0.5s;
}
</style>
