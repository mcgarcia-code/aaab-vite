<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-person-lines-fill me-1"></i> Coordinadores: Base de datos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ arbitrosFiltrados.length }} árbitros</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6">
              <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                <option value="">Activo (Todos)</option>
                <option value="1">Sólo Activos</option>
                <option value="0">Sólo Inactivos</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.apto_medico" class="form-select form-select-sm shadow-none">
                <option value="">Apto (Todos)</option>
                <option value="1">Sólo Aptos</option>
                <option value="0">No Aptos</option>
              </select>
            </div>
            <div class="col-12">
              <select v-model="filtros.licencia" class="form-select form-select-sm shadow-none">
                <option value="">Licencia/Sanción (Todas)</option>
                <option value="sin_licencia">Sin Licencia</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="pendiente">Pendiente</option>
                <option value="sancion_vigente">Sanción Vigente</option>
                <option value="sancion_proceso">Sanción en Proceso</option>
              </select>
            </div>
            <div class="col-6">
              <input v-model="filtros.grupo" class="form-control form-control-sm shadow-none" placeholder="Grupo">
            </div>
            <div class="col-6">
              <input v-model="filtros.subgrupo" class="form-control form-control-sm shadow-none" placeholder="Sub-grupo">
            </div>
            <div class="col-12">
              <input v-model="filtros.zona" class="form-control form-control-sm shadow-none" placeholder="Zona...">
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-licencia">Licencia / Sanción</th>
                  <th class="py-3 text-center text-uppercase text-muted">Edad</th>
                  <th class="py-3 text-center text-uppercase text-muted">WS</th>
                  <th class="py-3 text-center text-uppercase text-muted">Activo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Apto</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Sub</th>
                  <th class="py-3 text-center text-uppercase text-muted">Zona</th>
                  <th class="py-3 text-center text-uppercase text-muted">Movilidad</th>
                  <th class="py-3 text-center text-uppercase text-muted">Sáb Disp</th>
                  <th class="py-3 text-uppercase text-muted">Desde</th>
                  <th class="py-3 text-uppercase text-muted">Hasta</th>
                  <th class="py-3 text-center text-uppercase text-muted">Dom Disp</th>
                  <th class="py-3 text-uppercase text-muted">Desde</th>
                  <th class="py-3 text-uppercase text-muted">Hasta</th>
                  <th class="py-3 text-center text-uppercase text-muted">Juega</th>
                  <th class="py-3 text-center text-uppercase text-muted">Club</th>
                  <th class="py-3 text-center text-uppercase text-muted">Cat</th>
                  <th class="py-3 text-center text-uppercase text-muted">Observaciones</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-licencia">
                    <select v-model="filtros.licencia" class="form-select form-select-sm shadow-none">
                      <option value="">Todas</option>
                      <option value="sin_licencia">Sin Lic.</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="sancion_vigente">Sanción Vig.</option>
                      <option value="sancion_proceso">Sanc. Proc.</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option value="1">SÍ</option>
                      <option value="0">NO</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.apto_medico" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option value="1">SÍ</option>
                      <option value="0">NO</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.grupo" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.subgrupo" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.zona" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.movilidad" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_sabado" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_domingo" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.juega_handball" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.donde_juega" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.categoria_handball" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.observaciones" class="form-control form-control-sm shadow-none"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosPaginados" :key="a.id" :class="obtenerClaseFila(a)">
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark col-fija col-licencia" style="white-space: nowrap; font-size: 0.7rem;">{{ obtenerTextoLicencia(a) }}</td>
                  <td class="text-center text-dark">{{ a.edad }}</td>
                  <td class="text-center">
                    <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn btn-success btn-sm p-1" title="Enviar WhatsApp">
                      <span class="material-icons" style="font-size: 14px;">chat</span>
                    </button>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="text-center">
                    <span v-if="a.es_activo" class="material-icons text-success" title="Activo" style="font-size: 18px;">check_circle</span>
                    <span v-else class="material-icons text-danger" title="Inactivo" style="font-size: 18px;">cancel</span>
                  </td>
                  <td class="text-center">
                    <span v-if="a.apto_medico" class="material-icons text-success" title="Apto Físico" style="font-size: 18px;">check_circle</span>
                    <span v-else class="material-icons text-danger" title="No Apto Físico" style="font-size: 18px;">cancel</span>
                  </td>
                  <td class="text-center text-dark">{{ a.grupo }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo }}</td>
                  <td class="text-dark">{{ a.zona }}</td>
                  <td class="text-dark">{{ a.movilidad }}</td>
                  <td class="text-center text-dark">{{ a.disponibilidad_sabado }}</td>
                  <td class="text-dark">{{ a.disponibilidad_sabado_desde }}</td>
                  <td class="text-dark">{{ a.disponibilidad_sabado_hasta }}</td>
                  <td class="text-center text-dark">{{ a.disponibilidad_domingo }}</td>
                  <td class="text-dark">{{ a.disponibilidad_domingo_desde }}</td>
                  <td class="text-dark">{{ a.disponibilidad_domingo_hasta }}</td>
                  <td class="text-center text-dark">{{ a.juega_handball }}</td>
                  <td class="text-dark">{{ a.donde_juega }}</td>
                  <td class="text-dark">{{ a.categoria_handball }}</td>
                  <td class="text-dark position-relative">
                    <span class="d-inline-block text-truncate observacion-texto" style="max-width: 180px;">
                      {{ a.observaciones || '-' }}
                    </span>
                    <div v-if="a.observaciones" class="observacion-tooltip">{{ a.observaciones }}</div>
                  </td>
                </tr>

                <tr v-if="arbitrosPaginados.length === 0">
                  <td colspan="21" class="text-center py-5 text-muted">
                    <span class="material-icons d-block mb-2" style="font-size: 40px;">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron registros.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="obtenerClaseFila(a)">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                <div class="text-dark fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                  <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                  {{ a.apellido }}, {{ a.nombre }} ({{ a.edad }} años)
                </div>
                <div class="text-xs fw-bold text-muted font-monospace">#{{ a.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between align-items-center mb-3 text-dark">
                  <span class="small"><strong>Gr:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                  <span class="small"><strong>Zona:</strong> {{ a.zona || '-' }}</span>
                </div>

                <div v-if="obtenerTextoLicencia(a) !== '-'" class="alert py-2 px-3 small fw-bold mb-3 d-flex align-items-center gap-2"
                     :class="((Number(a.tiene_aprobada) > 0) || a.sancion_vigente) ? 'alert-danger border-danger-subtle text-danger' : 'alert-warning border-warning-subtle text-warning-emphasis'">
                     <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                     <span class="text-break" style="white-space: normal; line-height: 1.3;">{{ obtenerTextoLicencia(a) }}</span>
                </div>

                <div class="bg-white p-2 rounded border small mb-3 border-light-subtle d-flex justify-content-between align-items-center">
                  <span class="text-dark d-flex align-items-center gap-1">
                    <strong>Apto Físico: </strong>
                    <span v-if="a.apto_medico" class="material-icons text-success align-middle" style="font-size: 16px;">check_circle</span>
                    <span v-else class="material-icons text-danger align-middle" style="font-size: 16px;">cancel</span>
                  </span>
                  <span class="text-dark"><strong>Juega:</strong> {{ a.juega_handball }} <span v-if="a.juega_handball === 'SI'">({{ a.donde_juega }})</span></span>
                </div>

                <div class="mb-3 text-dark small bg-white p-2 rounded border border-light-subtle">
                  <p class="mb-1"><strong>Sáb:</strong> {{ a.disponibilidad_sabado }} <span v-if="a.disponibilidad_sabado !== 'NO'">({{ a.disponibilidad_sabado_desde }}-{{ a.disponibilidad_sabado_hasta }})</span></p>
                  <p class="m-0"><strong>Dom:</strong> {{ a.disponibilidad_domingo }} <span v-if="a.disponibilidad_domingo !== 'NO'">({{ a.disponibilidad_domingo_desde }}-{{ a.disponibilidad_domingo_hasta }})</span></p>
                </div>

                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn btn-sm w-100 fw-bold shadow-sm mt-3 text-white d-flex align-items-center justify-content-center gap-2" style="background: #25d366;">
                  <span class="material-icons fs-6">chat</span> WhatsApp
                </button>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron registros.</p>
            </div>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModalExcel" @close="mostrarModalExcel = false" icono="description" colorIcono="bg-success-subtle text-success" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Exportar Listado</span>
          <div class="text-muted small mt-1">Marcá las columnas que querés incluir en el Excel</div>
        </div>
      </template>

      <div class="d-flex justify-content-between align-items-center mb-2 px-2 mt-1">
        <h6 class="fw-bold text-dark m-0 small text-uppercase">Columnas a incluir</h6>
        <div class="form-check m-0">
          <input class="form-check-input shadow-none" type="checkbox" id="checkAll" @change="toggleTodasColumnas($event.target.checked)" :checked="todasSeleccionadas">
          <label class="form-check-label small fw-bold text-primary" for="checkAll">Seleccionar Todas</label>
        </div>
      </div>

      <div class="row g-2 text-start mb-2 mx-auto shadow-sm p-3 rounded-3 bg-light border border-light-subtle" style="max-height: 250px; overflow-y: auto;">
        <div v-for="col in columnasExcel" :key="col.id" class="col-12 col-sm-6">
          <div class="form-check form-switch bg-white border p-2 rounded shadow-sm m-0">
            <input class="form-check-input ms-1 shadow-none" type="checkbox" role="switch" v-model="col.visible" :id="'col-'+col.id" style="cursor:pointer;">
            <label class="form-check-label ms-2 small fw-bold text-dark cursor-pointer" :for="'col-'+col.id">{{ col.label }}</label>
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="mostrarModalExcel = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button @click="ejecutarDescargaExcel" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="!algunaSeleccionada">
          <i class="bi bi-file-earmark-excel me-1"></i> DESCARGAR EXCEL
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, inject } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Coordinadores - Base de Datos | AAAB',
  meta: [
    { name: 'description', content: 'Base de datos de árbitros para coordinadores.' },
    { property: 'og:title', content: 'Coordinadores - Base de Datos | AAAB' },
    { property: 'og:description', content: 'Base de datos de árbitros para coordinadores.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const notificar = inject('notificar');

const arbitros = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  apellido: '', nombre: '', licencia: '', es_activo: '',
  apto_medico: '',
  grupo: '', subgrupo: '', zona: '', movilidad: '',
  disponibilidad_sabado: '', disponibilidad_domingo: '',
  juega_handball: '', donde_juega: '', categoria_handball: '', observaciones: '',
});

