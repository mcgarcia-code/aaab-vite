<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 border-bottom">
          <div class="row g-3 align-items-center">
            <div class="col-12 col-xl-auto">
              <div>
                <p class="seccion-descripcion">
                  <template v-if="modoReunion && !cargandoArbitros">
                    {{ reunionActual?.titulo }} — {{ arbitrosReunion.length }} árbitros
                    <span v-if="resumenReunionActual.presentes"   class="ms-1 estado-pill estado-verde">✓ {{ resumenReunionActual.presentes }}</span>
                    <span v-if="resumenReunionActual.ausentes"    class="ms-1 estado-pill estado-naranja">✗ {{ resumenReunionActual.ausentes }}</span>
                    <span v-if="resumenReunionActual.sinRegistro" class="ms-1 estado-pill estado-gris">— {{ resumenReunionActual.sinRegistro }}</span>
                  </template>
                  <template v-else>Presentes y ausentes de cada reunión · {{ totalFiltrados }} árbitros</template>
                </p>
                <span v-if="modoReunion && reunionActual" class="text-muted d-block mt-1 texto-creacion">
                  <i class="bi bi-person-badge me-1"></i>{{ textoCreacionReunion(reunionActual) }}
                </span>
              </div>
            </div>

            <div class="col-12 col-xl">
              <div class="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center justify-content-md-between">
                <select
                  v-model="reunionSeleccionada"
                  @change="onReunionSeleccionada"
                  class="form-select shadow-sm border-secondary-subtle fw-semibold text-truncate select-reunion control-encabezado"
                  :disabled="cargandoInicial || cargandoArbitros"
                  aria-label="Elegir reunión"
                >
                  <option value="">— Ver listado general —</option>
                  <option v-for="op in opcionesReunion" :key="op.key" :value="op.key">
                    {{ op.label }}
                  </option>
                </select>

                <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between justify-content-md-end flex-shrink-0">
                  <div class="form-check form-switch d-flex align-items-center gap-2 m-0 border rounded px-3 py-2 shadow-sm bg-white flex-shrink-0 control-encabezado">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="toggleSoloActivos"
                      v-model="soloActivos"
                      role="switch"
                      :disabled="cargandoInicial || cargandoArbitros"
                    >
                    <label class="form-check-label small fw-bold text-dark m-0" for="toggleSoloActivos">
                      Solo activos
                    </label>
                  </div>
                  <div class="d-flex gap-2">
                    <BotonHerramienta tipo="filtros" class="d-md-none flex-shrink-0 control-encabezado" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />
                    <BotonHerramienta tipo="limpiar" class="flex-shrink-0" @click="limpiarFiltros" />
                    <BotonHerramienta tipo="actualizar" class="flex-shrink-0" :cargando="cargandoInicial || cargandoArbitros" @click="recargar" />
                    <BotonHerramienta tipo="nuevo" texto="Nueva reunión" class="flex-shrink-0" @click="abrirModalNuevaReunion" />
                  </div>
                </div>
              </div>

              <div v-if="modoReunion" class="d-flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                  :disabled="cargandoArbitros || !!motivoNoGestionable"
                  @click="abrirModalEditarReunion"
                  :title="motivoNoGestionable || 'Modificar esta reunión'"
                >
                  <i class="bi bi-pencil-square"></i>
                  <span>Modificar</span>
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                  :disabled="cargandoArbitros || eliminandoReunion || !puedeEliminarReunion"
                  @click="confirmarEliminarReunion"
                  :title="puedeEliminarReunion ? 'Eliminar esta reunión' : motivoNoEliminable"
                >
                  <span v-if="eliminandoReunion" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-trash3"></i>
                  <span>Eliminar</span>
                </button>

                <template v-if="!reunionEsPasada">
                  <button
                    type="button"
                    class="btn btn-sm btn-danger rounded-pill fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                    :disabled="habilitandoExamen || cargandoArbitros || !idsGruposExamenReunion.length || examenHabilitado || !asistenciaGrupoExamen.presentes || !reunionAprobada"
                    @click="abrirModalExamen"
                    :title="tituloBotonHabilitar"
                  >
                    <span v-if="habilitandoExamen" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-shield-check"></i>
                    <span>Habilitar examen</span>
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
                    :disabled="deshabilitandoExamen || cargandoArbitros || !idsGruposExamenReunion.length || !examenHabilitado"
                    @click="deshabilitarExamenReunion"
                    title="Deshabilitar el examen de esta reunión"
                  >
                    <span v-if="deshabilitandoExamen" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-shield-slash"></i>
                    <span>Deshabilitar examen</span>
                  </button>
                </template>
              </div>
              <small v-if="modoReunion && motivoNoGestionable" class="d-block text-muted mt-1">
                <i class="bi bi-info-circle me-1"></i>{{ motivoNoGestionable }}
              </small>
            </div>
          </div>
        </div>

        <div v-if="modoReunion && reunionActual?.categoria === 'reunion' && reunionActual?.aprobacion === 'pendiente'" class="alert alert-warning rounded-0 border-0 border-bottom mb-0 py-2 px-3 small d-flex align-items-center gap-2">
          <i class="bi bi-hourglass-split flex-shrink-0"></i>
          <span><strong>Pendiente de aprobación.</strong> Los árbitros la van a ver, y vas a poder tomar asistencia y habilitar el examen, cuando la administración la apruebe.</span>
        </div>
        <div v-else-if="modoReunion && reunionActual?.categoria === 'reunion' && reunionActual?.aprobacion === 'rechazada'" class="alert alert-danger rounded-0 border-0 border-bottom mb-0 py-2 px-3 small d-flex flex-column flex-md-row align-items-md-center gap-2">
          <div class="flex-grow-1">
            <strong><i class="bi bi-x-octagon-fill me-1"></i>Reunión rechazada.</strong>
            <span v-if="reunionActual.motivo_rechazo"> Motivo: {{ reunionActual.motivo_rechazo }}.</span>
            Reprogramala para que vuelva a revisión.
          </div>
          <button v-if="puedeModificarReunion" type="button" class="btn btn-danger rounded-pill btn-sm fw-bold flex-shrink-0" @click="abrirModalEditarReunion">
            <i class="bi bi-calendar-plus me-1"></i>REPROGRAMAR
          </button>
        </div>

        <TablaAsistenciaReunion @ver-historial="verDetalleArbitro" @guardar="guardarAsistencia">
          <!-- Columna del teórico: nota del examen habilitado para la reunión -->
          <template #encabezado-extra>
            <th class="py-3 text-center text-uppercase text-muted">Teórico</th>
          </template>
          <template #celda-extra="{ arbitro: a }">
            <td class="text-center">
              <div v-if="examenes[a.id]" class="d-flex align-items-center justify-content-center gap-2">
                <span class="fw-bold" :class="examenes[a.id].aprobado ? 'text-success' : 'text-danger'">
                  {{ examenes[a.id].calificacion.toFixed(2) }} %
                </span>
                <button
                  type="button"
                  @click="descargarPdfTeorico(a)"
                  :disabled="!!descargandoPdf[a.id]"
                  class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark"
                  title="Descargar teórico"
                  aria-label="Descargar teórico"
                >
                  <span v-if="descargandoPdf[a.id]" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-eye"></i>
                </button>
              </div>
              <span v-else class="text-muted">-</span>
            </td>
          </template>
          <template #tarjeta-extra="{ arbitro: a }">
            <div v-if="examenes[a.id]" class="d-flex justify-content-between align-items-center text-dark mb-2 border-bottom border-secondary-subtle pb-2">
              <span class="small">
                <strong>Teórico:</strong>
                <span class="fw-bold ms-1" :class="examenes[a.id].aprobado ? 'text-success' : 'text-danger'">{{ examenes[a.id].calificacion.toFixed(2) }} %</span>
              </span>
              <button
                type="button"
                @click="descargarPdfTeorico(a)"
                :disabled="!!descargandoPdf[a.id]"
                class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark"
                aria-label="Descargar teórico"
              >
                <span v-if="descargandoPdf[a.id]" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-eye"></i>
              </button>
            </div>
          </template>
        </TablaAsistenciaReunion>
      </div>
    </div>

    <!-- MODAL NUEVA REUNIÓN (mismo formulario que "Nuevo Evento" de Gestión de Eventos) -->
    <ModalBase
      :show="mostrarModalNueva"
      :hay-cambios="hayCambiosReunion"
      @close="mostrarModalNueva = false"
      :icono="modoEdicionReunion ? 'edit' : 'notification_add'"
      :colorIcono="modoEdicionReunion ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'"
      maxWidth="900px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicionReunion ? 'Modificar Reunión' : 'Nueva Reunión' }}</span>
      </template>

      <p class="text-muted small mb-3">Completá los datos para enviar el aviso a los árbitros de tu grupo.</p>

      <div class="text-start mb-4">
        <label class="small fw-bold text-dark mb-2 d-block">
          <i class="bi bi-calendar3 me-1 text-danger"></i>Agenda de reuniones de todos los grupos
          <span class="fw-normal text-muted">· tocá un día para elegir la fecha</span>
        </label>
        <CalendarioEventos
          v-if="mostrarModalNueva"
          v-model:fecha-seleccionada="formReunion.fecha_evento"
          :fecha-minima="modoEdicionReunion ? manianaStr() : hoyStr()"
          :grupos-destacados="misGrupos.map(g => Number(g.id))"
          incluir-clases-curso
          @cargado="evs => eventosAgenda = evs"
        />
      </div>

      <form id="formNuevaReunion" @submit.prevent="confirmarGuardadoReunion" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Tema de la Reunión *</label>
            <input aria-label="Tema de la Reunión" v-model="formReunion.titulo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Reunión mensual..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Lugar *</label>
            <textarea aria-label="Lugar" v-model="formReunion.descripcion" class="form-control shadow-none border-secondary-subtle" rows="2" placeholder="Ej: Casa del Handball..." required></textarea>
          </div>

          <div class="col-6 col-md-4">
            <label class="small fw-bold text-dark mb-1">Fecha de la Reunión *</label>
            <input aria-label="Fecha de la Reunión" v-model="formReunion.fecha_evento" type="date" :min="modoEdicionReunion ? manianaStr() : hoyStr()" class="form-control shadow-none border-secondary-subtle" required>
            <small v-if="eventosMismoDia.length" class="d-block text-danger fw-semibold mt-1">
              <i class="bi bi-exclamation-circle-fill me-1"></i>Ese día ya hay {{ eventosMismoDia.length === 1 ? 'otro evento' : `${eventosMismoDia.length} eventos` }}: {{ eventosMismoDia.map(e => e.titulo).join(', ') }}
            </small>
          </div>

          <div class="col-6 col-md-3">
            <label for="reunion-hora" class="small fw-bold text-dark mb-1">Hora</label>
            <input id="reunion-hora" v-model="formReunion.hora_evento" type="time" class="form-control shadow-none border-secondary-subtle"
                   aria-describedby="reunion-hora-ayuda">
          </div>

          <div class="col-12 col-md-5">
            <label class="small fw-bold text-dark mb-1">Categoría</label>
            <div class="form-control bg-light border-secondary-subtle fw-bold text-dark">Reunión</div>
          </div>

          <div class="col-12 mt-1">
            <p id="reunion-hora-ayuda" class="small text-muted m-0">
              <i class="bi bi-clock me-1"></i>
              <template v-if="modoEdicionReunion && !formReunion.hora_evento">Si dejás la hora vacía, se mantiene la que ya tenía la reunión.</template>
              <template v-else>Las reuniones se cargan a las {{ HORA_REUNION }} hs; podés cambiar la hora.</template>
            </p>
          </div>

          <div class="col-12">
            <hr class="my-2 border-secondary-subtle opacity-25">
          </div>

          <div class="col-12">
            <label class="small fw-bold text-danger mb-2">Grupo destinatario *</label>
            <div class="bg-light border border-danger-subtle rounded p-3">
              <div v-if="cargandoMisGrupos" class="text-center py-2">
                <span class="spinner-border spinner-border-sm text-danger"></span>
                <span class="text-muted small ms-2">Cargando tus grupos...</span>
              </div>
              <div v-else-if="misGrupos.length" class="d-flex flex-wrap gap-3">
                <div v-for="g in misGrupos" :key="g.id" class="form-check m-0">
                  <input
                    :id="`reunion-grupo-${g.id}`"
                    class="form-check-input shadow-none border-secondary-subtle"
                    type="checkbox"
                    :value="Number(g.id)"
                    v-model="gruposReunion"
                    :disabled="misGrupos.length === 1"
                  >
                  <label class="form-check-label small fw-bold mt-1" :for="`reunion-grupo-${g.id}`">
                    {{ g.nombre }} {{ g.subgrupo }}
                  </label>
                </div>
              </div>
              <p v-else class="text-muted small mb-0">No tenés grupos a cargo asignados.</p>
              <span v-if="misGrupos.length > 1" class="d-block text-muted mt-2" style="font-size: 0.75rem;">Solo podés convocar a los grupos que coordinás.</span>
            </div>
          </div>
        </div>
      </form>

      <template #footer="{ cerrar }">
        <button type="button" @click="cerrar" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formNuevaReunion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesandoReunion || !misGrupos.length">
          <span v-if="procesandoReunion" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesandoReunion ? 'GUARDANDO...' : (modoEdicionReunion ? 'GUARDAR CAMBIOS' : 'PUBLICAR REUNIÓN') }}
        </button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalExamen"
      :hay-cambios="hayCambiosExamen"
      @close="mostrarModalExamen = false"
      icono="quiz"
      colorIcono="bg-danger-subtle text-danger"
      maxWidth="640px"
    >
      <template #header>
        <span class="fw-bold fs-5">Programar examen</span>
      </template>

      <div class="d-flex flex-wrap gap-2 justify-content-center mb-3">
        <span class="estado-pill estado-verde px-3 py-2"><i class="bi bi-person-check-fill me-1"></i>{{ asistenciaGrupoExamen.presentes }} presentes</span>
        <span class="estado-pill estado-naranja px-3 py-2"><i class="bi bi-person-dash-fill me-1"></i>{{ asistenciaGrupoExamen.ausentes }} ausentes</span>
        <span v-if="asistenciaGrupoExamen.sinRegistro" class="estado-pill estado-gris px-3 py-2">{{ asistenciaGrupoExamen.sinRegistro }} sin registro</span>
      </div>
      <p class="text-muted small text-center mb-4">Solo los árbitros presentes van a poder rendir el examen desde su panel.</p>

      <div v-if="cargandoReglas" class="text-center py-4">
        <span class="spinner-border spinner-border-sm text-danger"></span>
        <span class="text-muted small ms-2">Cargando reglas...</span>
      </div>

      <form v-else id="formProgramarExamen" @submit.prevent="habilitarExamenReunion" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <SelectorReglas v-model="formExamen.reglas" :reglas="reglasDisponibles" titulo="Reglas a evaluar" requerido id="examen-reunion-reglas" :invalido="!formExamen.reglas.length" />
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Cantidad de preguntas *</label>
            <input aria-label="Cantidad de preguntas"
              v-model.number="formExamen.cantidadPreguntas"
              type="number"
              min="1"
              :max="Math.min(100, preguntasDisponiblesExamen) || 1"
              class="form-control shadow-none border-secondary-subtle"
              required
            >
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Tiempo (minutos) *</label>
            <input aria-label="Tiempo (minutos)"
              v-model.number="formExamen.tiempoLimiteMin"
              type="number"
              min="1"
              max="180"
              class="form-control shadow-none border-secondary-subtle"
              required
            >
          </div>
        </div>
      </form>

      <template #footer="{ cerrar }">
        <button type="button" @click="cerrar" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formProgramarExamen" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="habilitandoExamen || cargandoReglas || !programacionValida">
          <span v-if="habilitandoExamen" class="spinner-border spinner-border-sm me-1"></span>
          {{ habilitandoExamen ? 'HABILITANDO...' : 'HABILITAR EXAMEN' }}
        </button>
      </template>
    </ModalBase>

    <ModalHistorialReuniones :show="mostrarModalDetalle" :arbitro="arbitroSeleccionado" @close="mostrarModalDetalle = false" />
  </div>
