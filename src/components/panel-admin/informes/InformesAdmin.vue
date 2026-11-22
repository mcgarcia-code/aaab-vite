<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Informes arbitrales · Total: {{ informesFiltrados.length }} registros</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerInformes" />

            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />

            <BotonHerramienta tipo="nuevo" texto="Cargar informe" icono="bi-file-earmark-plus" @click="abrirModalCarga" />
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
            <div class="col-6 col-md-1">
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
                <option value="desestimado">DESESTIMADO</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select aria-label="Filtrar por carga en Larry" v-model="filtros.larry" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">LARRY</option>
                <option value="si">CARGADO</option>
                <option value="no">SIN CARGAR</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select aria-label="Filtrar por año" v-model="filtros.anio" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">AÑO</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando informes" />

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija texto-075 tabla-layout-fijo">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 100px;">Acciones</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-fecha" style="width: 110px;">Fecha</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 220px;">Encuentro</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 130px;">Categoría</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 180px;">Torneo</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 160px;">Implicado</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 200px;">Árbitros</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="width: 110px;">Estado</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="width: 150px;">Cargado en Larry</th>
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
                          @click="editarDesdeTabla(inf)"
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
                      <span :class="badgeEstado(inf.estado)">{{ etiquetaEstado(inf.estado) }}</span>
                    </td>
                    <td class="text-center">
                      <div class="form-check form-switch d-inline-flex align-items-center gap-2 m-0 justify-content-center">
                        <input
                          class="form-check-input m-0"
                          type="checkbox"
                          role="switch"
                          :checked="!!inf.cargado_larry"
                          :disabled="guardandoLarry === inf.id"
                          @change="toggleLarry(inf, $event)"
                        >
                        <span class="small fw-bold" :class="inf.cargado_larry ? 'text-success' : 'text-muted'">
                          {{ inf.cargado_larry ? 'Sí' : 'No' }}
                        </span>
                      </div>
                    </td>
                    <td class="text-center pe-3 text-muted">{{ formatearFechaHora(inf.creado_en) }}</td>
                  </tr>
                  <tr v-if="informesPaginados.length === 0">
                    <td colspan="11" class="py-5 text-center text-muted border-0 bg-white">
                      <i class="bi bi-clipboard-check d-block fs-1 mb-2"></i>
                      <p class="m-0 fw-bold">Todavía no hay informes cargados.</p>
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
                      <span :class="badgeEstado(inf.estado)">{{ etiquetaEstado(inf.estado) }}</span>
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
                    <div class="d-flex justify-content-between align-items-center mt-2 border-top border-secondary-subtle pt-2">
                      <div class="form-check form-switch d-inline-flex align-items-center gap-2 m-0">
                        <input
                          class="form-check-input m-0"
                          type="checkbox"
                          role="switch"
                          :checked="!!inf.cargado_larry"
                          :disabled="guardandoLarry === inf.id"
                          @change="toggleLarry(inf, $event)"
                        >
                        <span class="small fw-bold" :class="inf.cargado_larry ? 'text-success' : 'text-muted'">
                          Larry: {{ inf.cargado_larry ? 'Sí' : 'No' }}
                        </span>
                      </div>
                      <span class="text-muted small">{{ formatearFechaHora(inf.creado_en) }}</span>
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
                    >
                      <span v-if="descargandoId === inf.id" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-file-earmark-pdf texto-18px"></i> PDF
                    </button>
                  </div>
                </div>
              </div>

              <EstadoVacio v-if="informesPaginados.length === 0" icono="bi-clipboard-check" titulo="Todavía no hay informes cargados" />
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
    <ModalBase :show="mostrarDetalle" :hay-cambios="hayCambiosEdicion" @close="cerrarDetalle" titulo="Detalle del informe" icono="description" colorIcono="bg-danger text-white" maxWidth="640px">
      <div v-if="informeSel" class="text-start">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span class="fw-bold text-muted small">Informe #{{ informeSel.id }}</span>
          <span :class="badgeEstado(informeSel.estado)">{{ etiquetaEstado(informeSel.estado) }}</span>
        </div>

        <div class="row g-3">
          <div class="col-6"><DatoDetalle etiqueta="Fecha del partido" :valor="formatearFecha(informeSel.fecha_partido)" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Categoría" :valor="informeSel.categoria || '-'" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Torneo" :valor="etiquetaTorneo(informeSel.torneo)" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Encuentro" :valor="informeSel.encuentro" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Árbitros" :valor="informeSel.arbitros || '-'" /></div>
          <div class="col-12" v-if="informeSel.delegado_tecnico">
            <DatoDetalle etiqueta="Delegado técnico (cargó el informe)" :valor="informeSel.delegado_tecnico" />
          </div>
          <div class="col-6"><DatoDetalle etiqueta="Implicado" :valor="informeSel.implicado" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Sanción" :valor="informeSel.sancion" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Institución" :valor="informeSel.institucion_nombre" /></div>
          <div class="col-12">
            <label class="form-label small fw-bold text-muted mb-1">Motivo y descripción</label>
            <div v-if="!modoEdicion" class="border rounded p-2 bg-light small text-break texto-preformateado">{{ informeSel.motivo_descripcion }}</div>
            <textarea aria-label="Motivo y descripción"
              v-else
              v-model="formAdmin.motivo_descripcion"
              class="form-control shadow-none"
              rows="5"
              placeholder="Motivo y descripción del informe..."
            ></textarea>
          </div>

          <!-- Cambiar estado (solo en modo edición y si el informe no fue resuelto) -->
          <div class="col-12" v-if="modoEdicion">
            <label class="form-label small fw-bold text-muted mb-1">Estado del informe</label>
            <select aria-label="Estado del informe" v-model="formAdmin.estado" class="form-select form-select-sm shadow-none">
              <option value="creado">Creado</option>
              <option value="pendiente">Pendiente (necesita corrección)</option>
              <option value="aprobado">Aprobado</option>
              <option value="desestimado">Desestimado</option>
              <option value="anulado">Anulado</option>
            </select>
            <small class="text-muted d-block mt-1">
              Al pasar a <strong>Pendiente</strong> o <strong>Aprobado</strong> se le avisa por email al árbitro que cargó el informe.
              Si lo pasás a <strong>Anulado</strong>, el informe deja de aparecer en la tabla.
            </small>
          </div>

          <div class="col-6"><DatoDetalle :etiqueta="informeSel.cargado_por_es_rol ? 'Cargado por' : (informeSel.delegado_tecnico ? 'Cargado por el delegado técnico' : 'Cargado por el árbitro')" :valor="`${formatearFechaHora(informeSel.creado_en)} — ${informeSel.cargado_por_nombre || informeSel.delegado_tecnico || informeSel.arbitros || '-'}`" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Cargado en Larry" :valor="informeSel.cargado_larry ? 'Sí' : 'No'" /></div>

          <!-- COORDINADOR/ES DEL GRUPO (para contacto desde admin) -->
          <div class="col-12">
            <label class="form-label small fw-bold text-muted mb-1">
              <i class="bi bi-person-badge me-1"></i>Coordinador del grupo
            </label>
            <div v-if="informeSel.coordinadores && informeSel.coordinadores.length" class="d-flex flex-column gap-1">
              <div
                v-for="(co, idx) in informeSel.coordinadores"
                :key="idx"
                class="border rounded p-2 bg-light small d-flex flex-column flex-sm-row justify-content-between gap-1"
              >
                <span class="fw-bold text-dark text-break">{{ co.nombre || 'Coordinador' }}</span>
                <a
                  v-if="co.email"
                  :href="`mailto:${co.email}`"
                  class="text-danger fw-bold text-break text-decoration-none d-flex align-items-center gap-1"
                >
                  <i class="bi bi-envelope-fill"></i>{{ co.email }}
                </a>
                <span v-else class="text-muted">Sin email</span>
              </div>
            </div>
            <div v-else class="border rounded p-2 bg-light small text-muted">
              Sin coordinador asignado al grupo.
            </div>
          </div>

          <!-- ARCHIVOS ADJUNTOS -->
          <div class="col-12" v-if="informeSel.archivos && informeSel.archivos.length">
            <label class="form-label small fw-bold text-muted mb-1">
              <i class="bi bi-paperclip me-1"></i>Archivos adjuntos ({{ informeSel.archivos.length }})
            </label>
            <ul class="list-group list-group-flush border rounded">
              <li
                v-for="(arc, idx) in informeSel.archivos"
                :key="idx"
                class="list-group-item d-flex justify-content-between align-items-center py-2 px-2 small"
              >
                <span class="text-break d-flex align-items-center gap-2 min-w-0">
                  <i class="bi bi-file-earmark-arrow-down text-danger flex-shrink-0"></i>
                  <span class="text-truncate">{{ arc.archivo_nombre }}</span>
                </span>
                <button
                  type="button"
                  @click="descargarArchivo(arc)"
                  class="btn btn-sm btn-outline-danger py-0 px-2 ms-2 flex-shrink-0 d-flex align-items-center gap-1"
                  :disabled="descargandoArchivo === arc.url_completa"
                  title="Descargar"
                >
                  <span v-if="descargandoArchivo === arc.url_completa" class="spinner-border spinner-border-sm" style="width:12px;height:12px;"></span>
                  <i v-else class="bi bi-download"></i>
                  <span class="d-none d-sm-inline">Descargar</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- Modo edición: guardar / cancelar -->
        <template v-if="modoEdicion">
          <button
            @click="guardarCambiosAdmin"
            class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            :disabled="guardandoAdmin"
          >
            <span v-if="guardandoAdmin" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-floppy texto-18px"></i> Guardar cambios
          </button>
          <button @click="cancelarEdicionAdmin" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1" :disabled="guardandoAdmin">CANCELAR</button>
        </template>

        <!-- Modo lectura: solo cerrar (PDF y editar están en las acciones de la tabla) -->
        <template v-else>
          <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1">CERRAR</button>
        </template>
      </template>
    </ModalBase>

    <!-- Modal compartido de carga de informe -->
    <ModalCargarInforme :show="mostrarCarga" @close="cerrarModalCarga" @cargado="obtenerInformes" />

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, onMounted, computed, reactive, inject, watch, h } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { OPCIONES_TORNEO, etiquetaTorneo } from '@/utils/informes'
import { useDescargasInforme } from '@/composables/useDescargasInforme'
import { fechaArg, fechaHoraArg } from '@/utils/fechas'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import ModalCargarInforme from '@/components/ModalCargarInforme.vue'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'

