<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">

      <div class="text-center mb-5">
        <i class="bi bi-shield-exclamation display-3 text-danger"></i>
        <h1 class="fw-bold text-white mt-3">Listado Oficial de Sanciones</h1>
        <p class="lead text-white-50">Historial completo de sanciones disciplinarias vigentes.</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10">

          <!-- Filtro búsqueda pública -->
          <div class="mb-4">
            <input
              v-model="filtro"
              class="form-control buscador-publico"
              placeholder="🔍 Buscar por árbitro o motivo..."
            >
          </div>

          <!-- Cargando -->
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="text-white mt-3">Cargando sanciones...</p>
          </div>

          <!-- Sin resultados -->
          <div v-else-if="sancionesFiltradas.length === 0" class="text-center py-5">
            <i class="bi bi-shield-check display-1 text-success"></i>
            <p class="text-white mt-3">No hay sanciones registradas.</p>
          </div>

          <!-- Tabla -->
          <div v-else class="table-responsive shadow rounded">
            <table class="table table-striped table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>Árbitro</th>
                  <th>Motivo</th>
                  <th>Artículo</th>
                  <th>Sanción</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sancionesFiltradas" :key="s.id">
                  <td class="fw-bold">{{ s.apellido }}, {{ s.nombre }}</td>
                  <td class="text-muted small">{{ s.motivo }}</td>
                  <td>{{ s.articulo || '—' }}</td>
                  <td class="fw-bold text-danger">{{ s.sancion }}</td>
                  <td class="small">{{ formatFecha(s.desde) }}</td>
                  <td class="small">
                    <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinida</span>
                    <span v-else>{{ formatFecha(s.hasta) }}</span>
                  </td>
                  <td class="text-center">
                    <span :class="['badge rounded-pill', s.activo == 1 ? 'bg-danger' : 'bg-success']">
                      {{ s.activo == 1 ? 'Vigente' : 'Cumplida' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Nota al pie -->
          <p class="text-white-50 small text-center mt-4">
            <i class="bi bi-info-circle me-1"></i>
            Las resoluciones son de cumplimiento obligatorio según el reglamento vigente de la AAAB.
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Sanciones | AAAB',
  meta: [
    { name: 'description', content: 'Listado oficial de sanciones disciplinarias de la AAAB.' },
    { property: 'og:title', content: 'Sanciones | AAAB' },
    { property: 'og:description', content: 'Visualizá el listado oficial de sanciones para árbitros.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' },
  ],
});

// Esta vista es PÚBLICA — no requiere token, se llama directamente
const API_URL = 'https://arbitroshandball.com.ar/api/api.php';

const sanciones  = ref([]);
const cargando   = ref(false);
const filtro     = ref('');

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
};

const sancionesFiltradas = computed(() => {
  const q = filtro.value.toLowerCase().trim();
  if (!q) return sanciones.value;
  return sanciones.value.filter(s =>
    `${s.apellido} ${s.nombre} ${s.motivo}`.toLowerCase().includes(q)
  );
});

const fetchSanciones = async () => {
  cargando.value = true;
  try {
    // NOTA: si esta ruta requiere JWT, mover a api.get igual que las demás
    const res = await axios.get(API_URL, {
      params: { entity: 'sanciones', action: 'listar_publico' }
    });
    sanciones.value = res.data?.payload ?? [];
  } catch (err) {
    console.error('Error cargando sanciones públicas:', err);
  } finally {
    cargando.value = false;
  }
};

onMounted(fetchSanciones);
</script>

<style scoped>
.dark-background-section {
  background-image:
    linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.82)),
    url('../../assets/fotos/sanciones-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}

.buscador-publico {
  border-radius: 50px;
  padding: 12px 20px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  font-size: 0.9rem;
}
.buscador-publico::placeholder { color: rgba(255,255,255,0.5); }
.buscador-publico:focus {
  background: rgba(255,255,255,0.15);
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220,38,38,0.3);
  color: #fff;
  outline: none;
}

.table thead th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.table tbody td { font-size: 0.85rem; }
.text-danger { color: #ef4444 !important; }
</style>