</template>

<script setup>
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, onMounted, computed, reactive, inject, watch, provide } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import TablaAsistenciaReunion from '@/components/comunes/reuniones/TablaAsistenciaReunion.vue'
import SelectorReglas from '@/components/comunes/SelectorReglas.vue'
import { compararReglas, normalizarRegla } from '@/utils/cuestionarios'
import ModalHistorialReuniones from '@/components/comunes/reuniones/ModalHistorialReuniones.vue'
import { useAsistenciaReuniones } from '@/composables/useAsistenciaReuniones'
import ModalBase from '@/components/ModalBase.vue'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'
import CalendarioEventos from '@/components/CalendarioEventos.vue'
import { textoCreacionReunion } from '@/composables/useCreadorReunion'

useHead({
  title: 'Reuniones | Coordinador',
  meta: [{ name: 'description', content: 'Gestión de asistencia a reuniones del grupo coordinado.' }],
})

// ─── Constantes ───────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────

// True si la fecha del evento ya pasó (comparación por día, hora 00:00).
// No se puede habilitar un examen para una reunión con fecha pasada.
const esFechaPasada = (fechaEvento) => {
  if (!fechaEvento) return false
  const soloFecha = String(fechaEvento).split(' ')[0] // "YYYY-MM-DD" o "DD/MM/YYYY"
  let d
  if (soloFecha.includes('/')) {
    const [dia, mes, anio] = soloFecha.split('/')
    d = new Date(Number(anio), Number(mes) - 1, Number(dia))
  } else {
    const [anio, mes, dia] = soloFecha.split('-')
    d = new Date(Number(anio), Number(mes) - 1, Number(dia))
  }
  if (isNaN(d)) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return d < hoy
}

