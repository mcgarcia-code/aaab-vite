<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div>
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-shop me-1"></i> Solicitar Indumentaria
            </h4>
            <p class="text-muted small m-0 mt-1">Armá tu pedido de temporada</p>
          </div>

          <div class="header-actions d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
            <RouterLink to="/panel-arbitro/indumentaria/mis-pedidos" class="text-decoration-none">
              <button class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Ver Mis Pedidos" style="background-color: #e2e8f0 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
                <span class="material-icons" style="font-size: 22px; color: #000;">history</span>
                <span class="btn-text desktop-only fw-bold text-dark" style="font-size: 0.8rem;">Mis Pedidos</span>
              </button>
            </RouterLink>

            <button @click="mostrarCarrito = true" class="btn-blue position-relative rounded shadow-sm border-0 p-2 d-flex align-items-center justify-content-center gap-2 text-white" title="Ver Carrito" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">shopping_cart</span>
              <span class="btn-text desktop-only fw-bold text-white" style="font-size: 0.8rem;">Ver Carrito</span>
              <span v-if="carrito.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style="font-size: 0.6rem; transform: translate(-30%, -30%) !important;">
                {{ totalArticulosCarrito }}
              </span>
            </button>
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
                placeholder="Buscar prenda o modelo..."
              >
            </div>
          </div>

          <div class="row g-3">
            <div v-for="(prenda, key) in stockPaginado" :key="key" class="col-12 col-md-4 col-lg-3 text-center">
              <div class="card h-100 border-0 shadow-sm tarjeta-prenda-invertida overflow-hidden" style="border-radius: 12px;">

                <div class="bg-white position-relative contenedor-imagen-superior">
                  <div
                    class="d-flex align-items-center justify-content-center h-100 cursor-zoom"
                    @click="abrirZoom(obtenerImagenActual(prenda))"
                  >
                    <img
                      :src="obtenerImagenActual(prenda)"
                      class="img-fluid foto-prenda animate__animated animate__fadeIn animate__faster"
                      alt="Indumentaria"
                    >
                    <div class="zoom-icon-overlay">
                      <span class="material-icons" style="font-size: 16px;">search</span>
                    </div>
                  </div>

                  <template v-if="obtenerTotalImagenes(prenda) > 1">
                    <button @click.stop="cambiarFoto(prenda, -1)" class="btn-nav-foto start-0 ms-1">
                      <span class="material-icons">chevron_left</span>
                    </button>
                    <button @click.stop="cambiarFoto(prenda, 1)" class="btn-nav-foto end-0 me-1">
                      <span class="material-icons">chevron_right</span>
                    </button>
                    <div class="indicador-fotos">
                      {{ (prenda.fotoActualIndex || 0) + 1 }} / {{ obtenerTotalImagenes(prenda) }}
                    </div>
                  </template>
                </div>

                <div class="card-body p-3 d-flex flex-column cuerpo-gris-inferior">
                  <h6 class="fw-bold text-dark mb-1 text-uppercase extra-small-mobile">{{ prenda.descripcion }}</h6>
                  <h5 class="fw-bold text-danger mb-2 mb-md-3">$ {{ prenda.precio_general }}</h5>

                  <div class="mt-auto">
                    <div class="row g-2 mb-2 text-start">
                      <div class="col-7">
                        <label class="extra-small-label fw-bold text-muted">Talle:</label>
                        <select v-model="prenda.itemSeleccionado" @change="validarCantidad(prenda)" class="form-select form-select-sm rounded-pill shadow-sm border-secondary-subtle bg-white">
                          <option v-for="(t, k) in prenda.items" :key="k" :value="k">
                            {{ t.talle }}
                          </option>
                        </select>
                      </div>
