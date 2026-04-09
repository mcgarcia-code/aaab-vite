<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA ESTÁNDAR -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Mis Pedidos</h2>
          <span class="counter">Total: {{ pedidosFiltrados.length }} solicitudes</span>
        </div>

        <div class="header-actions">
          <button @click="obtenerPedidos" class="btn-action btn-clear" title="Actualizar">
            <span class="material-icons">refresh</span> <span class="btn-text">Actualizar</span>
          </button>
          <RouterLink to="/panel-arbitro/indumentaria/nuevo" class="text-decoration-none">
            <button class="btn-action btn-blue" title="Nuevo Pedido">
              <span class="material-icons">add_shopping_cart</span> <span class="btn-text">Pedir Ropa</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- BUSCADOR -->
      <div class="mb-4">
        <input 
          v-model="busqueda" 
          type="text" 
          class="form-control rounded-pill shadow-sm px-4 border-0 input-filtro-custom" 
          placeholder="Buscar por prenda o estado..."
        >
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr class="main-header">
              <th class="sticky-col col-id text-center">Pedido</th>
              <th>Prenda Solicitada</th>
              <th class="text-center">Cant.</th>
              <th class="text-center">Total Abonado</th>
              <th class="text-center">Fecha</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pedidosPaginados" :key="p.id">
              <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">#{{ p.id }}</td>
              <td class="cell-ro fw-bold text-dark">{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></td>
              <td class="text-center cell-ro">{{ p.cantidad }}</td>
              <td class="text-center cell-ro fw-bold text-success">$ {{ p.cantidad * p.precio_unitario }}</td>
              <td class="text-center cell-ro text-muted fw-bold">{{ p.fecha_creacion || 'S/F' }}</td>
              <td class="text-center cell-ro">
                <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
              </td>
            </tr>
            <tr v-if="pedidosPaginados.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">No se encontraron pedidos.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE (CARDS) -->
      <div class="mobile-only">
        <div v-for="p in pedidosPaginados" :key="'mob-'+p.id" class="card-licencia">
          <div class="card-header border-bottom-0 pb-0">
            <div class="card-name text-uppercase text-truncate">
              <strong>{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></strong>
            </div>
          </div>

          <div class="card-body pt-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="text-xs text-muted fw-bold">
                Pedido #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
              </div>
              <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
            </div>

            <div class="card-info bg-light p-2 rounded border mt-2 d-flex justify-content-between align-items-center">
              <span>Cant: <strong>{{ p.cantidad }}</strong></span>
              <span class="text-success fw-bold fs-6">Total: ${{ p.cantidad * p.precio_unitario }}</span>
            </div>
          </div>
        </div>

        <div v-if="pedidosPaginados.length === 0" class="text-center p-4 bg-white rounded shadow-sm border mt-2">
          <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
          <p class="text-muted mt-2 mb-0">No tenés pedidos registrados.</p>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="paginacion" v-if="totalPaginas > 1">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Mis Pedidos | AAAB',
  meta: [
    { name: 'description', content: 'Seguimiento de tus solicitudes de indumentaria.' },
    { property: 'og:title', content: 'Mis Pedidos | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const pedidos = ref([]);
const busqueda = ref('');
const cargando = ref(false);

// Paginación
const paginaActual = ref(1);
const registrosPorPagina = 10;

// Filtros y Paginación
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(p => {
    const texto = `${p.descripcion} ${p.estado}`.toLowerCase();
    return normalizar(texto).includes(normalizar(busqueda.value));
  });
});

const totalPaginas = computed(() => Math.ceil(pedidosFiltrados.value.length / registrosPorPagina) || 1);
const pedidosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return pedidosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

watch(busqueda, () => { paginaActual.value = 1 });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

// API
const obtenerPedidos = async () => {
  cargando.value = true;
  const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidosArbitro' });
  if (res.ok) pedidos.value = res.payload;
  cargando.value = false;
};

// Estilos visuales
const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-creado';
  switch (estado.toLowerCase()) {
    case 'creado': return 'estado-creado';
    case 'en proceso': return 'estado-proceso';
    case 'aceptado': return 'estado-aceptado';
    case 'entregado': return 'estado-entregado';
    case 'rechazado': return 'estado-rechazado';
    default: return 'estado-creado';
  }
};

onMounted(obtenerPedidos);
</script>

<style scoped>
/* MISMOS ESTILOS ESTÁNDAR DEL ADMIN */
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }

.input-filtro-custom { font-size: 1rem !important; padding: 0.5rem 1rem; height: auto !important; }
.input-filtro-custom:focus { box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; outline: none; }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }

.col-id { left: 0; width: 80px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }

.cell-ro { padding: 12px 8px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; }

.badge-status-sm { padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; white-space: nowrap; }
.estado-creado { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.estado-proceso { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.estado-aceptado { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.estado-entregado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.estado-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { margin-bottom: 8px; }
  .card-name { font-size: 1.05rem; color: #0f172a; }
}
@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .header-actions { width: 100%; display: flex; flex-direction: row; justify-content: flex-end; }
  .btn-text { display: none !important; }
}
</style>