// Fecha (YYYY-MM-DD o DD/MM/YYYY, con o sin hora) -> "YYYY-MM-DD"
const aISO = (fecha) => {
  const soloFecha = String(fecha || '').split(' ')[0]
  if (soloFecha.includes('/')) {
    const [dia, mes, anio] = soloFecha.split('/')
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }
  return soloFecha.substring(0, 10)
}
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoyStr = () => isoLocal(new Date())
const manianaStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return isoLocal(d) }
// True si la fecha es posterior a hoy (mañana en adelante)
const esFechaFutura = (fechaEvento) => !!fechaEvento && aISO(fechaEvento) > hoyStr()

// Nombre legible de un grupo a partir de su id (usa la lista cargada de grupos).

// ─── Componentes internos ─────────────────────────────────────────

// ─── Inyectado ───────────────────────────────────────────────────
const toast = inject('toast')

// ─── Asistencia (compartida con el panel admin) ──────────────────
// El coordinador ve solo los árbitros de los grupos que coordina.
const asistencia = useAsistenciaReuniones({ toast, accionArbitros: 'grupos' })
provide('asistenciaReuniones', asistencia)
const {
  arbitrosReunion, grupos, reunionSeleccionada, soloActivos,
  asistencias, cargandoInicial, cargandoArbitros, paginaActual, mostrarFiltrosMobile,
  nombreGrupo, modoReunion, resumenReunionActual, totalFiltrados,
  obtenerGrupos, cargarArbitros, cargarAsistenciasGlobales,
  limpiarAsistencias, limpiarFiltros, cargarArbitrosReunion
} = asistencia
const notificar = inject('notificar')

