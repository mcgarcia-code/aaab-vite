<template>
  <div class="container-fluid py-2 py-md-0 px-2 px-md-3 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <!-- Card Header -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center border-bottom gap-3 text-center text-md-start">
        <div class="w-100 w-md-auto">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center justify-content-center justify-content-md-start gap-2 fs-5 fs-md-4">
            <i class="bi bi-shield-check me-1 me-md-2"></i> Administración de Exámenes Generales — Asamblea
          </h4>
          <p class="text-muted small m-0 mt-1">Elegí una asamblea y qué grupos quedan habilitados para rendir el examen teórico.</p>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body p-3 p-md-4">

        <!-- Estado: Cargando -->
        <div v-if="cargandoInicial" class="text-center py-5">
          <span class="spinner-border text-danger" role="status"></span>
          <p class="text-muted mt-3 m-0 fw-bold small">Cargando...</p>
        </div>

        <div v-else>
          <!-- Estado: Sin eventos -->
          <div v-if="!eventos.length" class="text-center py-5 px-3 text-muted bg-light rounded-3">
            <span class="material-icons opacity-50 d-block mb-2" style="font-size: 40px;">event_busy</span>
            <p class="m-0 fw-bold">No hay eventos de tipo asamblea o recuperatorio cargados.</p>
          </div>

          <!-- Estado: Lista de eventos -->
          <div v-else class="row g-3">
            <div v-for="ev in eventos" :key="ev.id" class="col-12 col-lg-6">
              <div class="card border border-light-subtle shadow rounded-4 h-100 evento-card">
                <div class="card-body p-3 p-md-4 d-flex flex-column justify-content-between">

                  <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <span class="badge bg-danger-subtle text-danger text-uppercase mb-2">{{ ev.categoria }}</span>
                      <h5 class="fw-bold text-dark mb-1 fs-5">{{ ev.titulo }}</h5>
                      <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>{{ formatoFecha(ev.fecha) }}</small>
                    </div>
                    <button class="btn btn-danger btn-sm rounded-pill px-3 fw-bold align-self-start align-self-sm-auto mt-1 mt-sm-0 flex-shrink-0" @click="abrirModal(ev.id)">
                      <i class="bi bi-pencil-square me-1"></i>Habilitar
                    </button>
                  </div>

                  <div class="border-top pt-3 mt-auto">
                    <small class="text-muted d-block mb-2 fw-bold">Grupos habilitados ({{ gruposDeEvento(ev.id).length }})</small>
                    <div v-if="gruposDeEvento(ev.id).length" class="d-flex flex-wrap gap-1">
                      <span v-for="(g, i) in gruposDeEvento(ev.id)" :key="i"
                            class="badge bg-success-subtle text-success border border-success-subtle">{{ g }}</span>
                    </div>
                    <span v-else class="text-secondary small fst-italic">Ningún grupo habilitado todavía</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Base -->
    <ModalBase :show="modalAbierto" @close="cerrarModal">
      <template #header>
        <div class="d-flex align-items-center text-wrap text-break pe-2">
          <i class="bi bi-people-fill me-2 text-danger flex-shrink-0"></i>
          <span>Habilitar grupos — {{ eventoActual?.titulo }}</span>
        </div>
      </template>

      <!-- Cuerpo del modal -->
      <p class="text-muted small mb-3">
        Marcá los grupos que van a poder rendir este examen. Los desmarcados dejan de verlo en su panel.
      </p>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <button class="btn btn-outline-danger btn-sm rounded-pill flex-grow-1 flex-sm-grow-0" @click="marcarTodos">Marcar todos</button>
        <button class="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1 flex-sm-grow-0" @click="desmarcarTodos">Desmarcar todos</button>
      </div>
      <div class="grupos-grid mb-3">
        <label v-for="g in grupos" :key="g.id" class="grupo-item" :class="{ activo: gruposElegidos.includes(g.id) }">
          <input type="checkbox" class="form-check-input me-2 flex-shrink-0"
                 :checked="gruposElegidos.includes(g.id)" @change="toggleGrupo(g.id)">
          <span class="text-break">{{ g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre }}</span>
        </label>
      </div>

      <template #footer>
        <div class="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 w-100">
          <button class="btn btn-outline-secondary rounded-pill px-4 w-100 w-sm-auto" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-danger rounded-pill px-4 fw-bold w-100 w-sm-auto" :disabled="guardando" @click="guardar">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>Guardar
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'

