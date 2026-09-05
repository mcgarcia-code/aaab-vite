<template>
  <div class="container-fluid px-2 px-md-3 py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- ================= HEADER ================= -->
      <div class="card-header bg-white p-0 border-bottom">
        <div class="px-3 py-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-clipboard-check"></i> Informes aprobados
          </h4>
          <p class="text-muted small m-0 mt-1">Informes aprobados por los coordinadores</p>
        </div>
      </div>

      <!-- ================= BODY ================= -->
      <div class="card-body p-2 p-sm-3 p-md-4">

        <div v-if="cargando" class="text-center py-5">
          <span class="spinner-border text-danger"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando informes...</p>
        </div>

        <template v-else>

          <div v-if="informes.length === 0" class="text-center py-5 text-muted bg-light rounded-3">
            <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">fact_check</span>
            <p class="m-0 fw-bold">Todavía no hay informes aprobados.</p>
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
                  <th>Torneo</th>
                  <th class="text-center">Cargado en Larry</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="inf in informes" :key="inf.id">
                  <td class="fw-bold text-muted small">#{{ inf.id }}</td>
                  <td class="small text-nowrap">{{ formatearFechaHora(inf.creado_en) }}</td>
                  <td class="small text-nowrap">{{ formatearFecha(inf.fecha_partido) }}</td>
                  <td class="small fw-bold text-break">{{ inf.encuentro }}</td>
                  <td class="small">{{ inf.categoria || '-' }}</td>
                  <td class="small text-break">{{ inf.implicado }}</td>
                  <td class="small">{{ etiquetaTorneo(inf.torneo) }}</td>
                  <td class="text-center">
                    <div class="form-check form-switch d-flex justify-content-center m-0">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        :checked="!!inf.cargado_larry"
                        :disabled="guardandoLarry === inf.id"
                        @change="toggleLarry(inf, $event)"
                      >
                    </div>
                    <span class="small fw-bold" :class="inf.cargado_larry ? 'text-success' : 'text-muted'">
                      {{ inf.cargado_larry ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="text-end text-nowrap">
                    <button @click="abrirDetalle(inf)" class="btn btn-sm btn-outline-secondary" title="Ver detalle">
                      <i class="bi bi-eye"></i>
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
      icono="clipboard-check"
      colorIcono="bg-danger text-white"
      maxWidth="640px"
      @close="cerrarDetalle"
    >
      <div v-if="informeSel" class="informe-detalle">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span class="fw-bold text-muted small">Informe #{{ informeSel.id }}</span>
          <span class="badge bg-success d-inline-flex align-items-center gap-1">
            <i class="bi bi-check-circle-fill"></i> Aprobado
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
          <div class="col-6"><DatoDetalle etiqueta="Cargado por el árbitro" :valor="formatearFechaHora(informeSel.creado_en)" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Cargado en Larry" :valor="informeSel.cargado_larry ? 'Sí' : 'No'" /></div>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold w-100">
          Cerrar
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, h, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Informes | AAAB',
  meta: [
    { name: 'description', content: 'Panel de administración de informes de partidos.' },
    { property: 'og:title', content: 'Informes Admin | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})

const toast = inject('toast', ({ mensaje }) => alert(mensaje))

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

const informes = ref([])
const cargando = ref(false)
const guardandoLarry = ref(null)

const cargarInformes = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'informes',
      action: 'obtenerInformesAdmin'
    })
    if ((res.ok || res.success) && res.payload) {
      informes.value = res.payload
    }
  } catch (err) {
    console.error('Error al cargar informes admin:', err)
  } finally {
    cargando.value = false
  }
}

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

/* ============ CHECKBOX CARGADO EN LARRY ============ */
const toggleLarry = async (inf, event) => {
  const nuevoValor = event.target.checked ? 1 : 0
  guardandoLarry.value = inf.id
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'marcarCargadoLarry',
      payload: { id_informe: inf.id, cargado_larry: nuevoValor }
    })
    if (res.ok || res.success) {
      inf.cargado_larry = nuevoValor
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al marcar Larry:', err)
    // Revertir el checkbox visual
    event.target.checked = !!inf.cargado_larry
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo actualizar.', tipo: 'danger' })
  } finally {
    guardandoLarry.value = null
  }
}

/* ============ DETALLE ============ */
const mostrarDetalle = ref(false)
const informeSel = ref(null)
const abrirDetalle = (inf) => { informeSel.value = inf; mostrarDetalle.value = true }
const cerrarDetalle = () => { mostrarDetalle.value = false; informeSel.value = null }

onMounted(cargarInformes)
</script>

<style scoped>
.container-fluid { overflow-x: hidden; }
.table thead th { font-weight: 700; font-size: 0.7rem; letter-spacing: 0.03em; }
.table td { vertical-align: middle; }
.form-switch .form-check-input:checked { background-color: #198754; border-color: #198754; }
.animate__animated { animation-duration: 0.5s; }
</style>
