<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA ESTÁNDAR -->
      <div class="header-section shadow-sm mb-4">
        <div class="header-info">
          <h2 class="title d-flex align-items-center gap-2">
            <span class="material-icons text-danger">gavel</span> Mis Sanciones
          </h2>
          <span class="counter">Total: {{ sanciones.length }} resoluciones en tu legajo</span>
        </div>

        <div class="header-actions">
          <button @click="obtenerSancionesLocales" class="btn-action btn-clear" title="Actualizar">
            <span class="material-icons">refresh</span> <span class="btn-text">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Alerta Informativa -->
      <div class="alert alert-secondary border-0 shadow-sm mb-4">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-4 text-dark"></i>
          <div class="small text-dark lh-sm">
            Las resoluciones del Tribunal de Ética son de cumplimiento obligatorio según el reglamento vigente.
            Para consultas sobre una resolución, comunicate a <a href="mailto:etica@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">etica@arbitroshandball.com.ar</a>
          </div>
        </div>
      </div>

      <!-- ESTADO DE CARGA -->
      <div v-if="cargando" class="text-center text-white my-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="mt-2 text-muted">Buscando en legajo...</p>
      </div>

      <!-- SIN SANCIONES -->
      <div v-else-if="sanciones.length === 0" class="text-center p-5 bg-white rounded shadow-sm border mt-4">
        <span class="material-icons text-success" style="font-size: 60px;">verified</span>
        <h5 class="fw-bold text-dark mt-3">Sin Sanciones</h5>
        <p class="text-muted small m-0">No se registran medidas disciplinarias en tu legajo a la fecha. ¡Excelente trabajo!</p>
      </div>

      <!-- CON SANCIONES -->
      <div v-else>
        <!-- TABLA DESKTOP -->
        <div class="table-container shadow desktop-only">
          <table>
            <thead>
              <tr class="main-header">
                <th class="sticky-col col-id text-center">Estado</th>
                <th>Sanción y Artículo</th>
                <th>Motivo</th>
                <th class="text-center">Desde</th>
                <th class="text-center">Hasta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sancionesPaginadas" :key="s.id">
                <td class="sticky-col col-id text-center">
                  <!-- ERROR SOLUCIONADO -->
                  <span :class="s.estado_dinamico == 1 ? 'badge bg-danger rounded-pill px-3' : 'badge bg-secondary rounded-pill px-3'">
                    {{ s.estado_dinamico == 1 ? 'VIGENTE' : 'CUMPLIDA' }}
                  </span>
                </td>
                <td class="cell-ro">
                  <span class="fw-bold text-dark">{{ s.sancion }}</span><br>
                  <span class="text-muted" style="font-size: 0.75rem;" v-if="s.articulo">Art. {{ s.articulo }}</span>
                </td>
                <td class="cell-ro">{{ s.motivo }}</td>
                <td class="text-center cell-ro fw-bold">{{ s.desde_formateada }}</td>
                <td class="text-center cell-ro fw-bold text-danger">
                  <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinido</span>
                  <span v-else>{{ s.hasta_formateada }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MOBILE (CARDS) -->
        <div class="mobile-only mt-3">
          <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card-licencia">
            <div class="card-header border-bottom-0 pb-0">
              <div class="d-flex justify-content-between align-items-center">
                <strong class="text-danger">{{ s.sancion }}</strong>
                <!-- ERROR SOLUCIONADO -->
                <span :class="s.estado_dinamico == 1 ? 'badge bg-danger rounded-pill' : 'badge bg-secondary rounded-pill'">
                  {{ s.estado_dinamico == 1 ? 'VIGENTE' : 'CUMPLIDA' }}
                </span> 
              </div>
            </div>
            <div class="card-body pt-2">
              <p class="small text-muted mb-2 mt-1 lh-sm">
                <span v-if="s.articulo" class="fw-bold text-dark">Art. {{ s.articulo }} - </span>{{ s.motivo }}
              </p>
              <div class="card-info bg-light p-2 rounded border mt-2 d-flex justify-content-between align-items-center">
                <span class="small">Desde: <strong>{{ formatFecha(s.desde) }}</strong></span>
                <span class="small">Hasta: 
                  <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                  <strong class="text-danger" v-else>{{ formatFecha(s.hasta) }}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINACIÓN -->
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
import { ref, computed, onMounted } from 'vue';
import { auth } from '@/api/auth';
import { api }  from '@/api/api';

const arbitro = ref(auth.getUser() || {});
const sanciones = ref([]);
const cargando = ref(false);

const formatFecha = (f) => f ? f : '—'; // Ya viene formateada del backend

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

const sancionesPaginadas = computed(() => sanciones.value); // Paginación simplificada
</script>
<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #dc2626; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }
.col-id { left: 0; width: 100px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
.cell-ro { padding: 12px 8px; font-size: 0.85rem; color: #000; white-space: nowrap; border-bottom: 1px solid #f1f5f9; }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .header-actions { width: 100%; display: flex; flex-direction: row; justify-content: flex-end; }
  .btn-text { display: none !important; }
}
</style>