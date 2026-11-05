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

            <button @click="abrirModalNuevo()" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_alert</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <div class="card-body p-2 p-md-3 bg-white">
          <CalendarioEventos
            ref="calendario"
            editable
            @nuevo="abrirModalNuevo"
            @editar="cargarDatosEdicion"
            @eliminar="ev => confirmarEliminacion(ev.id)"
            @cargado="evs => cantidadEventos = evs.length"
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
            <input v-model="form.fecha_evento" type="date" class="form-control shadow-none border-secondary-subtle" required>
            <small v-if="fechaEsMartes" class="d-block text-warning-emphasis fw-semibold mt-1">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ AVISO_MARTES }}
            </small>
          </div>

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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import CalendarioEventos from '@/components/CalendarioEventos.vue'

useHead({
  title: 'Gestion de Eventos | AAAB',
  meta: [{ name: 'description', content: 'Administracion de eventos y avisos.' }],
})

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const calendario = ref(null)
const cantidadEventos = ref(0)
const procesando = ref(false)
const grupos = ref([])
const gruposSeleccionados = ref([])

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

const AVISO_MARTES = 'Los días martes hay curso de árbitros, solo se puede programar una reunión en el Dickens.'
const fechaEsMartes = computed(() => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_evento || '')) return false
  const [y, m, d] = form.fecha_evento.split('-').map(Number)
  return new Date(y, m - 1, d).getDay() === 2
})

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
      await calendario.value?.recargar()
      toast({
        titulo: 'Exito',
        mensaje: `El evento se ${modoEdicion.value ? 'actualizo' : 'publico'} correctamente.`,
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
    await calendario.value?.recargar()
    toast({ titulo: 'Eliminado', mensaje: 'El evento fue borrado.', tipo: 'success' })
  }
}

onMounted(obtenerGrupos)
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
</style>
