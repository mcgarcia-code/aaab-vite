<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-clipboard-data-fill me-1"></i> Observaciones del Curso
            </h4>
            <span class="text-muted small d-block mt-1">{{ observacionesFiltradas.length }} observaciones de partidos en {{ anio }}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargarObservaciones" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirNueva" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nueva observación</span>
            </button>
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2">
            <div class="col-12 col-md-4"><input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ASPIRANTE, ENCUENTRO U OBSERVADOR..."></div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.modalidad" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CURSO</option>
                <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark" aria-label="Estado">
                <option value="">ESTADO</option>
                <option v-for="(e, clave) in ESTADOS_REVISION_OBSERVACION" :key="clave" :value="clave">{{ e.etiqueta.toUpperCase() }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando observaciones...</p></div>
          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.78rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-center text-uppercase text-muted">Acciones</th>
                    <th class="py-3 text-uppercase text-muted">Fecha</th>
                    <th class="py-3 text-uppercase text-muted">Aspirante</th>
                    <th class="py-3 text-center text-uppercase text-muted">Curso</th>
                    <th class="py-3 text-uppercase text-muted">Encuentro</th>
                    <th class="py-3 text-uppercase text-muted">Categoría</th>
                    <th class="py-3 text-uppercase text-muted">Observador</th>
                    <th class="py-3 text-center text-uppercase text-muted">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in observacionesFiltradas" :key="o.id">
                    <td class="ps-3 text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirVer(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-success" title="Ver y revisar" aria-label="Ver y revisar">
                          <span class="material-icons" style="font-size:16px;">visibility</span>
                        </button>
                        <button @click="abrirEditar(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar" aria-label="Editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="confirmarEliminar(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Borrar" aria-label="Borrar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                    </td>
                    <td class="fw-bold text-dark">{{ fechaDMA(o.fecha_partido) }}</td>
                    <td class="fw-bold text-dark text-uppercase">{{ o.apellido }}, {{ o.nombre }}</td>
                    <td class="text-center"><span class="badge" :class="MODALIDADES_CURSO[o.modalidad_curso]?.clase">{{ MODALIDADES_CURSO[o.modalidad_curso]?.corta }}</span></td>
                    <td class="text-dark">{{ o.encuentro }}</td>
                    <td class="text-dark">{{ o.categoria || '-' }}</td>
                    <td class="text-dark">{{ o.observador || '-' }}</td>
                    <td class="text-center"><span :class="estadoDe(o).clase">{{ estadoDe(o).etiqueta }}</span></td>
                  </tr>
                  <tr v-if="!observacionesFiltradas.length">
                    <td colspan="8" class="text-center py-5 text-muted border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No hay observaciones para mostrar.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="o in observacionesFiltradas" :key="'m-' + o.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <span class="fw-bold text-uppercase">{{ o.apellido }}, {{ o.nombre }}</span>
                    <span class="flex-shrink-0" :class="estadoDe(o).clase">{{ estadoDe(o).etiqueta }}</span>
                  </div>
                  <div>{{ fechaDMA(o.fecha_partido) }} · {{ o.encuentro }}</div>
                  <div v-if="o.observador" class="text-muted">Observador/a: {{ o.observador }}</div>
                  <div v-if="o.categoria" class="text-muted">{{ o.categoria }}</div>
                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirVer(o)" class="btn btn-sm btn-outline-success flex-fill fw-bold"><i class="bi bi-eye me-1"></i> Ver y revisar</button>
                    <button @click="abrirEditar(o)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Editar</button>
                    <button @click="confirmarEliminar(o)" class="btn btn-sm btn-outline-danger fw-bold" aria-label="Borrar"><i class="bi bi-trash3"></i></button>
                  </div>
                </div>
              </div>
              <div v-if="!observacionesFiltradas.length" class="text-center p-4 bg-white rounded-3 shadow-sm border text-muted fw-bold">
                No hay observaciones para mostrar.
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ModalObservacionCurso v-model:show="mostrarModal" :observacion="seleccionada" @guardado="alGuardar" />

    <ModalBase :show="!!verObservacion" @close="verObservacion = null" icono="visibility" colorIcono="bg-success-subtle text-success" maxWidth="720px">
      <template #header>
        <div v-if="verObservacion" class="text-center w-100">
          <span class="fw-bold fs-5 text-uppercase">{{ verObservacion.apellido }}, {{ verObservacion.nombre }}</span>
          <div class="text-muted small mt-1">{{ MODALIDADES_CURSO[verObservacion.modalidad_curso]?.etiqueta }}</div>
        </div>
      </template>
      <div v-if="verObservacion" class="text-start">
        <div class="row g-2 mb-3 small">
          <div class="col-6 col-md-3">
            <div class="dato-etiqueta">Fecha</div>
            <div class="fw-bold text-dark">{{ fechaDMA(verObservacion.fecha_partido) }}</div>
          </div>
          <div class="col-6 col-md-5">
            <div class="dato-etiqueta">Encuentro</div>
            <div class="fw-bold text-dark text-break">{{ verObservacion.encuentro }}</div>
          </div>
          <div class="col-6 col-md-4">
            <div class="dato-etiqueta">Categoría</div>
            <div class="fw-bold text-dark text-break">{{ verObservacion.categoria || '-' }}</div>
          </div>
          <div class="col-6 col-md-12">
            <div class="dato-etiqueta">Observador/a</div>
            <div class="fw-bold text-dark text-break">{{ verObservacion.observador || '-' }}</div>
          </div>
        </div>
        <div class="alert small py-2 mb-3 d-flex flex-wrap align-items-center gap-2" :class="estadoDe(verObservacion).alerta">
          <span :class="estadoDe(verObservacion).clase">{{ estadoDe(verObservacion).etiqueta }}</span>
          <span v-if="verObservacion.revisado_por">por {{ verObservacion.revisado_por }} · {{ fechaHoraDMA(verObservacion.fecha_revision) }}</span>
          <span v-else-if="(verObservacion.estado_revision || 'pendiente') === 'pendiente'">El aspirante todavía no la ve.</span>
          <div v-if="verObservacion.motivo_revision" class="w-100"><strong>Motivo:</strong> {{ verObservacion.motivo_revision }}</div>
        </div>
        <div class="d-flex flex-column gap-2">
          <template v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave">
            <div v-if="verObservacion[c.columna]" class="bloque-comentario">
              <div class="detalle-titulo" :class="c.clave === 'aspectosAMejorar' ? 'text-danger' : 'text-dark'"><i :class="['bi', c.icono, 'me-1']"></i>{{ c.etiqueta }}</div>
              <div class="detalle-texto">{{ verObservacion[c.columna] }}</div>
            </div>
          </template>
          <div v-if="!CAMPOS_OBSERVACION_CURSO.some(c => verObservacion[c.columna])" class="small text-muted fst-italic">Sin comentarios.</div>
        </div>

        <!-- REVISIÓN -->
        <div class="revision mt-3 p-3">
          <div class="dato-etiqueta mb-2">Revisión</div>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-success fw-bold flex-fill" :disabled="revisando || verObservacion.estado_revision === 'aprobada'" @click="revisar('aprobada')">
              <i class="bi bi-check-lg me-1"></i> Aprobar
            </button>
            <button type="button" class="btn btn-outline-danger fw-bold flex-fill" :disabled="revisando || verObservacion.estado_revision === 'rechazada'" @click="mostrarMotivoRechazo = !mostrarMotivoRechazo">
              <i class="bi bi-x-lg me-1"></i> Rechazar
            </button>
            <button v-if="verObservacion.estado_revision !== 'pendiente'" type="button" class="btn btn-outline-secondary fw-bold flex-fill" :disabled="revisando" @click="revisar('pendiente')">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Volver a pendiente
            </button>
          </div>
          <div v-if="mostrarMotivoRechazo" class="mt-2">
            <label for="motivo-rechazo" class="form-label small fw-bold text-dark">Motivo del rechazo *</label>
            <textarea id="motivo-rechazo" v-model.trim="motivoRechazo" rows="2" maxlength="500" class="form-control" placeholder="El observador lo va a ver en su panel"></textarea>
            <button type="button" class="btn btn-danger btn-sm fw-bold mt-2" :disabled="revisando || motivoRechazo.length < 3" @click="revisar('rechazada')">
              <span v-if="revisando" class="spinner-border spinner-border-sm me-1"></span> Confirmar rechazo
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" @click="editarDesdeVer" class="btn btn-outline-primary rounded-pill px-4 fw-bold w-100 mb-2 mb-sm-0">EDITAR</button>
        <button type="button" @click="verObservacion = null" class="btn btn-dark rounded-pill px-4 fw-bold w-100">CERRAR</button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import ModalObservacionCurso from '@/components/ModalObservacionCurso.vue'
import { CAMPOS_OBSERVACION_CURSO, ESTADOS_REVISION_OBSERVACION } from '@/composables/useObservacionesCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA, fechaHoraDMA } from '@/utils/fechas'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'

useHead({ title: 'Observaciones del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const observaciones = ref([])
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '', estado: '' })

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const observacionesFiltradas = computed(() => {
  const texto = normalizar(filtros.texto)
  return observaciones.value.filter(o =>
    (!filtros.modalidad || o.modalidad_curso === filtros.modalidad) &&
    (!filtros.estado || (o.estado_revision || 'pendiente') === filtros.estado) &&
    (!texto || normalizar(`${o.apellido} ${o.nombre} ${o.encuentro} ${o.observador}`).includes(texto))
  )
})

const limpiarFiltros = () => Object.assign(filtros, { texto: '', modalidad: '', estado: '' })
const estadoDe = (o) => ESTADOS_REVISION_OBSERVACION[o?.estado_revision] || ESTADOS_REVISION_OBSERVACION.pendiente

const cargarObservaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerObservacionesCursoAdmin', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las observaciones')
    observaciones.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargarObservaciones)