<div class="col-5">
                        <label class="extra-small-label fw-bold text-muted">Cant:</label>

                        <div class="d-flex align-items-center rounded-pill shadow-sm border border-secondary-subtle bg-white overflow-hidden p-0" style="height: 31px;">

                          <button
                            type="button"
                            class="btn btn-light border-0 text-muted p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                            style="width: 28px; height: 100%; background: transparent;"
                            @click="prenda.cantidadSeleccionada > 1 ? (prenda.cantidadSeleccionada--, validarCantidad(prenda)) : null"
                          >
                            <span class="material-icons" style="font-size: 16px;">remove</span>
                          </button>

                          <input
                            type="number"
                            v-model.number="prenda.cantidadSeleccionada"
                            min="1"
                            :max="permitePedidoSinStock(prenda) ? 99 : obtenerStockMaximo(prenda)"
                            @input="validarCantidad(prenda)"
                            class="form-control border-0 text-center p-0 shadow-none bg-transparent hide-arrows fw-bold text-dark"
                            style="min-width: 0; font-size: 0.85rem;"
                          >

                          <button
                            type="button"
                            class="btn btn-light border-0 text-muted p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                            style="width: 28px; height: 100%; background: transparent;"
                            @click="prenda.cantidadSeleccionada < (permitePedidoSinStock(prenda) ? 99 : obtenerStockMaximo(prenda)) ? (prenda.cantidadSeleccionada++, validarCantidad(prenda)) : null"
                          >
                            <span class="material-icons" style="font-size: 16px;">add</span>
                          </button>

                        </div>
                      </div>

                      <div class="col-12 mt-0 text-center">
                        <span v-if="obtenerStockMaximo(prenda) > 0" class="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style="font-size: 0.65rem;">
                          Disp: {{ obtenerStockMaximo(prenda) }}
                        </span>
                        <span v-else-if="permitePedidoSinStock(prenda)" class="badge rounded-pill bg-warning-subtle text-dark border border-warning" style="font-size: 0.65rem;">
                          A Pedido (Demora de fábrica)
                        </span>
                        <span v-else class="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle" style="font-size: 0.65rem;">
                          Agotado Definitivamente
                        </span>
                      </div>
                    </div>

                    <button
                      @click="agregarAlCarrito(prenda)"
                      :disabled="obtenerStockMaximo(prenda) <= 0 && !permitePedidoSinStock(prenda)"
                      :class="['btn btn-sm w-100 rounded-pill fw-bold shadow-sm py-2 d-flex align-items-center justify-content-center gap-1 mt-2', (obtenerStockMaximo(prenda) <= 0 && permitePedidoSinStock(prenda)) ? 'btn-warning text-dark' : 'btn-danger text-white']"
                    >
                      <span class="material-icons" style="font-size: 16px;">
                        {{ (obtenerStockMaximo(prenda) > 0 || permitePedidoSinStock(prenda)) ? 'add_shopping_cart' : 'remove_shopping_cart' }}
                      </span>
                      {{ obtenerStockMaximo(prenda) > 0 ? 'AGREGAR' : (permitePedidoSinStock(prenda) ? 'ENCARGAR' : 'SIN STOCK') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="stockPaginado.length === 0" class="text-center p-5 bg-light rounded border mt-3" style="border-radius: 12px !important;">
            <span class="material-icons text-muted" style="font-size: 48px;">inventory_2</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No se encontraron prendas.</p>
          </div>

          <div
            class="d-flex justify-content-center align-items-center gap-3 mt-4"
            v-if="totalPaginas > 1"
          >
            <button
              class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
              @click="cambiarPagina(-1)"
              :disabled="paginaActual <= 1"
            >
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>
            <button
              class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
              @click="cambiarPagina(1)"
              :disabled="paginaActual >= totalPaginas"
            >
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>

      <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
          <div class="small text-dark lh-sm">
            Por dudas o consultas enviar e-mail a <a href="mailto:tesoreria@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">tesoreria@arbitroshandball.com.ar</a>
          </div>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="imagenZoom" class="modal-zoom-overlay animate__animated animate__fadeIn" @click="imagenZoom = null" style="z-index: 20000; cursor: pointer;">
        <button class="btn-cerrar-zoom shadow" @click.stop="imagenZoom = null">
          <span class="material-icons">close</span>
        </button>
        <img :src="imagenZoom" class="img-zoom-full animate__animated animate__zoomIn" @click.stop style="cursor: default;">
      </div>
    </Teleport>

    <ModalBase
      :show="mostrarCarrito"
      @close="mostrarCarrito = false"
      titulo="Tu Pedido"
      icono="shopping_cart_checkout"
      colorIcono="bg-danger text-white"
      maxWidth="450px"
    >
      <div v-if="carrito.length === 0" class="text-center py-5 text-muted bg-light rounded border">
        <span class="material-icons fs-1 mb-2">remove_shopping_cart</span>
        <p class="m-0">El carrito está vacío</p>
      </div>

      <div v-else class="contenedor-items-carrito px-1 text-start">
        <div v-for="(p, i) in carrito" :key="i" class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div>
            <div class="fw-bold small text-dark">{{ p.descripcion }}</div>
            <div class="text-muted extra-small">Talle: <strong>{{ p.talle }}</strong> | Cant: <strong>{{ p.cantidadSolicitada }}</strong> | ${{ p.precio * p.cantidadSolicitada }}</div>
          </div>
          <button @click="carrito.splice(i, 1)" class="btn btn-sm text-danger border-0 p-1">
            <span class="material-icons" style="font-size: 18px;">delete</span>
          </button>
        </div>
        <div class="d-flex justify-content-between mt-3 fw-bold fs-5 text-danger bg-danger-subtle p-2 rounded">
          <span>TOTAL:</span><span>$ {{ totalCarrito }}</span>
        </div>
      </div>

      <template #footer>
        <button @click="mostrarCarrito = false" class="btn btn-light w-100 rounded-pill fw-bold border" style="font-size: 0.8rem;">SEGUIR MIRANDO</button>
        <button v-if="carrito.length > 0" @click="confirmarPedido" class="btn btn-dark w-100 rounded-pill fw-bold shadow" style="font-size: 0.8rem;">FINALIZAR</button>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarPago"
      @close="mostrarPago = false"
      titulo="Abonar Pedido"
      icono="account_balance_wallet"
      colorIcono="bg-danger text-white"
      maxWidth="450px"
    >
      <div class="small text-muted mb-4 text-start bg-light p-3 rounded border">
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Total a transferir:</span>
          <strong class="text-danger fs-6">$ {{ totalCarrito }}</strong>
        </div>
        <strong>CBU:</strong> 0170182740000032568543<br>
        <strong>Alias:</strong> Adrianmanzanos.bbva<br>
        <strong>Titular:</strong> Adrian Manzanos<br>
        <strong>Banco:</strong> BBVA
      </div>

      <div class="alert alert-info extra-small py-2 border-0 mb-0 fw-bold">
        <span class="material-icons align-middle me-1" style="font-size: 14px;">info</span>
        Para que tu pedido sea ACEPTADO, debes enviar el comprobante de pago a tesoreria@arbitroshandball.com.ar
      </div>

      <template #footer>
        <button @click="mostrarPago = false" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" style="background: #e2e8f0; border: 1px solid #e2e8f0;">CANCELAR</button>
        <button @click="realizarPedidoFinal" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ cargando ? 'PROCESANDO' : 'CONFIRMAR' }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, inject } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';

