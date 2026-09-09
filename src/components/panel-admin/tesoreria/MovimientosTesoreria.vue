<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-list-check me-1"></i> Movimientos de Tesorería
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ movimientosFiltrados.length }} movimientos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerMovimientos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirModalManual" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Ajuste Manual</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- GENERAR APORTES DEL PERIODO -->
        <div class="bg-light p-3 border-bottom">
          <div class="row g-2 align-items-end">
            <div class="col-6 col-md-3">
              <label class="small fw-bold text-dark mb-1 d-block">Período</label>
              <input type="month" v-model="periodoGenerar" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-6 col-md-3">
              <button @click="confirmarGenerar" :disabled="!periodoGenerar || generando" class="btn btn-dark btn-sm w-100 fw-bold shadow-sm">
                <span v-if="generando" class="spinner-border spinner-border-sm me-1"></span>
                Generar Aportes del Período
              </button>
            </div>
          </div>
        </div>

        <!-- FILTROS -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Movimientos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro...">
            </div>
            <div class="col-6 col-md-2">
              <input type="month" v-model="filtros.periodo" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.concepto" class="form-select form-select-sm shadow-none">
                <option value="">Concepto (Todos)</option>
                <option value="arbitraje">Arbitraje</option>
                <option value="observador">Observador</option>
                <option value="mesa_arbitral">Mesa Arbitral</option>
                <option value="delegado">Delegado</option>
                <option value="ajuste_manual">Ajuste Manual</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">Estado (Todos)</option>
                <option value="pendiente">Pendiente</option>
                <option value="cerrado">Cerrado</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando movimientos...</p>
          </div>

          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-uppercase text-muted">Fecha</th>
                    <th class="py-3 text-uppercase text-muted">Árbitro</th>
                    <th class="py-3 text-uppercase text-muted">Concepto</th>
                    <th class="py-3 text-center text-uppercase text-muted">Tipo</th>
                    <th class="py-3 text-end text-uppercase text-muted">Monto</th>
                    <th class="py-3 text-center text-uppercase text-muted">Estado</th>
                    <th class="py-3 text-uppercase text-muted">Descripción</th>
                    <th class="py-3 text-center text-uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in movimientosPaginados" :key="m.id">
                    <td>{{ m.fecha_generacion }}</td>
                    <td class="fw-bold text-dark text-uppercase">{{ m.arbitro }}</td>
                    <td>{{ etiquetaConcepto(m.concepto) }}</td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', m.tipo === 'debito' ? 'debito' : 'credito']">{{ m.tipo === 'debito' ? 'DÉBITO' : 'CRÉDITO' }}</span>
                    </td>
                    <td class="text-end fw-bold">{{ formatearMonto(m.monto) }}</td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', m.estado]">{{ m.estado.toUpperCase() }}</span>
                    </td>
                    <td class="text-muted"><div class="text-truncate" style="max-width: 220px;" :title="m.descripcion">{{ m.descripcion || '-' }}</div></td>
                    <td class="text-center">
                      <button v-if="m.concepto === 'ajuste_manual' && m.estado === 'pendiente'" @click="confirmarAnular(m)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Anular">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                      <span v-else class="text-muted small">—</span>
                    </td>
                  </tr>
                  <tr v-if="movimientosPaginados.length === 0">
                    <td colspan="8" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">search_off</span>
                      <p class="m-0 fw-bold">No se encontraron movimientos.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="m in movimientosPaginados" :key="'mob-'+m.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 0.95rem;">{{ m.arbitro }}</div>
                  <span :class="['badge-status-sm', m.estado]">{{ m.estado.toUpperCase() }}</span>
                </div>
                <div class="card-body pt-1 px-3 pb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted">{{ etiquetaConcepto(m.concepto) }} · {{ m.fecha_generacion }}</span>
                    <span :class="['badge-status-sm', m.tipo === 'debito' ? 'debito' : 'credito']">{{ m.tipo === 'debito' ? 'DÉBITO' : 'CRÉDITO' }}</span>
                  </div>
                  <div class="fw-bold fs-6 mb-2">{{ formatearMonto(m.monto) }}</div>
                  <p v-if="m.descripcion" class="text-muted small mb-2">{{ m.descripcion }}</p>
                  <button v-if="m.concepto === 'ajuste_manual' && m.estado === 'pendiente'" @click="confirmarAnular(m)" class="btn btn-sm btn-outline-danger w-100 fw-bold">
                    Anular
                  </button>
                </div>
              </div>
              <div v-if="movimientosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <p class="text-muted m-0 fw-bold">No se encontraron movimientos.</p>
              </div>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModalManual" @close="mostrarModalManual = false" icono="add_circle" colorIcono="bg-success-subtle text-success" maxWidth="550px">
      <template #header><span class="fw-bold fs-5">Nuevo Ajuste Manual</span></template>

      <form id="formManual" @submit.prevent="confirmarGuardarManual" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Árbitro *</label>
            <select v-model="formManual.id_arbitro" class="form-select shadow-none border-secondary-subtle" required>
              <option value="" disabled>Seleccione un árbitro...</option>
              <option v-for="a in arbitros" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }}</option>
            </select>
          </div>
          <div class="col-6">
            <label class="small fw-bold text-dark mb-1">Tipo *</label>
            <select v-model="formManual.tipo" class="form-select shadow-none border-secondary-subtle" required>
              <option value="debito">Débito (deuda)</option>
              <option value="credito">Crédito (a favor)</option>
            </select>
          </div>
          <div class="col-6">
            <label class="small fw-bold text-dark mb-1">Monto ($) *</label>
            <input v-model.number="formManual.monto" type="number" step="0.01" min="0.01" class="form-control shadow-none border-secondary-subtle" required>
          </div>
          <div class="col-6">
            <label class="small fw-bold text-dark mb-1">Fecha</label>
            <input v-model="formManual.fecha" type="date" class="form-control shadow-none border-secondary-subtle">
          </div>
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Descripción</label>
            <textarea v-model="formManual.descripcion" rows="2" class="form-control shadow-none border-secondary-subtle"></textarea>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalManual = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formManual" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : 'CREAR AJUSTE' }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import { useRoute } from 'vue-router'

