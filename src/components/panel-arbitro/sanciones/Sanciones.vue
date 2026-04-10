<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="header-section shadow-sm mb-4 p-3 bg-white rounded" style="border-left: 5px solid #dc2626;">
        <div class="d-flex justify-content-between align-items-center w-100">
          <div class="header-info">
            <h2 class="title d-flex align-items-center gap-2 m-0 fs-5">
              <span class="material-icons text-danger" style="transform: rotate(-15deg);">gavel</span> Mis Sanciones
            </h2>
            <span class="counter text-dark mt-1 d-block" style="font-size: 0.85rem;">
              Total: {{ sancionesFiltradas.length }} resoluciones en tu legajo
            </span>
          </div>
          
          <div class="header-actions d-flex gap-2 align-items-center">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex shadow-sm rounded border-0 p-2 d-flex align-items-center justify-content-center text-white" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">filter_alt</span>
            </button>
            
            <button @click="obtenerSancionesLocales" class="btn-refresh bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center" title="Actualizar" style="background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
              <span class="material-icons" style="font-size: 22px; color: #0f172a;">refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="small fw-bold text-muted text-uppercase">Filtrar Sanciones</span>
          <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
            <span class="material-icons" style="font-size: 20px;">close</span>
          </button>
        </div>
        <div class="filter-grid-mobile">
          <select v-model="filtros.estado" class="full-width">
            <option value="">Estado (Todos)</option>
            <option value="vigente">Vigente</option>
            <option value="cumplida">Cumplida</option>
            <option value="en_proceso">En Proceso</option>
            <option value="anulada">Anulada</option>
          </select>
          <input v-model="filtros.sancion" placeholder="Buscar Sanción...">
          <input v-model="filtros.motivo_articulo" placeholder="Motivo / Art...">
          <input type="text" v-model="filtros.desde" placeholder="Desde (DD/MM/AAAA)">
          <input type="text" v-model="filtros.hasta" placeholder="Hasta (DD/MM/AAAA)">
        </div>
        <div class="d-flex gap-2 mt-3">
          <button @click="limpiarFiltros" class="btn btn-light w-50 fw-bold border">Limpiar</button>
          <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-50 fw-bold border-0" style="background-color: #3b82f6;">Aplicar</button>
        </div>
      </div>

      <div class="alert alert-secondary border-0 shadow-sm mb-4">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-4 text-secondary"></i>
          <div class="small text-dark lh-sm">
            Las resoluciones del Tribunal de Ética son de cumplimiento obligatorio según el reglamento vigente.
            Para consultas, comunicate a <a href="mailto:etica@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">etica@arbitroshandball.com.ar</a>
          </div>
        </div>
      </div>

      <div v-if="cargando" class="text-center text-white my-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="mt-2 text-muted">Buscando en legajo...</p>
      </div>

      <div v-else-if="sancionesFiltradas.length === 0" class="text-center p-5 bg-white rounded shadow-sm border mt-4">
        <span class="material-icons text-success" style="font-size: 60px;">verified</span>
        <h5 class="fw-bold text-dark mt-3">Sin resultados</h5>
        <p class="text-muted small m-0">No se encontraron medidas disciplinarias con los filtros aplicados.</p>
      </div>

      <div v-else>
        <div class="table-container shadow desktop-only">
          <table>
            <thead>
              <tr class="main-header">
                <th class="sticky-col col-id text-center" style="width: 130px;">Estado</th>
                <th style="width: 160px;">Sanción</th>
                <th>Motivo / Art.</th>
                <th class="text-center" style="width: 140px;">Desde</th>
                <th class="text-center" style="width: 140px;">Hasta</th>
              </tr>
              <tr class="filter-row">
                <td class="sticky-col col-id text-center">
                  <select v-model="filtros.estado" class="filter-input text-center shadow-none w-100">
                    <option value="">TODOS</option>
                    <option value="vigente">VIGENTE</option>
                    <option value="cumplida">CUMPLIDA</option>
                    <option value="en_proceso">EN PROCESO</option>
                    <option value="anulada">ANULADA</option>
                  </select>
                </td>
                <td><input v-model="filtros.sancion" class="filter-input shadow-none w-100" placeholder="Filtrar.."></td>
                <td><input v-model="filtros.motivo_articulo" class="filter-input shadow-none w-100" placeholder="Filtrar.."></td>
                <td><input v-model="filtros.desde" class="filter-input text-center shadow-none w-100" placeholder="DD/MM/AAAA"></td>
                <td><input v-model="filtros.hasta" class="filter-input text-center shadow-none w-100" placeholder="DD/MM/AAAA"></td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sancionesPaginadas" :key="s.id">
                <td class="sticky-col col-id text-center cell-ro">
                  <span :class="obtenerClaseEstado(s.estado_dinamico)">
                    {{ obtenerTextoEstado(s.estado_dinamico) }}
                  </span>
                </td>
                <td class="cell-ro">
                  <span :class="obtenerClaseTextoSancion(s.estado_dinamico)">{{ s.sancion }}</span>
                </td>
                <td class="cell-ro text-wrap" style="min-width: 250px;">
                  <span class="fw-bold text-dark" v-if="s.articulo">Art. {{ s.articulo }} - </span>
                  <span class="text-muted">{{ s.motivo }}</span>
                </td>
                <td class="text-center cell-ro fw-bold text-dark">{{ s.desde_formateada || '-' }}</td>
                <td class="text-center cell-ro fw-bold" :class="s.estado_dinamico == 3 ? 'text-muted' : 'text-danger'">
                  <span v-if="s.es_indefinido == 1">Indefinido</span>
                  <span v-else>{{ s.hasta_formateada || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-only mt-3">
          <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card-licencia shadow-sm border">
            
            <div class="card-header border-bottom-0 pb-2 px-3 pt-3">
              <div class="d-flex justify-content-start align-items-center gap-2">
                <span :class="obtenerClaseTextoSancion(s.estado_dinamico)" style="font-size: 1.1rem;">
                  {{ s.sancion }}
                </span>
                <span :class="obtenerClaseEstado(s.estado_dinamico, true)" style="font-size: 0.7rem; padding: 3px 10px;">
                  {{ obtenerTextoEstado(s.estado_dinamico) }}
                </span>
              </div>
            </div>

            <div class="card-body pt-0 px-3 pb-3">
              <p class="text-dark mb-3 mt-2 lh-sm" style="font-size: 0.9rem;">
                <span v-if="s.articulo" class="fw-bold text-dark">Art. {{ s.articulo }}</span>
                <span v-if="s.articulo && s.motivo"> - </span>
                <span class="text-muted">{{ s.motivo }}</span>
              </p>
              
              <div class="bg-light p-2 rounded border d-flex justify-content-between align-items-center" style="background-color: #f8fafc !important;">
                <span class="text-dark" style="font-size: 0.85rem;">Desde: <strong class="text-dark">{{ s.desde_formateada || '-' }}</strong></span>
                <span class="text-dark" style="font-size: 0.85rem;">Hasta: 
                  <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                  <strong class="text-danger" v-else-if="s.hasta_formateada">{{ s.hasta_formateada }}</strong>
                  <strong class="text-muted" v-else>-</strong>
                </span>
              </div>
            </div>

          </div>
        </div>

        <div class="paginacion" v-if="totalPaginas > 1">
          <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
          <span class="paginacion-texto text-dark">Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { auth } from '@/api/auth';
import { api }  from '@/api/api';

const arbitro = ref(auth.getUser() || {});
const sanciones = ref([]);
const cargando = ref(false);

const filtros = reactive({
  motivo_articulo: '',
  sancion: '',
  desde: '',
  hasta: '',
  estado: ''
});
const mostrarFiltrosMobile = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

const limpiarFiltros = () => {
  filtros.motivo_articulo = ''; filtros.sancion = ''; filtros.desde = ''; filtros.hasta = ''; filtros.estado = '';
};

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

// ==========================================
// LÓGICA VISUAL DE ESTADOS Y SANCIONES (Mapeada con el Backend)
// ==========================================
const obtenerTextoEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'VIGENTE';
  if (estado_dinamico == 2) return 'CUMPLIDA';
  if (estado_dinamico == 3) return 'EN PROCESO';
  if (estado_dinamico == 4) return 'ANULADA';
  return 'DESCONOCIDO';
}

const obtenerClaseEstado = (estado_dinamico, es_sm = false) => {
  const prefijo = es_sm ? 'badge-status-sm' : 'badge-status';
  if (estado_dinamico == 1) return `${prefijo} rechazada`; // Vigente (Rojo)
  if (estado_dinamico == 2) return `${prefijo} aprobada`;  // Cumplida (Verde)
  if (estado_dinamico == 3) return `${prefijo} pendiente text-dark`; // En proceso (Amarillo)
  if (estado_dinamico == 4) return `${prefijo} anulada`; // Anulada (Negro/Blanco)
  return `${prefijo}`;
}

const obtenerClaseTextoSancion = (estado_dinamico) => {
  if (estado_dinamico == 4) return 'text-anulada fw-bold';
  if (estado_dinamico == 3) return 'text-en-proceso fw-bold';
  return 'text-danger fw-bold';
}

const sancionesFiltradas = computed(() => {
  return sanciones.value.filter(s => {
    const matchMotArt = normalizar((s.motivo || '') + ' ' + (s.articulo || '')).includes(normalizar(filtros.motivo_articulo));
    const matchSan = normalizar(s.sancion || '').includes(normalizar(filtros.sancion));
    const matchDes = (s.desde_formateada || '').includes(filtros.desde);
    const matchHas = (s.hasta_formateada || '').includes(filtros.hasta);

    let matchEst = true;
    if (filtros.estado === 'vigente') matchEst = (s.estado_dinamico == 1);
    if (filtros.estado === 'cumplida') matchEst = (s.estado_dinamico == 2);
    if (filtros.estado === 'en_proceso') matchEst = (s.estado_dinamico == 3);
    if (filtros.estado === 'anulada') matchEst = (s.estado_dinamico == 4);

    return matchMotArt && matchSan && matchDes && matchHas && matchEst;
  });
});

const totalPaginas = computed(() => Math.ceil(sancionesFiltradas.value.length / registrosPorPagina) || 1);

const sancionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo });

const obtenerSancionesLocales = async () => {
  cargando.value = true;
  try {
    const data = await api.get({
      entity: 'sanciones',
      action: 'obtenerSancionesArbitro',
      payload: { id_arbitro: arbitro.value.id },
    });
    sanciones.value = data.payload || [];
  } catch (err) {
    console.error(err);
  } finally {
    cargando.value = false;
  }
};

onMounted(obtenerSancionesLocales);
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }

/* REFRESH REESTILIZADO IGUAL A LA FOTO */
.btn-refresh:hover { transform: rotate(45deg); }

/* TABLA DESKTOP */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 10px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }

/* FILTROS TABLA */
thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 10px 12px 10px; border-bottom: 4px solid #e2e8f0; margin: 0; }
.filter-input { font-size: 0.75rem; height: 32px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; box-sizing: border-box; }
.filter-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

/* COLUMNAS CONGELADAS */
.col-id { left: 0; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

/* CELDAS */
.cell-ro { padding: 14px 10px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

/* PAGINACIÓN */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 15px; }
.btn-paginacion { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

/* NUEVOS ESTILOS PARA ESTADOS */
.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }

.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.badge-status.pendiente { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; }
.badge-status.anulada { background: #0f172a; color: #ffffff; border: 1px solid #0f172a; }

.badge-status-sm { padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status-sm.aprobada { background: #dcfce7; color: #15803d; }
.badge-status-sm.rechazada { background: #fee2e2; color: #b91c1c; }
.badge-status-sm.pendiente { background: #fef9c3; color: #a16207; }
.badge-status-sm.anulada { background: #0f172a; color: #ffffff; }

/* VISTAS MOBILE / DESKTOP */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

.mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-grid-mobile input, .filter-grid-mobile select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; outline: none; background: #f8fafc; }
.filter-grid-mobile select.full-width { grid-column: span 2; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .card-licencia { background: white; border-radius: 8px; margin-bottom: 15px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .mobile-only-flex { display: flex !important; }
}
</style>