const paginaActual = ref(1);
const registrosPorPagina = 8;

const mostrarModalExcel = ref(false);

const columnasExcel = ref([
  { id: 'apellido', label: 'Apellido', visible: true },
  { id: 'nombre', label: 'Nombre', visible: true },
  { id: 'celular', label: 'Celular', visible: true },
  { id: 'licencia', label: 'Licencia / Sanción', visible: true },
  { id: 'edad', label: 'Edad', visible: false },
  { id: 'es_activo', label: 'Activo', visible: false },
  { id: 'apto_medico', label: 'Apto Médico', visible: false },
  { id: 'grupo', label: 'Grupo', visible: false },
  { id: 'subgrupo', label: 'Subgrupo', visible: false },
  { id: 'zona', label: 'Zona', visible: false },
  { id: 'movilidad', label: 'Movilidad', visible: false },
  { id: 'disponibilidad_sabado', label: 'Sáb Disp', visible: false },
  { id: 'sabado_rango', label: 'Sáb Rango', visible: false },
  { id: 'disponibilidad_domingo', label: 'Dom Disp', visible: false },
  { id: 'domingo_rango', label: 'Dom Rango', visible: false },
  { id: 'juega_handball', label: 'Juega Handball', visible: false },
  { id: 'donde_juega', label: 'Club', visible: false },
  { id: 'categoria_handball', label: 'Categoría', visible: false },
  { id: 'observaciones', label: 'Observaciones', visible: false },
]);