useHead({ title: 'Movimientos de Tesorería | AAAB' })

const route = useRoute()
const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const cargando = ref(false)
const generando = ref(false)
const procesando = ref(false)
const movimientos = ref([])
const arbitros = ref([])

const periodoGenerar = ref(new Date().toISOString().slice(0, 7))

const mostrarFiltrosMobile = ref(false)
const filtros = reactive({ arbitro: '', periodo: '', concepto: '', estado: '' })
const paginaActual = ref(1)
const registrosPorPagina = 10

const CONCEPTOS = {
  arbitraje: 'Arbitraje',
  observador: 'Observador',
  mesa_arbitral: 'Mesa Arbitral',
  delegado: 'Delegado',
  ajuste_manual: 'Ajuste Manual'
}
const etiquetaConcepto = (c) => CONCEPTOS[c] || c

const normalizar = (t) => t ? t.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : ''
const formatearMonto = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(v)

const movimientosFiltrados = computed(() => {
  return movimientos.value.filter(m => {
    const matchArbitro = normalizar(m.arbitro).includes(normalizar(filtros.arbitro))
    const matchPeriodo = !filtros.periodo || (m.fecha_generacion || '').startsWith(filtros.periodo)
    const matchConcepto = !filtros.concepto || m.concepto === filtros.concepto
    const matchEstado = !filtros.estado || m.estado === filtros.estado
    return matchArbitro && matchPeriodo && matchConcepto && matchEstado
  }).sort((a, b) => b.id - a.id)
})

const totalPaginas = computed(() => Math.ceil(movimientosFiltrados.value.length / registrosPorPagina) || 1)
const movimientosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return movimientosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo })

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }) }, 50)
}

const limpiarFiltros = () => { filtros.arbitro = ''; filtros.periodo = ''; filtros.concepto = ''; filtros.estado = '' }

