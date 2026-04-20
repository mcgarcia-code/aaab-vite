<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">

        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px; border-left: 5px solid #25d366;">
          <div class="header-info">
            <h4 class="title text-dark fw-bold m-0 d-flex align-items-center gap-2 flex-wrap" style="font-size: 1.25rem;">
              <i class="bi bi-person-badge-fill me-1" style="color: #25d366;"></i> Agenda de Contactos AAAB
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ arbitrosFiltrados.length }} personas encontradas</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only-flex">
              <span class="material-icons">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn-action btn-clear">
              <span class="material-icons">filter_alt_off</span>
              <span class="btn-text">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; box-shadow: none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px;">FILTRAR CONTACTOS</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.apellido" class="filter-input-mobile" placeholder="Apellido...">
            <input v-model="filtros.nombre" class="filter-input-mobile" placeholder="Nombre...">
            <input v-model="filtros.grupo" class="filter-input-mobile" placeholder="Grupo...">
            <input v-model="filtros.subgrupo" class="filter-input-mobile" placeholder="Subgrupo...">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm" style="font-size: 0.95rem;">
            Aplicar Filtros
          </button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">APELLIDO</th>
                  <th style="width: 25%;">NOMBRE</th>
                  <th class="text-center" style="width: 15%;">GRUPO</th>
                  <th class="text-center" style="width: 15%;">SUB-GRUPO</th>
                  <th class="text-center" style="width: 20%;">ACCIONES</th>
                </tr>
                <tr class="filter-row">
                  <td><input v-model="filtros.apellido" class="filter-input shadow-none" placeholder="Filtrar..."></td>
                  <td><input v-model="filtros.nombre" class="filter-input shadow-none" placeholder="Filtrar..."></td>
                  <td class="bg-filter text-center"><input v-model="filtros.grupo" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter text-center"><input v-model="filtros.subgrupo" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosPaginados" :key="a.id" :class="{'fila-ina': a.es_activo == 0}">
                  <td class="font-bold">{{ a.apellido }}</td>
                  <td class="font-bold">{{ a.nombre }}</td>
                  <td class="text-center">{{ a.grupo || '-' }}</td>
                  <td class="text-center">{{ a.subgrupo || '-' }}</td>
                  <td class="text-center">
                    <div class="actions-wrapper">
                      <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa shadow-sm" title="WhatsApp">
                        <span class="material-icons" style="font-size: 18px;">chat</span>
                      </button>
                      <button v-if="a.celular" @click="copiarAlPortapapeles(a.celular)" class="btn-copy shadow-sm" title="Copiar Número">
                        <span class="material-icons" style="font-size: 18px;">content_copy</span>
                      </button>
                      <span v-else class="no-phone text-muted small italic">Sin número</span>
                    </div>
                  </td>
                </tr>

                <tr v-if="arbitrosPaginados.length === 0">
                  <td colspan="5" class="text-center py-5 text-muted bg-light italic border-0">
                    <span class="material-icons d-block mb-2" style="font-size: 40px;">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron contactos.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card-arbitro shadow-sm border border-light-subtle mb-3" :class="{'fila-ina': a.es_activo == 0}">

              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="card-name text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">
                  {{ a.apellido }}, {{ a.nombre }}
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="card-row text-dark mb-2">
                  <span style="font-size: 0.9rem;"><strong>Grupo:</strong> {{ a.grupo || '-' }} | <strong>Sub:</strong> {{ a.subgrupo || '-' }}</span>
                </div>

                <div class="d-flex gap-2 mt-3" v-if="a.celular">
                  <button @click="copiarAlPortapapeles(a.celular)" class="btn btn-light flex-grow-1 d-flex align-items-center justify-content-center gap-2 border shadow-sm" style="font-size: 0.85rem; font-weight: bold; border-radius: 6px;">
                    <span class="material-icons" style="font-size: 18px;">content_copy</span> Copiar
                  </button>
                  <button @click="abrirWhatsApp(a.celular)" class="btn-wa-mobile flex-grow-1 shadow-sm m-0" style="background: #25d366;">
                    <span class="material-icons">chat</span> WhatsApp
                  </button>
                </div>
                <div v-else class="text-center mt-3">
                  <span class="no-phone text-muted small italic">Sin número registrado</span>
                </div>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-light rounded shadow-sm border mt-3">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0 fw-bold">No se encontraron contactos.</p>
            </div>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>

            <span class="fw-bold text-dark small">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>

            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
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
   1. BASE (MOBILE FIRST - CELULARES POR DEFECTO)
   ==================================================== */

.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .full-screen-wrapper { padding: 0 15px 20px 15px !important; }
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #ffffff;
  min-height: 100vh;
  border-radius: 0;
}

/* Cabecera Móvil */
.header-section {
  background: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 15px;
  border-left: 5px solid #25d366;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
.title { font-size: 1.25rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; }

/* Botones Móvil */
.header-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
}

.btn-action {
  border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.1s;
  flex: none; width: 42px; height: 42px; padding: 0;
}
.btn-action:hover { opacity: 0.85; }
.btn-action:active { transform: scale(0.95); }
.btn-text { display: none; }