const todasSeleccionadas = computed(() => columnasExcel.value.every(c => c.visible));
const algunaSeleccionada = computed(() => columnasExcel.value.some(c => c.visible));

const toggleTodasColumnas = (val) => {
  columnasExcel.value.forEach(c => c.visible = val);
};

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const cargarDatos = async () => {
  try {
    const {payload} = await api.get({
      entity: "arbitros",
      action:"getArbitros"
    });

    let sancionesPayload = [];
    try {
      const resSanciones = await api.get({ entity: "sanciones", action: "obtenerSanciones" });
      sancionesPayload = resSanciones.payload || [];
    } catch(e) {
      console.error("Error al cargar sanciones:", e);
    }

    const sancionesMap = {};
    sancionesPayload.forEach(s => {
      if (s.estado_dinamico === 1 || s.estado_dinamico === 3) {
        if (!sancionesMap[s.id_arbitro]) {
          sancionesMap[s.id_arbitro] = s;
        } else {
          if (s.estado_dinamico === 1 && sancionesMap[s.id_arbitro].estado_dinamico === 3) {
            sancionesMap[s.id_arbitro] = s;
          }
        }
      }
    });

    arbitros.value = payload
      ? payload.map(a => {
          const sancion = sancionesMap[a.id];
          return {
            ...a,
            apto_medico: a.apto_medico == 1,
            sancion_vigente: sancion && sancion.estado_dinamico === 1,
            sancion_proceso: sancion && sancion.estado_dinamico === 3,
            sancion_hasta: sancion ? sancion.hasta_formateada : null,
            sancion_indefinida: sancion ? sancion.es_indefinido == 1 : false
          };
        })
      : [];
  } catch (err) {
    console.error("Error al cargar datos:", err);
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la tabla.', tipo: 'danger' });
  }
};