useHead({
  title: 'Realizar Pedido | AAAB',
  meta: [
    { name: 'description', content: 'Realizá tu pedido de indumentaria para los torneos de la Asociación Argentina de Árbitros de Balonmano.' },
    { property: 'og:title', content: 'Realizar Pedido | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const notificar = inject('notificar');

const listaAgrupada = ref([]);
const busqueda = ref('');
const carrito = ref([]);
const mostrarCarrito = ref(false);
const mostrarPago = ref(false);
const cargando = ref(false);
const imagenZoom = ref(null);

const ordenTalles = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8, '4XL': 9 };

const anchoPantalla = ref(window.innerWidth);
const actualizarAncho = () => { anchoPantalla.value = window.innerWidth; };

const paginaActual = ref(1);
const registrosPorPagina = computed(() => anchoPantalla.value <= 768 ? 5 : 12);

const manejarEsc = (e) => {
  if (e.key === 'Escape' && imagenZoom.value) {
    imagenZoom.value = null;
  }
};

const permitePedidoSinStock = (prenda) => {
  if (!prenda) return false;
  return prenda.admite_encargo === true || prenda.admite_encargo === 1;
};

const obtenerImagenActual = (prenda) => {
  const fotos = prenda.archivo_imagen ? prenda.archivo_imagen.split(",") : [];
  const index = prenda.fotoActualIndex || 0;
  const archivo = fotos[index]?.trim() || fotos[0]?.trim();

  if (archivo) {
    return prenda.folder_imagenes + encodeURIComponent(archivo);
  }
  return "https://placehold.co/400x400?text=Indumentaria";
};

const obtenerTotalImagenes = (prenda) => {
  return prenda.archivo_imagen && prenda.archivo_imagen.trim() !== ''
          ? prenda.archivo_imagen.split(",").length
          : 0;
};

const cambiarFoto = (prenda, delta) => {
  const total = obtenerTotalImagenes(prenda);
  if (total <= 1) return;
  let current = prenda.fotoActualIndex || 0;
  current = (current + delta + total) % total;
  prenda.fotoActualIndex = current;
};

const obtenerStockMaximo = (prenda) => {
  const talleInfo = prenda.items[prenda.itemSeleccionado];
  return talleInfo ? talleInfo.cantidad : 0;
};

const validarCantidad = (prenda) => {
  const max = obtenerStockMaximo(prenda);
  const permiteSinStock = permitePedidoSinStock(prenda);

  if (!permiteSinStock && prenda.cantidadSeleccionada > max) {
    prenda.cantidadSeleccionada = max;
  }
  if (prenda.cantidadSeleccionada < 1) {
    prenda.cantidadSeleccionada = 1;
  }
};

const abrirZoom = (url) => { imagenZoom.value = url; };

const cargarStock = async () => {
  const respuesta = await api.get({
    entity: 'indumentaria',
    action: 'obtenerStock'
  });
  if (respuesta.ok) {
    listaAgrupada.value = respuesta.payload.map(prenda => {
      prenda.items.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99));
      return {
        ...prenda,
        itemSeleccionado: 0,
        cantidadSeleccionada: 1,
        fotoActualIndex: 0
      };
    });
  }
};

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const stockFiltrado = computed(() => {
  return listaAgrupada.value
    .filter(p => normalizar(p.descripcion).includes(normalizar(busqueda.value)))
    .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
});

const totalPaginas = computed(() => Math.ceil(stockFiltrado.value.length / registrosPorPagina.value) || 1);
const stockPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
  const stock = stockFiltrado.value.slice(inicio, inicio + registrosPorPagina.value);
  console.log(stock)
  return stock
});

