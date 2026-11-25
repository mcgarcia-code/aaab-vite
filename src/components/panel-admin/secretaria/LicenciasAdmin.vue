<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Licencias e inasistencias · Total: {{ licenciasFiltradas.length }} licencias</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar (Movido acá) -->
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerLicencias" />

            <!-- Botón Filtros (Solo Móvil) -->
            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />

            <BotonHerramienta tipo="nuevo" texto="Nueva licencia" icono="bi-person-plus" @click="abrirModalNuevo" />

            <BotonHerramienta tipo="excel" @click="exportarExcel" />
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Licencias</span>
            <button type="button" aria-label="Cerrar filtros" title="Cerrar filtros" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-2">
              <input aria-label="Apellido" v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="APELLIDO...">
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="Nombre" v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="NOMBRE...">
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por estado" v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobada">APROBADA</option>
                <option value="rechazada">RECHAZADA</option>
                <option value="anulada">ANULADA</option>
                <option value="borrada">BORRADA</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por año" v-model="filtros.anio" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">AÑO</option>
                <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="F. solicitud" type="text" v-model="filtros.fecha_solicitud" class="form-control form-control-sm shadow-none text-md-center" placeholder="F. SOLICITUD">
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="F. ausencia o indeterminada" type="text" v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="F. AUSENCIA O INDETERMINADA">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando licencias" />

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 texto-075">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted texto-075" style="width: 1px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted texto-075">Acciones</th>
                    <th class="py-3 text-uppercase text-muted texto-075">Árbitro</th>
                    <th class="py-3 text-center text-uppercase text-muted texto-075">Estado</th>
                    <th class="py-3 text-uppercase text-muted texto-075">Motivo</th>
                    <th class="py-3 text-center text-uppercase text-muted texto-075">F. Solicitud</th>
                    <th class="py-3 text-center pe-3 text-uppercase text-muted texto-075">F. Ausencia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lic in licenciasPaginadas" :key="lic.id">
                    <td class="ps-3 text-muted fw-bold font-monospace">{{ lic.id }}</td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="editarLicencia(lic)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Editar Licencia">
                          <i class="bi bi-pencil texto-16px"></i>
                        </button>
                        <button @click="verHistorialLicencia(lic)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver Historial">
                          <i class="bi bi-search texto-16px"></i>
                        </button>
                        <button @click="eliminarLicencia(lic.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                          <i class="bi bi-trash texto-16px"></i>
                        </button>
                      </div>
                    </td>
                    <td class="fw-bold text-uppercase text-dark">{{ lic.apellido }}, {{ lic.nombre }}</td>
                    <td class="text-center">
                      <span :class="['estado-pill', 'estado-' + lic.estado]">{{ lic.estado.toUpperCase() }}</span>
                    </td>
                    <td class="text-muted small">{{ etiquetaMotivo(lic.motivo, true) }}</td>
                    <td class="text-center text-muted fw-bold">{{ formatearFechaVista(lic.fecha_solicitud) }}</td>
                    <td class="text-center pe-3 text-danger fw-bold">{{ formatearFechaAusencia(lic) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="lic in licenciasPaginadas" :key="'mob-'+lic.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                  <div class="text-uppercase text-dark fw-bold texto-105">
                    {{ lic.apellido }}, {{ lic.nombre }}
                  </div>
                  <div class="small text-muted fw-bold font-monospace">#{{ lic.id }}</div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fw-bold text-danger fs-5">{{ formatearFechaAusencia(lic) }}</span>
                    <span class="texto-07" :class="['estado-pill', 'estado-' + lic.estado]">{{ lic.estado.toUpperCase() }}</span>
                  </div>

                  <div class="bg-light p-2 rounded border small mb-3">
                    <div class="d-flex justify-content-between mb-1">
                      <span class="text-muted">Motivo:</span>
                      <span class="fw-bold text-dark">{{ etiquetaMotivo(lic.motivo, true) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Solicitada:</span>
                      <span class="fw-bold text-dark">{{ formatearFechaVista(lic.fecha_solicitud) }}</span>
                    </div>
                  </div>

                  <!-- Botones Acciones -->
                  <div class="d-flex gap-2">
                    <button @click="editarLicencia(lic)" class="btn btn-sm btn-outline-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <i class="bi bi-pencil texto-16px"></i> EDITAR
                    </button>
                    <button type="button" aria-label="Ver historial de la licencia" title="Ver historial de la licencia" @click="verHistorialLicencia(lic)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                      <i class="bi bi-search texto-18px"></i>
                    </button>
                    <button type="button" aria-label="Eliminar licencia" title="Eliminar licencia" @click="eliminarLicencia(lic.id)" class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center">
                      <i class="bi bi-trash texto-18px"></i>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- EMPTY STATE -->
            <EstadoVacio v-if="licenciasPaginadas.length === 0" icono="bi-search" titulo="No se encontraron licencias" />

            <!-- PAGINACIÓN -->
            <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4 mb-3" />
          </template>

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODALES
         ============================================== -->

    <!-- Modal Formulario -->
    <ModalBase
      :show="mostrarModal"
      :hay-cambios="hayCambios"
      @close="cerrarModal"
      :icono="modoModal === 'editar' ? 'edit' : 'calendar_today'"
      :colorIcono="modoModal === 'editar' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? 'Editar Licencia' : 'Registrar Licencia' }}</span>
          <div v-if="modoModal === 'editar'" class="text-muted small texto-085">
            ID #{{ formModal.id }} — {{ formModal.apellido }}, {{ formModal.nombre }}
          </div>
        </div>
      </template>

      <form id="formLicencia" @submit.prevent="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start mt-2">
        <div class="row g-3">
          <div class="col-12" v-if="modoModal === 'nuevo'">
            <label class="small fw-bold text-dark mb-1">Seleccionar Árbitro *</label>
            <select aria-label="Seleccionar Árbitro" v-model="formModal.id_arbitro" class="form-select border-secondary-subtle shadow-none" required>
              <option value="" disabled>Elegir árbitro...</option>
              <option v-for="arb in arbitrosLista" :key="arb.id" :value="arb.id">
                {{ arb.apellido }}, {{ arb.nombre }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Motivo</label>
            <select aria-label="Motivo" v-model="formModal.motivo" class="form-select shadow-none border-secondary-subtle">
              <option value="particular">Particular</option>
              <option value="lesion_enfermedad">Lesión / Enfermedad</option>
              <option v-if="!formModal.tiempo_indeterminado" value="designacion_torneo_nacional">Designación Torneo Nacional</option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Estado</label>
            <select aria-label="Estado" v-model="formModal.estado" class="form-select shadow-none border-secondary-subtle">
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option v-if="modoModal === 'editar'" value="anulada">Anulada</option>
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha Solicitud *</label>
            <input aria-label="Fecha Solicitud" v-model="formModal.fecha_solicitud" type="date" class="form-control shadow-none border-secondary-subtle" required :disabled="formModal.tiempo_indeterminado && modoModal === 'nuevo'">
          </div>

          <div class="col-6 col-md-3">
            <label class="small fw-bold text-dark mb-1" for="licAdminDesde">Desde {{ formModal.tiempo_indeterminado ? '' : '*' }}</label>
            <input id="licAdminDesde" v-model="formModal.fecha_licencia" type="date" class="form-control shadow-none border-secondary-subtle" :required="!formModal.tiempo_indeterminado" :disabled="formModal.tiempo_indeterminado">
          </div>
          <div class="col-6 col-md-3">
            <label class="small fw-bold text-dark mb-1" for="licAdminHasta">Hasta {{ formModal.tiempo_indeterminado ? '' : '*' }}</label>
            <input id="licAdminHasta" v-model="formModal.fecha_hasta" type="date" :min="formModal.fecha_licencia || undefined" class="form-control shadow-none border-secondary-subtle" :required="!formModal.tiempo_indeterminado" :disabled="formModal.tiempo_indeterminado || !formModal.fecha_licencia">
          </div>
          <div v-if="diasAlta > 1" class="col-12">
            <small class="text-muted"><i class="bi bi-calendar-range me-1"></i>Licencia de {{ diasAlta }} días.</small>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input v-model="formModal.tiempo_indeterminado" @change="onToggleTiempoIndeterminado" class="form-check-input" type="checkbox" id="chkTiempoIndeterminado">
              <label class="form-check-label small fw-bold text-dark" for="chkTiempoIndeterminado">
                Por tiempo indeterminado
              </label>
            </div>
            <div v-if="formModal.tiempo_indeterminado" class="form-text small text-muted mt-1">
              <i class="bi bi-info-circle me-1"></i>
              Las licencias indeterminadas solo pueden ser por Lesión/Enfermedad o Particulares.
            </div>
          </div>
        </div>
      </form>

      <template #footer="{ cerrar }">
        <button type="button" @click="cerrar" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formLicencia" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR LICENCIA' }}
        </button>
      </template>
    </ModalBase>

    <!-- Modal Historial -->
    <ModalBase
      :show="mostrarModalHistorial"
      @close="mostrarModalHistorial = false"
      icono="manage_search"
      colorIcono="bg-warning-subtle text-warning-emphasis"
      maxWidth="700px"
    >
      <template #header>
        <div class="text-center">
          <div class="fw-bold fs-5">Historial de {{ licenciaSeleccionada?.apellido }}, {{ licenciaSeleccionada?.nombre }}</div>
          <span v-if="!cargandoHistorial" class="badge bg-dark rounded-pill fs-6" title="Total de licencias pedidas">{{ historialLicencia.length }}</span>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
      </div>

      <div v-else-if="historialLicencia.length === 0" class="text-center py-4 text-muted bg-light border rounded">
        No hay registros en el historial.
      </div>

      <div v-else>
        <!-- Tabla Historial (Escritorio) -->
        <div class="table-responsive d-none d-md-block bg-white rounded shadow-sm border border-light-subtle">
          <table class="table table-sm table-hover align-middle m-0 texto-085 tabla-layout-fijo" style="width: 100%;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 fw-bold text-uppercase text-muted texto-075" style="width: 130px;">F. Solicitud</th>
                <th class="py-2 fw-bold text-uppercase text-muted texto-075" style="width: 130px;">F. Ausencia</th>
                <th class="py-2 fw-bold text-uppercase text-muted texto-075">Motivo</th>
                <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted texto-075" style="width: 120px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historialLicencia" :key="h.id">
                <td class="text-nowrap text-muted fw-bold py-3 ps-3">{{ formatearFechaVista(h.fecha_solicitud) }}</td>
                <td class="text-nowrap text-danger fw-bold py-3">{{ formatearFechaAusencia(h) }}</td>
                <td class="text-muted py-3 text-wrap" style="word-wrap: break-word;">
                  {{ etiquetaMotivo(h.motivo, true) }}
                </td>
                <td class="text-center py-3 pe-3">
                  <span :class="['estado-pill', 'estado-' + h.estado]">{{ h.estado.toUpperCase() }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tarjetas Historial (Móvil) -->
        <div class="d-md-none d-flex flex-column gap-2">
          <div v-for="h in historialLicencia" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded-3 p-3 shadow-sm bg-light">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
              <span class="fw-bold text-danger fs-5">{{ formatearFechaAusencia(h) }}</span>
              <span :class="['estado-pill', 'estado-' + h.estado]">{{ h.estado.toUpperCase() }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small mt-2">
              <span><strong>Solicitada:</strong> {{ formatearFechaVista(h.fecha_solicitud) }}</span>
              <span>{{ etiquetaMotivo(h.motivo, true) }}</span>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { cargarExcelJS } from '@/utils/librerias'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'

useHead({
  title: 'Gestión de Licencias | AAAB',
  meta: [{ name: 'description', content: 'Gestión de licencias solicitadas por los árbitros.' }],
})

const notificar = inject('notificar')
const toast = inject('toast')

const licencias = ref([])
const arbitrosLista = ref([])
const cargando = ref(false)

const filtros = reactive({
  apellido: '', nombre: '', estado: '', fecha: '', fecha_solicitud: '', anio: anioActual()
})

const mostrarFiltrosMobile = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
// MODIFICADO: Agregué motivo al estado inicial del formModal
const formModal = ref({ id: null, id_arbitro: '', fecha_solicitud: '', fecha_licencia: '', estado: 'aprobada', apellido: '', nombre: '', motivo: 'particular', tiempo_indeterminado: false })
const { hayCambios } = useCambiosSinGuardar(formModal, mostrarModal)

const mostrarModalHistorial = ref(false)
const cargandoHistorial = ref(false)
const licenciaSeleccionada = ref(null)
const historialLicencia = ref([])

const formatearFechaVista = (f) => f ? f.split(' ')[0].split('-').reverse().join('/') : ''
const formatearFechaAusencia = (lic) => {
  if (lic.tiempo_indeterminado == 1) return 'Tiempo indeterminado'
  const desde = formatearFechaVista(lic.fecha_licencia)
  const hasta = formatearFechaVista(lic.fecha_hasta)
  return hasta && hasta !== desde ? `${desde} al ${hasta}` : desde
}

// Extrae el año (AAAA) de una fecha en formato 'AAAA-MM-DD ...'. Devuelve '' si no hay fecha.
const anioDeFecha = (f) => (f ? String(f).split(' ')[0].split('-')[0] : '')

const etiquetaMotivo = (motivo, corto = false) => {
  if (motivo === 'lesion_enfermedad') return corto ? 'Lesión/Enf.' : 'Lesión/Enfermedad'
  if (motivo === 'designacion_torneo_nacional') return corto ? 'Desig. T. Nac.' : 'Designación Torneo Nacional'
  return 'Particular'
}

// Años presentes en las licencias (según fecha de ausencia o de solicitud), ordenados descendente.
const aniosDisponibles = computed(() => {
  const set = new Set()
  licencias.value.forEach(l => {
    const aAus = anioDeFecha(l.fecha_licencia)
    const aSol = anioDeFecha(l.fecha_solicitud)
    if (aAus) set.add(aAus)
    if (aSol) set.add(aSol)
  })
  return conAnioActual(set)
})

const licenciasFiltradas = computed(() => {
  return licencias.value.filter(l => {
    const matchApe = normalizarTexto(l.apellido).includes(normalizarTexto(filtros.apellido))
    const matchNom = normalizarTexto(l.nombre).includes(normalizarTexto(filtros.nombre))
    const matchEst = filtros.estado === '' || l.estado === filtros.estado
    const matchFec = normalizarTexto(formatearFechaAusencia(l)).includes(normalizarTexto(filtros.fecha))
    const matchFecSol = formatearFechaVista(l.fecha_solicitud).includes(filtros.fecha_solicitud)
    // Año: coincide por fecha de ausencia o de solicitud.
    // Las indeterminadas (sin fecha de ausencia) se muestran siempre.
    const matchAnio = filtros.anio === ''
      || l.tiempo_indeterminado == 1
      || anioDeFecha(l.fecha_licencia) === filtros.anio
      || anioDeFecha(l.fecha_solicitud) === filtros.anio
    return matchApe && matchNom && matchEst && matchFec && matchFecSol && matchAnio
  })
})

const { totalPaginas, paginados: licenciasPaginadas } = usePaginacion(licenciasFiltradas, registrosPorPagina, paginaActual)

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })


const obtenerLicencias = async () => {
  cargando.value = true
  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerTodasLasLicencias'
    })
    if (res.ok) licencias.value = res.payload
  } finally {
    cargando.value = false
  }
}

const obtenerArbitros = async () => {
  const res = await api.get({
    entity: 'arbitros',
    action: 'getArbitros'
  })
  if (res.ok && Array.isArray(res.payload)) {
    arbitrosLista.value = (res.payload || []).sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''))
  }
}