useHead({
  title: 'Informes | AAAB',
  meta: [{ name: 'description', content: 'Panel de administración de informes de partidos.' }],
})

const toast = inject('toast')

const DatoDetalle = (props) => h('div', {}, [
  h('label', { class: 'form-label small fw-bold text-muted mb-1' }, props.etiqueta),
  h('div', { class: 'fw-bold text-dark small text-break' }, props.valor)
])
DatoDetalle.props = ['etiqueta', 'valor']

/* ====================================================
   CATÁLOGOS
   ==================================================== */
const opcionesTorneo = OPCIONES_TORNEO

/* Estados (píldoras) — en admin llegan creado, pendiente, aprobado y desestimado */
const etiquetaEstado = (estado) => {
  const e = (estado || '').toLowerCase()
  if (e === 'desestimado') return 'DESESTIMADO'
  if (e === 'pendiente') return 'PENDIENTE'
  if (e === 'creado') return 'CREADO'
  return 'APROBADO'
}
const badgeEstado = (estado) => {
  const e = (estado || '').toLowerCase()
  if (e === 'desestimado') return 'estado-pill estado-desestimado'
  if (e === 'pendiente') return 'estado-pill estado-pendiente'
  if (e === 'creado') return 'estado-pill estado-creado'
  return 'estado-pill estado-aprobado'
}

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const informes = ref([])
const cargando = ref(false)
const guardandoLarry = ref(null)

