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

          <div class="mb-4">
            <input
              v-model="filtro"
              class="form-control buscador-publico shadow-sm"
              placeholder="🔍 Buscar por árbitro o motivo..."
            >
          </div>

          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger"></div>
            <p class="text-white mt-3">Cargando sanciones...</p>
          </div>

          <div v-else-if="sancionesFiltradas.length === 0" class="text-center py-5">
            <i class="bi bi-shield-check display-1 text-success"></i>
            <p class="text-white mt-3">No hay sanciones registradas.</p>
          </div>

          <div v-else>
            <div class="table-responsive shadow rounded bg-white">
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
                  <tr v-for="s in sancionesPaginadas" :key="s.id">
                    <td class="fw-bold">{{ s.arbitro || s.apellido + ', ' + s.nombre }}</td>
                    <td class="text-muted small">{{ s.motivo }}</td>
                    <td>{{ s.articulo || '—' }}</td>
                    <td class="fw-bold" :class="s.estado_dinamico == 3 ? 'text-muted' : 'text-danger'">
                      {{ s.sancion || 'Sin sanción' }}
                    </td>
                    <td class="small">{{ s.desde_formateada || '-' }}</td>
                    <td class="small">
                      <span v-if="s.es_indefinido == 1" class="badge bg-dark rounded-pill">Indefinida</span>
                      <span v-else>{{ s.hasta_formateada || '-' }}</span>
                    </td>
                    <td class="text-center">
                      <span v-if="s.estado_dinamico == 1" class="badge bg-danger">Vigente</span>
                      <span v-else-if="s.estado_dinamico == 3" class="badge bg-warning text-dark">En proceso</span>
                      <span v-else class="badge bg-secondary">Cumplida</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
              <button
                class="btn btn-light rounded-pill px-4 fw-bold shadow-sm"
                @click="paginaActual--"
                :disabled="paginaActual === 1"
              >Anterior</button>

              <span class="text-white fw-bold small">
                Página {{ paginaActual }} de {{ totalPaginas }}
              </span>

              <button
                class="btn btn-light rounded-pill px-4 fw-bold shadow-sm"
                @click="paginaActual++"
                :disabled="paginaActual === totalPaginas"
              >Siguiente</button>
            </div>
          </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const API_URL = 'https://arbitroshandball.com.ar/api/api.php'
const sanciones = ref([])
const cargando = ref(false)
const filtro = ref('')

// Configuración de Paginación
const paginaActual = ref(1)
const registrosPorPagina = 10

const fetchSanciones = async () => {
  cargando.value = true
  try {
    const res = await axios.get(API_URL, {
      params: { entity: 'sanciones', action: 'obtenerSanciones' }
    })
    sanciones.value = res.data?.payload ?? []
  } catch (err) {
    console.error(err)
  } finally {
    cargando.value = false;
  }
}

const sancionesFiltradas = computed(() => {
    let res = sanciones.value;
    
    // 1. Filtrado por texto
    if (filtro.value) {
        const textoBusqueda = filtro.value.toLowerCase();
        res = res.filter(s => 
          (s.arbitro || '').toLowerCase().includes(textoBusqueda) ||
          (s.motivo || '').toLowerCase().includes(textoBusqueda)
        );
    }
    
    // 2. Ordenamiento: Vigentes (1) y En Proceso (3) arriba. Cumplidas (2) abajo.
    return res.sort((a, b) => {
        const pesoA = (a.estado_dinamico == 1 || a.estado_dinamico == 3) ? 0 : 1;
        const pesoB = (b.estado_dinamico == 1 || b.estado_dinamico == 3) ? 0 : 1;
        return pesoA - pesoB;
    });
});

// Paginación Calculada
const totalPaginas = computed(() => Math.ceil(sancionesFiltradas.value.length / registrosPorPagina) || 1);

const sancionesPaginadas = computed(() => {
    const inicio = (paginaActual.value - 1) * registrosPorPagina;
    return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

// Reiniciar a la página 1 si el usuario escribe en el buscador
watch(filtro, () => {
    paginaActual.value = 1;
});

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
.table tbody td { 
  font-size: 0.85rem; 
  vertical-align: middle;
}
.text-danger { color: #ef4444 !important; }
</style>