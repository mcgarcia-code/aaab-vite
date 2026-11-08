<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-calendar3 me-1"></i> Agenda de Eventos
            </h4>
            <span class="text-muted small d-block mt-1">{{ cantidadEventos }} eventos en la vista</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="calendario?.recargar()" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltrosTabla" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo()" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_alert</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Eventos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-2">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="Buscar tema o descripcion...">
            </div>
            <div class="col-6 col-md-2">
              <input type="date" v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.categoria" class="form-select form-select-sm shadow-none">
                <option value="">TODAS LAS CATEGORIAS</option>
                <option value="reunion">REUNION</option>
                <option value="recordatorio">RECORDATORIO</option>
                <option value="urgente">URGENTE</option>
                <option value="asamblea">ASAMBLEA GENERAL</option>
                <option value="recuperatorio">RECUPERATORIO</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                <option value="">GRUPO (TODOS)</option>
                <option v-for="g in opcionesGrupo" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                <option value="">SUBGRUPO (TODOS)</option>
                <option v-for="s in opcionesSubgrupo" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.anio" class="form-select form-select-sm shadow-none">
                <option value="">AÑO (TODOS)</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-2 p-md-3 bg-white">
          <div v-if="esAprobador && pendientes.length" class="border border-warning rounded-3 mb-3 overflow-hidden">
            <div class="bg-warning-subtle px-3 py-2 fw-bold text-warning-emphasis d-flex align-items-center gap-2">
              <i class="bi bi-hourglass-split"></i>
              {{ pendientes.length }} {{ pendientes.length === 1 ? 'reunión para aprobar' : 'reuniones para aprobar' }}
            </div>
            <div class="d-flex flex-column">
              <div v-for="r in pendientes" :key="r.id" class="d-flex flex-column flex-md-row align-items-md-center gap-2 px-3 py-2 border-top">
                <div class="flex-grow-1 min-w-0">
                  <div class="fw-bold text-dark text-break">
                    {{ formatearFecha(r.fecha_evento) }} · {{ r.titulo }}
                    <span v-if="r.fue_revisada" class="badge text-bg-info ms-1">MODIFICADA</span>
                  </div>
                  <div class="small text-muted text-break">
                    {{ r.grupos || 'Sin grupo' }} · {{ r.descripcion || 'Lugar a confirmar' }}<span v-if="r.creador"> · Cargada por {{ r.creador }}</span>
                  </div>
                </div>
                <div class="d-flex gap-2 flex-shrink-0">
                  <button type="button" class="btn btn-light border btn-sm fw-bold" @click="calendario?.irAFecha(r.fecha_evento)">
                    <i class="bi bi-calendar3"></i>
                  </button>
                  <button type="button" class="btn btn-success btn-sm fw-bold flex-grow-1" :disabled="resolviendo === r.id" @click="confirmarAprobacion(r)">
                    <i class="bi bi-check-lg me-1"></i>APROBAR
                  </button>
                  <button type="button" class="btn btn-outline-danger btn-sm fw-bold flex-grow-1" :disabled="resolviendo === r.id" @click="abrirRechazo(r)">
                    <i class="bi bi-x-lg me-1"></i>RECHAZAR
                  </button>
                </div>
              </div>
            </div>
          </div>

          <CalendarioEventos
            ref="calendario"
            editable
            :puede-aprobar="esAprobador"
            :puede-eliminar="esAprobador"
            @nuevo="abrirModalNuevo"
            @editar="cargarDatosEdicion"
            @eliminar="ev => confirmarEliminacion(ev.id)"
            @aprobar="confirmarAprobacion"
            @rechazar="abrirRechazo"
            :filtro="filtroEventos"
            @cargado="evs => eventosVista = evs"
          />
        </div>
      </div>
    </div>

    <ModalBase
      :show="mostrarModal"
      @close="mostrarModal = false"
      :icono="modoEdicion ? 'edit' : 'notification_add'"
      :colorIcono="modoEdicion ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicion ? 'Editar Evento' : 'Nuevo Evento' }}</span>
      </template>

      <p class="text-muted small mb-4">Completa los datos para enviar el aviso a los arbitros.</p>

      <form id="formEvento" @submit.prevent="confirmarGuardado" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Tema del Evento *</label>
            <input v-model="form.titulo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Reunion general..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Lugar*</label>
            <textarea v-model="form.descripcion" class="form-control shadow-none border-secondary-subtle" rows="2  " placeholder="Ej: Casa del Handball..." required></textarea>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha del Evento *</label>
            <input v-model="form.fecha_evento" type="date" class="form-control shadow-none border-secondary-subtle" required>          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Categoria *</label>
            <select v-model="form.categoria" class="form-select shadow-none border-secondary-subtle">
              <option value="reunion">Reunion</option>
              <option value="recordatorio">Recordatorio</option>
              <option value="urgente">Urgente</option>
              <option value="asamblea">Asamblea General</option>
              <option value="recuperatorio">Recuperatorio</option>
            </select>
          </div>

          <div class="col-12">
            <hr class="my-2 border-secondary-subtle opacity-25">
          </div>

          <div class="col-12">
            <label class="small fw-bold text-danger mb-2">Grupos destinatarios *</label>
            <div class="bg-light border border-danger-subtle rounded p-3">
              <div v-if="grupos.length" class="d-flex flex-wrap gap-3">
                <div class="form-check m-0 w-100 border-bottom pb-2 mb-1">
                  <input
                    id="evento-grupos-todos"
                    class="form-check-input shadow-none border-secondary-subtle"
                    type="checkbox"
                    v-model="form.todosLosGrupos"
                  >
                  <label class="form-check-label small fw-bold mt-1" for="evento-grupos-todos">
                    Seleccionar todos
                  </label>
                </div>
                <div v-for="grupoItem in grupos" :key="grupoItem.id" class="form-check m-0">
                  <input
                    :id="`evento-grupo-${grupoItem.id}`"
                    class="form-check-input shadow-none border-secondary-subtle"
                    type="checkbox"
                    :checked="gruposSeleccionados.includes(grupoItem.id)"
                    @change = 'toggleGrupoSeleccionado(grupoItem.id, $event.target.checked)'
                    :disabled="form.todosLosGrupos"
                  >
                  <label class="form-check-label small fw-bold mt-1" :for="`evento-grupo-${grupoItem.id}`">
                    {{ grupoItem.nombre }} {{ grupoItem.subgrupo }}
                  </label>
                </div>
              </div>
              <p v-else class="text-muted small mb-0">No hay grupos disponibles para seleccionar.</p>
            </div>
            <small v-if="seSeparaPorGrupo" class="d-block text-primary fw-semibold mt-2">
              <i class="bi bi-diagram-3-fill me-1"></i>Se va a crear una reunión separada para cada grupo ({{ gruposSeleccionados.length }}), así cada coordinador puede gestionar la suya.
            </small>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formEvento" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'PUBLICAR EVENTO') }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="!!reunionRechazo"
      @close="reunionRechazo = null"
      icono="block"
      colorIcono="bg-danger-subtle text-danger"
      maxWidth="520px"
    >
      <template #header>
        <span class="fw-bold fs-5">Rechazar reunión</span>
      </template>
      <div v-if="reunionRechazo" class="text-start">
        <p class="small text-muted mb-3">
          {{ formatearFecha(reunionRechazo.fecha_evento) }} · {{ reunionRechazo.titulo }}<span v-if="reunionRechazo.grupos"> · {{ reunionRechazo.grupos }}</span>
        </p>
        <label class="small fw-bold text-dark mb-1">Motivo del rechazo *</label>
        <textarea v-model="motivoRechazo" class="form-control shadow-none border-secondary-subtle" rows="3" placeholder="Ej: Ese día ya hay otra reunión en el Dickens..."></textarea>
        <small class="text-muted d-block mt-1">Se le envía por email al coordinador del grupo para que reprograme la reunión.</small>
      </div>
      <template #footer>
        <button type="button" @click="reunionRechazo = null" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="rechazar" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="motivoRechazo.trim().length < 5 || !!resolviendo">
          <span v-if="resolviendo" class="spinner-border spinner-border-sm me-1"></span>
          RECHAZAR
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import CalendarioEventos from '@/components/CalendarioEventos.vue'
import { auth } from '@/api/auth'