const cambiarPagina = (delta) => {
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
  }
};

watch(paginaActual, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(busqueda, () => { paginaActual.value = 1 });
watch(totalPaginas, (nuevo) => {
  if (nuevo === 0) paginaActual.value = 1;
  else if (paginaActual.value > nuevo) paginaActual.value = nuevo;
});

const totalCarrito = computed(() => {
  return carrito.value.reduce((total, p) => total + (p.precio * p.cantidadSolicitada), 0);
});

const totalArticulosCarrito = computed(() => {
  return carrito.value.reduce((total, p) => total + p.cantidadSolicitada, 0);
});

const agregarAlCarrito = (prenda) => {
  const itemTalle = prenda.items[prenda.itemSeleccionado]
  const permiteSinStock = permitePedidoSinStock(prenda)
  const precio_general = prenda.precio_general
  if (itemTalle.cantidad <= 0 && !permiteSinStock) {
    notificar({ titulo: 'Agotado', mensaje: 'Lo sentimos, este modelo no admite encargos.', tipo: 'danger' });
    return;
  }

  const itemExistente = carrito.value.find(p => p.id_item === prenda.id_item && p.id_talle === itemTalle.id);

  if (itemExistente) {
    // NUEVA VALIDACIÓN: Calculamos cuánto habría en total si lo agregamos
    const nuevaCantidadTotal = itemExistente.cantidad + prenda.cantidadSeleccionada;

    // Comparamos contra el stock real de la base
    if (!permiteSinStock && nuevaCantidadTotal > itemTalle.cantidad) {
      notificar({
        titulo: 'Stock Insuficiente',
        mensaje: `Solo hay ${itemTalle.cantidad} en stock. Ya tenés ${itemExistente.cantidad} en el carrito.`,
        tipo: 'warning'
      });
      return; // Cortamos acá, no dejamos que se agregue
    }

    // Si pasó la validación, actualizamos la cantidad
    itemExistente.cantidad = nuevaCantidadTotal;
  } else {
    // Validación de seguridad por si es la primera vez que lo agrega
    if (!permiteSinStock && prenda.cantidadSeleccionada > itemTalle.cantidad) {
       notificar({
         titulo: 'Stock Insuficiente',
         mensaje: `Solo quedan ${itemTalle.cantidad} unidades en stock.`,
         tipo: 'warning'
       });
       return;
    }

    carrito.value.push({
      id_item: prenda.id_item,
      id_talle: itemTalle.id,
      descripcion: prenda.descripcion,
      precio: precio_general,
      permiteSinStock: permiteSinStock,
      talle: itemTalle.talle,
      cantidadActual: itemTalle.cantidad,
      cantidadSolicitada: prenda.cantidadSeleccionada
    });
    console.log(carrito.value)
  }

  mostrarCarrito.value = true;
};

const confirmarPedido = () => {
  mostrarCarrito.value = false;
  mostrarPago.value = true;
};

const realizarPedidoFinal = async () => {
  cargando.value = true;
  try {
    const respuesta = await api.post({
      entity: 'indumentaria',
      action: 'crearPedidoMultiple',
      payload: { items: carrito.value, total: totalCarrito.value }
    });

    if (respuesta.ok) {
      notificar({
        titulo: '¡Pedido Recibido!',
        mensaje: 'Tu pedido se registró con éxito. Recordá enviar el comprobante.',
        tipo: 'success'
      });
      carrito.value = [];
      mostrarPago.value = false;
      await cargarStock();
    } else {
      notificar({ titulo: 'Error', mensaje: 'No pudimos procesar tu pedido.', tipo: 'danger' });
    }
  } catch{
    notificar({ titulo: 'Error de Red', mensaje: 'Error al conectar.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', actualizarAncho);
  window.addEventListener('keydown', manejarEsc);
  cargarStock();
});

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAncho);
  window.removeEventListener('keydown', manejarEsc);
});
</script>