const filtros = reactive({ fecha: '', anio: anioActual(), torneo: '', estado: '', larry: '', encuentro: '', arbitros: '', implicado: '' })
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
    const matchTorneo = !filtros.torneo || inf.torneo === filtros.torneo
    const matchEstado = !filtros.estado || (inf.estado || '').toLowerCase() === filtros.estado
    const matchLarry = !filtros.larry
      || (filtros.larry === 'si' && !!inf.cargado_larry)
      || (filtros.larry === 'no' && !inf.cargado_larry)
    const matchEnc = normalizarTexto(inf.encuentro).includes(normalizarTexto(filtros.encuentro))
    const matchArb = normalizarTexto(inf.arbitros).includes(normalizarTexto(filtros.arbitros))
    const matchImp = normalizarTexto(inf.implicado).includes(normalizarTexto(filtros.implicado))

    return matchFec && matchAnio && matchTorneo && matchEstado && matchLarry && matchEnc && matchArb && matchImp
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
    const res = await api.get({ entity: 'informes', action: 'obtenerInformesAdmin' })
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
   CHECKBOX CARGADO EN LARRY
   ==================================================== */
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
    // Revertir el checkbox visual
    event.target.checked = !!inf.cargado_larry
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo actualizar.', tipo: 'danger' })
  } finally {
    guardandoLarry.value = null
  }
}

