<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-5 ps-3" style="border-color: #25d366 !important;">
            <h4 class="text-dark fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-person-badge-fill me-1" style="color: #25d366;"></i> Agenda de Contactos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ arbitrosFiltrados.length }} personas encontradas</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerArbitros" class="btn btn-light border shadow-sm py-2 d-none d-md-flex align-items-center gap-2" title="Actualizar">
              <span class="material-icons text-dark fs-6">refresh</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Contactos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.grupo" class="form-control form-control-sm shadow-none" placeholder="Grupo...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.subgrupo" class="form-control form-control-sm shadow-none" placeholder="Subgrupo...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
            <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.85rem; table-layout: fixed;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted border-bottom-0" style="width: 25%;">Apellido</th>
                  <th class="py-3 text-uppercase text-muted border-bottom-0" style="width: 25%;">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted border-bottom-0" style="width: 15%;">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted border-bottom-0" style="width: 15%;">Sub-Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted border-bottom-0" style="width: 20%;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosPaginados" :key="a.id" :class="{'bg-danger-subtle': a.es_activo == 0}">
                  <td class="ps-3 text-dark fw-bold text-uppercase">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                      <template v-if="a.celular">
                        <button @click="abrirWhatsApp(a.celular)" class="btn btn-success btn-sm p-1 lh-1 rounded-circle shadow-sm" title="Enviar WhatsApp" style="background-color: #25d366; border-color: #25d366;">
                          <span class="material-icons" style="font-size: 16px;">chat</span>
                        </button>
                        <button @click="copiarAlPortapapeles(a.celular)" class="btn btn-light btn-sm p-1 lh-1 rounded-circle shadow-sm border" title="Copiar Número">
                          <span class="material-icons text-dark" style="font-size: 16px;">content_copy</span>
                        </button>
                      </template>
                      <span v-else class="text-muted small font-italic">Sin número</span>
                    </div>
                  </td>
                </tr>

                <tr v-if="arbitrosPaginados.length === 0">
                  <td colspan="5" class="py-5 text-center text-muted border-0 bg-white">
                    <span class="material-icons d-block fs-1 mb-2">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron contactos.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{'bg-danger-subtle': a.es_activo == 0}">

              <div class="card-header bg-transparent border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">
                  {{ a.apellido }}, {{ a.nombre }}
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="mb-3">
                  <span class="small text-dark"><strong>Grupo:</strong> {{ a.grupo || '-' }} | <strong>Sub:</strong> {{ a.subgrupo || '-' }}</span>
                </div>

                <div class="d-flex gap-2" v-if="a.celular">
                  <button @click="copiarAlPortapapeles(a.celular)" class="btn btn-light flex-grow-1 shadow-sm border d-flex align-items-center justify-content-center gap-2 fw-bold" style="font-size: 0.85rem;">
                    <span class="material-icons" style="font-size: 18px;">content_copy</span> Copiar
                  </button>
                  <button @click="abrirWhatsApp(a.celular)" class="btn flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-2 text-white fw-bold" style="background-color: #25d366; font-size: 0.85rem;">
                    <span class="material-icons" style="font-size: 18px;">chat</span> WhatsApp
                  </button>
                </div>
                <div v-else class="text-center mt-2 bg-white p-2 rounded border border-light-subtle">
                  <span class="text-muted small fst-italic">Sin número registrado</span>
                </div>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2 fs-1">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron contactos.</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Contactos Celulares | AAAB',
  meta: [
    { name: 'description', content: 'Lista de contactos celulares de árbitros AAAB.' },
    { property: 'og:title', content: 'Contactos Celulares | AAAB' },
    { property: 'og:description', content: 'Lista de contactos celulares de árbitros AAAB.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const arbitros = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  apellido: '', nombre: '', grupo: '', subgrupo: ''
});

// --- VARIABLES DE PAGINACIÓN ---
const paginaActual = ref(1);
const registrosPorPagina = 8;

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');

const notificar = inject('notificar');

// --- LÓGICA DE CARGA ---
const cargarDatos = async () => {
  try {
    const {payload} = await api.get({
      entity: "arbitros",
      action:"getArbitros"
    })
    arbitros.value = payload || [];
  } catch (err) {
    console.error("Error al cargar datos:", err);
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la tabla.', tipo: 'danger' });
  }
};

const cambiarPagina = (delta) => {
  const nueva = paginaActual.value + delta;
  if (nueva < 1 || nueva > totalPaginas.value) return;
  paginaActual.value = nueva;
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const abrirWhatsApp = (numero) => {
  if (!numero) return;
  const limpio = String(numero).replace(/\D/g, '');
  const prefijo = limpio.startsWith('54') ? limpio : `54${limpio}`;
  window.open(`https://wa.me/${prefijo}`, '_blank');
};

const copiarAlPortapapeles = async (numero) => {
  if (!numero) return;
  try {
    await navigator.clipboard.writeText(numero);
    notificar({ titulo: 'Copiado', mensaje: `Número copiado: ${numero}`, tipo: 'success' });
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const arbitrosFiltrados = computed(() => {
  const filtrados = arbitros.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (!filtros[key]) return true;
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });

  return filtrados.sort((a, b) => {
    const compApellido = (a.apellido || '').localeCompare(b.apellido || '');
    if (compApellido === 0) {
      return (a.nombre || '').localeCompare(b.nombre || '');
    }
    return compApellido;
  });
});

// --- CÁLCULOS DE PAGINACIÓN ---
const totalPaginas = computed(() => Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina) || 1);

const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return arbitrosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

// Reseteamos la paginación al filtrar
watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

// Ajuste seguro de páginas
watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
  if (paginaActual.value < 1) paginaActual.value = 1;
});

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

/* ====================================================
   TABLA SIN LÍNEAS VERTICALES
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}

</style>
