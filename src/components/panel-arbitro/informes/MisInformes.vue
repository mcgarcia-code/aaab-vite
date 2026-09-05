<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard-data-fill me-1"></i> Mis Informes
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
            <div class="col-6 col-md-2">
              <input v-model="filtros.implicado" class="form-control form-control-sm shadow-none" placeholder="Implicado...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.categoria" class="form-control form-control-sm shadow-none" placeholder="Categoría...">
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
                <option value="anulado">Anulado</option>
                <option value="desestimado">Desestimado</option>
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
            <p class="text-muted mt-3 fw-bold">Cargando tus informes...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem; table-layout: fixed;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 120px;">Acciones</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-fecha" style="width: 110px;">Fecha</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 220px;">Encuentro</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 130px;">Categoría</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 180px;">Torneo</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 160px;">Implicado</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 140px;">Sanción</th>
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
                          <span class="material-icons" style="font-size:16px;">visibility</span>
                        </button>
                        <button
                          v-if="puedeEditar(inf)"
                          @click="abrirEdicion(inf)"
                          class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary"
                          title="Editar"
                        >
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button
                          v-if="puedeAnular(inf)"
                          @click="pedirAnular(inf)"
                          class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger"
                          title="Anular informe"
                        >
                          <span class="material-icons" style="font-size:16px;">block</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-center fw-bold col-fija col-fecha">{{ formatearFecha(inf.fecha_partido) }}</td>
                    <td class="fw-bold text-uppercase text-dark text-truncate" :title="inf.encuentro" style="max-width: 220px;">{{ inf.encuentro }}</td>
                    <td class="text-dark text-truncate" :title="inf.categoria" style="max-width: 130px;">{{ inf.categoria || '-' }}</td>
                    <td class="text-dark text-truncate" :title="etiquetaTorneo(inf.torneo)" style="max-width: 180px;">{{ etiquetaTorneo(inf.torneo) }}</td>
                    <td class="text-dark text-truncate" :title="inf.implicado" style="max-width: 160px;">{{ inf.implicado }}</td>
                    <td class="text-dark text-truncate" :title="inf.sancion" style="max-width: 140px;">{{ inf.sancion }}</td>
                    <td class="text-center">
                      <span :class="badgeEstado(inf.estado)">{{ etiquetaEstado(inf.estado) }}</span>
                    </td>
                    <td class="text-center pe-3 text-muted">{{ formatearFechaHora(inf.creado_en) }}</td>
                  </tr>
                  <tr v-if="informesPaginados.length === 0">
                    <td colspan="10" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">description</span>
                      <p class="m-0 fw-bold">Todavía no cargaste ningún informe.</p>
                      <p class="small m-0 mt-1">Podés cargar informes desde "Mis Designaciones".</p>
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
                    <p class="m-0 text-dark small mt-1"><strong class="text-muted">Sanción:</strong> {{ inf.sancion }}</p>
                    <p class="m-0 text-dark small mt-1">
                      <strong class="text-muted">Categoría:</strong>
                      <span class="badge bg-secondary ms-1">{{ inf.categoria || '-' }}</span>
                    </p>
                    <div class="d-flex justify-content-end mt-2 border-top border-secondary-subtle pt-2">
                      <span class="text-muted small">Cargado: {{ formatearFechaHora(inf.creado_en) }}</span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button @click="verDetalle(inf)" class="btn btn-sm btn-outline-secondary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 18px;">visibility</span> Ver detalle
                    </button>
                    <button
                      v-if="puedeEditar(inf)"
                      @click="abrirEdicion(inf)"
                      class="btn btn-sm btn-outline-primary shadow-sm px-3 d-flex justify-content-center align-items-center"
                      title="Editar"
                    >
                      <span class="material-icons" style="font-size: 18px;">edit</span>
                    </button>
                    <button
                      v-if="puedeAnular(inf)"
                      @click="pedirAnular(inf)"
                      class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center"
                      title="Anular informe"
                    >
                      <span class="material-icons" style="font-size: 18px;">block</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="informesPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">description</span>
                <p class="text-muted m-0 fw-bold">Todavía no cargaste ningún informe.</p>
                <p class="text-muted small m-0 mt-1">Podés cargar informes desde "Mis Designaciones".</p>
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
          <div class="col-6"><DatoDetalle etiqueta="Implicado" :valor="informeSel.implicado" /></div>
          <div class="col-6"><DatoDetalle etiqueta="Sanción" :valor="informeSel.sancion" /></div>
          <div class="col-12"><DatoDetalle etiqueta="Institución" :valor="informeSel.institucion_nombre" /></div>
          <div class="col-12">
            <label class="form-label small fw-bold text-muted mb-1">Motivo y descripción</label>
            <div class="border rounded p-2 bg-light small text-break" style="white-space: pre-wrap;">{{ informeSel.motivo_descripcion }}</div>
          </div>
          <div class="col-12">
            <DatoDetalle etiqueta="Cargado" :valor="formatearFechaHora(informeSel.creado_en)" />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          v-if="informeSel && puedeAnular(informeSel)"
          @click="pedirAnularDesdeDetalle"
          class="btn btn-outline-danger rounded-pill px-4 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-1"
        >
          <span class="material-icons" style="font-size:18px;">block</span> Anular
        </button>
        <button
          v-if="informeSel && puedeEditar(informeSel)"
          @click="editarDesdeDetalle"
          class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
        >
          <span class="material-icons" style="font-size:18px;">edit</span> Editar
        </button>
        <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1">Cerrar</button>
      </template>
    </ModalBase>

    <!-- ==========================================
         MODAL EDICIÓN
         ========================================== -->
    <ModalBase :show="mostrarEdicion" @close="cerrarEdicion" titulo="Editar informe" icono="edit" colorIcono="bg-primary text-white" maxWidth="640px">
      <div v-if="informeEdit" class="text-start">

        <!-- Datos automáticos (solo lectura) -->
        <div class="row g-2 mb-3">
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Fecha</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="formatearFecha(informeEdit.fecha_partido)" readonly>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Categoría</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="informeEdit.categoria || '-'" readonly>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-dark mb-1">Encuentro</label>
            <input type="text" class="form-control form-control-sm bg-light input-readonly" :value="informeEdit.encuentro" readonly>
          </div>
        </div>

        <hr class="my-3">

        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Torneo *</label>
          <select v-model="formEdit.torneo" class="form-select form-select-sm shadow-none">
            <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
          </select>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Implicado *</label>
            <input v-model="formEdit.implicado" type="text" class="form-control form-control-sm shadow-none">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold text-dark mb-1">Sanción *</label>
            <input v-model="formEdit.sancion" type="text" class="form-control form-control-sm shadow-none">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold text-dark mb-1">Institución a la que pertenece *</label>
          <select v-model="formEdit.institucion" class="form-select form-select-sm shadow-none">
            <option value="local">{{ informeEdit.equipo_local }}</option>
            <option value="visitante">{{ informeEdit.equipo_visitante }}</option>
          </select>
        </div>
        <div class="mb-1">
          <label class="form-label small fw-bold text-dark mb-1">Motivo y descripción *</label>
          <textarea v-model="formEdit.motivo_descripcion" class="form-control shadow-none" rows="4"></textarea>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarEdicion" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1 border" :disabled="procesando">Cancelar</button>
        <button @click="guardarEdicion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="procesando || !edicionValida">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span> Guardar cambios
        </button>
      </template>
    </ModalBase>

    <!-- ==========================================
         MODAL: CONFIRMAR ANULACIÓN
         ========================================== -->
    <ModalBase :show="mostrarConfirmAnular" @close="cerrarAnular" titulo="Anular informe" icono="block" colorIcono="bg-danger text-white" maxWidth="480px">
      <div class="text-center">
        <p class="text-dark mb-1">¿Seguro que querés anular este informe?</p>
        <p class="text-muted small mb-0" v-if="infoAAnular">
          #{{ infoAAnular.id }} — {{ infoAAnular.encuentro }}
        </p>
        <div class="alert alert-warning py-2 px-3 mt-3 mb-0 small">
          <i class="bi bi-exclamation-triangle me-1"></i>
          El informe quedará fuera del circuito y no llegará al coordinador. Solo se pueden anular informes en estado creado.
        </div>
      </div>
      <template #footer>
        <button @click="cerrarAnular" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1">CANCELAR</button>
        <button @click="confirmarAnular" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="anulando">
          <span v-if="anulando" class="spinner-border spinner-border-sm me-1"></span> ANULAR
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch, h } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';