<style scoped>
/* ====================================================
   1. LAYOUT BASE Y UTILIDADES
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  /* Top en 0, pero volvemos a respetar los 20px laterales para que quede igual que el header */
  padding: 0 20px 20px 20px;
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  /* Mantenemos los 20px laterales */
  padding: 0 20px 20px 20px;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

h5 {
  font-size: 1.2rem;
}

.desktop-only {
  display: block;
}

/* ====================================================
   2. BOTONES E INPUTS
   ==================================================== */
.btn-action, .btn-clear {
  border: none;
  cursor: pointer;
}

.btn-clear:hover {
  background-color: #e2e8f0 !important;
}

.input-filtro-custom {
  font-size: 1rem !important;
  height: auto !important;
}

.input-filtro-custom:focus {
  outline: none;
}

.form-select-sm, .form-control-sm {
  font-size: 0.75rem;
  padding: 0.3rem 0.5rem;
}

/* ====================================================
   4. CARDS TIENDA (PRODUCTOS)
   ==================================================== */
.tarjeta-prenda-invertida {
  border-radius: 16px;
  transition: all 0.3s ease;
  background-color: #e2e8f0;
  border: 1px solid #e2e8f0 !important;
  display: flex;
  flex-direction: column;
}

.contenedor-imagen-superior {
  background-color: #ffffff;
  height: 180px;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  z-index: 1;
}

