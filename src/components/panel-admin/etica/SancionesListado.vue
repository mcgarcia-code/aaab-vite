<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      <!-- CABECERA -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Historial de Sanciones</h2>
          <span class="counter">Total: {{ sancionesFiltradas.length }} sanciones</span>
        </div>
        <div class="header-actions">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex"><span class="material-icons">filter_alt</span> Filtros</button>
          <button @click="limpiarFiltros" class="btn-action btn-clear"><span class="material-icons">filter_alt_off</span> Limpiar</button>
          <RouterLink to="/panel-admin/tribunal/cargar-sancion" class="text-decoration-none">
            <button class="btn-action btn-clear-checks"><span class="material-icons">add_circle</span> Nuevo</button>
          </RouterLink>
          <button @click="exportarExcel" class="btn-action btn-export"><span class="material-icons">download</span> Excel</button>
        </div>
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr class="main-header">
              <th class="text-center">ID</th>
              <th class="text-center">Acciones</th>
              <th>Árbitro</th>
              <th>Motivo / Art.</th>
              <th class="text-center">Sanción</th>
              <th class="text-center">Desde</th>
              <th class="text-center">Hasta</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sancionesPaginadas" :key="s.id">
              <td class="text-center text-muted fw-bold">{{ s.id }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button @click="editarSancion(s)" class="btn-editar"><span class="material-icons" style="font-size:16px;">edit</span></button>
                  <button @click="verHistorialArbitro(s)" class="btn-historial"><span class="material-icons" style="font-size:16px;">manage_search</span></button>
                  <button @click="eliminarSancionRegistro(s.id)" class="btn-eliminar"><span class="material-icons" style="font-size:16px;">delete</span></button>
                </div>
              </td>
              <td class="fw-bold">{{ s.arbitro }}</td>
              <td>{{ s.motivo }} <br> <small class="text-muted">Art. {{ s.articulo }}</small></td>
              <td class="text-center fw-bold text-danger">{{ s.sancion }}</td>
              <td class="text-center">{{ s.desde_formateada }}</td>
              <td class="text-center">
                <span v-if="s.es_indefinido == 1" class="text-muted">Indefinido</span>
                <span v-else>{{ s.hasta_formateada }}</span>
              </td>
              <td class="text-center">
                <span :class="s.estado_dinamico == 1 ? 'badge-status rechazada' : 'badge-status aprobada'">
                  {{ s.estado_dinamico == 1 ? 'VIGENTE' : 'CUMPLIDA' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación omitida por espacio pero se mantiene igual -->
    </div>

    <!-- MODAL EDICIÓN -->
    <Teleport to="body">
      <div v-if="mostrarModalEditar" class="modal-overlay-exito animate__animated animate__fadeIn">
        <div class="modal-content-exito animate__animated animate__zoomIn">
          <h4 class="fw-bold">Editar Sanción</h4>
          <div class="row g-3 text-start">
            <div class="col-md-6"><label>Artículo</label><input v-model="formModal.articulo" class="form-control"></div>
            <div class="col-md-6"><label>Sanción</label><input v-model="formModal.sancion" class="form-control"></div>
            <div class="col-12"><label>Motivo</label><textarea v-model="formModal.motivo" class="form-control"></textarea></div>
            <div class="col-md-6"><label>Desde</label><input v-model="formModal.desde" type="date" class="form-control"></div>
            <div class="col-md-6">
                <label>Hasta</label>
                <input v-model="formModal.hasta" type="date" class="form-control" :disabled="formModal.es_indefinido == 1">
                <input type="checkbox" v-model="formModal.es_indefinido" :true-value="1" :false-value="0"> Indefinido
            </div>
          </div>
          <div class="d-flex gap-2 justify-content-center mt-4">
            <button @click="mostrarModalEditar = false" class="btn btn-light">CANCELAR</button>
            <button @click="confirmarEdicion" class="btn btn-dark">GUARDAR CAMBIOS</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'

useHead({ title: 'Gestión de Sanciones | AAAB' })

// Notificación segura (fallback a alert)
const notificar = inject('notificar', (opts) => alert(opts.mensaje))

const sanciones = ref([])
const cargando = ref(false)
const cargandoProceso = ref(false)

const filtros = reactive({
  arbitro: '',
  motivo: '',
  sancion: '',
  desde: '',
  hasta: '',
  estado: ''
})

const mostrarFiltrosMobile = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModalEditar = ref(false)
const formModal = ref({
  id: null,
  id_arbitro: '',
  arbitro: '',
  motivo: '',
  articulo: '',
  sancion: '',
  desde: '',
  hasta: '',
  es_indefinido: 0,
  activo: 1
})

const mostrarModalHistorial = ref(false)
const cargandoHistorial = ref(false)
const arbitroHistorial = ref(null)
const historialSanciones = ref([])

// 🔧 Normalizar texto (acentos)
const normalizar = (t) =>
  t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''

// 🔧 Convierte DD/MM/YYYY → YYYY-MM-DD
const revertirFechaParaInput = (fecha) => {
  if (!fecha) return ''
  if (fecha.includes('-')) return fecha
  const partes = fecha.split('/')
  return partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : ''
}

// 🔎 FILTROS
const sancionesFiltradas = computed(() => {
  return sanciones.value.filter(s => {
    const matchArb = normalizar(s.arbitro || '').includes(normalizar(filtros.arbitro))
    const matchMot = normalizar((s.motivo || '') + " " + (s.articulo || '')).includes(normalizar(filtros.motivo))
    const matchSan = normalizar(s.sancion || '').includes(normalizar(filtros.sancion))
    const matchDes = (s.desde || '').includes(filtros.desde)

    const textoHasta = s.es_indefinido == 1 ? 'indefinido' : (s.hasta || '')
    const matchHas = normalizar(textoHasta).includes(normalizar(filtros.hasta))

    let matchEst = true
    if (filtros.estado === 'vigente') matchEst = s.activo == 1
    if (filtros.estado === 'cumplida') matchEst = s.activo == 0

    return matchArb && matchMot && matchSan && matchDes && matchHas && matchEst
  })
})

// 📄 PAGINACIÓN
const totalPaginas = computed(() =>
  Math.ceil(sancionesFiltradas.value.length / registrosPorPagina) || 1
)

const sancionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})

// 🔄 Reset página cuando cambian filtros
watch(filtros, () => { paginaActual.value = 1 }, { deep: true })

// 🔄 Evita páginas inválidas
watch(totalPaginas, (nuevo) => {
  if (paginaActual.value > nuevo) paginaActual.value = nuevo
})

// 📡 FETCH
const fetchSanciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'sanciones',
      action: 'obtenerSanciones'
    })
    sanciones.value = res.payload ?? res ?? []
  } catch (err) {
    console.error("Error:", err)
  } finally {
    cargando.value = false
  }
}