const obtenerClaseFila = (a) => {
  const tieneAprobada = Number(a.tiene_aprobada) > 0;
  const tieneRechazada = Number(a.tiene_rechazada) > 0;
  const tienePendiente = Number(a.tiene_pendiente) > 0;
  const esInactivo = a.es_activo == 0;

  if (esInactivo || tieneAprobada || a.sancion_vigente) {
    return 'fila-roja';
  }

  if (tieneRechazada || tienePendiente || a.sancion_proceso) return 'fila-amarilla';

  return '';
};

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const abrirWhatsApp = (numero) => {
  if (!numero) return;
  const limpio = String(numero).replace(/\D/g, '');
  const prefijo = limpio.startsWith('54') ? limpio : `54${limpio}`;
  window.open(`https://wa.me/${prefijo}`, '_blank');
};

const obtenerTextoLicencia = (a) => {
  let textos = [];

  const formatearVariasFechas = (cadenaFechas) => {
    if (!cadenaFechas) return '';
    return cadenaFechas
      .split(',')
      .map(f => f.trim())
      .sort((fechaA, fechaB) => new Date(fechaA) - new Date(fechaB))
      .map(f => mostrarFechaArg(f))
      .join(', ');
  };

  if (a.sancion_vigente) {
    const textoHasta = a.sancion_indefinida ? 'Indefinida' : a.sancion_hasta;
    textos.push(`SANCIONADO (Hasta: ${textoHasta || '-'})`);
  } else if (a.sancion_proceso) {
    textos.push(`SANC. EN PROCESO`);
  }

  if (Number(a.tiene_aprobada) > 0 && a.fecha_licencia_aprobada) {
    textos.push(`APR: ${formatearVariasFechas(a.fecha_licencia_aprobada)}`);
  }
  if (Number(a.tiene_pendiente) > 0 && a.fecha_licencia_pendiente) {
    textos.push(`PEN: ${formatearVariasFechas(a.fecha_licencia_pendiente)}`);
  }
  if (Number(a.tiene_rechazada) > 0 && a.fecha_licencia_rechazada) {
    textos.push(`REC: ${formatearVariasFechas(a.fecha_licencia_rechazada)}`);
  }

  return textos.length > 0 ? textos.join(' | ') : '-';
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const arbitrosFiltrados = computed(() => {
  const filtrados = arbitros.value.filter(a => {
    const cumpleTexto = Object.keys(filtros).every(key => {
      if (!filtros[key] || key === 'licencia' || key === 'apto_medico') return true;
      if (key === 'es_activo') return String(a[key]) === filtros[key];
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });

    let cumpleLicencia = true;
    if (filtros.licencia === 'aprobada') cumpleLicencia = Number(a.tiene_aprobada || 0) > 0;
    else if (filtros.licencia === 'rechazada') cumpleLicencia = Number(a.tiene_rechazada || 0) > 0;
    else if (filtros.licencia === 'pendiente') cumpleLicencia = Number(a.tiene_pendiente || 0) > 0;
    else if (filtros.licencia === 'sancion_vigente') cumpleLicencia = a.sancion_vigente === true;
    else if (filtros.licencia === 'sancion_proceso') cumpleLicencia = a.sancion_proceso === true;
    else if (filtros.licencia === 'sin_licencia') {
      cumpleLicencia = Number(a.tiene_aprobada || 0) === 0 &&
                       Number(a.tiene_rechazada || 0) === 0 &&
                       Number(a.tiene_pendiente || 0) === 0;
    }

    let cumpleApto = true;
    if (filtros.apto_medico !== '') {
      const valorFiltro = filtros.apto_medico === '1';
      cumpleApto = a.apto_medico === valorFiltro;
    }

    return cumpleTexto && cumpleLicencia && cumpleApto;
  });

  return filtrados.sort((a, b) => {
    const compApellido = (a.apellido || '').localeCompare(b.apellido || '');
    if (compApellido === 0) return (a.nombre || '').localeCompare(b.nombre || '');
    return compApellido;
  });
});

const totalPaginas = computed(() => Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina) || 1);

