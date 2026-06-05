<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-calendar-check-fill me-1"></i> Control de Designaciones
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

            <button @click="mostrarModalSubida = true" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white">
              <span class="material-icons fs-6">cloud_upload</span>
              <span class="fw-bold d-none d-md-inline small">Publicar</span>
            </button>

            <button @click="solicitarLimpiarChecks" class="btn btn-danger shadow-sm py-2 d-flex align-items-center gap-2 text-white d-none d-md-flex">
              <span class="material-icons fs-6">check_box_outline_blank</span>
              <span class="fw-bold small">Tildes</span>
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
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
            <div class="col-6">
              <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                <option value="">Activo (Todos)</option><option value="1">Sólo Activos</option><option value="0">Sólo Inactivos</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.licencia" class="form-select form-select-sm shadow-none">
                <option value="">Licencia (Todas)</option><option value="sin_licencia">Sin Licencia</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option><option value="pendiente">Pendiente</option><option value="sancion_vigente">Sanción Vigente</option><option value="sancion_proceso">Sanción en Proceso</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.designado_sabado" class="form-select form-select-sm shadow-none">
                <option value="">Designado Sáb (Todos)</option><option value="1">Designados</option><option value="0">No Designados</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.designado_domingo" class="form-select form-select-sm shadow-none">
                <option value="">Designado Dom (Todos)</option><option value="1">Designados</option><option value="0">No Designados</option>
              </select>
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
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-sab">SÁB</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-dom">DOM</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-licencia">Licencia / Sanción</th>
                  <th class="py-3 text-center text-uppercase text-muted">WS</th>
                  <th class="py-3 text-center text-uppercase text-muted">Activo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Apto</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Sub</th>
                  <th class="py-3 text-center text-uppercase text-muted">Zona</th>
                  <th class="py-3 text-center text-uppercase text-muted">Movilidad</th>
                  <th class="py-3 text-center text-uppercase text-muted">Sab</th>
                  <th class="py-3 text-uppercase text-muted">Desde</th>
                  <th class="py-3 text-uppercase text-muted">Hasta</th>
                  <th class="py-3 text-center text-uppercase text-muted">Dom</th>
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
                  <td class="p-2 border-bottom border-2 text-center col-fija col-sab">
                    <select v-model="filtros.designado_sabado" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="1">SI</option><option value="0">NO</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2 text-center col-fija col-dom">
                    <select v-model="filtros.designado_domingo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="1">SI</option><option value="0">NO</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-licencia">
                    <select v-model="filtros.licencia" class="form-select form-select-sm shadow-none">
                      <option value="">Todas</option><option value="sin_licencia">Sin Lic.</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option><option value="pendiente">Pendiente</option><option value="sancion_vigente">Sanción Vig.</option><option value="sancion_proceso">Sanc. Proc.</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2"></td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="1">SÍ</option><option value="0">NO</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.apto_medico" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="1">SÍ</option><option value="0">NO</option>
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
                  <td class="text-center col-fija col-sab">
                    <input type="checkbox" :checked="designadosSabado.has(a.id)" :disabled="a.disponibilidad_sabado === 'NO'" @change="toggleDesignacion(a.id, 'S')" class="form-check-input" style="transform: scale(1.3); cursor:pointer;">
                  </td>
                  <td class="text-center col-fija col-dom">
                    <input type="checkbox" :checked="designadosDomingo.has(a.id)" :disabled="a.disponibilidad_domingo === 'NO'" @change="toggleDesignacion(a.id, 'D')" class="form-check-input" style="transform: scale(1.3); cursor:pointer;">
                  </td>
                  <td class="text-center text-dark col-fija col-licencia" style="white-space: nowrap; font-size: 0.7rem;">{{ obtenerTextoLicencia(a) }}</td>
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
                    <span class="d-inline-block text-truncate observacion-texto" style="max-width: 300px;">
                      {{ a.observaciones || '-' }}
                    </span>
                    <div v-if="a.observaciones" class="observacion-tooltip">{{ a.observaciones }}</div>
                  </td>
                </tr>

                <tr v-if="arbitrosPaginados.length === 0">
                  <td colspan="22" class="text-center py-5 text-muted bg-white border-0">
                    <span class="material-icons d-block mb-2 fs-1 opacity-50">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron registros.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 rounded-3 border-light-subtle" :class="obtenerClaseFila(a)">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                <div class="text-dark fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                  <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                  {{ a.apellido }}, {{ a.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
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
                    <strong>Apto: </strong>
                    <span v-if="a.apto_medico" class="material-icons text-success" style="font-size: 16px;">check_circle</span>
                    <span v-else class="material-icons text-danger" style="font-size: 16px;">cancel</span>
                  </span>
                  <span class="text-dark"><strong>Juega:</strong> {{ a.juega_handball }}</span>
                </div>

                <div class="mb-3 text-dark small bg-white p-2 rounded border border-light-subtle">
                  <p class="mb-1"><strong>Sáb:</strong> {{ a.disponibilidad_sabado }} <span v-if="a.disponibilidad_sabado === 'SI' || a.disponibilidad_sabado === 'OTROS'">({{ a.disponibilidad_sabado_desde }}-{{ a.disponibilidad_sabado_hasta }})</span></p>
                  <p class="m-0"><strong>Dom:</strong> {{ a.disponibilidad_domingo }} <span v-if="a.disponibilidad_domingo === 'SI' || a.disponibilidad_domingo === 'OTROS'">({{ a.disponibilidad_domingo_desde }}-{{ a.disponibilidad_domingo_hasta }})</span></p>
                </div>

                <div class="d-flex gap-2 mt-3 pt-3 border-top border-secondary-subtle">
                  <div class="flex-grow-1 bg-white p-2 rounded border shadow-sm d-flex flex-column align-items-center justify-content-center">
                    <label class="small fw-bold text-dark mb-2" :for="'sab-'+a.id">Designar SÁB</label>
                    <div class="form-check form-switch m-0">
                      <input class="form-check-input shadow-none" type="checkbox" role="switch" :id="'sab-'+a.id" :checked="designadosSabado.has(a.id)" :disabled="a.disponibilidad_sabado === 'NO'" @change="toggleDesignacion(a.id, 'S')" style="transform: scale(1.3); cursor:pointer;">
                    </div>
                  </div>
                  <div class="flex-grow-1 bg-white p-2 rounded border shadow-sm d-flex flex-column align-items-center justify-content-center">
                    <label class="small fw-bold text-dark mb-2" :for="'dom-'+a.id">Designar DOM</label>
                    <div class="form-check form-switch m-0">
                      <input class="form-check-input shadow-none" type="checkbox" role="switch" :id="'dom-'+a.id" :checked="designadosDomingo.has(a.id)" :disabled="a.disponibilidad_domingo === 'NO'" @change="toggleDesignacion(a.id, 'D')" style="transform: scale(1.3); cursor:pointer;">
                    </div>
                  </div>
                </div>

                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn btn-sm w-100 fw-bold shadow-sm mt-3 text-white d-flex align-items-center justify-content-center gap-2" style="background: #25d366;">
                  <span class="material-icons fs-6">chat</span> WhatsApp
                </button>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-white rounded shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2 fs-1">search_off</span>
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

    <ModalBase
      :show="mostrarModalSubida"
      titulo="Publicar Designaciones"
      icono="publish"
      colorIcono="bg-danger text-white"
      maxWidth="600px"
      @close="mostrarModalSubida = false"
    >
      <div class="mb-3">
        <label class="form-label small fw-bold">Torneo</label>
        <input
          v-model="formPublicar.torneo"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: TORNEO APERTURA"
        >
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Fecha</label>
        <input
          v-model="formPublicar.fecha"
          type="text"
          class="form-control shadow-none border-secondary-subtle"
          placeholder="Ej: 18 y 19 de Abril"
        >
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Archivo Excel</label>
        <input
          @change="manejarArchivo"
          type="file"
          class="form-control shadow-none border-secondary-subtle"
          accept=".xlsx,.xls"
        >
      </div>

      <template #footer>
        <button
          @click="mostrarModalSubida = false"
          class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
          :disabled="subiendoArchivo"
        >
          Cancelar
        </button>

        <button
          @click="enviarDesignaciones"
          class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
          :disabled="subiendoArchivo || !formPublicar.archivoBase64"
        >
          <span
            v-if="subiendoArchivo"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ subiendoArchivo ? 'Publicando...' : 'Publicar Ahora' }}
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
  title: 'Designaciones de Árbitros| AAAB',
  meta: [
    { name: 'description', content: 'Administra y controla las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:title', content: 'Designaciones de Árbitros | AAAB' },
    { property: 'og:description', content: 'Administra y controla las designaciones de árbitros para los partidos del fin de semana.' },
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
  designado_sabado: '',
  designado_domingo: '',
});

