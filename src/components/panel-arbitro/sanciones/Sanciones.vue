<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto" style="border-radius: 15px; overflow: hidden; margin-bottom: 1.5rem;">
        
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
          <div>
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <span class="material-icons" style="transform: rotate(-15deg);">gavel</span> Mis Sanciones
            </h4>
            <p class="text-muted small m-0 mt-1">Total: {{ sancionesFiltradas.length }} resoluciones en tu legajo</p>
          </div>
          
          <div class="header-actions d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue d-flex d-md-none shadow-sm rounded border-0 p-2 align-items-center justify-content-center text-white" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">filter_alt</span>
            </button>
            
            <button @click="limpiarFiltros" class="btn-clear d-none d-md-flex bg-light rounded shadow-sm border p-2 align-items-center justify-content-center gap-2" title="Limpiar Filtros" style="background-color: #f8fafc !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
              <span class="material-icons" style="font-size: 22px; color: #64748b;">filter_alt_off</span>
              <span class="fw-bold text-secondary" style="font-size: 0.8rem;">Limpiar Filtros</span>
            </button>

            <button @click="obtenerSancionesLocales" class="btn-refresh bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center" title="Actualizar" style="background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
              <span class="material-icons" style="font-size: 22px; color: #0f172a;">refresh</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm border-bottom p-3" style="background-color: #f8fafc; margin-bottom: 0; border-radius: 0;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase">Filtrar Sanciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1 shadow-sm" style="line-height: 1; background: white;">
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
          <div class="mt-3">
            <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 fw-bold border-0 py-2 shadow-sm" style="background-color: #3b82f6;">Aplicar Filtros</button>
          </div>
        </div>

        <div class="card-body bg-white p-3 p-md-4">
          
          <div v-if="cargando" class="text-center text-white my-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="mt-2 text-muted">Buscando en legajo...</p>
          </div>

          <div v-else-if="sancionesFiltradas.length === 0" class="text-center p-5 rounded border bg-light shadow-sm">
            <span class="material-icons text-success" style="font-size: 60px;">verified</span>
            <h5 class="fw-bold text-dark mt-3">Sin resultados</h5>
            <p class="text-muted small m-0">No se encontraron medidas disciplinarias con los filtros aplicados.</p>
          </div>

          <div v-else>
            <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
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

<div 
  class="d-flex justify-content-center align-items-center gap-3 mt-4"
  v-if="totalPaginas > 1"
>

  <!-- ANTERIOR -->
  <button
    class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
    @click="cambiarPagina(-1)"
    :disabled="paginaActual <= 1"
  >
    <i class="bi bi-chevron-left"></i> Ant
  </button>

  <!-- TEXTO -->
  <span class="fw-bold text-dark small">
    Página {{ paginaActual }} de {{ totalPaginas }}
  </span>

  <!-- SIGUIENTE -->
  <button
    class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
    @click="cambiarPagina(1)"
    :disabled="paginaActual >= totalPaginas"
  >
    Sig <i class="bi bi-chevron-right"></i>
  </button>

</div>
            
          </div>
        </div>

      </div> 
      
      <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
          <div class="small text-dark lh-sm">
            Las resoluciones del Tribunal de Ética son de cumplimiento obligatorio.
            Para consultas, comunicate a <a href="mailto:etica@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">etica@arbitroshandball.com.ar</a>
          </div>
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
// LÓGICA VISUAL DE ESTADOS Y SANCIONES 
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
  if (estado_dinamico == 1) return `${prefijo} rechazada`; 
  if (estado_dinamico == 2) return `${prefijo} aprobada`;  
  if (estado_dinamico == 3) return `${prefijo} pendiente text-dark`; 
  if (estado_dinamico == 4) return `${prefijo} anulada`; 
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

// --- LÓGICA DE PAGINACIÓN CON SCROLL MÓVIL ---
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

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
/* ====================================================
   1. ESTRUCTURA BASE MAESTRA
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  /* Top en 0, pero volvemos a respetar los 20px laterales para que quede igual que el header */
  padding: 0 20px 20px 20px; 
  padding-bottom: 120px;
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  /* Mantenemos los 20px laterales */
  padding: 0 20px 20px 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  border-radius: 12px;
}

/* Cabecera Estándar */
.header-section { 
    background: white; padding: 15px 25px; border-radius: 8px; 
    display: flex; justify-content: space-between; margin-bottom: 15px; 
    border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    align-items: center; 
}
.header-info { display: flex; flex-direction: column; }
.header-actions { display: flex; gap: 8px; }
.btn-action { 
    border: none; padding: 8px 12px; border-radius: 4px; 
    font-weight: bold; cursor: pointer; display: flex; 
    align-items: center; justify-content: center; gap: 5px; 
    font-size: 0.75rem; transition: opacity 0.2s; 
}
.btn-text { display: inline; }

/* ====================================================
   2. COMPONENTES Y BOTONES
   ==================================================== */
.btn-refresh:hover { transform: rotate(45deg); }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 15px; }
.btn-paginacion { border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; padding: 8px 16px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

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

/* ====================================================
   3. TABLA DESKTOP
   ==================================================== */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 10px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }

thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 10px 12px 10px; border-bottom: 4px solid #e2e8f0; margin: 0; }
.filter-input { font-size: 0.75rem; height: 32px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; box-sizing: border-box; }
.filter-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

.col-id { left: 0; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.cell-ro { padding: 14px 10px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

/* ====================================================
   4. 📱 RESPONSIVE DESIGN (Tiered Layout)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }

/* --- Laptops y Tablets Grandes (Hasta 1024px) --- */
@media (max-width: 1024px) {
    .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
    .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* --- Tablets y Móviles (Hasta 768px) --- */
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: block !important; }
    
    .card-licencia { background: white; border-radius: 8px; margin-bottom: 15px; }

    .mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
    .filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    
    .filter-grid-mobile input, .filter-grid-mobile select { 
        padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; 
        font-size: 16px; width: 100%; outline: none; background: #f8fafc; 
    }
    .filter-grid-mobile select.full-width { grid-column: span 2; }
}

/* --- Smartphones (Hasta 600px) --- */
@media (max-width: 600px) {
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
    .admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
    }

    .header-section { 
        padding: 15px !important; flex-direction: column; 
        align-items: flex-start; text-align: left; gap: 15px; 
    }
    .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
    .header-info h4, h4 { font-size: 1.2rem !important; margin: 0; text-align: left; }
    
    .header-actions { 
        width: 100%; display: flex; flex-direction: row; 
        flex-wrap: wrap; justify-content: center; gap: 8px; 
    }
    .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
    .btn-text { display: none !important; }
    
    .filter-grid-mobile { grid-template-columns: 1fr; }
    .filter-grid-mobile select.full-width { grid-column: span 1; }
}
</style>