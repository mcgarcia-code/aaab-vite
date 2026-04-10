<template>
  <div class="animate__animated animate__fadeIn">

    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Tribunal de Ética</h4>
        <p class="text-muted small m-0">Historial de sanciones y resoluciones vigentes.</p>
      </div>

      <div class="card-body p-0">

        <!-- Cargando -->
        <div v-if="cargando" class="text-center py-5">
          <div class="spinner-border text-danger" role="status"></div>
          <p class="mt-3 text-muted small">Cargando tus sanciones...</p>
        </div>

        <!-- Con sanciones -->
        <div v-else-if="sanciones.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">Desde</th>
                <th>Hasta</th>
                <th>Motivo / Artículo</th>
                <th>Sanción</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, idx) in sanciones" :key="idx">
                <td class="ps-3 fw-bold small">{{ formatFecha(s.desde) }}</td>
                <td class="fw-bold small">
                  <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinida</span>
                  <span v-else>{{ formatFecha(s.hasta) }}</span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ s.motivo }}</div>
                  <div class="text-muted x-small" v-if="s.articulo">{{ s.articulo }}</div>
                </td>
                <td class="fw-bold text-danger small">{{ s.sancion }}</td>
                <td class="text-center">
                  <span :class="['badge rounded-pill', s.activo == 1 ? 'bg-danger' : 'bg-success']">
                    {{ s.activo == 1 ? 'Vigente' : 'Cumplida' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sin sanciones -->
        <div v-else class="text-center py-5">
          <i class="bi bi-shield-check text-success display-1"></i>
          <h5 class="mt-3 fw-bold text-dark">Sin Sanciones Vigentes</h5>
          <p class="text-muted small px-4">
            No se registran medidas disciplinarias activas en tu legajo arbitral a la fecha.
          </p>
        </div>

      </div>
    </div>

    <!-- Alerta informativa -->
    <div class="alert alert-secondary mt-4 border-0 shadow-sm">
      <div class="d-flex">
        <i class="bi bi-info-square-fill me-3 fs-4 text-dark"></i>
        <div class="small text-dark">
          Las resoluciones del Tribunal de Ética son de cumplimiento obligatorio según el reglamento vigente de la AAAB.
          Para consultas sobre una resolución, podés dirigirte a
          <a href="mailto:etica@arbitroshandball.com.ar" class="text-danger fw-bold">etica@arbitroshandball.com.ar</a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '@/api/auth';
import { api }  from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Mis Sanciones | AAAB',
  meta: [
    { name: 'description', content: 'Tu historial de sanciones y resoluciones vigentes.' },
    { property: 'og:title', content: 'Tus Sanciones | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' },
  ],
});

const arbitro  = ref(auth.getUser() || {});
const sanciones = ref([]);
const cargando  = ref(false);

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

const obtenerSanciones = async () => {
  cargando.value = true;
  try {
    // El backend filtra por el id del árbitro autenticado usando el JWT
    const data = await api.get({
      entity:  'sanciones',
      action:  'mis_sanciones',
      payload: JSON.stringify({ id_arbitro: arbitro.value.id }),
    });
    sanciones.value = Array.isArray(data) ? data : (data.payload ?? []);
  } catch (err) {
    console.error('Error al cargar sanciones:', err);
  } finally {
    cargando.value = false;
  }
};

onMounted(obtenerSanciones);
</script>

<style scoped>
.card          { border-radius: 15px; overflow: hidden; }
.card-header   { border-bottom: 1px solid #f1f5f9; }

.table thead th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  padding: 15px 10px;
}
.table tbody td { font-size: 0.85rem; padding: 15px 10px; }

.x-small       { font-size: 0.75rem; }
.text-danger   { color: #ef4444 !important; }
.text-success  { color: #10b981 !important; }
.bg-danger     { background-color: #ef4444 !important; }
.bg-success    { background-color: #10b981 !important; }
</style>