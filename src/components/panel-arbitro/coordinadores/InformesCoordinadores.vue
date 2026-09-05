<template>
  <div class="container-fluid px-2 px-md-3 py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ================= HEADER ================= -->
      <div class="card-header bg-white p-0 border-bottom">
        <div class="px-3 py-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-clipboard-data"></i> Informes de mi grupo
          </h4>
          <p class="text-muted small m-0 mt-1">Informes cargados por los árbitros de los grupos que coordinás</p>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-2 p-sm-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando informes...</p>
        </div>

        <template v-else>

          <!-- FILTRO POR ESTADO -->
          <ul class="nav nav-pills gap-2 mb-4 flex-wrap">
            <li v-for="f in filtrosEstado" :key="f.valor" class="nav-item">
              <button
                @click="estadoActivo = f.valor"
                class="nav-link py-2 px-3 fw-bold small shadow-sm d-flex align-items-center gap-2"
                :class="estadoActivo === f.valor ? `active ${f.claseActiva}` : 'bg-light border text-dark'"
              >
                <i class="bi" :class="f.icono"></i>
                <span>{{ f.etiqueta }}</span>
                <span class="badge rounded-pill" :class="estadoActivo === f.valor ? 'bg-white text-dark' : 'bg-secondary'">
                  {{ contarPorEstado(f.valor) }}
                </span>
              </button>
            </li>
          </ul>

          <!-- TABLA -->
          <div v-if="informesFiltrados.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
            <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">description</span>
            <p class="m-0 fw-bold">No hay informes en este estado.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr class="small text-uppercase text-muted">
                  <th>ID</th>
                  <th>Fecha carga</th>
                  <th>Fecha partido</th>
                  <th>Encuentro</th>
                  <th>Categoría</th>
                  <th>Implicado</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inf in informesFiltrados" :key="inf.id">
                  <td class="fw-bold text-muted small">#{{ inf.id }}</td>
                  <td class="small text-nowrap">{{ formatearFechaHora(inf.creado_en) }}</td>
                  <td class="small text-nowrap">{{ formatearFecha(inf.fecha_partido) }}</td>
                  <td class="small fw-bold text-break">{{ inf.encuentro }}</td>
                  <td class="small">{{ inf.categoria || '-' }}</td>
                  <td class="small text-break">{{ inf.implicado }}</td>
                  <td>
                    <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstado(inf.estado)">
                      <i class="bi" :class="iconoEstado(inf.estado)"></i>
                      {{ etiquetaEstado(inf.estado) }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button
                      @click="abrirDetalle(inf)"
                      class="btn btn-sm btn-outline-secondary me-1"
                      title="Ver detalle"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      v-if="inf.estado === 'creado' || inf.estado === 'pendiente'"
                      @click="abrirEdicion(inf)"
                      class="btn btn-sm btn-outline-danger"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </template>
      </div>
    </div>

    <!-- ================= MODAL DETALLE ================= -->
    <ModalBase
      :show="mostrarDetalle"
      titulo="Detalle del informe"
      icono="clipboard-data"
      colorIcono="bg-danger text-white"
      maxWidth="640px"
      @close="cerrarDetalle"
    >
      <div v-if="informeSel" class="informe-detalle">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span class="fw-bold text-muted small">Informe #{{ informeSel.id }}</span>
          <span class="badge d-inline-flex align-items-center gap-1" :class="badgeEstado(informeSel.estado)">
            <i class="bi" :class="iconoEstado(informeSel.estado)"></i>
            {{ etiquetaEstado(informeSel.estado) }}
          </span>
        </div>

        <div class="row g-3">
          <div class="col-6"><DatoDetalle etiqueta="Fecha del partido" :valor="formatearFecha(informeSel.fecha_partido)" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Categoría" :valor="informeSel.categoria || '-'" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Torneo" :valor="etiquetaTorneo(informeSel.torneo)" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Encuentro" :valor="informeSel.encuentro" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Árbitros" :valor="informeSel.arbitros || '-'" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Implicado" :valor="informeSel.implicado" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Sanción" :valor="informeSel.sancion" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Institución" :valor="informeSel.institucion_nombre" /></div>
          <div class="col-12">
            <label class="form-label small fw-bold text-muted mb-1">Motivo y descripción</label>
            <div class="border rounded p-2 bg-light small text-break" style="white-space: pre-wrap;">{{ informeSel.motivo_descripcion }}</div>
          </div>
          <div class="col-12">
            <DatoDetalle etiqueta="Cargado por el árbitro" :valor="formatearFechaHora(informeSel.creado_en)" />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          v-if="informeSel && (informeSel.estado === 'creado' || informeSel.estado === 'pendiente')"
          @click="anularInforme(informeSel)"
          class="btn btn-outline-secondary rounded-pill px-4 fw-bold w-100 mb-2 mb-md-0"
          :disabled="procesando"
        >
          <i class="bi bi-x-circle me-1"></i> Anular
        </button>
        <button
          v-if="informeSel && (informeSel.estado === 'creado' || informeSel.estado === 'pendiente')"
          @click="aprobarInforme(informeSel)"
          class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="procesando"
        >
          <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-check-circle me-1"></i> Aprobar
        </button>
        <button
          v-if="informeSel && (informeSel.estado === 'aprobado' || informeSel.estado === 'anulado')"
          @click="cerrarDetalle"
          class="btn btn-light border rounded-pill px-4 fw-bold w-100"
        >
          Cerrar
        </button>
      </template>
    </ModalBase>

    <!-- ================= MODAL EDICION ================= -->
    <ModalBase
      :show="mostrarEdicion"
      titulo="Editar informe"
      icono="pencil-square"
      colorIcono="bg-danger text-white"
      maxWidth="640px"
      @close="cerrarEdicion"
    >
      <div v-if="informeEdit" class="informe-form">
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Torneo *</label>
          <select v-model="formEdit.torneo" class="form-select form-select-sm shadow-none">
            <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
          </select>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Implicado *</label>
            <input v-model="formEdit.implicado" type="text" class="form-control form-control-sm shadow-none">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Sanción *</label>
            <input v-model="formEdit.sancion" type="text" class="form-control form-control-sm shadow-none">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Institución *</label>
          <select v-model="formEdit.institucion" class="form-select form-select-sm shadow-none">
            <option value="local">{{ informeEdit.equipo_local }}</option>
            <option value="visitante">{{ informeEdit.equipo_visitante }}</option>
          </select>
        </div>
        <div class="mb-1">
          <label class="form-label small fw-bold text-dark mb-1">Motivo y descripción *</label>
          <textarea v-model="formEdit.motivo_descripcion" class="form-control shadow-none" rows="4"></textarea>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarEdicion" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0" :disabled="procesando">
          Cancelar
        </button>
        <button @click="guardarEdicion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando || !edicionValida">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
          Guardar cambios
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, h, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Informes de mi grupo | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de informes de partidos de los grupos coordinados.' },
    { property: 'og:title', content: 'Informes Coordinadores | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})

const toast = inject('toast', ({ mensaje }) => alert(mensaje))

// Mini componente para mostrar un dato en el detalle
const DatoDetalle = (props) => h('div', {}, [
  h('label', { class: 'form-label small fw-bold text-muted mb-1' }, props.etiqueta),
  h('div', { class: 'fw-bold text-dark small text-break' }, props.valor)
])
DatoDetalle.props = ['etiqueta', 'valor']

const opcionesTorneo = [
  { valor: 'metropolitano_apertura', etiqueta: 'Metropolitano Apertura' },
  { valor: 'metropolitano_clausura', etiqueta: 'Metropolitano Clausura' },
  { valor: 'super_8', etiqueta: 'Super 8' },
  { valor: 'copa_campeones', etiqueta: 'Copa de Campeones' },
  { valor: 'desarrollo_apertura', etiqueta: 'Torneo Desarrollo Apertura' },
  { valor: 'desarrollo_clausura', etiqueta: 'Torneo Desarrollo Clausura' },
  { valor: 'otros', etiqueta: 'Otros' }
]
const etiquetaTorneo = (v) => (opcionesTorneo.find(t => t.valor === v) || {}).etiqueta || v

const filtrosEstado = [
  { valor: 'creado',    etiqueta: 'Creados',   icono: 'bi-file-earmark-text-fill', claseActiva: 'bg-info text-dark' },
  { valor: 'pendiente', etiqueta: 'Pendientes', icono: 'bi-hourglass-split',        claseActiva: 'bg-warning text-dark' },
  { valor: 'aprobado',  etiqueta: 'Aprobados',  icono: 'bi-check-circle-fill',      claseActiva: 'bg-success text-white' },
  { valor: 'anulado',   etiqueta: 'Anulados',   icono: 'bi-x-circle-fill',          claseActiva: 'bg-secondary text-white' }
]

const etiquetaEstado = (e) => ({ creado: 'Creado', pendiente: 'Pendiente', aprobado: 'Aprobado', anulado: 'Anulado' }[e] || e)
const badgeEstado = (e) => ({
  creado: 'bg-info text-dark',
  pendiente: 'bg-warning text-dark',
  aprobado: 'bg-success',
  anulado: 'bg-secondary'
}[e] || 'bg-secondary')
const iconoEstado = (e) => ({
  creado: 'bi-file-earmark-text-fill',
  pendiente: 'bi-hourglass-split',
  aprobado: 'bi-check-circle-fill',
  anulado: 'bi-x-circle-fill'
}[e] || 'bi-question-circle')

const informes = ref([])
const cargando = ref(false)
const procesando = ref(false)
const estadoActivo = ref('creado')

const cargarInformes = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'informes',
      action: 'obtenerInformesCoordinador'
    })
    if ((res.ok || res.success) && res.payload) {
      informes.value = res.payload
    }
  } catch (err) {
    console.error('Error al cargar informes:', err)
  } finally {
    cargando.value = false
  }
}

