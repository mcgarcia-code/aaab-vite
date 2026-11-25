<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Informes de los árbitros · Total: {{ informesFiltrados.length }} registros</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerInformes" />

            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Informes</span>
            <button type="button" aria-label="Cerrar filtros" title="Cerrar filtros" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2 flex-md-nowrap">
            <div class="col-6 col-md-1">
              <input aria-label="Fecha (DD/MM/AAAA)" v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="DD/MM/AAAA">
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="Encuentro" v-model="filtros.encuentro" class="form-control form-control-sm shadow-none" placeholder="ENCUENTRO...">
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="Árbitros" v-model="filtros.arbitros" class="form-control form-control-sm shadow-none" placeholder="ÁRBITROS...">
            </div>
            <div class="col-6 col-md-2">
              <input aria-label="Implicado" v-model="filtros.implicado" class="form-control form-control-sm shadow-none" placeholder="IMPLICADO...">
            </div>
            <div class="col-6 col-md-2">
              <select aria-label="Filtrar por torneo" v-model="filtros.torneo" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">TORNEO</option>
                <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select aria-label="Filtrar por estado" v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="creado">CREADO</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="aprobado">APROBADO</option>
                <option value="anulado">ANULADO</option>
                <option value="desestimado">DESESTIMADO</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select aria-label="Filtrar por año" v-model="filtros.anio" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">AÑO</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger rounded-pill w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando informes" />

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija solo-escritorio texto-075 tabla-layout-fijo">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 130px;">Acciones</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-fecha" style="width: 110px;">Fecha</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 220px;">Encuentro</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 130px;">Categoría</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 180px;">Torneo</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 160px;">Implicado</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 200px;">Árbitros</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="width: 120px;">Estado</th>
                    <th class="py-3 text-center pe-3 text-uppercase text-muted" style="width: 140px;">Cargado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inf in informesPaginados" :key="inf.id">
                    <td class="text-center text-muted fw-bold font-monospace col-fija col-id">{{ inf.id }}</td>
                    <td class="text-center col-fija col-acciones">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="verDetalle(inf)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary" title="Ver detalle">
                          <i class="bi bi-eye texto-16px"></i>
                        </button>
                        <button
                          @click="descargarPDF(inf)"
                          class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger"
                          title="Descargar PDF"
                          :disabled="descargandoId === inf.id"
                        >
                          <span v-if="descargandoId === inf.id" class="spinner-border spinner-border-sm" style="width:14px;height:14px;"></span>
                          <i v-else class="bi bi-file-earmark-pdf texto-16px"></i>
                        </button>
                        <button
                          v-if="inf.estado === 'creado' || inf.estado === 'pendiente'"
                          @click="abrirEdicion(inf)"
                          class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark"
                          title="Editar"
                        >
                          <i class="bi bi-pencil texto-16px"></i>
                        </button>
                      </div>
                    </td>
                    <td class="text-center fw-bold col-fija col-fecha">{{ formatearFecha(inf.fecha_partido) }}</td>
                    <td class="fw-bold text-uppercase text-dark text-truncate" :title="inf.encuentro" style="max-width: 220px;">{{ inf.encuentro }}</td>
                    <td class="text-dark text-truncate" :title="inf.categoria" style="max-width: 130px;">{{ inf.categoria || '-' }}</td>
                    <td class="text-dark text-truncate" :title="etiquetaTorneo(inf.torneo)" style="max-width: 180px;">{{ etiquetaTorneo(inf.torneo) }}</td>
                    <td class="text-dark text-truncate" :title="inf.implicado" style="max-width: 160px;">{{ inf.implicado }}</td>
                    <td class="text-dark text-truncate" :title="inf.arbitros" style="max-width: 200px;">{{ inf.arbitros || '-' }}</td>
                    <td class="text-center">
                      <span :class="claseEstadoInforme(inf.estado)">{{ etiquetaEstadoInforme(inf.estado) }}</span>
                    </td>
                    <td class="text-center pe-3 text-muted">{{ formatearFechaHora(inf.creado_en) }}</td>
                  </tr>
                  <tr v-if="informesPaginados.length === 0">
                    <td colspan="10" class="py-5 text-center text-muted border-0 bg-white">
                      <i class="bi bi-clipboard-x d-block fs-1 mb-2"></i>
                      <p class="m-0 fw-bold">No hay informes registrados.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="inf in informesPaginados" :key="'mob-'+inf.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase texto-105 lh-12">
                    {{ inf.encuentro }}
                  </div>
                  <div class="small text-muted fw-bold text-end">
                    #{{ inf.id }}<br>
                    {{ formatearFecha(inf.fecha_partido) }}
                    <div class="mt-1">
                      <span :class="claseEstadoInforme(inf.estado)">{{ etiquetaEstadoInforme(inf.estado) }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="bg-light p-2 rounded border mt-2 border-light-subtle">
                    <p class="m-0 text-dark small"><strong class="text-muted">Torneo:</strong> {{ etiquetaTorneo(inf.torneo) }}</p>
                    <p class="m-0 text-dark small mt-1"><strong class="text-muted">Implicado:</strong> {{ inf.implicado }}</p>
                    <p class="m-0 text-dark small mt-1">
                      <strong class="text-muted">Categoría:</strong>
                      <span class="badge bg-secondary ms-1">{{ inf.categoria || '-' }}</span>
                    </p>
                    <p class="m-0 text-dark small mt-1"><strong class="text-muted">Árbitros:</strong> {{ inf.arbitros || '-' }}</p>
                    <p v-if="inf.delegado_tecnico" class="m-0 text-dark small mt-1"><strong class="text-muted">Delegado técnico:</strong> {{ inf.delegado_tecnico }}</p>
                    <div class="d-flex justify-content-end mt-2 border-top border-secondary-subtle pt-2">
                      <span class="text-muted small">Cargado: {{ formatearFechaHora(inf.creado_en) }}</span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button @click="verDetalle(inf)" class="btn btn-sm btn-outline-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <i class="bi bi-eye texto-18px"></i> Ver detalle
                    </button>
                    <button
                      @click="descargarPDF(inf)"
                      class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center gap-1 fw-bold"
                      :disabled="descargandoId === inf.id"
                      title="Descargar PDF"
                    >
                      <span v-if="descargandoId === inf.id" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-file-earmark-pdf texto-18px"></i>
                    </button>
                    <button
                      v-if="inf.estado === 'creado' || inf.estado === 'pendiente'"
                      @click="abrirEdicion(inf)"
                      class="btn btn-sm btn-outline-secondary shadow-sm px-3 d-flex justify-content-center align-items-center"
                      title="Editar"
                    >
                      <i class="bi bi-pencil texto-18px"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="informesPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <i class="bi bi-clipboard-x text-muted opacity-50 d-block mb-2 texto-40px"></i>
                <p class="text-muted m-0 fw-bold">No hay informes registrados.</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4 mb-3" />
          </template>

        </div>
      </div>
    </div>

    <!-- ==========================================
         MODAL DETALLE
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle del informe" icono="description" colorIcono="bg-danger text-white" maxWidth="640px">
      <DetalleInforme v-if="informeSel" :informe="informeSel" :descargando-archivo="descargandoArchivo" @descargar="descargarArchivo">
        <template #despues>
          <!-- Cambio de estado (siempre editable: se puede revertir) -->
          <div class="mt-4 pt-3 border-top">
            <label class="form-label small fw-bold text-dark mb-1">Actualizar estado del informe</label>
            <select aria-label="Actualizar estado del informe" v-model="nuevoEstado" class="form-select form-select-sm shadow-none fw-bold">
              <option value="creado">Creado</option>
              <option value="pendiente">Pendiente de correción</option>
              <option value="aprobado">Aprobar informe</option>
              <option value="desestimado">Desestimar informe</option>
              <option value="anulado">Anular informe</option>
            </select>
            <p class="text-muted small mt-2 mb-0">
              <i class="bi bi-info-circle me-1"></i>Aprobados y desestimados pasan al panel de administración. Los anulados quedan fuera del circuito. Podés revertir el estado si hace falta.
            </p>
          </div>
        </template>
      </DetalleInforme>

      <template #footer>
        <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1" :disabled="procesando">
          Cancelar
        </button>
        <button @click="guardarEstado" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="procesando || nuevoEstado === informeSel.estado">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          Guardar
        </button>
      </template>
    </ModalBase>

    <!-- Edición: formulario y guardado en ModalEditarInforme -->
    <ModalEditarInforme :show="mostrarEdicion" :informe="informeEdit" @close="cerrarEdicion" />

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { OPCIONES_TORNEO, etiquetaTorneo, etiquetaEstadoInforme, claseEstadoInforme } from '@/utils/informes'
import { useDescargasInforme } from '@/composables/useDescargasInforme'
import { fechaArg, fechaHoraArg } from '@/utils/fechas'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import DetalleInforme from '@/components/comunes/informes/DetalleInforme.vue'
import ModalEditarInforme from '@/components/comunes/informes/ModalEditarInforme.vue'

useHead({
  title: 'Informes de mi grupo | AAAB',
  meta: [{ name: 'description', content: 'Gestión de informes de partidos de los grupos coordinados.' }],
})

const toast = inject('toast')

/* ====================================================
   CATÁLOGOS
   ==================================================== */
const opcionesTorneo = OPCIONES_TORNEO

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const informes = ref([])
const cargando = ref(false)
const procesando = ref(false)

const filtros = reactive({ fecha: '', anio: anioActual(), estado: '', encuentro: '', arbitros: '', implicado: '', torneo: '' })
const mostrarFiltrosMobile = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10

/* ====================================================
   FECHAS
   ==================================================== */
const formatearFecha = (fecha) => fechaArg(fecha, 'S/F')

const formatearFechaHora = (fechaHora) => fechaHoraArg(fechaHora, '-')

/* ====================================================
   FILTROS Y PAGINACIÓN
   ==================================================== */
const aniosDisponibles = computed(() => {
  const anios = new Set()
  informes.value.forEach(inf => {
    const anio = (inf.fecha_partido || '').substring(0, 4)
    if (anio) anios.add(anio)
  })
  return conAnioActual(anios)
})

const informesFiltrados = computed(() => {
  return informes.value.filter(inf => {
    const matchFec = formatearFecha(inf.fecha_partido).includes(filtros.fecha)
    const matchAnio = !filtros.anio || (inf.fecha_partido || '').substring(0, 4) === filtros.anio
    const matchEstado = !filtros.estado || (inf.estado || 'creado').toLowerCase() === filtros.estado
    const matchTorneo = !filtros.torneo || inf.torneo === filtros.torneo
    const matchEnc = normalizarTexto(inf.encuentro).includes(normalizarTexto(filtros.encuentro))
    const matchArb = normalizarTexto(inf.arbitros).includes(normalizarTexto(filtros.arbitros))
    const matchImp = normalizarTexto(inf.implicado).includes(normalizarTexto(filtros.implicado))

    return matchFec && matchAnio && matchEstado && matchTorneo && matchEnc && matchArb && matchImp
  })
})

const { totalPaginas, paginados: informesPaginados } = usePaginacion(informesFiltrados, registrosPorPagina, paginaActual)

const limpiarFiltros = () => { Object.keys(filtros).forEach(key => filtros[key] = ''); filtros.anio = anioActual() }

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })

/* ====================================================
   CARGA DE DATOS
   ==================================================== */
const obtenerInformes = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'informes', action: 'obtenerInformesCoordinador' })
    if ((res && res.ok) || (res && res.success)) {
      informes.value = (res.payload || []).sort((a, b) => b.id - a.id)
    } else {
      informes.value = []
      toast({ titulo: 'Sin datos', mensaje: 'No se pudieron cargar los informes.', tipo: 'warning' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Problema al cargar los informes.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

/* ====================================================
   DETALLE + CAMBIO DE ESTADO
   ==================================================== */
const mostrarDetalle = ref(false)
const informeSel = ref(null)
const nuevoEstado = ref('creado')

const verDetalle = (inf) => {
  informeSel.value = inf
  nuevoEstado.value = inf.estado || 'creado'
  mostrarDetalle.value = true
}
const cerrarDetalle = () => { mostrarDetalle.value = false; informeSel.value = null }

// Descargas del informe (adjuntos y PDF): compartidas con las otras pantallas de informes
const { descargandoArchivo, descargarArchivo, descargandoId, descargarPDF } = useDescargasInforme({ etiquetaEstado: etiquetaEstadoInforme, toast })

// El coordinador puede pasar el informe a: creado, pendiente, aprobado o anulado
const guardarEstado = async () => {
  if (!informeSel.value || nuevoEstado.value === informeSel.value.estado) return
  const inf = informeSel.value
  const estado = nuevoEstado.value

  procesando.value = true
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'cambiarEstadoInforme',
      payload: { id_informe: inf.id, estado }
    })
    if (res.ok || res.success) {
      inf.estado = estado
      cerrarDetalle()
      toast({
        titulo: 'Estado actualizado',
        mensaje: mensajeEstado(estado),
        tipo: (estado === 'aprobado' || estado === 'desestimado') ? 'success' : (estado === 'anulado' ? 'secondary' : 'info')
      })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo actualizar el informe.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const mensajeEstado = (estado) => {
  if (estado === 'aprobado') return 'El informe fue aprobado y pasó al panel de administración.'
  if (estado === 'desestimado') return 'El informe fue desestimado y pasó al panel de administración.'
  if (estado === 'anulado') return 'El informe fue anulado y queda fuera del circuito.'
  if (estado === 'pendiente') return 'El informe quedó pendiente de revisión.'
  return 'El informe volvió al estado creado.'
}

/* ====================================================
   EDICIÓN (el formulario y el guardado están en ModalEditarInforme)
   ==================================================== */
const mostrarEdicion = ref(false)
const informeEdit = ref(null)
const abrirEdicion = (inf) => { informeEdit.value = inf; mostrarEdicion.value = true }
const cerrarEdicion = () => { mostrarEdicion.value = false; informeEdit.value = null }

onMounted(obtenerInformes)
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */

.min-w-0 { min-width: 0; }

/* ====================================================
   TABLA CON COLUMNAS FIJAS Y SIN LÍNEAS
   ==================================================== */

@media (min-width: 768px) {  .col-acciones { left: 50px; min-width: 130px !important; max-width: 130px !important; }
  .col-fecha    {
    left: 180px;
    min-width: 110px !important;
    max-width: 110px !important;
    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
  }
}

</style>
