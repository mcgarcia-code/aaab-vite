<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard-check-fill me-1"></i> Informes de partidos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ informesFiltrados.length }} registros</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerInformes" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Informes</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2 flex-md-nowrap">
            <div class="col-6 col-md-1">
              <input v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="DD/MM/AAAA">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.encuentro" class="form-control form-control-sm shadow-none" placeholder="Encuentro...">
            </div>
            <div class="col-6 col-md-1">
              <input v-model="filtros.arbitros" class="form-control form-control-sm shadow-none" placeholder="Árbitros...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.implicado" class="form-control form-control-sm shadow-none" placeholder="Implicado...">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.torneo" class="form-select form-select-sm shadow-none" :class="{ 'text-muted': !filtros.torneo }">
                <option value="">TORNEO</option>
                <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none" :class="{ 'text-muted': !filtros.estado }">
                <option value="">ESTADO</option>
                <option value="creado">Creado</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="desestimado">Desestimado</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select v-model="filtros.larry" class="form-select form-select-sm shadow-none" :class="{ 'text-muted': !filtros.larry }">
                <option value="">LARRY</option>
                <option value="si">Cargado</option>
                <option value="no">Sin cargar</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select v-model="filtros.anio" class="form-select form-select-sm shadow-none">
                <option value="">AÑO</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando informes...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem; table-layout: fixed;">
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
                          <span class="material-icons" style="font-size:16px;">visibility</span>
                        </button>
                        <button
                          @click="descargarPDF(inf)"
                          class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger"
                          title="Descargar PDF"
                          :disabled="descargandoId === inf.id"
                        >
                          <span v-if="descargandoId === inf.id" class="spinner-border spinner-border-sm" style="width:14px;height:14px;"></span>
                          <span v-else class="material-icons" style="font-size:16px;">picture_as_pdf</span>
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
                      <span class="material-icons d-block fs-1 mb-2">fact_check</span>
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
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem; line-height: 1.2;">
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
                      <span class="material-icons" style="font-size: 18px;">visibility</span> Ver detalle
                    </button>
                    <button
                      @click="descargarPDF(inf)"
                      class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center gap-1 fw-bold"
                      :disabled="descargandoId === inf.id"
                    >
                      <span v-if="descargandoId === inf.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else class="material-icons" style="font-size: 18px;">picture_as_pdf</span> PDF
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="informesPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">fact_check</span>
                <p class="text-muted m-0 fw-bold">Todavía no hay informes cargados.</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- ==========================================
         MODAL DETALLE
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle del informe" icono="description" colorIcono="bg-danger text-white" maxWidth="640px">
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
            <div class="border rounded p-2 bg-light small text-break" style="white-space: pre-wrap;">{{ informeSel.motivo_descripcion }}</div>
          </div>
          <div class="col-6"><DatoDetalle :etiqueta="informeSel.delegado_tecnico ? 'Cargado por el delegado técnico' : 'Cargado por el árbitro'" :valor="formatearFechaHora(informeSel.creado_en)" /></div>
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
        <button
          v-if="informeSel"
          @click="descargarPDF(informeSel)"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          :disabled="descargandoId === informeSel.id"
        >
          <span v-if="descargandoId === informeSel.id" class="spinner-border spinner-border-sm"></span>
          <span v-else class="material-icons" style="font-size:18px;">picture_as_pdf</span> Descargar PDF
        </button>
        <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1">CERRAR</button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch, h } from 'vue';
import { api } from '@/api/api';
import html2pdf from 'html2pdf.js';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';

useHead({
  title: 'Informes | AAAB',
  meta: [{ name: 'description', content: 'Panel de administración de informes de partidos.' }],
});

const toast = inject('toast', ({ mensaje }) => alert(mensaje));

const DatoDetalle = (props) => h('div', {}, [
  h('label', { class: 'form-label small fw-bold text-muted mb-1' }, props.etiqueta),
  h('div', { class: 'fw-bold text-dark small text-break' }, props.valor)
]);
DatoDetalle.props = ['etiqueta', 'valor'];

/* ====================================================
   CATÁLOGOS
   ==================================================== */
const opcionesTorneo = [
  { valor: 'metropolitano_apertura', etiqueta: 'Metropolitano Apertura' },
  { valor: 'metropolitano_clausura', etiqueta: 'Metropolitano Clausura' },
  { valor: 'super_8', etiqueta: 'Super 8' },
  { valor: 'copa_campeones', etiqueta: 'Copa de Campeones' },
  { valor: 'desarrollo_apertura', etiqueta: 'Torneo Desarrollo Apertura' },
  { valor: 'desarrollo_clausura', etiqueta: 'Torneo Desarrollo Clausura' },
  { valor: 'otros', etiqueta: 'Otros' }
];
const etiquetaTorneo = (v) => (opcionesTorneo.find(t => t.valor === v) || {}).etiqueta || v;

