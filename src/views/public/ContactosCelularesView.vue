<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <div class="admin-panel">
    <div class="header-section">
      <div class="header-title-box">
        <h2 class="title">Agenda de Contactos AAAB</h2>
        <span class="counter">{{ arbitrosFiltrados.length }} personas encontradas</span>
      </div>
      <div class="header-actions">
        <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only">
          <span class="material-icons">filter_alt</span>
        </button>
        <button @click="limpiarFiltros" class="btn-action btn-clear">
          <span class="material-icons">filter_alt_off</span> 
          <span class="btn-text">Limpiar Filtros</span>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only shadow">
      <div class="filter-grid-mobile">
        <input v-model="filtros.apellido" placeholder="Apellido..">
        <input v-model="filtros.nombre" placeholder="Nombre..">
        <input v-model="filtros.grupo" placeholder="Grupo..">
        <input v-model="filtros.subgrupo" placeholder="Sub-grupo..">
      </div>
      <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Contactos</button>
    </div>

    <div class="table-container shadow desktop-only">
      <table>
        <thead>
          <tr>
            <th>APELLIDO</th>
            <th>NOMBRE</th>
            <th class="text-center">GRUPO</th>
            <th class="text-center">SUB-GRUPO</th>
            <th class="text-center">ACCIONES</th>
          </tr>
          <tr class="filter-row">
            <td><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar..."></td>
            <td><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar..."></td>
            <td><input v-model="filtros.grupo" class="filter-input-min" placeholder="G..."></td>
            <td><input v-model="filtros.subgrupo" class="filter-input-min" placeholder="S..."></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <!-- USAMOS arbitrosPaginados EN LUGAR DE arbitrosFiltrados -->
          <tr v-for="a in arbitrosPaginados" :key="a.id" :class="{'fila-ina': a.es_activo == 0}">
            <td class="font-bold">{{ a.apellido }}</td>
            <td class="font-bold">{{ a.nombre }}</td>
            <td class="text-center">{{ a.grupo || '-' }}</td>
            <td class="text-center">{{ a.subgrupo || '-' }}</td>
            <td class="text-center">
              <div class="actions-wrapper">
                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa" title="WhatsApp">
                  <span class="material-icons">chat</span>
                </button>
                <button v-if="a.celular" @click="copiarAlPortapapeles(a.celular)" class="btn-copy" title="Copiar Número">
                  <span class="material-icons">content_copy</span>
                </button>
                <span v-else class="no-phone">Sin número</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-only">
      <!-- USAMOS arbitrosPaginados EN LUGAR DE arbitrosFiltrados -->
      <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card-contacto" :class="{'fila-ina': a.es_activo == 0}">
        <div class="card-main">
          <div class="card-info">
            <div class="card-name">{{ a.apellido }}, {{ a.nombre }}</div>
            <div class="card-subtext">Grupo: {{ a.grupo || '-' }} | Sub: {{ a.subgrupo || '-' }}</div>
            <button v-if="a.celular" @click="copiarAlPortapapeles(a.celular)" class="btn-copy-mobile">
              <span class="material-icons">content_copy</span> {{ a.celular }}
            </button>
          </div>
          <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa-circle">
            <span class="material-icons">chat</span>
          </button>
        </div>
      </div>
    </div>

    <!-- CONTROLES DE PAGINACIÓN -->
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
const registrosPorPagina = 10;

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

  // opcional: scroll en mobile
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
    alert('Copiado al portapapeles: ' + numero);
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
.admin-panel { padding: 15px; background: #f8fafc; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; min-height: 100vh;}
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #25d366; align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #1e293b; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.8rem; }
.btn-clear { background: #f1f5f9; color: #000000; }
.btn-filter-mobile { background: #3b82f6; color: white; }

/* TABLA DESKTOP */
.table-container { background: white; border-radius: 8px; overflow: auto; border: 1px solid #e2e8f0; max-height: 75vh; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #000000; position: sticky; top: 0; z-index: 10; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.filter-row td { background: #f8fafc; padding: 8px; position: sticky; top: 45px; z-index: 10; border-bottom: 2px solid #cbd5e1;}
.filter-input { width: 90%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }
.filter-input-min { width: 60px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; }

/* ACCIONES Y BOTONES */
.actions-wrapper { display: flex; gap: 8px; justify-content: center; }
.btn-wa { background: #25d366; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.3s; }
.btn-wa:hover { transform: scale(1.1); background: #128c7e; }

.btn-copy { background: #e2e8f0; color: #000000; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-copy:hover { background: #cbd5e1; color: #1e293b; }

.no-phone { color: #94a3b8; font-size: 0.75rem; font-style: italic; }

/* MOBILE CARDS */
.mobile-filter-panel { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.filter-grid-mobile input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; }
.btn-close-filters { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; }

.card-contacto { background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.card-main { display: flex; justify-content: space-between; align-items: center; }
.card-name { font-weight: bold; font-size: 1rem; color: #1e293b; }
.card-subtext { font-size: 0.8rem; color: #64748b; margin-top: 4px; margin-bottom: 6px; }
.btn-wa-circle { background: #25d366; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3); flex-shrink: 0; }

.btn-copy-mobile { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; color: #000000; cursor: pointer; }
.btn-copy-mobile .material-icons { font-size: 16px; }

/* ESTADOS */
.font-bold { font-weight: 600; }
.text-center { text-align: center; }
.shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

/* ESTADO INACTIVO MODIFICADO */
.fila-ina, .fila-ina td, .card-contacto.fila-ina { 
  background-color: #fca5a5 !important; /* Rojo claro derivado de tu paleta */
  opacity: 1 !important; 
}
.card-contacto.fila-ina .card-subtext {
  color: #000000 !important;
}

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .btn-text { display: none; }
}
</style>