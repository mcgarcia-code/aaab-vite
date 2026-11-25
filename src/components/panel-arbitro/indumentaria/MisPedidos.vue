<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100 radio-15">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <p class="seccion-descripcion">Estado de tus solicitudes · Total: {{ pedidosFiltradas.length }} solicitudes</p>

        <div class="header-actions d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
          <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerPedidos" />

          <BotonHerramienta tipo="nuevo" texto="Nuevo pedido" icono="bi-cart-plus" @click="$router.push('/panel-arbitro/indumentaria/nuevo')" />
        </div>
      </div>

      <div class="card-body bg-white p-3 p-md-4">

        <div class="mb-4">
          <div class="input-group shadow-sm rounded-pill overflow-hidden border border-secondary-subtle">
            <span class="input-group-text bg-light border-0 text-muted ps-4"><i class="bi bi-search"></i></span>
            <input aria-label="Buscar por prenda o estado"
              v-model="busqueda"
              type="text"
              class="form-control border-0 py-2 py-md-3 bg-light shadow-none input-filtro-custom"
              placeholder="BUSCAR POR PRENDA O ESTADO..."
            >
          </div>
        </div>

        <EstadoCargando v-if="cargando" texto="Cargando tus pedidos" />

        <!-- LISTA UNIFICADA (Reemplaza a la tabla y tarjetas mobile) -->
        <div v-else class="border shadow-sm rounded overflow-hidden">

          <!-- Encabezado de Columnas (Solo visible en Escritorio) -->
          <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase texto-075" style="color: var(--o-texto, #0f172a);">
            <div class="col-md-1 text-center">Pedido</div>
            <div class="col-md-3 ps-2">Prenda Solicitada</div>
            <div class="col-md-1 text-center">Cant.</div>
            <div class="col-md-2 text-center">Total Abonado</div>
            <div class="col-md-2 text-center">Fecha</div>
            <div class="col-md-1 text-center">Estado</div>
            <div class="col-md-2 text-center pe-2">Acciones</div>
          </div>

          <EstadoVacio v-if="pedidosPaginados.length === 0" icono="bi-bag"
                       titulo="Sin resultados" mensaje="No se encontraron pedidos." />

          <!-- Filas de Datos -->
          <div class="d-flex flex-column">
            <div v-for="p in pedidosPaginados" :key="p.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-pedido">

              <!-- HEADER MOBILE: Título, Fecha y Estado (Se oculta en escritorio) -->
              <div class="col-12 d-md-none mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div class="fw-bold text-dark text-uppercase text-truncate pe-2 texto-105">
                    {{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <div class="text-muted fw-bold texto-08">
                    Pedido #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
                  </div>
                  <span :class="['estado-pill', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                </div>
              </div>

              <!-- INFO EXTRA MOBILE: Cantidad y Total (Se oculta en escritorio) -->
              <div class="col-12 d-md-none bg-light p-2 rounded border mb-2 d-flex justify-content-between align-items-center">
                <span class="text-dark small">Cant: <strong>{{ p.cantidad + p.cantidad_encargada }}</strong></span>
                <span class="text-success fw-bold fs-6">Total: ${{ (p.cantidad + p.cantidad_encargada) * p.precioUnitario }}</span>
              </div>

              <!-- COL 1: ID (Escritorio) -->
              <div class="col-md-1 d-none d-md-block text-center text-muted fw-bold texto-085">
                #{{ p.id }}
              </div>

              <!-- COL 2: Prenda (Escritorio) -->
              <div class="col-md-3 d-none d-md-block fw-bold text-dark ps-2 text-truncate texto-085">
                {{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span>
              </div>

              <!-- COL 3: Cantidad (Escritorio) -->
              <div class="col-md-1 d-none d-md-block text-center texto-085">
                {{ p.cantidad + p.cantidad_encargada }}
              </div>

              <!-- COL 4: Total (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-center fw-bold text-success texto-085">
                ${{ (p.cantidad + p.cantidad_encargada) * p.precioUnitario }}
              </div>

              <!-- COL 5: Fecha (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-center text-muted fw-bold texto-085">
                {{ p.fecha_creacion || 'S/F' }}
              </div>

              <!-- COL 6: Estado (Escritorio) -->
              <div class="col-md-1 d-none d-md-flex justify-content-center">
                <span :class="['estado-pill', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
              </div>

              <!-- COL 7: Acciones (Ambos) -->
              <div class="col-12 col-md-2 text-center mt-2 mt-md-0 pe-md-2">
                <button
                  v-if="p.estado && ['creado', 'en proceso'].includes(p.estado.toLowerCase())"
                  @click="abrirModalCancelar(p.id)"
                  class="btn btn-sm btn-outline-danger shadow-sm rounded-pill d-inline-flex align-items-center justify-content-center gap-1 w-100 texto-075"
                  title="Cancelar Pedido"
                 
                 style="padding: 4px 10px;">
                  <i class="bi bi-x-circle texto-14px"></i> Cancelar <span class="d-md-none ms-1">Pedido</span>
                </button>
                <span v-else class="text-muted small d-none d-md-inline">-</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginación -->
        <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-4" />

      </div>
    </div>

  </div>
</template>


<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ref, computed, onMounted, watch, inject } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Mis Pedidos | AAAB',
  meta: [
    { name: 'description', content: 'Seguimiento de tus solicitudes de indumentaria.' },
    { property: 'og:title', content: 'Mis Pedidos | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const notificar = inject('notificar')
const toast = inject('toast')

const pedidos = ref([])
const busqueda = ref('')
const cargando = ref(false)

const paginaActual = ref(1)
const registrosPorPagina = 10


const pedidosFiltradas = computed(() => {
  return pedidos.value.filter(p => {
    const texto = `${p.descripcion} ${p.estado}`.toLowerCase()
    return normalizarTexto(texto).includes(normalizarTexto(busqueda.value))
  })
})

const { totalPaginas, paginados: pedidosPaginados } = usePaginacion(pedidosFiltradas, registrosPorPagina, paginaActual)


watch(busqueda, () => { paginaActual.value = 1 })

const obtenerPedidos = async () => {
  cargando.value = true
  const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidosArbitro' })
  if (res.ok) pedidos.value = res.payload
  cargando.value = false
}

// Acciones del modal usando la alerta global
const abrirModalCancelar = (id) => {
  notificar({
    titulo: 'Cancelar Pedido',
    mensaje: '¿Estás seguro que querés cancelar este pedido? Esta acción no se puede deshacer.',
    tipo: 'danger',
    alConfirmar: async () => {
      cargando.value = true
      try {
        const res = await api.post({
          entity: 'indumentaria',
          action: 'actualizarPedido',
          payload: { id: id, estado: 'cancelado' }
        })

        if (res.ok) {
          toast({ titulo: 'Pedido cancelado', mensaje: 'El pedido ha sido cancelado con éxito.', tipo: 'success' })
          await obtenerPedidos()
        } else {
          toast({ titulo: 'Error', mensaje: 'No se pudo cancelar el pedido.', tipo: 'danger' })
        }
      } catch {
        toast({ titulo: 'Error de Red', mensaje: 'Ocurrió un problema al conectar con el servidor.', tipo: 'danger' })
      } finally {
        cargando.value = false
      }
    }
  })
}

const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-gris'
  switch (estado.toLowerCase()) {
    case 'creado': return 'estado-gris'
    case 'en proceso': return 'estado-en-proceso'
    case 'aceptado': return 'estado-aceptado'
    case 'entregado': return 'estado-entregado'
    case 'rechazado': return 'estado-rechazado'
    case 'cancelado': return 'estado-cancelado'
    default: return 'estado-gris'
  }
}


onMounted(obtenerPedidos)
</script>

<style scoped>

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
  background-color: var(--o-superficie, #f8fafc) !important;
}

</style>