/* ====================================================
   DETALLE
   ==================================================== */
const mostrarDetalle = ref(false)
const informeSel = ref(null)
const verDetalle = (inf) => { informeSel.value = inf; modoEdicion.value = false; mostrarDetalle.value = true }
const cerrarDetalle = () => { mostrarDetalle.value = false; informeSel.value = null; modoEdicion.value = false }

// Abrir el modal directamente en modo edición desde el botón de la tabla.
const editarDesdeTabla = (inf) => {
  informeSel.value = inf
  mostrarDetalle.value = true
  abrirEdicionAdmin()
}

/* ====================================================
   EDICIÓN DESDE ADMIN (motivo/descripción + estado)
   Disponible mientras el informe esté 'creado' o 'pendiente'.
   ==================================================== */
const modoEdicion = ref(false)
const guardandoAdmin = ref(false)
const formAdmin = reactive({ motivo_descripcion: '', estado: '' })
const { hayCambios: hayCambiosEdicion } = useCambiosSinGuardar(formAdmin, () => mostrarDetalle.value && modoEdicion.value)

const abrirEdicionAdmin = () => {
  if (!informeSel.value) return
  formAdmin.motivo_descripcion = informeSel.value.motivo_descripcion || ''
  formAdmin.estado = informeSel.value.estado || 'creado'
  modoEdicion.value = true
}

const cancelarEdicionAdmin = () => {
  modoEdicion.value = false
}