const obtenerMovimientos = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerMovimientos', payload: {} })
    if (res.ok) movimientos.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargando.value = false
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    let lista = Array.isArray(res) ? res : (res.payload ?? [])
    lista.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
    arbitros.value = lista

    // Preselección desde "Ver detalle" en Estado de Cuenta General.
    const idPreseleccionado = route.query.id_arbitro
    if (idPreseleccionado) {
      const arbitro = lista.find(a => String(a.id) === String(idPreseleccionado))
      if (arbitro) filtros.arbitro = `${arbitro.apellido} ${arbitro.nombre}`
    }
  } catch (err) {
    console.error('Error cargando árbitros:', err)
  }
}

const confirmarGenerar = () => {
  notificar({
    titulo: 'Generar aportes del período?',
    mensaje: `Se generarán los movimientos correspondientes a las designaciones publicadas de ${periodoGenerar.value}. Puede ejecutarse varias veces sin duplicar.`,
    tipo: 'success',
    alConfirmar: generarAportes
  })
}

const generarAportes = async () => {
  generando.value = true
  try {
    const res = await api.post({ entity: 'tesoreria', action: 'generarAportesPeriodo', payload: { periodo: periodoGenerar.value } })
    if (res.ok) {
      await obtenerMovimientos()
      toast({ titulo: 'Aportes generados', mensaje: `Generados: ${res.payload.generados} · Omitidos: ${res.payload.omitidos}`, tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    generando.value = false
  }
}

const mostrarModalManual = ref(false)
const formManualBase = () => ({ id_arbitro: '', tipo: 'debito', monto: null, fecha: new Date().toISOString().slice(0, 10), descripcion: '' })
const formManual = reactive(formManualBase())

const abrirModalManual = () => {
  Object.assign(formManual, formManualBase())
  mostrarModalManual.value = true
}

const confirmarGuardarManual = () => {
  notificar({
    titulo: 'Crear ajuste manual?',
    mensaje: 'Se registrará el movimiento y se notificará al árbitro.',
    tipo: 'success',
    alConfirmar: guardarManual
  })
}

const guardarManual = async () => {
  procesando.value = true
  try {
    const res = await api.post({ entity: 'tesoreria', action: 'crearMovimientoManual', payload: { ...formManual } })
    if (res.ok && res.payload?.success !== false) {
      mostrarModalManual.value = false
      await obtenerMovimientos()
      toast({ titulo: 'Éxito', mensaje: 'El ajuste manual se creó correctamente.', tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.payload?.message || res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarAnular = (m) => {
  notificar({
    titulo: 'Anular movimiento?',
    mensaje: `Se anulará el ajuste manual de ${m.arbitro} por ${formatearMonto(m.monto)}.`,
    tipo: 'danger',
    alConfirmar: () => anular(m.id)
  })
}

const anular = async (id) => {
  const res = await api.post({ entity: 'tesoreria', action: 'anularMovimientoManual', payload: { id } })
  if (res.ok && res.payload?.success !== false) {
    obtenerMovimientos()
    toast({ titulo: 'Anulado', mensaje: 'El movimiento fue anulado.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: res.payload?.mensaje || 'No pudo anularse el movimiento.', tipo: 'danger' })
  }
}

const exportarExcel = async () => {
  const data = movimientosFiltrados.value.map(m => ({
    Fecha: m.fecha_generacion,
    Árbitro: m.arbitro,
    Concepto: etiquetaConcepto(m.concepto),
    Tipo: m.tipo === 'debito' ? 'Débito' : 'Crédito',
    Monto: Number(m.monto),
    Estado: m.estado,
    Descripción: m.descripcion || ''
  }))

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Movimientos')
  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Movimientos_Tesoreria_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  obtenerMovimientos()
  cargarArbitros()
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

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-block;
  text-align: center;
  border: 1px solid;
}
.badge-status-sm.debito { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge-status-sm.credito { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.badge-status-sm.pendiente { background: #fef9c3; color: #a16207; border-color: #fef08a; }
.badge-status-sm.cerrado { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
.badge-status-sm.anulado { background: #0f172a; color: #ffffff; border-color: #0f172a; }

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
</style>