// ✏️ EDITAR
const editarSancion = (s) => {
  formModal.value = {
    ...s,
    desde: revertirFechaParaInput(s.desde),
    hasta: revertirFechaParaInput(s.hasta)
  }
  mostrarModalEditar.value = true
}

// 💾 GUARDAR
const confirmarEdicion = async () => {
  cargandoProceso.value = true
  try {
    const res = await api.post({
      entity: 'sanciones',
      action: 'actualizarSancion',
      payload: formModal.value
    })

    if (res?.ok !== false) {
      mostrarModalEditar.value = false
      fetchSanciones()
      notificar({
        titulo: 'Guardado',
        mensaje: 'Sanción actualizada correctamente.',
        tipo: 'success'
      })
    }
  } catch {
    notificar({
      titulo: 'Error',
      mensaje: 'Error de conexión.',
      tipo: 'danger'
    })
  } finally {
    cargandoProceso.value = false
  }
}

// 🗑️ ELIMINAR
const eliminarSancionRegistro = (id) => {
  notificar({
    titulo: '¿Eliminar?',
    mensaje: 'Se borrará permanentemente',
    tipo: 'danger',
    tieneAccion: true,
    alConfirmar: async () => {
      await api.post({
        entity: 'sanciones',
        action: 'eliminarSancion',
        payload: { id }
      })
      fetchSanciones()
    }
  })
}

// 📜 HISTORIAL
const verHistorialArbitro = async (sancion) => {
  arbitroHistorial.value = sancion
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true

  try {
    const { payload } = await api.get({
      entity: 'sanciones',
      action: 'obtenerSancionesArbitro',
      payload: { id_arbitro: sancion.id_arbitro }
    })

    historialSanciones.value = payload ?? []
  } 
  finally {
    cargandoHistorial.value = false
  }
}