// ─── Estado ──────────────────────────────────────────────────────
const arrReuniones        = ref([])
const examenes            = ref({})
const descargandoPdf      = reactive({})
const habilitandoExamen   = ref(false)
const deshabilitandoExamen = ref(false)
const examenHabilitado    = ref(false)
const mostrarModalExamen  = ref(false)
const cargandoReglas      = ref(false)
const reglasDisponibles   = ref([])
const formExamen          = reactive({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [] })
const { hayCambios: hayCambiosExamen } = useCambiosSinGuardar(
  () => ({ ...formExamen, reglas: [...formExamen.reglas].sort(compararReglas) }),
  () => mostrarModalExamen.value && !cargandoReglas.value
)

const mostrarModalDetalle  = ref(false)
const arbitroSeleccionado  = ref({ id: null, apellido: '', nombre: '' })

// ─── Computeds: modo ─────────────────────────────────────────────
// El select trabaja con una clave "idEvento|idGrupo" (o "idEvento|all" para
// reuniones de todos los grupos), de modo que cada grupo de una reunión es una
// opción separada. Igual acá derivamos el idEvento y el idGrupo elegidos.

// Opciones del select: una por evento + grupo. Para un coordinador, el backend
// adjunta idsGruposCoordinados/nombresGruposCoordinados (solo los grupos que
// coordina, ya intersectados con los de la reunión); en ese caso desglosamos
// únicamente esos. Para otros roles se desglosa por los grupos de la reunión
// (o todos los del sistema, si la reunión es "todos los grupos").
const opcionesReunion = computed(() => {
  const ops = []
  for (const r of arrReuniones.value) {
    const estado = r.categoria === 'reunion' && r.aprobacion === 'pendiente'
      ? ' · PENDIENTE'
      : (r.categoria === 'reunion' && r.aprobacion === 'rechazada' ? ' · RECHAZADA' : '')
    const base = `${r.fecha_formateada}  —  ${r.titulo}${estado}`

    let ids = []
    let nombres = []
    if (Array.isArray(r.idsGruposCoordinados)) {
      ids = r.idsGruposCoordinados
      nombres = r.nombresGruposCoordinados || []
    } else if (r.todosLosGrupos) {
      ids = grupos.value.map(g => g.id)
      nombres = grupos.value.map(g => (g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre))
    } else {
      ids = r.idsGrupos || []
      nombres = r.nombresGrupos || []
    }

    ids.forEach((idGrupo, i) => {
      ops.push({
        key: `${r.id}|${idGrupo}`,
        idEvento: r.id,
        idsGrupos: [idGrupo],
        label: `${base} (${nombres[i] ?? nombreGrupo(idGrupo)})`,
      })
    })
  }
  return ops
})