const mostrarModalSubida = ref(false);
const subiendoArchivo = ref(false);

const formPublicar = reactive({
  torneo: '',
  fecha: '',
  archivoBase64: '',
  nombreArchivo: ''
});

const manejarArchivo = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    formPublicar.archivoBase64 = reader.result;
    formPublicar.nombreArchivo = file.name;
  };
};

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const designadosSabado = ref(new Set());
const designadosDomingo = ref(new Set());

const paginaActual = ref(1);
const registrosPorPagina = 8;

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

    const resChecks = await api.get({
      entity: 'designaciones',
      action: 'obtener_tildes',
    });
    const listaTildes = resChecks.payload;

    if (listaTildes && Array.isArray(listaTildes)) {
      designadosSabado.value.clear();
      designadosDomingo.value.clear();

      listaTildes.forEach(item => {
        if (item.dia === 'S') designadosSabado.value.add(item.idarbitro);
        if (item.dia === 'D') designadosDomingo.value.add(item.idarbitro);
      });
    }
  } catch (err) {
    console.error("Error al cargar datos:", err);
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la tabla.', tipo: 'danger' });
  }
};

const toggleDesignacion = async (id, dia) => {
  const set = dia === 'S' ? designadosSabado.value : designadosDomingo.value;
  const nuevoValor = !set.has(id);

  if (nuevoValor) set.add(id); else set.delete(id);

  try {
    await api.post({
      entity: 'designaciones',
      action: 'actualizar_tilde',
      payload: { id_arbitro: id, dia: dia, checked: nuevoValor }
    });
  } catch (err) {
    console.error("Error al guardar tilde:", err);
    if (nuevoValor) set.delete(id); else set.add(id);
    notificar({ titulo: 'Error', mensaje: 'No se pudo guardar la designación.', tipo: 'danger' });
  }
};