const contarPorEstado = (estado) => informes.value.filter(i => i.estado === estado).length
const informesFiltrados = computed(() => informes.value.filter(i => i.estado === estadoActivo.value))

/* ============ FECHAS ============ */
const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const f = String(fecha).slice(0, 10)
  const [a, m, d] = f.split('-')
  return (a && m && d) ? `${d}/${m}/${a}` : f
}
const formatearFechaHora = (valor) => {
  if (!valor) return '-'
  const s = String(valor)
  const fecha = s.slice(0, 10)
  const hora = s.slice(11, 16)
  const [a, m, d] = fecha.split('-')
  const fmtFecha = (a && m && d) ? `${d}/${m}/${a}` : fecha
  return hora ? `${fmtFecha} ${hora}` : fmtFecha
}

/* ============ DETALLE ============ */
const mostrarDetalle = ref(false)
const informeSel = ref(null)
const abrirDetalle = (inf) => { informeSel.value = inf; mostrarDetalle.value = true }
const cerrarDetalle = () => { mostrarDetalle.value = false; informeSel.value = null }

/* ============ APROBAR / ANULAR ============ */
const cambiarEstado = async (inf, nuevoEstado) => {
  procesando.value = true
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'cambiarEstadoInforme',
      payload: { id_informe: inf.id, estado: nuevoEstado }
    })
    if (res.ok || res.success) {
      inf.estado = nuevoEstado
      cerrarDetalle()
      toast({
        titulo: nuevoEstado === 'aprobado' ? 'Informe aprobado' : 'Informe anulado',
        mensaje: nuevoEstado === 'aprobado'
          ? 'El informe pasó al panel de administración.'
          : 'El informe fue anulado.',
        tipo: nuevoEstado === 'aprobado' ? 'success' : 'secondary'
      })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo actualizar el informe.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}
