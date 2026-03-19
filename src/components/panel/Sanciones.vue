<template>
  <div class="animate__animated animate__fadeIn">
    <div class="card shadow border-0">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Tribunal de Ética</h4>
        <p class="text-muted small m-0">Historial de sanciones y resoluciones vigentes.</p>
      </div>
      
      <div class="card-body p-0">
        <div v-if="sanciones.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-3">Desde</th>
                <th>Hasta</th>
                <th>Motivo / Artículo</th>
                <th class="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sancion, index) in sanciones" :key="index">
                <td class="ps-3 fw-bold">{{ sancion.fecha_inicio }}</td>
                <td class="fw-bold">{{ sancion.fecha_fin }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ sancion.motivo }}</div>
                  <div class="text-muted x-small">Art. {{ sancion.articulo }}</div>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill bg-danger">Cumpliendo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5">
          <i class="bi bi-shield-check text-success display-1"></i>
          <h5 class="mt-3 fw-bold text-dark">Sin Sanciones Vigentes</h5>
          <p class="text-muted small px-4">
            No se registran medidas disciplinarias activas en tu legajo arbitral a la fecha.
          </p>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm">
      <div class="d-flex">
        <i class="bi bi-info-square-fill me-3 fs-4 text-dark"></i>
        <div class="small text-dark">
          Las resoluciones del Tribunal de Ética son de cumplimiento obligatorio según el reglamento vigente de la AAAB. 
          Para consultas sobre una resolución, podés dirigirte a etica@arbitroshandball.com.ar
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 1. Importamos auth para la sesión y api para las peticiones con headers
import { auth } from '@/api/auth';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de Sanciones AAAB
useHead({
  title: 'Tus Sanciones | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Ve tu historial de sanciones y resoluciones vigentes.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Tus Sanciones | AAAB',
    },
    {
      property: 'og:description',
      content: 'Ve tu historial de sanciones y resoluciones vigentes.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

// 2. Usamos el método getUser() que ya gestiona sessionStorage
const arbitro = ref(auth.getUser() || {});
const sanciones = ref([]);
const cargando = ref(false);

// Función para obtener las sanciones
const obtenerSanciones = async () => {
  cargando.value = true;
  try {
    // 3. Usamos 'api.get' (nuestra instancia de Axios con interceptores)
    // Ya no necesitas pasar la URL completa si definiste BASE_URL en api.js
    const res = await api.get(`mis_sanciones.php?id_arbitro=${arbitro.value.id}`);
    sanciones.value = res; // Con nuestra api.js, res ya es res.data
  } catch (err) {
    console.error("Error al cargar sanciones:", err);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  // obtenerSanciones(); // Descomentar cuando el PHP esté listo
});
</script>

<style scoped>
.card { border-radius: 15px; overflow: hidden; }
.card-header { border-bottom: 1px solid #f1f5f9; }

.table thead th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  padding: 15px 10px;
}

.table tbody td {
  font-size: 0.85rem;
  padding: 15px 10px;
}

.x-small { font-size: 0.75rem; }

.text-success { color: #10b981 !important; }
.bg-danger { background-color: #ef4444 !important; }
</style>