useHead({
  title: 'Mis Informes | AAAB',
  meta: [
    { name: 'description', content: 'Consultá y editá los informes de partido que cargaste.' },
    { property: 'og:title', content: 'Mis Informes | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
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

/* ====================================================
   ESTADOS (píldoras)
   ==================================================== */
const etiquetaEstado = (estado) => {
  const e = (estado || 'creado').toLowerCase();
  if (e === 'aprobado') return 'APROBADO';
  if (e === 'desestimado') return 'DESESTIMADO';
  if (e === 'anulado') return 'ANULADO';
  if (e === 'pendiente') return 'PENDIENTE';
  return 'CREADO';
};

const badgeEstado = (estado) => {
  const e = (estado || 'creado').toLowerCase();
  if (e === 'aprobado') return 'estado-pill estado-aprobado';
  if (e === 'desestimado') return 'estado-pill estado-desestimado';
  if (e === 'anulado') return 'estado-pill estado-anulado';
  if (e === 'pendiente') return 'estado-pill estado-pendiente';
  return 'estado-pill estado-creado';
};

// El árbitro solo puede editar mientras el informe no fue resuelto
const puedeEditar = (inf) => inf.estado === 'creado' || inf.estado === 'pendiente';

// El árbitro solo puede anular su informe mientras esté en 'creado'
const puedeAnular = (inf) => inf.estado === 'creado';

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const informes = ref([]);
const cargando = ref(false);
const procesando = ref(false);

const filtros = reactive({ fecha: '', anio: '', estado: '', encuentro: '', implicado: '', categoria: '', torneo: '' });
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
    const matchEstado = !filtros.estado || (inf.estado || 'creado').toLowerCase() === filtros.estado;
    const matchTorneo = !filtros.torneo || inf.torneo === filtros.torneo;
    const matchEnc = normalizar(inf.encuentro).includes(normalizar(filtros.encuentro));
    const matchImp = normalizar(inf.implicado).includes(normalizar(filtros.implicado));
    const matchCat = normalizar(inf.categoria).includes(normalizar(filtros.categoria));

    return matchFec && matchAnio && matchEstado && matchTorneo && matchEnc && matchImp && matchCat;
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
    const res = await api.get({ entity: 'informes', action: 'obtenerMisInformes' });
    if ((res && res.ok) || (res && res.success)) {
      informes.value = (res.payload || []).sort((a, b) => b.id - a.id);
    } else {
      informes.value = [];
    }
  } catch (err) {
    console.error('Error al cargar mis informes:', err);
    toast({ titulo: 'Error', mensaje: 'No se pudieron cargar tus informes.', tipo: 'danger' });
  } finally {
    cargando.value = false;
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
   ANULACIÓN (por el propio árbitro, solo si está en 'creado')
   ==================================================== */
const mostrarConfirmAnular = ref(false);
const infoAAnular = ref(null);
const anulando = ref(false);

const pedirAnular = (inf) => {
  if (!puedeAnular(inf)) {
    toast({ titulo: 'No permitido', mensaje: 'Solo se pueden anular informes en estado creado.', tipo: 'warning' });
    return;
  }
  infoAAnular.value = inf;
  mostrarConfirmAnular.value = true;
};

const cerrarAnular = () => { mostrarConfirmAnular.value = false; infoAAnular.value = null; };

// Desde el modal de detalle: cerramos el detalle y abrimos la confirmación
const pedirAnularDesdeDetalle = () => {
  const inf = informeSel.value;
  cerrarDetalle();
  pedirAnular(inf);
};

const confirmarAnular = async () => {
  if (!infoAAnular.value) return;
  const inf = infoAAnular.value;
  anulando.value = true;
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'cambiarEstadoInforme',
      payload: { id_informe: inf.id, estado: 'anulado' }
    });
    if (res.ok || res.success) {
      const idx = informes.value.findIndex(i => i.id === inf.id);
      if (idx !== -1) informes.value[idx].estado = 'anulado';
      cerrarAnular();
      toast({ titulo: 'Informe anulado', mensaje: 'Tu informe fue anulado correctamente.', tipo: 'success' });
    } else {
      toast({ titulo: 'No se pudo anular', mensaje: (res && res.message) || 'El informe no pudo anularse.', tipo: 'danger' });
    }
  } catch (err) {
    console.error('Error al anular informe:', err);
    toast({ titulo: 'Error', mensaje: err.message || 'Fallo de conexión al anular.', tipo: 'danger' });
  } finally {
    anulando.value = false;
  }
};

/* ====================================================
   EDICIÓN
   ==================================================== */
const mostrarEdicion = ref(false);
const informeEdit = ref(null);
const formEdit = reactive({ torneo: '', implicado: '', sancion: '', institucion: '', motivo_descripcion: '' });

const edicionValida = computed(() =>
  formEdit.torneo && formEdit.implicado.trim() && formEdit.sancion.trim() && formEdit.institucion && formEdit.motivo_descripcion.trim()
);

const abrirEdicion = (inf) => {
  informeEdit.value = inf;
  formEdit.torneo = inf.torneo || '';
  formEdit.implicado = inf.implicado || '';
  formEdit.sancion = inf.sancion || '';
  formEdit.institucion = inf.institucion || '';
  formEdit.motivo_descripcion = inf.motivo_descripcion || '';
  mostrarEdicion.value = true;
};
const cerrarEdicion = () => { mostrarEdicion.value = false; informeEdit.value = null; };

// Abrir edición directamente desde el modal de detalle
const editarDesdeDetalle = () => {
  const inf = informeSel.value;
  cerrarDetalle();
  abrirEdicion(inf);
};

const guardarEdicion = async () => {
  if (!edicionValida.value || !informeEdit.value) return;
  const inf = informeEdit.value;
  const institucionNombre = formEdit.institucion === 'local' ? inf.equipo_local : inf.equipo_visitante;

  procesando.value = true;
  try {
    const res = await api.post({
      entity: 'informes',
      action: 'actualizarInforme',
      payload: {
        id_informe: inf.id,
        torneo: formEdit.torneo,
        implicado: formEdit.implicado.trim(),
        sancion: formEdit.sancion.trim(),
        institucion: formEdit.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: formEdit.motivo_descripcion.trim()
      }
    });
    if (res.ok || res.success) {
      Object.assign(inf, {
        torneo: formEdit.torneo,
        implicado: formEdit.implicado.trim(),
        sancion: formEdit.sancion.trim(),
        institucion: formEdit.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: formEdit.motivo_descripcion.trim()
      });
      cerrarEdicion();
      toast({ titulo: 'Informe actualizado', mensaje: 'Se guardaron los cambios.', tipo: 'success' });
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor');
    }
  } catch (err) {
    console.error('Error al editar informe:', err);
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo guardar.', tipo: 'danger' });
  } finally {
    procesando.value = false;
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

/* Inputs de solo lectura: sin borde azul de foco */
.input-readonly { cursor: default; }
.input-readonly:focus { border-color: #dee2e6; box-shadow: none; }

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
  .col-acciones { left: 50px; min-width: 120px !important; max-width: 120px !important; }
  .col-fecha    {
    left: 170px;
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

/* APROBADO — verde */
.estado-aprobado {
  background-color: #e3f5e6;
  color: #2f8a45;
  border-color: #bfe6c8;
}

/* ANULADO — gris azulado */
.estado-anulado {
  background-color: #eef1f5;
  color: #5b6b7f;
  border-color: #d4dbe4;
}

/* DESESTIMADO — naranja */
.estado-desestimado {
  background-color: #fdecd8;
  color: #b5691a;
  border-color: #f6d3a8;
}
</style>