const opcionSeleccionada = computed(() =>
  opcionesReunion.value.find(o => o.key === reunionSeleccionada.value) ?? null
)

// idEvento derivado de la opción elegida (para cargar árbitros del evento).
const idEventoSeleccionado = computed(() => opcionSeleccionada.value?.idEvento ?? null)

const reunionActual = computed(() =>
  arrReuniones.value.find(r => String(r.id) === String(idEventoSeleccionado.value)) ?? null
)

// Ids de grupos que se habilitarían para el examen de la opción elegida:
// solo el grupo de la opción (o todos, si la reunión es "todos los grupos").
const idsGruposExamenReunion = computed(() => opcionSeleccionada.value?.idsGrupos ?? [])

// La reunión seleccionada tiene fecha pasada => no se puede habilitar examen.
const reunionEsPasada = computed(() =>
  reunionActual.value ? esFechaPasada(reunionActual.value.fecha_evento) : false
)

// El coordinador puede modificar una reunión si es futura, es de categoría "reunion"
// y está dirigida solo a grupos que él coordina (no "todos los grupos" ni grupos ajenos).
const reunionAprobada = computed(() => {
  const r = reunionActual.value
  return !r || r.categoria !== 'reunion' || !r.aprobacion || r.aprobacion === 'aprobada'
})

const motivoNoEliminable = computed(() => {
  const r = reunionActual.value
  if (!r) return 'Elegí una reunión'
  if (r.categoria !== 'reunion') return 'Solo se pueden gestionar reuniones'
  if (r.todosLosGrupos) return 'Es una reunión para todos los grupos: solo la puede gestionar la administración'
  const propios = misGrupos.value.map(g => Number(g.id))
  const idsReunion = (r.idsGrupos || []).map(Number)
  if (!idsReunion.length) return 'La reunión no tiene grupos asignados'
  const ajenos = idsReunion.filter(id => !propios.includes(id))
  if (ajenos.length) {
    return `La reunión incluye grupos que no coordinás (${ajenos.map(nombreGrupo).join(', ')}): solo la puede gestionar la administración`
  }
  return ''
})

const motivoNoGestionable = computed(() => {
  if (motivoNoEliminable.value) return motivoNoEliminable.value
  const r = reunionActual.value
  if (r.aprobacion !== 'rechazada' && !esFechaFutura(r.fecha_evento)) return 'Solo se pueden modificar reuniones futuras'
  return ''
})

const puedeModificarReunion = computed(() => !motivoNoGestionable.value)
const puedeEliminarReunion = computed(() => !motivoNoEliminable.value)

const eliminandoReunion = ref(false)

const confirmarEliminarReunion = () => {
  const r = reunionActual.value
  if (!r) return
  notificar({
    titulo: '¿Eliminar reunión?',
    mensaje: `${r.fecha_formateada} · ${r.titulo}. Los árbitros del grupo dejarán de verla. Esta acción no se puede deshacer.`,
    tipo: 'danger',
    alConfirmar: eliminarReunion
  })
}

const eliminarReunion = async () => {
  const r = reunionActual.value
  if (!r) return
  eliminandoReunion.value = true
  try {
    const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id: r.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo eliminar la reunión')
    reunionSeleccionada.value = ''
    await obtenerReuniones()
    await onReunionSeleccionada()
    toast({ titulo: 'Eliminada', mensaje: 'La reunión fue eliminada.', tipo: 'success' })
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo eliminar la reunión', tipo: 'danger' })
  } finally {
    eliminandoReunion.value = false
  }
}