const abrirModalNuevo = () => {
  const hoy = new Date().toISOString().split('T')[0]
  // MODIFICADO: Reiniciar motivo a particular por defecto
  formModal.value = { id: null, id_arbitro: '', fecha_solicitud: hoy, fecha_licencia: '', fecha_hasta: '', estado: 'aprobada', apellido: '', nombre: '', motivo: 'particular', tiempo_indeterminado: false }
  modoModal.value = 'nuevo'
  mostrarModal.value = true
}

const editarLicencia = (lic) => {
  // MODIFICADO: Asegurarse de que el motivo se cargue al editar
  // y normalizar tiempo_indeterminado (1/0) a booleano para el checkbox.
  formModal.value = {
    ...lic,
    fecha_licencia: (lic.fecha_licencia || '').slice(0, 10),
    fecha_hasta: (lic.fecha_hasta || lic.fecha_licencia || '').slice(0, 10),
    motivo: lic.motivo || 'particular',
    tiempo_indeterminado: lic.tiempo_indeterminado == 1
  }
  modoModal.value = 'editar'
  mostrarModal.value = true
}

const onToggleTiempoIndeterminado = () => {
  if (formModal.value.tiempo_indeterminado) {
    if (modoModal.value === 'nuevo') {
      formModal.value.fecha_solicitud = new Date().toISOString().split('T')[0]
    }
    formModal.value.fecha_licencia = ''
    formModal.value.fecha_hasta = ''
    // Las indeterminadas solo admiten lesión/enfermedad o particular.
    if (formModal.value.motivo !== 'lesion_enfermedad') {
      formModal.value.motivo = 'particular'
    }
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const diasAlta = computed(() => {
  const desde = formModal.value.fecha_licencia
  const hasta = formModal.value.fecha_hasta || desde
  if (!desde || hasta < desde) return 0
  const [y1, m1, d1] = desde.split('-').map(Number)
  const [y2, m2, d2] = hasta.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000) + 1
})

watch(() => formModal.value.fecha_licencia, (desde) => {
  if (!desde) return
  if (!formModal.value.fecha_hasta || formModal.value.fecha_hasta < desde) formModal.value.fecha_hasta = desde
})

const confirmarAlta = async () => {
  cargando.value = true
  const { fecha_licencia, fecha_hasta, ...resto } = formModal.value
  const res = await api.post({
    entity: 'licencias',
    action: 'crearLicencia',
    payload: {
      ...resto,
      fecha_desde: resto.tiempo_indeterminado ? null : fecha_licencia,
      fecha_hasta: resto.tiempo_indeterminado ? null : (fecha_hasta || fecha_licencia),
      es_admin: true
    }
  })
  cargando.value = false

  if (res.ok) {
    mostrarModal.value = false
    obtenerLicencias()
    toast({ titulo: 'Éxito', mensaje: 'Licencia registrada correctamente.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: res.message || 'No se pudo registrar la licencia.', tipo: 'danger' })
  }
}

const confirmarEdicion = async () => {
  cargando.value = true
  const res = await api.post({
    entity: 'licencias',
    action: 'actualizarLicencia',
    payload: {
      id: formModal.value.id,
      estado: formModal.value.estado,
      fecha_licencia: formModal.value.tiempo_indeterminado ? null : formModal.value.fecha_licencia,
      fecha_hasta: formModal.value.tiempo_indeterminado ? null : (formModal.value.fecha_hasta || formModal.value.fecha_licencia),
      fecha_solicitud: formModal.value.fecha_solicitud,
      motivo: formModal.value.motivo,
      tiempo_indeterminado: formModal.value.tiempo_indeterminado ? 1 : 0
    }
  })
  cargando.value = false

  if (res.ok) {
    mostrarModal.value = false
    obtenerLicencias()
    toast({ titulo: 'Guardado', mensaje: 'Licencia actualizada correctamente.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: res.message || 'No se pudieron guardar los cambios.', tipo: 'danger' })
  }
}

const eliminarLicencia = (id) => {
  notificar({
    titulo: '¿Eliminar Licencia?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      const res = await api.post({
        entity: 'licencias',
        action: 'eliminarLicencia',
        payload: { id }
      })
      if(res.ok) {
        licencias.value = licencias.value.filter(l => l.id !== id)
        toast({ titulo: 'Eliminado', mensaje: 'La licencia ha sido removida.', tipo: 'success' })
      }
    }
  })
}

const verHistorialLicencia = async (lic) => {
  licenciaSeleccionada.value = lic
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true
  historialLicencia.value = []

  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
      payload: { id_arbitro: lic.id_arbitro }
    })
    if (res.payload) {
      historialLicencia.value = res.payload
    }
  } catch (error) {
    console.error("Error al cargar historial", error)
  } finally {
    cargandoHistorial.value = false
  }
}
const exportarExcel = async () => {
  const data = licenciasFiltradas.value.map(l => ({
    'ID': l.id,
    'Apellido': l.apellido,
    'Nombre': l.nombre,
    'Estado': l.estado.toUpperCase(),
    'Motivo': etiquetaMotivo(l.motivo),
    'Fecha Solicitud': formatearFechaVista(l.fecha_solicitud),
    'Fecha Licencia': formatearFechaAusencia(l)
  }))

  const wb = new (await cargarExcelJS()).Workbook()
  const ws = wb.addWorksheet('Licencias')

  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Licencias_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

const limpiarFiltros = () => {
  filtros.nombre = ''; filtros.apellido = ''; filtros.estado = ''; filtros.fecha = ''; filtros.fecha_solicitud = ''; filtros.anio = anioActual()
}

onMounted(() => {
  obtenerLicencias()
  obtenerArbitros()
})
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */
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

/* ====================================================
   UTILIDADES
   ==================================================== */
.animate__animated { animation-duration: 0.5s; }

</style>