const solicitarLimpiarChecks = () => {
  notificar({
    titulo: 'Limpiar Designaciones',
    mensaje: '¿Estás seguro que deseas limpiar todos los tildes de designación? Esta acción no se puede deshacer.',
    tipo: 'warning',
    alConfirmar: () => limpiarChecks()
  });
};

const limpiarChecks = async () => {
  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'limpiarTildesDesignaciones',
      payload: {}
    });

    if (res.ok || res.success) {
      designadosSabado.value.clear();
      designadosDomingo.value.clear();
      notificar({ titulo: 'Éxito', mensaje: 'Se limpiaron todas las designaciones.', tipo: 'success' });
    } else {
      throw new Error("Error del servidor");
    }
  } catch (err) {
    console.error("Error al limpiar tildes en BE:", err);
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al limpiar las designaciones.', tipo: 'danger' });
  }
};

const obtenerClaseFila = (a) => {
  const tieneAprobada = Number(a.tiene_aprobada) > 0;
  const tieneRechazada = Number(a.tiene_rechazada) > 0;
  const tienePendiente = Number(a.tiene_pendiente) > 0;
  const esInactivo = a.es_activo == 0;

  const tildadoSabado = designadosSabado.value.has(a.id);
  const tildadoDomingo = designadosDomingo.value.has(a.id);

  if ((tildadoSabado && tildadoDomingo) || esInactivo || tieneAprobada || a.sancion_vigente) {
    return 'fila-roja';
  }

  if (tieneRechazada || tienePendiente || a.sancion_proceso) return 'fila-amarilla';

  if (tildadoSabado || tildadoDomingo) return 'fila-des';
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
      if (!filtros[key] || key === 'licencia' || key === 'apto_medico' || key === 'designado_sabado' || key === 'designado_domingo') return true;
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

    let cumpleDesignadoSab = true;
    if (filtros.designado_sabado !== '') {
      cumpleDesignadoSab = (filtros.designado_sabado === '1') === designadosSabado.value.has(a.id);
    }

    let cumpleDesignadoDom = true;
    if (filtros.designado_domingo !== '') {
      cumpleDesignadoDom = (filtros.designado_domingo === '1') === designadosDomingo.value.has(a.id);
    }

    return cumpleTexto && cumpleLicencia && cumpleApto && cumpleDesignadoSab && cumpleDesignadoDom;
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

const enviarDesignaciones = async () => {
  if (!formPublicar.torneo || !formPublicar.fecha || !formPublicar.archivoBase64) {
    notificar({ titulo: 'Atención', mensaje: 'Completá todos los campos y seleccioná un archivo.', tipo: 'warning' });
    return;
  }

  subiendoArchivo.value = true;

  try {
    const res = await api.post({
      entity: 'designaciones',
      action: 'subirDesignaciones',
      payload: {
        torneo: formPublicar.torneo,
        fecha: formPublicar.fecha,
        archivoBase64: formPublicar.archivoBase64,
        nombreArchivo: formPublicar.nombreArchivo
      }
    });

    if (res.ok && res.payload && res.payload.success) {
      notificar({ titulo: 'Éxito', mensaje: res.payload.mensaje || 'Las designaciones ya están visibles para el público.', tipo: 'success' });

      mostrarModalSubida.value = false;
      formPublicar.torneo = '';
      formPublicar.fecha = '';
      formPublicar.archivoBase64 = '';
      formPublicar.nombreArchivo = '';
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor al subir designaciones.');
    }
  } catch (error) {
    console.error("Error al publicar:", error);
    notificar({ titulo: 'Error', mensaje: error.message || 'Hubo un problema al subir las designaciones.', tipo: 'danger' });
  } finally {
    subiendoArchivo.value = false;
  }
};

const exportarExcel = () => {
  const datos = arbitrosFiltrados.value.map(a => ({
    APELLIDO: a.apellido, NOMBRE: a.nombre,
    CELULAR: a.celular,
    SAB_DESIGNADO: designadosSabado.value.has(a.id) ? 'SI' : 'NO',
    DOM_DESIGNADO: designadosDomingo.value.has(a.id) ? 'SI' : 'NO',
    LICENCIA_O_SANCION: obtenerTextoLicencia(a),
    ACTIVO: a.es_activo == 1 ? 'SI' : 'NO',
    ZONA: a.zona, MOVILIDAD: a.movilidad,
    SAB_DISP: a.disponibilidad_sabado, SAB_HORA: `${a.disponibilidad_sabado_desde} a ${a.disponibilidad_sabado_hasta}`,
    DOM_DISP: a.disponibilidad_domingo, DOM_HORA: `${a.disponibilidad_domingo_desde} a ${a.disponibilidad_domingo_hasta}`,
    JUEGA: a.juega_handball, CLUB: a.donde_juega, OBS: a.observaciones
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Designaciones");
  XLSX.writeFile(wb, "Planilla_Designaciones_AAAB.xlsx");
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
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated {
  animation-duration: 0.5s;
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

/* Base de columnas fijas */
.col-fija {
  position: sticky;
  background-color: inherit;
}

/* THEAD: Cabecera por encima de todo (z-index: 12) para tapar datos al scrollear hacia abajo */
.tabla-fija thead .col-fija {
  background-color: #f8f9fa !important;
  z-index: 12 !important;
}

/* TBODY: Datos por debajo de la cabecera (z-index: 10) */
.tabla-fija tbody .col-fija {
  background-color: #ffffff;
  z-index: 10 !important;
}

/* Respetamos el color si la fila está coloreada dinámicamente */
.tabla-fija tbody tr.fila-roja .col-fija { background-color: #fca5a5 !important; }
.tabla-fija tbody tr.fila-amarilla .col-fija { background-color: #fef08a !important; }
.tabla-fija tbody tr.fila-des .col-fija { background-color: #93e2ab !important; }

/* Posiciones EXACTAS de las columnas (Sin z-index extra) */
.col-apellido {
  left: 0;
  min-width: 140px;
}

.col-nombre {
  left: 140px;
  min-width: 140px;
}

.col-sab {
  left: 280px;
  min-width: 50px;
  width: 50px;
}

.col-dom {
  left: 330px;
  min-width: 50px;
  width: 50px;
}

.col-licencia {
  left: 380px;
  min-width: 160px;
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
   COLORES DE FILAS DINAMICAS
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

.fila-des td,
.fila-des .col-fija {
  background-color: #93e2ab !important;
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

.card.fila-des,
.card.fila-des .card-header,
.card.fila-des .card-body,
.card.fila-des .bg-white {
  background-color: #93e2ab !important;
  color: #000 !important;
}
</style>