const asistenciaGrupoExamen = computed(() => {
  const ids = idsGruposExamenReunion.value.map(Number)
  const r = { presentes: 0, ausentes: 0, sinRegistro: 0 }
  for (const a of arbitrosReunion.value) {
    if (ids.length && !ids.includes(Number(a.id_grupo))) continue
    const v = asistencias[a.id]
    if      (v === 'presente') r.presentes++
    else if (v === 'ausente')  r.ausentes++
    else                       r.sinRegistro++
  }
  return r
})

const tituloBotonHabilitar = computed(() => {
  if (!idsGruposExamenReunion.value.length) return 'Esta reunión no tiene grupos asociados'
  if (examenHabilitado.value) return 'El examen ya está habilitado'
  if (!asistenciaGrupoExamen.value.presentes) return 'Marcá presentes y ausentes antes de habilitar el examen'
  return 'Programar y habilitar el examen para los presentes'
})

const preguntasDisponiblesExamen = computed(() =>
  reglasDisponibles.value
    .filter(r => formExamen.reglas.includes(r.codigo))
    .reduce((total, r) => total + r.cantidad, 0)
)

const programacionValida = computed(() =>
  formExamen.reglas.length > 0 &&
  formExamen.cantidadPreguntas >= 1 &&
  formExamen.cantidadPreguntas <= Math.min(100, preguntasDisponiblesExamen.value) &&
  formExamen.tiempoLimiteMin >= 1 &&
  formExamen.tiempoLimiteMin <= 180
)


const cargarProgramacionExamen = async () => {
  examenHabilitado.value = false
  if (!idEventoSeleccionado.value || !idsGruposExamenReunion.value.length) return
  try {
    const res = await api.get({
      entity: 'examenes_habilitaciones',
      action: 'obtenerProgramacion',
      payload: { idEvento: Number(idEventoSeleccionado.value), idsGrupos: idsGruposExamenReunion.value }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo obtener la programación del examen')
    const p = res.payload
    if (!p) return
    examenHabilitado.value = !!p.habilitado
    formExamen.cantidadPreguntas = p.cantidadPreguntas
    formExamen.tiempoLimiteMin = p.tiempoLimiteMin
    formExamen.reglas = (p.reglas || []).map(normalizarRegla)
  } catch (e) { console.error('cargarProgramacionExamen:', e) }
}

async function abrirModalExamen() {
  if (!asistenciaGrupoExamen.value.presentes) {
    toast({ tipo: 'danger', mensaje: 'Marcá presentes y ausentes antes de habilitar el examen' })
    return
  }
  mostrarModalExamen.value = true
  if (reglasDisponibles.value.length) return
  cargandoReglas.value = true
  try {
    const res = await api.get({ entity: 'examenes_habilitaciones', action: 'obtenerReglasExamen' })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las reglas')
    reglasDisponibles.value = (res?.payload?.reglas || []).map(r => ({ codigo: normalizarRegla(r.codigo), cantidad: Number(r.cantidad) }))
    const codigos = reglasDisponibles.value.map(r => r.codigo)
    formExamen.reglas = formExamen.reglas.filter(c => codigos.includes(c))
  } catch (e) {
    console.error('obtenerReglasExamen:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudieron cargar las reglas' })
  } finally {
    cargandoReglas.value = false
  }
}

async function habilitarExamenReunion() {
  const r = reunionActual.value
  if (!r || !idsGruposExamenReunion.value.length || !programacionValida.value) return
  if (reunionEsPasada.value) {
    toast({ tipo: 'danger', mensaje: 'No se puede habilitar el examen: la reunión ya pasó' })
    return
  }
  habilitandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examenes_habilitaciones',
      action: 'guardarHabilitacion',
      payload: {
        idEvento: r.id,
        idsGrupos: idsGruposExamenReunion.value,
        arrArbitros: [],
        sumar: true,
        programacion: {
          cantidadPreguntas: formExamen.cantidadPreguntas,
          tiempoLimiteMin: formExamen.tiempoLimiteMin,
          reglas: formExamen.reglas
        }
      }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo habilitar el examen')
    toast({ tipo: 'success', mensaje: 'Examen habilitado para los árbitros presentes' })
    examenHabilitado.value = true
    mostrarModalExamen.value = false
  } catch (e) {
    console.error('habilitarExamenReunion:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudo habilitar el examen' })
  } finally {
    habilitandoExamen.value = false
  }
}

async function deshabilitarExamenReunion() {
  const r = reunionActual.value
  if (!r || !idsGruposExamenReunion.value.length) return
  deshabilitandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examenes_habilitaciones',
      action: 'deshabilitarHabilitacion',
      payload: {
        idEvento: r.id,
        idsGrupos: idsGruposExamenReunion.value
      }
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo deshabilitar el examen')
    toast({ tipo: 'success', mensaje: 'Examen deshabilitado para la reunión' })
    examenHabilitado.value = false
  } catch (e) {
    console.error('deshabilitarExamenReunion:', e)
    toast({ tipo: 'danger', mensaje: e?.message || 'No se pudo deshabilitar el examen' })
  } finally {
    deshabilitandoExamen.value = false
  }
}