.contenedor-imagen-superior:hover .zoom-icon-overlay {
  opacity: 1;
}

.foto-prenda {
  max-width: 175%;
  max-height: 175%;
  object-fit: contain;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.cuerpo-gris-inferior {
  padding: 15px !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #e2e8f0;
  border-radius: 0 0 16px 16px;
}

.extra-small-mobile {
  font-size: 0.85rem;
  line-height: 1.2;
}

.extra-small-label {
  font-size: 0.7rem;
  display: block;
  margin-bottom: 2px;
}

/* ====================================================
   5. CONTROLES DE FOTO Y ZOOM
   ==================================================== */
.cursor-zoom {
  cursor: zoom-in;
  width: 100%;
  height: 100%;
}

.zoom-icon-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.05);
  color: #666;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
}

.btn-nav-foto {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.indicador-fotos {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 0.65rem;
  padding: 2px 10px;
  border-radius: 12px;
  z-index: 5;
}

/* ====================================================
   6. MODALES (CARRITO Y ZOOM)
   ==================================================== */
.modal-overlay-exito {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content-exito {
  background: white;
  border-radius: 20px;
  border: none;
}

.contenedor-items-carrito {
  max-height: 250px;
  overflow-y: auto;
}

.icon-circle-exito {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.modal-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(8px);
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-zoom-full {
  max-width: 95%;
  max-height: 85vh;
  border-radius: 10px;
}

.btn-cerrar-zoom {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  z-index: 11001;
}

/* ====================================================
   7. RESPONSIVE (MEDIA QUERIES)
   ==================================================== */
@media (min-width: 992px) {
  .tarjeta-prenda-invertida:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
    border-color: #cbd5e1 !important;
  }
}

@media (min-width: 768px) {
  .btn-text {
    display: inline;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  .contenedor-imagen-superior {
    height: 150px;
  }
  .btn-text {
    display: inline;
  }
}

@media (max-width: 600px) {
  .full-screen-wrapper {
    position: relative;
    width: 99vw;
    min-height: 100vh;
    height: auto;
    margin-left: 50%;
    transform: translateX(-50%);
    /* Top en 0, pero conservando los 15px laterales originales para celulares */
    padding: 0 15px 20px 15px !important;
    box-sizing: border-box !important;
  }

  .admin-panel {
    padding: 0 !important;
    border-radius: 0;
    box-sizing: border-box !important;
  }

  .header-section {
    padding: 15px !important;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 15px;
  }

  .header-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info h4, h4 {
    font-size: 1.2rem !important;
    margin: 0;
    text-align: left;
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .btn-action {
    flex: none;
    width: 42px;
    height: 42px;
    padding: 0;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
  }

  .btn-text {
    display: none !important;
  }
}
/* ====================================================
   8. INPUTS NUMÉRICOS PERSONALIZADOS
   ==================================================== */
/* Ocultar flechas del input type="number" en Chrome/Safari/Edge */
.hide-arrows::-webkit-outer-spin-button,
.hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Ocultar flechas en Firefox y navegadores estándar */
.hide-arrows {
  -moz-appearance: textfield;
  appearance: textfield; /* Agregá esta línea para el linter */
}
</style>