useHead({
  title: 'Gestion de Eventos | AAAB',
  meta: [{ name: 'description', content: 'Administracion de eventos y avisos.' }],
})

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const calendario = ref(null)
const procesando = ref(false)
const grupos = ref([])
const gruposSeleccionados = ref([])
const seSeparaPorGrupo = computed(() =>
  form.categoria === 'reunion' && !form.todosLosGrupos && gruposSeleccionados.value.length > 1
)

const formBase = {
  id: null,
  titulo: '',
  descripcion: '',
  fecha_evento: '',
  nombresGrupos: [],
  idsGrupos: [],
  todosLosGrupos: false,
  categoria: 'reunion'
}

const form = reactive({ ...formBase })
const mostrarModal = ref(false)
const modoEdicion = ref(false)

const mostrarFiltrosMobile = ref(false)
const eventosVista = ref([])
const filtros = reactive({
  busqueda: '',
  anio: String(new Date().getFullYear()),
  fecha: '',
  categoria: '',
  grupo: '',
  subgrupo: ''
})

const normalizarTexto = (texto) => String(texto || '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .trim()

const opcionesGrupo = computed(() => {
  const vistos = []
  for (const g of grupos.value) {
    const nombre = String(g.nombre || '').trim()
    if (nombre && !vistos.includes(nombre)) vistos.push(nombre)
  }
  return vistos.sort((a, b) => a.localeCompare(b, 'es'))
})

const opcionesSubgrupo = computed(() => {
  const vistos = []
  for (const g of grupos.value) {
    const sub = String(g.subgrupo || '').trim()
    if (sub && !vistos.includes(sub)) vistos.push(sub)
  }
  return vistos.sort((a, b) => a.localeCompare(b, 'es'))
})

const anioActual = new Date().getFullYear()
const aniosDisponibles = [anioActual + 1, anioActual, anioActual - 1, anioActual - 2].map(String)

const filtroEventos = (ev) => {
  if (filtros.busqueda) {
    const q = normalizarTexto(filtros.busqueda)
    if (!normalizarTexto(ev.titulo).includes(q) && !normalizarTexto(ev.descripcion).includes(q)) return false
  }
  if (filtros.categoria && ev.categoria !== filtros.categoria) return false
  if (filtros.fecha && ev.fecha_evento !== filtros.fecha) return false
  if (filtros.anio && !String(ev.fecha_evento).startsWith(filtros.anio)) return false
  if (filtros.grupo || filtros.subgrupo) {
    if (ev.todosLosGrupos) return false
    const gFiltro = normalizarTexto(filtros.grupo)
    const sFiltro = normalizarTexto(filtros.subgrupo)
    return (ev.idsGrupos || []).some(id => {
      const g = grupos.value.find(x => Number(x.id) === Number(id))
      if (!g) return false
      return (!gFiltro || normalizarTexto(g.nombre) === gFiltro) && (!sFiltro || normalizarTexto(g.subgrupo) === sFiltro)
    })
  }
  return true
}

const cantidadEventos = computed(() => eventosVista.value.filter(filtroEventos).length)

watch(() => filtros.fecha, (f) => { if (f) calendario.value?.irAFecha(f) })
watch(() => filtros.anio, (a) => {
  if (!a) return
  calendario.value?.irAFecha(Number(a) === anioActual ? [new Date().getFullYear(), String(new Date().getMonth() + 1).padStart(2, "0"), String(new Date().getDate()).padStart(2, "0")].join("-") : `${a}-01-01`)
})

const limpiarFiltrosTabla = () => {
  Object.assign(filtros, { busqueda: '', anio: String(new Date().getFullYear()), fecha: '', categoria: '', grupo: '', subgrupo: '' })
}

const obtenerGrupos = async () => {
  const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos', payload: {} })
  if (res.ok) {
    grupos.value = Array.isArray(res.payload) ? res.payload : []
  }
}

const abrirModalNuevo = (fecha = '') => {
  gruposSeleccionados.value = []
  Object.assign(form, { ...formBase, fecha_evento: typeof fecha === 'string' ? fecha : '' })
  modoEdicion.value = false
  mostrarModal.value = true
}

const cargarDatosEdicion = (evento) => {
  modoEdicion.value = true
  Object.assign(form, {
    id: evento.id,
    titulo: evento.titulo,
    descripcion: evento.descripcion,
    fecha_evento: (evento.fecha_evento || '').substring(0, 10),
    idsGrupos: [...(evento.idsGrupos || [])],
    todosLosGrupos: !!evento.todosLosGrupos,
    categoria: evento.categoria || 'reunion'
  })
  gruposSeleccionados.value = [...(evento.idsGrupos || [])]
  mostrarModal.value = true
}

const toggleGrupoSeleccionado = (id, estaChequeado) => {
  if (!estaChequeado) {
    gruposSeleccionados.value = gruposSeleccionados.value.filter(g => g !== id)
  } else if (!gruposSeleccionados.value.includes(id)) {
    gruposSeleccionados.value.push(id)
  }
}

const guardarEvento = async () => {
  if (!form.todosLosGrupos && gruposSeleccionados.value.length == 0) {
    toast({ titulo: 'Faltan grupos', mensaje: 'Selecciona al menos un grupo destinatario.', tipo: 'danger' })
    return
  }

  procesando.value = true
  try {
    const action = modoEdicion.value ? 'editarEvento' : 'guardarEvento'
    const res = await api.post({
      entity: 'eventos',
      action,
      payload: {
        ...form,
        idsGrupos: gruposSeleccionados.value,
      }
    })
    if (res.ok) {
      gruposSeleccionados.value = []
      mostrarModal.value = false
      await Promise.all([calendario.value?.recargar(), cargarPendientes()])
      const pendiente = res.payload?.aprobacion === 'pendiente'
      const cantidad = (res.payload?.ids || []).length
      const base = cantidad > 1
        ? `Se ${modoEdicion.value ? 'guardaron' : 'crearon'} ${cantidad} reuniones, una por grupo.`
        : `El evento se ${modoEdicion.value ? 'actualizo' : 'publico'} correctamente.`
      toast({
        titulo: 'Exito',
        mensaje: pendiente ? `${base} Quedan pendientes de aprobación.` : base,
        tipo: 'success'
      })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazo la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexion.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarGuardado = () => {
  const tituloStr = modoEdicion.value ? 'Actualizar?' : 'Publicar?'
  const mensajeStr = modoEdicion.value ? 'Se modificaran los datos del evento.' : 'Se enviara el aviso a los arbitros.'
  notificar({ titulo: tituloStr, mensaje: mensajeStr, tipo: 'success', alConfirmar: guardarEvento })
}

const confirmarEliminacion = (id) => {
  notificar({
    titulo: 'Eliminar Evento?',
    mensaje: 'Esta accion es irreversible y los arbitros dejaran de verlo.',
    tipo: 'danger',
    alConfirmar: () => eliminar(id)
  })
}

const eliminar = async (id) => {
  const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id } })
  if (res.ok) {
    await Promise.all([calendario.value?.recargar(), cargarPendientes()])
    toast({ titulo: 'Eliminado', mensaje: 'El evento fue borrado.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: res.message || 'No se pudo eliminar el evento.', tipo: 'danger' })
  }
}

const usuario = auth.getUser()
const esAprobador = ['admin', 'secretario', 'coordinador general'].includes(usuario?.rol)
const pendientes = ref([])
const resolviendo = ref(null)
const reunionRechazo = ref(null)
const motivoRechazo = ref('')

const formatearFecha = (f) => f ? String(f).substring(0, 10).split('-').reverse().join('/') : ''

const cargarPendientes = async () => {
  if (!esAprobador) return
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerReunionesPendientes' })
    if (res?.ok) pendientes.value = res.payload || []
  } catch (e) {
    console.error('obtenerReunionesPendientes:', e)
  }
}

const resolverReunion = async (action, payload, mensajeOk) => {
  resolviendo.value = payload.id
  try {
    const res = await api.post({ entity: 'eventos', action, payload })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo procesar la reunión')
    toast({ titulo: 'Listo', mensaje: mensajeOk, tipo: 'success' })
    reunionRechazo.value = null
    await Promise.all([calendario.value?.recargar(), cargarPendientes()])
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo procesar la reunión', tipo: 'danger' })
  } finally {
    resolviendo.value = null
  }
}

const confirmarAprobacion = (r) => {
  notificar({
    titulo: '¿Aprobar reunión?',
    mensaje: `${formatearFecha(r.fecha_evento)} · ${r.titulo}. Se le avisará por email al coordinador y la reunión quedará visible para los árbitros.`,
    tipo: 'success',
    alConfirmar: () => resolverReunion('aprobarReunion', { id: r.id }, 'Reunión aprobada. Se notificó al coordinador.')
  })
}

const abrirRechazo = (r) => {
  const grupos = r.grupos ?? pendientes.value.find(p => p.id === r.id)?.grupos ?? ''
  reunionRechazo.value = { ...r, grupos }
  motivoRechazo.value = ''
}

const rechazar = () => {
  if (!reunionRechazo.value) return
  resolverReunion(
    'rechazarReunion',
    { id: reunionRechazo.value.id, motivo: motivoRechazo.value.trim() },
    'Reunión rechazada. Se notificó al coordinador con el motivo.'
  )
}

onMounted(() => {
  obtenerGrupos()
  cargarPendientes()
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

.badge-category {
  font-size: 0.65rem;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 800;
  display: inline-block;
}

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
}

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
.min-w-0 { min-width: 0; }
</style>