const guardarCambiosAdmin = async () => {
  const inf = informeSel.value
  if (!inf) return
  if (!formAdmin.motivo_descripcion.trim()) {
    toast({ titulo: 'Falta el motivo', mensaje: 'El motivo y descripción no puede quedar vacío.', tipo: 'warning' })
    return
  }

  guardandoAdmin.value = true
  try {
    const estadoCambio = formAdmin.estado !== inf.estado

    // 1) Guardar motivo/descripción (y demás datos que exige el backend)
    const fd = new FormData()
    fd.append('id_informe', inf.id)
    fd.append('torneo', inf.torneo || '')
    fd.append('implicado', inf.implicado || '')
    fd.append('sancion', inf.sancion || '')
    fd.append('institucion', inf.institucion || '')
    fd.append('institucion_nombre', inf.institucion_nombre || '')
    fd.append('motivo_descripcion', formAdmin.motivo_descripcion.trim())
    fd.append('archivos_eliminar', JSON.stringify([]))

    const resEdit = await api.postFile({
      entity: 'informes',
      action: 'actualizarInforme',
      payload: fd
    })
    if (!(resEdit.ok || resEdit.success)) {
      throw new Error((resEdit.payload && resEdit.payload.mensaje) ? resEdit.payload.mensaje : 'No se pudo guardar el motivo.')
    }
    inf.motivo_descripcion = formAdmin.motivo_descripcion.trim()

    // 2) Si cambió el estado, lo actualizamos aparte (dispara el email al árbitro)
    if (estadoCambio) {
      const resEstado = await api.post({
        entity: 'informes',
        action: 'cambiarEstadoInforme',
        payload: { id_informe: inf.id, estado: formAdmin.estado }
      })
      if (!(resEstado.ok || resEstado.success)) {
        throw new Error((resEstado.payload && resEstado.payload.mensaje) ? resEstado.payload.mensaje : 'No se pudo cambiar el estado.')
      }
      inf.estado = formAdmin.estado
    }

    // Si se anuló, el informe ya no debe figurar en la tabla de admin.
    if (estadoCambio && formAdmin.estado === 'anulado') {
      informes.value = informes.value.filter(i => i.id !== inf.id)
      cerrarDetalle()
      toast({ titulo: 'Informe anulado', mensaje: 'El informe fue anulado y quitado de la lista.', tipo: 'success' })
      return
    }

    modoEdicion.value = false
    toast({ titulo: 'Informe actualizado', mensaje: 'Se guardaron los cambios.', tipo: 'success' })
  } catch (err) {
    console.error('Error al guardar cambios admin:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo guardar.', tipo: 'danger' })
  } finally {
    guardandoAdmin.value = false
  }
}

// Descargas del informe (adjuntos y PDF): compartidas con las otras pantallas de informes
const { descargandoArchivo, descargarArchivo, descargandoId, descargarPDF } = useDescargasInforme({ etiquetaEstado, toast })

/* ====================================================
   CARGAR INFORME (modal compartido)
   ==================================================== */
const mostrarCarga = ref(false)
const abrirModalCarga = () => { mostrarCarga.value = true }
const cerrarModalCarga = () => { mostrarCarga.value = false }

onMounted(obtenerInformes)
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

.animate__animated { animation-duration: 0.5s; }

.min-w-0 { min-width: 0; }

/* ====================================================
   TABLA CON COLUMNAS FIJAS Y SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

.form-switch .form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

@media (min-width: 768px) {
  .col-fija {
    position: sticky !important;
    background-color: inherit;
    z-index: 10;
  }

  .tabla-fija thead .col-fija {
    background-color: var(--o-superficie, #f8f9fa) !important;
    z-index: 12;
  }

  .tabla-fija tbody .col-fija {
    background-color: var(--o-tarjeta, #ffffff) !important;
  }

  .col-id       { left: 0; min-width: 50px !important; max-width: 50px !important; }
  .col-acciones { left: 50px; min-width: 100px !important; max-width: 100px !important; }
  .col-fecha    {
    left: 150px;
    min-width: 110px !important;
    max-width: 110px !important;
    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
  }
}

/* ====================================================
   PÍLDORAS DE ESTADO
   ==================================================== */
.estado-pill {
  border-radius: 999px;
  padding: 0.35em 0.85em;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  display: inline-block;
  white-space: nowrap;
}

.estado-aprobado {
  background-color: var(--o-verde-fondo, #e3f5e6);
  color: var(--o-verde-texto, #2f8a45);
  border-color: var(--o-verde-borde, #bfe6c8);
}

/* CREADO — celeste */
.estado-creado {
  background-color: var(--o-azul-fondo, #dceefb);
  color: var(--o-azul-texto, #1c6ea4);
  border-color: var(--o-azul-borde, #b6dcf5);
}

/* PENDIENTE — amarillo */
.estado-pendiente {
  background-color: var(--o-ambar-fondo, #fdf3d3);
  color: var(--o-ambar-texto, #a6841f);
  border-color: var(--o-ambar-borde, #f2e2a5);
}

/* DESESTIMADO — naranja */
.estado-desestimado {
  background-color: var(--o-ambar-fondo, #fdecd8);
  color: var(--o-ambar-texto, #b5691a);
  border-color: var(--o-ambar-borde, #f6d3a8);
}
</style>