useHead({ title: 'Habilitación de Exámenes - Asamblea' })

const notificar = inject('notificar')

const cargandoInicial = ref(true)
const guardando = ref(false)

const eventos = ref([])
const grupos = ref([])
const habilitaciones = ref([])

const modalAbierto = ref(false)
const eventoSeleccionado = ref(null)
const gruposElegidos = ref([])

const eventoActual = computed(() =>
  eventos.value.find(e => e.id === eventoSeleccionado.value) || null
)

const habilitadosPorEvento = computed(() => {
  const mapa = {}
  for (const h of habilitaciones.value) {
    if (!mapa[h.id_evento]) mapa[h.id_evento] = []
    mapa[h.id_evento].push(h.id_grupo)
  }
  return mapa
})

function nombreGrupo(idGrupo) {
  const g = grupos.value.find(x => x.id === idGrupo)
  if (!g) return '—'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

function gruposDeEvento(idEvento) {
  return (habilitadosPorEvento.value[idEvento] || []).map(nombreGrupo)
}

async function cargarTodo() {
  const [ev, gr, hab] = await Promise.all([
    api.get({ entity: 'eventos', action: 'obtenerEventosProximos' }),
    api.get({ entity: 'grupos', action: 'obtenerGrupos' }),
    api.get({ entity: 'examenes_habilitaciones', action: 'obtenerHabilitaciones' })
  ])
  const listaEv = ev?.payload ?? ev ?? []
  const listaGr = gr?.payload ?? gr ?? []
  const listaHab = hab?.payload ?? hab ?? []

  eventos.value = listaEv.filter(e =>
    ['asamblea', 'recuperatorio'].includes(String(e.categoria || '').toLowerCase())
  )
  grupos.value = listaGr
  habilitaciones.value = listaHab.filter(h => Number(h.activo) === 1)
}

function abrirModal(idEvento) {
  eventoSeleccionado.value = idEvento
  gruposElegidos.value = [...(habilitadosPorEvento.value[idEvento] || [])]
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  eventoSeleccionado.value = null
  gruposElegidos.value = []
}

function toggleGrupo(idGrupo) {
  const i = gruposElegidos.value.indexOf(idGrupo)
  if (i === -1) gruposElegidos.value.push(idGrupo)
  else gruposElegidos.value.splice(i, 1)
}

function marcarTodos() { gruposElegidos.value = grupos.value.map(g => g.id) }
function desmarcarTodos() { gruposElegidos.value = [] }

async function guardar() {
  if (!eventoSeleccionado.value) return
  guardando.value = true
  try {
    await api.post({
      entity: 'examenes_habilitaciones',
      action: 'guardarHabilitacion',
      payload: { idEvento: eventoSeleccionado.value, idsGrupos: gruposElegidos.value }
    })
    await cargarTodo()
    notificar?.({ tipo: 'success', mensaje: 'Habilitación guardada' })
    cerrarModal()
  } catch{
    notificar?.({ tipo: 'error', mensaje: 'No se pudo guardar la habilitación' })
  } finally {
    guardando.value = false
  }
}

function formatoFecha(f) {
  if (!f) return ''
  const d = new Date(f)
  if (isNaN(d)) return f
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  await cargarTodo()
  cargandoInicial.value = false
})
</script>

<style scoped>
.animate__animated {
  animation-duration: 0.5s;
}

.evento-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.evento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  max-height: 50vh;
  overflow-y: auto;
}

.grupo-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border: 1px solid #dee2e6;
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  transition: all 0.12s ease;
}

.grupo-item:hover {
  border-color: #dc3545;
  background: #fff5f5;
}

.grupo-item.activo {
  border-color: #dc3545;
  background: #fff0f0;
  font-weight: 600;
}
</style>
