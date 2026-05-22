<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-box-seam me-1"></i> Mis Pedidos
          </h4>
          <p class="text-muted small m-0 mt-1">Total: {{ pedidosFiltradas.length }} solicitudes</p>
        </div>

        <div class="header-actions d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
          <button @click="obtenerPedidos" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Actualizar" style="background-color: #e2e8f0 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #000;">refresh</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <RouterLink to="/panel-arbitro/indumentaria/nuevo" class="text-decoration-none">
            <button class="rounded shadow-sm border-0 p-2 d-flex align-items-center justify-content-center gap-2 text-white" title="Nuevo Pedido" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">add_shopping_cart</span>
              <span class="d-none d-md-inline fw-bold text-white" style="font-size: 0.8rem;">Pedir Ropa</span>
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

        <!-- LISTA UNIFICADA (Reemplaza a la tabla y tarjetas mobile) -->
        <div class="border shadow-sm rounded overflow-hidden">

          <!-- Encabezado de Columnas (Solo visible en Escritorio) -->
          <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase" style="font-size: 0.75rem; color: #0f172a;">
            <div class="col-md-1 text-center">Pedido</div>
            <div class="col-md-3 ps-2">Prenda Solicitada</div>
            <div class="col-md-1 text-center">Cant.</div>
            <div class="col-md-2 text-center">Total Abonado</div>
            <div class="col-md-2 text-center">Fecha</div>
            <div class="col-md-1 text-center">Estado</div>
            <div class="col-md-2 text-center pe-2">Acciones</div>
          </div>

          <div v-if="pedidosPaginados.length === 0" class="text-center p-5 bg-light">
            <span class="material-icons text-muted opacity-50 d-block mb-3" style="font-size: 48px;">search_off</span>
            <h5 class="fw-bold text-dark mt-3">Sin resultados</h5>
            <p class="text-muted small m-0">No se encontraron pedidos.</p>
          </div>

          <!-- Filas de Datos -->
          <div class="d-flex flex-column">
            <div v-for="p in pedidosPaginados" :key="p.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-pedido">

              <!-- HEADER MOBILE: Título, Fecha y Estado (Se oculta en escritorio) -->
              <div class="col-12 d-md-none mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div class="fw-bold text-dark text-uppercase text-truncate pe-2" style="font-size: 1.05rem;">
                    {{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <div class="text-muted fw-bold" style="font-size: 0.8rem;">
                    Pedido #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
                  </div>
                  <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                </div>
              </div>

              <!-- INFO EXTRA MOBILE: Cantidad y Total (Se oculta en escritorio) -->
              <div class="col-12 d-md-none bg-light p-2 rounded border mb-2 d-flex justify-content-between align-items-center">
                <span class="text-dark small">Cant: <strong>{{ p.cantidad + p.cantidad_encargada }}</strong></span>
                <span class="text-success fw-bold fs-6">Total: ${{ (p.cantidad + p.cantidad_encargada) * p.precioUnitario }}</span>
              </div>

              <!-- COL 1: ID (Escritorio) -->
              <div class="col-md-1 d-none d-md-block text-center text-muted fw-bold" style="font-size: 0.85rem;">
                #{{ p.id }}
              </div>

              <!-- COL 2: Prenda (Escritorio) -->
              <div class="col-md-3 d-none d-md-block fw-bold text-dark ps-2 text-truncate" style="font-size: 0.85rem;">
                {{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span>
              </div>

              <!-- COL 3: Cantidad (Escritorio) -->
              <div class="col-md-1 d-none d-md-block text-center" style="font-size: 0.85rem;">
                {{ p.cantidad + p.cantidad_encargada }}
              </div>

              <!-- COL 4: Total (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-center fw-bold text-success" style="font-size: 0.85rem;">
                ${{ (p.cantidad + p.cantidad_encargada) * p.precioUnitario }}
              </div>

              <!-- COL 5: Fecha (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-center text-muted fw-bold" style="font-size: 0.85rem;">
                {{ p.fecha_creacion || 'S/F' }}
              </div>

              <!-- COL 6: Estado (Escritorio) -->
              <div class="col-md-1 d-none d-md-flex justify-content-center">
                <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
              </div>

              <!-- COL 7: Acciones (Ambos) -->
              <div class="col-12 col-md-2 text-center mt-2 mt-md-0 pe-md-2">
                <button
                  v-if="p.estado && ['creado', 'en proceso'].includes(p.estado.toLowerCase())"
                  @click="abrirModalCancelar(p.id)"
                  class="btn btn-sm btn-outline-danger shadow-sm rounded-pill d-inline-flex align-items-center justify-content-center gap-1 w-100"
                  title="Cancelar Pedido"
                  style="font-size: 0.75rem; padding: 4px 10px;"
                >
                  <span class="material-icons" style="font-size: 14px;">cancel</span> Cancelar <span class="d-md-none ms-1">Pedido</span>
                </button>
                <span v-else class="text-muted small d-none d-md-inline">-</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
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

// Acciones del modal usando la alerta global
const abrirModalCancelar = (id) => {
  notificar({
    titulo: 'Cancelar Pedido',
    mensaje: '¿Estás seguro que querés cancelar este pedido? Esta acción no se puede deshacer.',
    tipo: 'danger',
    alConfirmar: async () => {
      cargando.value = true;
      try {
        const res = await api.post({
          entity: 'indumentaria',
          action: 'actualizarPedido',
          payload: { id: id, estado: 'cancelado' }
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
    }
  });
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
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

onMounted(obtenerPedidos);
</script>

<style scoped>
/* ====================================================
   1. BOTONES E INPUTS
   ==================================================== */
.btn-clear {
  border: none;
  cursor: pointer;
}
.btn-clear:hover {
  background-color: #cbd5e1 !important;
}

.input-filtro-custom {
  font-size: 1rem !important;
  height: auto !important;
}
.input-filtro-custom:focus {
  outline: none;
}

/* ====================================================
   2. ESTILOS DE LA LISTA
   ==================================================== */
.item-pedido {
  transition: background-color 0.2s ease;
}
.item-pedido:hover {
  background-color: #f8fafc !important;
}

/* ====================================================
   3. BADGES (ESTADOS DE PEDIDO)
   ==================================================== */
.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}

.estado-creado { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.estado-proceso { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.estado-aceptado { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.estado-entregado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.estado-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.estado-cancelado { background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }

.animate__animated { animation-duration: 0.5s; }


</style>