/* Estados (píldoras) — en admin llegan creado, pendiente, aprobado y desestimado */
const etiquetaEstado = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e === 'desestimado') return 'DESESTIMADO';
  if (e === 'pendiente') return 'PENDIENTE';
  if (e === 'creado') return 'CREADO';
  return 'APROBADO';
};
const badgeEstado = (estado) => {
  const e = (estado || '').toLowerCase();
  if (e === 'desestimado') return 'estado-pill estado-desestimado';
  if (e === 'pendiente') return 'estado-pill estado-pendiente';
  if (e === 'creado') return 'estado-pill estado-creado';
  return 'estado-pill estado-aprobado';
};

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const informes = ref([]);
const cargando = ref(false);
const guardandoLarry = ref(null);

const filtros = reactive({ fecha: '', anio: '', torneo: '', estado: '', larry: '', encuentro: '', arbitros: '', implicado: '' });
const mostrarFiltrosMobile = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

/* ====================================================
   FECHAS
   ==================================================== */
const formatearFecha = (fechaIso) => {
  if (!fechaIso) return 'S/F';
  const [anio, mes, dia] = fechaIso.split(' ')[0].split('-');
  if (!anio || !mes || !dia) return fechaIso;
  return `${dia}/${mes}/${anio}`;
};

const formatearFechaHora = (fechaHora) => {
  if (!fechaHora) return '-';
  const [fecha, hora] = fechaHora.split(' ');
  return `${formatearFecha(fecha)}${hora ? ' ' + hora.slice(0, 5) : ''}`;
};

/* ====================================================
   FILTROS Y PAGINACIÓN
   ==================================================== */
const aniosDisponibles = computed(() => {
  const anios = new Set();
  informes.value.forEach(inf => {
    const anio = (inf.fecha_partido || '').substring(0, 4);
    if (anio) anios.add(anio);
  });
  return [...anios].sort((a, b) => b.localeCompare(a));
});

const informesFiltrados = computed(() => {
  return informes.value.filter(inf => {
    const matchFec = formatearFecha(inf.fecha_partido).includes(filtros.fecha);
    const matchAnio = !filtros.anio || (inf.fecha_partido || '').substring(0, 4) === filtros.anio;
    const matchTorneo = !filtros.torneo || inf.torneo === filtros.torneo;
    const matchEstado = !filtros.estado || (inf.estado || '').toLowerCase() === filtros.estado;
    const matchLarry = !filtros.larry
      || (filtros.larry === 'si' && !!inf.cargado_larry)
      || (filtros.larry === 'no' && !inf.cargado_larry);
    const matchEnc = normalizar(inf.encuentro).includes(normalizar(filtros.encuentro));
    const matchArb = normalizar(inf.arbitros).includes(normalizar(filtros.arbitros));
    const matchImp = normalizar(inf.implicado).includes(normalizar(filtros.implicado));

    return matchFec && matchAnio && matchTorneo && matchEstado && matchLarry && matchEnc && matchArb && matchImp;
  });
});

const totalPaginas = computed(() => Math.ceil(informesFiltrados.value.length / registrosPorPagina) || 1);
const informesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return informesFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

const cambiarPagina = (delta) => {
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
    setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
  }
};

const limpiarFiltros = () => { Object.keys(filtros).forEach(key => filtros[key] = ''); };

watch(filtros, () => { paginaActual.value = 1; }, { deep: true });
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo; });

/* ====================================================
   CARGA DE DATOS
   ==================================================== */
const obtenerInformes = async () => {
  cargando.value = true;
  try {
    const res = await api.get({ entity: 'informes', action: 'obtenerInformesAdmin' });
    if ((res && res.ok) || (res && res.success)) {
      informes.value = (res.payload || []).sort((a, b) => b.id - a.id);
    } else {
      informes.value = [];
      toast({ titulo: 'Sin datos', mensaje: 'No se pudieron cargar los informes.', tipo: 'warning' });
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Problema al cargar los informes.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

/* ====================================================
   CHECKBOX CARGADO EN LARRY
   ==================================================== */
const toggleLarry = async (inf, event) => {
  const nuevoValor = event.target.checked ? 1 : 0;
  guardandoLarry.value = inf.id;
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'marcarCargadoLarry',
      payload: { id_informe: inf.id, cargado_larry: nuevoValor }
    });
    if (res.ok || res.success) {
      inf.cargado_larry = nuevoValor;
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor');
    }
  } catch (err) {
    // Revertir el checkbox visual
    event.target.checked = !!inf.cargado_larry;
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo actualizar.', tipo: 'danger' });
  } finally {
    guardandoLarry.value = null;
  }
};

/* ====================================================
   DETALLE
   ==================================================== */