const aprobarInforme = (inf) => cambiarEstado(inf, 'aprobado')
const anularInforme = (inf) => cambiarEstado(inf, 'anulado')

/* ============ EDICION ============ */
const mostrarEdicion = ref(false)
const informeEdit = ref(null)
const formEdit = ref({ torneo: '', implicado: '', sancion: '', institucion: '', motivo_descripcion: '' })

const edicionValida = computed(() => {
  const f = formEdit.value
  return f.torneo && f.implicado.trim() && f.sancion.trim() && f.institucion && f.motivo_descripcion.trim()
})

const abrirEdicion = (inf) => {
  informeEdit.value = inf
  formEdit.value = {
    torneo: inf.torneo || '',
    implicado: inf.implicado || '',
    sancion: inf.sancion || '',
    institucion: inf.institucion || '',
    motivo_descripcion: inf.motivo_descripcion || ''
  }
  mostrarEdicion.value = true
}
const cerrarEdicion = () => { mostrarEdicion.value = false; informeEdit.value = null }

const guardarEdicion = async () => {
  if (!edicionValida.value || !informeEdit.value) return
  const inf = informeEdit.value
  const f = formEdit.value
  const institucionNombre = f.institucion === 'local' ? inf.equipo_local : inf.equipo_visitante

  procesando.value = true
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'actualizarInforme',
      payload: {
        id_informe: inf.id,
        torneo: f.torneo,
        implicado: f.implicado.trim(),
        sancion: f.sancion.trim(),
        institucion: f.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: f.motivo_descripcion.trim()
      }
    })
    if (res.ok || res.success) {
      Object.assign(inf, {
        torneo: f.torneo,
        implicado: f.implicado.trim(),
        sancion: f.sancion.trim(),
        institucion: f.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: f.motivo_descripcion.trim()
      })
      cerrarEdicion()
      toast({ titulo: 'Informe actualizado', mensaje: 'Se guardaron los cambios.', tipo: 'success' })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al editar informe:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo guardar.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

onMounted(cargarInformes)
</script>

<style scoped>
.container-fluid { overflow-x: hidden; }
.table thead th { font-weight: 700; font-size: 0.7rem; letter-spacing: 0.03em; }
.table td { vertical-align: middle; }
.animate__animated { animation-duration: 0.5s; }
</style>
