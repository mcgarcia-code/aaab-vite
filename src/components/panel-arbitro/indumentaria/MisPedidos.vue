<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-box-seam me-1"></i> Mis Pedidos
          </h4>
          <p class="text-muted small m-0 mt-1">Total: {{ pedidosFiltradas.length }} solicitudes</p>
        </div>

        <div class="header-actions d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <button @click="obtenerPedidos" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Actualizar" style="background-color: #f8fafc !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #64748b;">refresh</span>
            <span class="btn-text desktop-only fw-bold text-secondary" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <RouterLink to="/panel-arbitro/indumentaria/nuevo" class="text-decoration-none">
            <button class="btn-blue rounded shadow-sm border-0 p-2 d-flex align-items-center justify-content-center gap-2 text-white" title="Nuevo Pedido" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">add_shopping_cart</span>
              <span class="btn-text desktop-only fw-bold text-white" style="font-size: 0.8rem;">Pedir Ropa</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <div class="card-body bg-white p-3 p-md-4">

        <div class="mb-4">
          <div class="input-group shadow-sm rounded-pill overflow-hidden border border-secondary-subtle">
            <span class="input-group-text bg-light border-0 text-muted ps-4"><i class="bi bi-search"></i></span>
            <input
              v-model="busqueda"
              type="text"
              class="form-control border-0 py-2 py-md-3 bg-light shadow-none input-filtro-custom"
              placeholder="Buscar por prenda o estado..."
            >
          </div>
        </div>

        <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
          <table>
            <thead>
              <tr class="main-header">
                <th class="sticky-col col-id text-center">Pedido</th>
                <th>Prenda Solicitada</th>
                <th class="text-center">Cant.</th>
                <th class="text-center">Total Abonado</th>
                <th class="text-center">Fecha</th>
                <th class="text-center">Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pedidosPaginados" :key="p.id" class="row-hover">
                <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">#{{ p.id }}</td>
                <td class="cell-ro fw-bold text-dark">{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></td>
                <td class="text-center cell-ro">{{ p.cantidad }}</td>
                <td class="text-center cell-ro fw-bold text-success">$ {{ p.cantidad * p.precio_unitario }}</td>
                <td class="text-center cell-ro text-muted fw-bold">{{ p.fecha_creacion || 'S/F' }}</td>
                <td class="text-center cell-ro">
                  <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                </td>
                <td class="text-center cell-ro">
                  <button
                    v-if="p.estado && p.estado.toLowerCase() === 'creado'"
                    @click="cancelarPedido(p.id)"
                    class="btn btn-sm btn-outline-danger shadow-sm rounded-pill d-inline-flex align-items-center gap-1"
                    title="Cancelar Pedido"
                    style="font-size: 0.75rem; padding: 2px 10px;"
                  >
                    <span class="material-icons" style="font-size: 14px;">cancel</span> Cancelar
                  </button>
                  <span v-else class="text-muted small">-</span>
                </td>
              </tr>
              <tr v-if="pedidosPaginados.length === 0">
                <td colspan="7" class="text-center py-5 text-muted bg-light">No se encontraron pedidos.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-only">
          <div v-for="p in pedidosPaginados" :key="'mob-'+p.id" class="card-licencia">
            <div class="card-header border-bottom-0 pb-0 bg-transparent px-0 pt-1">
              <div class="card-name text-uppercase text-truncate">
                <strong>{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></strong>
              </div>
            </div>

            <div class="card-body pt-2 px-0 pb-1">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="text-xs text-muted fw-bold">
                  Pedido #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
                </div>
                <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
              </div>

              <div class="card-info bg-light p-2 rounded border mt-2 d-flex justify-content-between align-items-center">
                <span class="text-dark small">Cant: <strong>{{ p.cantidad }}</strong></span>
                <span class="text-success fw-bold fs-6">Total: ${{ p.cantidad * p.precio_unitario }}</span>
              </div>

              <div v-if="p.estado && p.estado.toLowerCase() === 'creado'" class="mt-2 text-end">
                <button @click="cancelarPedido(p.id)" class="btn btn-sm btn-outline-danger shadow-sm rounded-pill w-100 d-flex justify-content-center align-items-center gap-1" style="font-size: 0.8rem;">
                  <span class="material-icons" style="font-size: 16px;">cancel</span> Cancelar Pedido
                </button>
              </div>
            </div>
          </div>

          <div v-if="pedidosPaginados.length === 0" class="text-center p-4 bg-light rounded border mt-2">
            <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No tenés pedidos registrados.</p>
          </div>
        </div>

        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
            <i class="bi bi-chevron-left"></i> Ant
          </button>
          <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
            Sig <i class="bi bi-chevron-right"></i>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
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

const notificar = inject('notificar');

const pedidos = ref([]);
const busqueda = ref('');
const cargando = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const pedidosFiltradas = computed(() => {
  return pedidos.value.filter(p => {
    const texto = `${p.descripcion} ${p.estado}`.toLowerCase();
    return normalizar(texto).includes(normalizar(busqueda.value));
  });
});

const totalPaginas = computed(() => Math.ceil(pedidosFiltradas.value.length / registrosPorPagina) || 1);

const pedidosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return pedidosFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

watch(busqueda, () => { paginaActual.value = 1 });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

const obtenerPedidos = async () => {
  cargando.value = true;
  const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidosArbitro' });
  if (res.ok) pedidos.value = res.payload;
  cargando.value = false;
};

const cancelarPedido = async (id) => {
  if (!confirm('¿Estás seguro que querés cancelar este pedido?')) return;

  cargando.value = true;
  try {
    const res = await api.post({
      entity: 'indumentaria',
      action: 'actualizarPedido',
      payload: { id_pedido: id, estado: 'cancelado' }
    });

    if (res.ok) {
      notificar({ titulo: 'Pedido cancelado', mensaje: 'El pedido ha sido cancelado con éxito.', tipo: 'success' });
      await obtenerPedidos();
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudo cancelar el pedido.', tipo: 'danger' });
    }
  } catch {
    notificar({ titulo: 'Error de Red', mensaje: 'Ocurrió un problema al conectar con el servidor.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-creado';
  switch (estado.toLowerCase()) {
    case 'creado': return 'estado-creado';
    case 'en proceso': return 'estado-proceso';
    case 'aceptado': return 'estado-aceptado';
    case 'entregado': return 'estado-entregado';
    case 'rechazado': return 'estado-rechazado';
    case 'cancelado': return 'estado-cancelado';
    default: return 'estado-creado';
  }
};

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(obtenerPedidos);
</script>

<style scoped>
/* ====================================================
   1. BOTONES E INPUTS
   ==================================================== */
.btn-clear:hover { background-color: #e2e8f0 !important; }
.input-filtro-custom { font-size: 1rem !important; height: auto !important; }
.input-filtro-custom:focus { outline: none; }

/* ====================================================
   2. TABLA DESKTOP
   ==================================================== */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

thead tr.main-header th {
  position: sticky; top: 0; z-index: 50; background: #f8fafc !important;
  padding: 12px 10px; border-bottom: 2px solid #e2e8f0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem;
  color: #000; text-transform: uppercase; font-weight: 800; margin: 0;
}

.col-id { left: 0; width: 80px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }

.cell-ro { padding: 14px 10px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; vertical-align: middle;}
.row-hover:hover { background-color: #f1f5f9; transition: background 0.2s ease; }

/* ====================================================
   3. BADGES (ESTADOS DE PEDIDO)
   ==================================================== */
.badge-status-sm { padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; white-space: nowrap; }

.estado-creado { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.estado-proceso { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.estado-aceptado { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.estado-entregado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.estado-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.estado-cancelado { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

/* ====================================================
   4. 📱 RESPONSIVE DESIGN
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia {
    background: white; border-radius: 8px; padding: 15px;
    margin-bottom: 12px; border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .card-name { font-size: 1.05rem; color: #0f172a; }
}

@media (min-width: 768px) {
  .btn-text { display: inline; }
}

.animate__animated { animation-duration: 0.5s; }
</style>