const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return arbitrosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
});

const exportarExcel = () => {
  mostrarModalExcel.value = true;
};

const ejecutarDescargaExcel = () => {
  const cols = columnasExcel.value.filter(c => c.visible);

  const datos = arbitrosFiltrados.value.map(a => {
    const fila = {};
    cols.forEach(col => {
      let valor = '';
      if (col.id === 'licencia') valor = obtenerTextoLicencia(a);
      else if (col.id === 'es_activo') valor = a.es_activo == 1 ? 'SI' : 'NO';
      else if (col.id === 'apto_medico') valor = a.apto_medico ? 'SI' : 'NO';
      else if (col.id === 'sabado_rango') valor = `${a.disponibilidad_sabado_desde || ''} a ${a.disponibilidad_sabado_hasta || ''}`;
      else if (col.id === 'domingo_rango') valor = `${a.disponibilidad_domingo_desde || ''} a ${a.disponibilidad_domingo_hasta || ''}`;
      else valor = a[col.id];

      fila[col.label] = valor || '';
    });
    return fila;
  });

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Base_Datos");
  XLSX.writeFile(wb, "Base_Datos_Coordinadores_AAAB.xlsx");

  mostrarModalExcel.value = false;
};

onMounted(cargarDatos);
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
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated {
  animation-duration: 0.5s;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* ====================================================
   TABLA CON COLUMNAS FIJAS
   ==================================================== */
.tabla-container {
  overflow-x: auto;
  max-height: 75vh;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

/* Eliminar bordes verticales de las celdas */
.tabla-fija th,
.tabla-fija td {
  border-left: none !important;
  border-right: none !important;
}

/* Columnas fijas con position: sticky */
.col-fija {
  position: sticky;
  background-color: inherit;
  z-index: 10;
}

/* Fondo para thead */
.tabla-fija thead .col-fija {
  background-color: #f8f9fa;
  z-index: 30;
}

/* Fondo para tbody */
.tabla-fija tbody .col-fija {
  background-color: #ffffff;
}

/* Posiciones de las columnas fijas */
.col-apellido {
  left: 0;
  min-width: 140px;
  z-index: 11;
}

.col-nombre {
  left: 140px;
  min-width: 140px;
  z-index: 11;
}

.col-licencia {
  left: 280px;
  min-width: 160px;
  z-index: 11;
}

/* Sombra visual en el borde derecho de la última columna fija */
.col-licencia::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.15), transparent);
}

/* ====================================================
   TOOLTIP OBSERVACIONES (Hover sin romper fila)
   ==================================================== */
.observacion-texto {
  cursor: help;
}

td:hover .observacion-tooltip {
  display: block;
}

.observacion-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  white-space: normal;
  max-width: 300px;
  z-index: 1000;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 5px;
}

.observacion-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

/* ====================================================
   COLORES DE FILAS
   ==================================================== */
.fila-roja td,
.fila-roja .col-fija {
  background-color: #fca5a5 !important;
  color: #000 !important;
}

.fila-amarilla td,
.fila-amarilla .col-fija {
  background-color: #fef08a !important;
  color: #000 !important;
}

/* Vista móvil: aplicar el mismo estado a la card completa */
.card.fila-roja,
.card.fila-roja .card-header,
.card.fila-roja .card-body,
.card.fila-roja .bg-white {
  background-color: #fca5a5 !important;
  color: #000 !important;
}

.card.fila-amarilla,
.card.fila-amarilla .card-header,
.card.fila-amarilla .card-body,
.card.fila-amarilla .bg-white {
  background-color: #fef08a !important;
  color: #000 !important;
}
</style>