// ─── Alta / edición ──────────────────────────────────────────────
const mostrarModal = ref(false)
const verObservacion = ref(null)
const revisando = ref(false)
const mostrarMotivoRechazo = ref(false)
const motivoRechazo = ref('')

const abrirVer = (o) => {
  verObservacion.value = o
  mostrarMotivoRechazo.value = false
  motivoRechazo.value = ''
}

const revisar = async (estado) => {
  const o = verObservacion.value
  revisando.value = true
  try {
    const res = await api.post({
      entity: 'observaciones_curso_arbitro',
      action: 'revisarObservacionCurso',
      payload: { id: o.id, estado, motivo: estado === 'rechazada' ? motivoRechazo.value : '' },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la revisión')
    const mensajes = {
      aprobada: 'La observación quedó aprobada y el aspirante ya la ve.',
      rechazada: 'La observación quedó rechazada.',
      pendiente: 'La observación volvió a pendiente.',
    }
    toast({ titulo: 'Revisión guardada', mensaje: mensajes[estado], tipo: 'success' })
    verObservacion.value = null
    await cargarObservaciones()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    revisando.value = false
  }
}

const editarDesdeVer = () => {
  const o = verObservacion.value
  verObservacion.value = null
  abrirEditar(o)
}
const seleccionada = ref(null)

const abrirNueva = () => {
  seleccionada.value = null
  mostrarModal.value = true
}

const abrirEditar = (o) => {
  seleccionada.value = o
  mostrarModal.value = true
}

const alGuardar = async (f) => {
  const anioObs = Number(String(f.fechaPartido).substring(0, 4))
  if (anioObs !== anio.value) anio.value = anioObs
  else await cargarObservaciones()
}

const confirmarEliminar = (o) => {
  notificar({
    titulo: '¿Borrar observación?',
    mensaje: `${o.apellido}, ${o.nombre} · ${o.encuentro} (${fechaDMA(o.fecha_partido)}).`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'eliminarObservacionCurso', payload: { id: o.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la observación')
        toast({ titulo: 'Borrada', mensaje: 'La observación se borró.', tipo: 'success' })
        await cargarObservaciones()
      } catch (e) {
        notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
      }
    },
  })
}

onMounted(cargarObservaciones)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.dato-etiqueta { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.revision { border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
.bloque-comentario { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
.detalle-titulo { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
.detalle-texto { white-space: pre-wrap; font-size: 0.9rem; color: #1e293b; overflow-wrap: anywhere; }

/* Píldoras de estado: mismo estilo que Observaciones del panel-admin */
.estado-pill { border-radius: 999px; padding: 0.35em 0.85em; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.02em; border: 1px solid transparent; display: inline-block; white-space: nowrap; }
.estado-pendiente { background-color: #fdf3d3; color: #a6841f; border-color: #f2e2a5; }
.estado-aprobada { background-color: #e3f5e6; color: #2f8a45; border-color: #bfe6c8; }
.estado-rechazada { background-color: #fde7ea; color: #c0304a; border-color: #f5c2cb; }
</style>