.btn-clear { background: #e2e8f0; color: #0f172a; border: 1px solid #e2e8f0; }
.btn-filter-mobile { background: #3b82f6; color: white; }
.btn-blue { background: #3b82f6; color: white; cursor: pointer; }

/* Visibilidad de Capas Base */
.desktop-only { display: none !important; }
.mobile-only { display: block !important; }
.mobile-only-flex { display: flex !important; }

/* Filtros Móvil */
.mobile-filter-panel {
  background: #e2e8f0;
  padding: 15px 20px;
  border-bottom: 1px solid #cbd5e1;
}

.filter-grid-mobile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.filter-grid-mobile input,
.filter-grid-mobile select {
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  height: 42px;
  outline: none;
  background: #ffffff;
  color: #334155;
  box-sizing: border-box;
}

.filter-grid-mobile input:focus,
.filter-grid-mobile select:focus {
  border-color: #3b82f6;
  background: white;
}

.filter-grid-mobile input::placeholder { color: #94a3b8; }

.filter-row-mobile {
  display: flex;
  gap: 10px;
  width: 100%;
}

.filter-row-mobile input { flex: 1; min-width: 0; }
.col-span-2 { grid-column: span 2; }

/* Botón celeste aplicar filtros */
.btn-close-filters {
  background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 8px;
  font-weight: bold; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 15px;
  transition: background 0.2s, transform 0.1s; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
.btn-close-filters:active { background: #2563eb; transform: scale(0.98); }

/* Tarjetas Móviles (Listado) */
.card-arbitro { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
.card-name { font-size: 1.05rem; color: #0f172a; }
.card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
.text-xs { font-size: 0.75rem; }

.btn-wa-mobile { width: 100%; border: none; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; cursor: pointer; color: white; }

/* Componentes Visuales */
.font-bold { font-weight: bold; }
.text-center { text-align: center; }
.italic { font-style: italic; }

/* Filas Inactivas (Rojo claro) */
.fila-ina { background-color: #fca5a5 !important; border-color: #ef4444 !important; }
.fila-ina td { background-color: #fca5a5 !important; color: #000 !important; }
.fila-ina .card-name, .fila-ina .text-dark, .fila-ina .small { color: #000 !important; }

.animate__animated { animation-duration: 0.5s; }


/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px hacia arriba)
   ==================================================== */
@media (min-width: 768px) {

  .admin-panel { padding: 20px; border-radius: 12px; }

  .desktop-only { display: block !important; }
  .mobile-only { display: none !important; }
  .mobile-only-flex { display: none !important; }

  .header-section { flex-direction: row; align-items: center; justify-content: space-between; border-radius: 8px; padding: 15px 25px; }
  .header-info { width: auto; align-items: flex-start; }
  .title { font-size: 1.1rem; }

  .header-actions { width: auto; justify-content: flex-end; flex-wrap: nowrap; gap: 8px; overflow-x: visible; }
  .btn-action { width: auto; height: auto; padding: 8px 12px; gap: 5px; font-size: 0.85rem; justify-content: flex-start; }
  .btn-text { display: inline !important; }

  /* TABLA DESKTOP */
  .table-container {
    width: 100%; overflow: auto; max-height: 75vh;
    background: white; border-radius: 8px; border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  table { width: 100%; min-width: max-content; border-collapse: collapse !important; border-spacing: 0; font-size: 0.85rem; }

  /* CABECERA PRINCIPAL */
  th {
    position: sticky; top: 0; z-index: 50;
    background-color: #e2e8f0 !important;
    padding: 14px 10px;
    border-bottom: 2px solid #cbd5e1;
    font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
    font-size: 0.75rem; color: #000000; text-transform: uppercase; font-weight: 800;
  }

  /* FILA DE FILTROS */
  .filter-row td {
    position: sticky; top: 46px; z-index: 40;
    background-color: #f1f5f9 !important;
    padding: 10px 8px;
    border-bottom: 2px solid #cbd5e1;
  }

  td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
  td.text-center { display: table-cell; text-align: center; vertical-align: middle; }

  /* Inputs Filtro Desktop */
  .filter-input { width: 100%; height: 30px; padding: 4px 8px; border: 1px solid #cbd5e1; font-size: 0.75rem; border-radius: 4px; outline: none; background-color: #ffffff; box-sizing: border-box; }
  .filter-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
  .filter-input-min { width: 45px; text-align: center; height: 30px; border: 1px solid #cbd5e1; font-size: 0.75rem; border-radius: 4px; outline: none; background-color: #ffffff;}
  .filter-input-min:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

  /* Botones pequeños de acción de tabla */
  .actions-wrapper { display: flex; gap: 8px; justify-content: center; align-items: center; }

  .btn-wa { background: #25d366; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
  .btn-wa:hover { transform: scale(1.1); }

  .btn-copy { background: #e2e8f0; color: #000000; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
  .btn-copy:hover { background: #cbd5e1; color: #1e293b; }
}
</style>