// ─── Computeds: modal historial ───────────────────────────────────

// ─── Computeds: filtrado y paginación ────────────────────────────


// ─── Cargas ──────────────────────────────────────────────────────
const obtenerReuniones = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload) {
      const vistos = new Set()
      arrReuniones.value = (res.payload || []).filter(r => {
        if (r.categoria !== 'reunion' || vistos.has(String(r.id))) return false
        vistos.add(String(r.id))
        return true
      })
    }
  } catch (e) { console.error('obtenerReuniones:', e) }
}

// ← ÚNICO CAMBIO vs. admin: obtenerArbitrosFiltradosPorGrupo

// Un solo request con los totales de presentes/ausentes por árbitro
// (antes se pedía obtenerArbitrosReunion una vez por cada reunión).

// ─── Cambio de reunión ────────────────────────────────────────────
const limpiarEstadoReunion = () => {
  limpiarAsistencias()
  Object.keys(descargandoPdf).forEach(k => delete descargandoPdf[k])
  examenes.value = {}
  examenHabilitado.value = false
  mostrarModalExamen.value = false
}

const onReunionSeleccionada = async () => {
  limpiarEstadoReunion()
  paginaActual.value = 1
  limpiarFiltros()
  mostrarFiltrosMobile.value = false
  if (!reunionSeleccionada.value) {
    cargandoInicial.value = true
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
    return
  }
  cargandoArbitros.value = true
  try {
    await cargarArbitrosReunion(idEventoSeleccionado.value)
    await Promise.all([cargarExamenes(), cargarProgramacionExamen()])
  } catch (e) {
    console.error('onReunionSeleccionada:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la reunión.', tipo: 'danger' })
  } finally {
    cargandoArbitros.value = false
  }
}

const cargarExamenes = async () => {
  const resExamenes = await api.get({
    entity: 'examen_online',
    action: 'obtenerExamenesReunion',
    payload: { idEvento: Number(idEventoSeleccionado.value) }
  })
  const mapa = {}
  if (resExamenes.ok && Array.isArray(resExamenes.payload)) {
    resExamenes.payload.forEach(e => { mapa[e.id_arbitro] = e })
  }
  examenes.value = mapa
}

const descargarPdfTeorico = async (a) => {
  descargandoPdf[a.id] = true
  try {
    await api.getFile({
      entity: 'examen_online',
      action: 'descargarPdfExamen',
      payload: { idEvento: Number(idEventoSeleccionado.value), idArbitro: a.id }
    }, `teorico_${a.apellido}_${a.nombre}.pdf`)
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo descargar el PDF', tipo: 'danger' })
  } finally {
    delete descargandoPdf[a.id]
  }
}

// Solo se toma asistencia en reuniones aprobadas
const guardarAsistencia = (a) => {
  if (!asistencias[a.id]) return
  if (!reunionAprobada.value) {
    delete asistencias[a.id]
    toast({ titulo: 'Reunión no aprobada', mensaje: 'La reunión todavía no fue aprobada: no se puede tomar asistencia.', tipo: 'danger' })
    return
  }
  asistencia.guardarAsistencia(a, idEventoSeleccionado.value)
}

// ─── Acciones ────────────────────────────────────────────────────
const verDetalleArbitro = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  mostrarModalDetalle.value = true
}

const recargar = async () => {
  if (modoReunion.value) {
    await onReunionSeleccionada()
  } else {
    cargandoInicial.value = true
    await Promise.all([obtenerReuniones(), cargarArbitros()])
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
  }
}

// ─── Nueva reunión (reutiliza eventos/guardarEvento de Gestión de Eventos) ─
const mostrarModalNueva  = ref(false)
const modoEdicionReunion = ref(false)
const idReunionEditada   = ref(null)
const procesandoReunion  = ref(false)
const cargandoMisGrupos  = ref(false)
const misGrupos          = ref([]) // grupos que coordina el usuario
const gruposReunion      = ref([]) // ids de grupos destinatarios elegidos

// Hora por defecto de las reuniones (la misma que en Gestión de Eventos; se puede cambiar)
const HORA_REUNION = '19:30'

// Hora de una reunión ya cargada. reuniones/obtenerReuniones todavía no la devuelve:
// en ese caso queda vacía y, al guardar, no se manda (el backend conserva la que tenía).
const horaDeReunion = (r) => {
  const hora = r.hora_evento || r.hora
  return hora ? String(hora).slice(0, 5) : ''
}

const formReunionBase = () => ({ titulo: '', descripcion: '', fecha_evento: '', hora_evento: HORA_REUNION })
const formReunion = reactive(formReunionBase())
const { hayCambios: hayCambiosReunion, tomarFoto: tomarFotoReunion } = useCambiosSinGuardar(
  () => ({ ...formReunion, grupos: [...gruposReunion.value].sort((a, b) => a - b) }),
  () => mostrarModalNueva.value && !cargandoMisGrupos.value
)

const eventosAgenda = ref([])
const eventosMismoDia = computed(() => eventosAgenda.value.filter(e =>
  e.fecha_evento === formReunion.fecha_evento &&
  e.categoria !== 'recordatorio' &&
  // las clases del curso (solo lectura) siempre cuentan; de los eventos se excluye la reunión que se edita
  (e.soloLectura || Number(e.id) !== Number(idReunionEditada.value))
))