const mostrarDetalle = ref(false);
const informeSel = ref(null);
const verDetalle = (inf) => { informeSel.value = inf; mostrarDetalle.value = true; };
const cerrarDetalle = () => { mostrarDetalle.value = false; informeSel.value = null; };

/* ====================================================
   DESCARGAR PDF
   ==================================================== */
const descargandoId = ref(null);

/* ====================================================
   DESCARGAR ARCHIVOS ADJUNTOS
   ==================================================== */
const descargandoArchivo = ref(null);

const descargarArchivo = async (arc) => {
  if (!arc || !arc.url_completa) return;
  descargandoArchivo.value = arc.url_completa;
  try {
    const resp = await fetch(arc.url_completa);
    if (!resp.ok) throw new Error('No se pudo descargar el archivo');
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = arc.archivo_nombre || 'archivo';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error al descargar archivo:', err);
    // Fallback: abrir en pestaña nueva
    window.open(arc.url_completa, '_blank');
  } finally {
    descargandoArchivo.value = null;
  }
};

const escapar = (v) => String(v ?? '-')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const filaPDF = (etiqueta, valor) => `
  <tr>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f8f9fa;font-weight:bold;width:38%;color:#334155;">${escapar(etiqueta)}</td>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#111;">${escapar(valor)}</td>
  </tr>`;

const descargarPDF = async (inf) => {
  descargandoId.value = inf.id;
  try {
    const contenedor = document.createElement('div');
    contenedor.style.padding = '28px';
    contenedor.style.fontFamily = 'Arial, Helvetica, sans-serif';
    contenedor.style.color = '#111';
    contenedor.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid #dc2626;padding-bottom:14px;margin-bottom:18px;">
        <img src="https://arbitroshandball.com.ar/logo.png" style="height:56px;" crossorigin="anonymous"
             onerror="this.style.display='none'">
        <div>
          <h1 style="margin:0;font-size:20px;color:#dc2626;">Informe de Partido</h1>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Asociación Argentina de Árbitros de Balonmano</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:12px;color:#64748b;">
          <div><strong>Informe #${escapar(inf.id)}</strong></div>
          <div>Estado: ${escapar(etiquetaEstado(inf.estado))}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${filaPDF('Fecha del partido', formatearFecha(inf.fecha_partido))}
        ${filaPDF('Torneo', etiquetaTorneo(inf.torneo))}
        ${filaPDF('Categoría', inf.categoria || '-')}
        ${filaPDF('Encuentro', inf.encuentro)}
        ${filaPDF('Árbitros', inf.arbitros || '-')}
        ${inf.delegado_tecnico ? filaPDF('Delegado técnico (cargó el informe)', inf.delegado_tecnico) : ''}
        ${filaPDF('Implicado', inf.implicado)}
        ${filaPDF('Sanción', inf.sancion)}
        ${filaPDF('Institución a la que pertenece', inf.institucion_nombre)}
      </table>

      <div style="margin-top:16px;">
        <div style="font-weight:bold;font-size:13px;color:#334155;margin-bottom:6px;">Motivo y descripción</div>
        <div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:13px;line-height:1.5;white-space:pre-wrap;background:#fff;">${escapar(inf.motivo_descripcion)}</div>
      </div>

      <div style="margin-top:22px;font-size:11px;color:#94a3b8;border-top:1px solid #e5e7eb;padding-top:10px;">
        Cargado por ${inf.delegado_tecnico ? 'el delegado técnico' : 'el árbitro'} el ${escapar(formatearFechaHora(inf.creado_en))}.
        Documento generado el ${escapar(new Date().toLocaleDateString('es-AR'))}.
      </div>
    `;

    const opciones = {
      margin: 10,
      filename: `Informe_${inf.id}_${(inf.encuentro || '').replace(/[^\w]+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opciones).from(contenedor).save();
  } catch (err) {
    console.error('Error al generar PDF:', err);
    toast({ titulo: 'Error', mensaje: 'No se pudo generar el PDF.', tipo: 'danger' });
  } finally {
    descargandoId.value = null;
  }
};

onMounted(obtenerInformes);
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
    background-color: #f8f9fa !important;
    z-index: 12;
  }

  .tabla-fija tbody .col-fija {
    background-color: #ffffff !important;
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
  background-color: #e3f5e6;
  color: #2f8a45;
  border-color: #bfe6c8;
}

/* CREADO — celeste */
.estado-creado {
  background-color: #dceefb;
  color: #1c6ea4;
  border-color: #b6dcf5;
}

/* PENDIENTE — amarillo */
.estado-pendiente {
  background-color: #fdf3d3;
  color: #a6841f;
  border-color: #f2e2a5;
}

/* DESESTIMADO — naranja */
.estado-desestimado {
  background-color: #fdecd8;
  color: #b5691a;
  border-color: #f6d3a8;
}
</style>