// 📊 EXPORTAR EXCEL
const exportarExcel = () => {
  const data = sancionesFiltradas.value.map(s => ({
    ID: s.id,
    Árbitro: s.arbitro,
    Motivo: s.motivo,
    Sanción: s.sancion,
    Desde: s.desde,
    Hasta: s.es_indefinido == 1 ? 'Indefinido' : s.hasta,
    Estado: s.activo == 1 ? 'VIGENTE' : 'CUMPLIDA'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sanciones")
  XLSX.writeFile(wb, "Sanciones_AAAB.xlsx")
}

// 🧹 LIMPIAR FILTROS
const limpiarFiltros = () => {
  Object.keys(filtros).forEach(key => filtros[key] = '')
}

onMounted(fetchSanciones)
</script>

<style scoped>
/* ====================================================
   AJUSTES GENERALES DEL CONTENEDOR Y FOOTER
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
}

.header-section {
  background: white;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-left: 5px solid #dc2626; /* Borde rojo tribunal */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: center;
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #dc2626; color: white; } /* Botón Rojo de Sanción */
.btn-export { background: #10b981; color: white; }

.paginacion {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn-paginacion {
  border: none;
  background: #f8fafc;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

/* ====================================================
   SOLUCIÓN DE LA TABLA: Huecos y Espaciado
   ==================================================== */
.table-container {
  width: 100%;
  overflow: auto;
  max-height: 85vh;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

table {
  width: 100%;
  min-width: max-content;
  border-collapse: separate !important;
  border-spacing: 0;
  font-size: 0.85rem;
}

/* TH PRINCIPAL */
thead tr.main-header th {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #f8fafc !important;
  padding: 12px 8px;
  border-bottom: 1px solid #cbd5e1;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  font-size: 0.75rem;
  color: #000;
  text-transform: uppercase;
  font-weight: 800;
  margin: 0;
}

/* FILA DE FILTROS */
thead tr.filter-row td {
  position: sticky;
  top: 35px;
  z-index: 40;
  background: #f1f5f9 !important;
  padding: 6px 8px 12px 8px;
  border-bottom: 4px solid #e2e8f0;
  margin: 0;
}

/* COLUMNAS CONGELADAS */
.col-id { left: 0; width: 50px; text-align: center; }
.col-acciones { left: 50px; width: 110px; }
.col-arbitro { left: 160px; width: 180px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.sticky-col {
  position: sticky !important;
  z-index: 60 !important;
  background: white !important;
  border-right: 1px solid #e2e8f0;
}
thead tr.main-header th.sticky-col {
  z-index: 100 !important;
  background-color: #f8fafc !important;
}
thead tr.filter-row td.sticky-col {
  z-index: 95 !important;
  background-color: #f1f5f9 !important;
}

/* CELDAS DE DATOS */
.cell-ro {
  padding: 10px 8px;
  font-size: 0.85rem;
  color: #000;
  white-space: nowrap;
  border-bottom: 1px solid #f1f5f9;
}

.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

/* BOTONES DE ACCIÓN EN TABLA */
.btn-editar, .btn-historial, .btn-eliminar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 6px; padding: 4px; cursor: pointer; transition: 0.2s; border: none;
}
.btn-editar { background: #eff6ff; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }

.btn-historial { background: #fef3c7; color: #d97706; }
.btn-historial:hover { background: #fde047; }

.btn-eliminar { background: #fee2e2; color: #dc2626; }
.btn-eliminar:hover { background: #fecaca; }

/* BADGES ESTADO */
.badge-status {
  padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;
}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.badge-status-sm {
  padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;
}
.badge-status-sm.aprobada { background: #dcfce7; color: #15803d; }
.badge-status-sm.rechazada { background: #fee2e2; color: #b91c1c; }

.btn-refresh { background: none; border: none; color: #64748b; cursor: pointer; }

/* MODALES */
.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-content-exito { background: white; border-radius: 30px; padding: 40px; width: 90%; max-width: 750px; text-align: center; }
.icon-circle-exito { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

/* =======================================
   VISTA MOBILE / RESPONSIVE
   ======================================= */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }

.mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-grid-mobile input, .filter-grid-mobile select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; outline: none; background: #f8fafc; }
.filter-grid-mobile select.full-width { grid-column: span 2; }
.filter-grid-mobile input.full-width { grid-column: span 2; }

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
  .card-info p { font-size: 0.85rem; color: #475569; margin: 4px 0; }

  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
  .btn-eliminar-mobile { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .header-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: center; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }
}
</style>