const cargarMisGrupos = async () => {
  cargandoMisGrupos.value = true
  try {
    const res = await api.get({ entity: 'coordinadores', action: 'obtenerGruposCoordinados' })
    if ((res.ok || res.success) && Array.isArray(res.payload)) misGrupos.value = res.payload
  } catch (e) {
    console.error('cargarMisGrupos:', e)
  } finally {
    cargandoMisGrupos.value = false
  }
}

const abrirModalEditarReunion = () => {
  const r = reunionActual.value
  if (!r) return
  modoEdicionReunion.value = true
  idReunionEditada.value = r.id
  Object.assign(formReunion, {
    titulo: r.titulo || '',
    descripcion: r.descripcion || '',
    fecha_evento: aISO(r.fecha_evento),
    hora_evento: horaDeReunion(r),
  })
  gruposReunion.value = (r.idsGrupos || []).map(Number)
  mostrarModalNueva.value = true
}

const abrirModalNuevaReunion = async () => {
  modoEdicionReunion.value = false
  idReunionEditada.value = null
  Object.assign(formReunion, formReunionBase())
  mostrarModalNueva.value = true
  if (!misGrupos.value.length) await cargarMisGrupos()
  // Por defecto, todos los grupos a cargo quedan marcados
  gruposReunion.value = misGrupos.value.map(g => Number(g.id))
  tomarFotoReunion()
}

const confirmarGuardadoReunion = () => {
  if (!gruposReunion.value.length) {
    toast({ titulo: 'Faltan grupos', mensaje: 'Seleccioná al menos un grupo destinatario.', tipo: 'danger' })
    return
  }
  if (modoEdicionReunion.value && formReunion.fecha_evento <= hoyStr()) {
    toast({ titulo: 'Fecha inválida', mensaje: 'La reunión modificada tiene que seguir siendo futura.', tipo: 'danger' })
    return
  }
  notificar({
    titulo: modoEdicionReunion.value ? '¿Guardar cambios?' : '¿Publicar?',
    mensaje: modoEdicionReunion.value
      ? 'Se modificarán los datos de la reunión y quedará pendiente de aprobación hasta que la revise la administración.'
      : 'La reunión quedará pendiente de aprobación. Cuando la administración la apruebe, los árbitros del grupo la van a ver.',
    tipo: 'success',
    alConfirmar: guardarReunion
  })
}

const guardarReunion = async () => {
  procesandoReunion.value = true
  try {
    const esEdicion = modoEdicionReunion.value
    const res = await api.post({
      entity: 'eventos',
      action: esEdicion ? 'editarEvento' : 'guardarEvento',
      payload: {
        id: esEdicion ? idReunionEditada.value : null,
        titulo: formReunion.titulo,
        descripcion: formReunion.descripcion,
        fecha_evento: formReunion.fecha_evento,
        // Solo si hay hora: al modificar sin tocarla, se mantiene la que ya tenía
        ...(formReunion.hora_evento ? { hora_evento: formReunion.hora_evento } : {}),
        categoria: 'reunion',
        todosLosGrupos: false,
        nombresGrupos: [],
        idsGrupos: gruposReunion.value,
      }
    })
    if (res.ok) {
      mostrarModalNueva.value = false
      await obtenerReuniones()
      // Si al modificar cambió el grupo, la opción elegida puede haber desaparecido del select
      if (reunionSeleccionada.value && !opcionSeleccionada.value) {
        reunionSeleccionada.value = ''
        await onReunionSeleccionada()
      }
      const pendiente = res.payload?.aprobacion === 'pendiente'
      toast({
        titulo: 'Éxito',
        mensaje: pendiente
          ? (esEdicion ? 'Los cambios quedaron pendientes de aprobación.' : 'La reunión quedó pendiente de aprobación.')
          : (esEdicion ? 'La reunión se modificó correctamente.' : 'La reunión se publicó correctamente.'),
        tipo: 'success'
      })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesandoReunion.value = false
  }
}

// ─── Misc ────────────────────────────────────────────────────────

watch(soloActivos, async () => {
  if (modoReunion.value) {
    cargandoArbitros.value = true
    await onReunionSeleccionada()
    cargandoArbitros.value = false
  } else {
    cargandoInicial.value = true
    await cargarArbitros()
    await cargarAsistenciasGlobales()
    cargandoInicial.value = false
  }
})

onMounted(async () => {
  await Promise.all([obtenerReuniones(), cargarArbitros(), obtenerGrupos(), cargarMisGrupos()])
  await cargarAsistenciasGlobales()
  cargandoInicial.value = false
})
</script>

<style scoped>

.select-reunion { width: 100%; min-width: 0; font-size: 1rem; }
@media (min-width: 768px) {
  .select-reunion { flex: 0 1 300px; max-width: 300px; font-size: 0.85rem; }
}
@media (min-width: 1400px) {
  .select-reunion { flex-basis: 380px; max-width: 380px; }
}
.texto-creacion { font-size: 0.75rem; }
.control-encabezado { height: 40px; }

</style>
