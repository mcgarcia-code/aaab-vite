<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-white m-0">Solicitar Indumentaria</h2>
        <p class="small text-white opacity-75 m-0">Seleccioná tus prendas y armá tu pedido</p>
      </div>
      <button @click="mostrarCarrito = true" class="btn btn-light rounded-pill px-3 shadow-sm position-relative">
        <i class="bi bi-cart3 fs-5 text-danger"></i>
        <span v-if="carrito.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          {{ carrito.length }}
        </span>
      </button>
    </div>

    <div class="mb-4">
      <input v-model="busqueda" type="text" class="form-control rounded-pill shadow-sm px-4 border-0" placeholder="Buscar prenda...">
    </div>

    <div class="row g-3">
      <div v-for="(prenda, key) in stockFiltrado" :key="key" class="col-6 col-md-4 col-lg-3 text-center">
        <div class="card h-100 border-0 shadow-sm tarjeta-prenda-invertida overflow-hidden">
          
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
                <i class="bi bi-search"></i>
              </div>
            </div>

            <template v-if="obtenerTotalImagenes(prenda.descripcion) > 1">
              <button @click.stop="cambiarFoto(prenda, -1)" class="btn-nav-foto start-0 ms-1">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button @click.stop="cambiarFoto(prenda, 1)" class="btn-nav-foto end-0 me-1">
                <i class="bi bi-chevron-right"></i>
              </button>
              <div class="indicador-fotos">
                {{ (prenda.fotoActualIndex || 0) + 1 }} / {{ obtenerTotalImagenes(prenda.descripcionLimpia) }}
              </div>
            </template>
          </div>
          
          <div class="card-body p-2 p-md-3 d-flex flex-column cuerpo-gris-inferior">
            <h6 class="fw-bold text-dark mb-1 text-uppercase extra-small-mobile">{{ prenda.descripcion }}</h6>
            <h5 class="fw-bold text-danger mb-2 mb-md-3">$ {{ prenda.precio_unitario }}</h5>
            
            <div class="mt-auto">
              <div class="row g-2 mb-2 text-start">
                <div class="col-7">
                  <label class="extra-small-label fw-bold text-muted">Talle:</label>
                  <select v-model="prenda.itemSeleccionado" @change="validarCantidad(prenda)" class="form-select form-select-sm rounded-pill shadow-sm border-danger-subtle bg-white">
                    <option v-for="(t, k) in prenda.items" :key="k" :value="k">
                      {{ t.talle }}
                    </option>
                  </select>
                </div>
                <div class="col-5">
                  <label class="extra-small-label fw-bold text-muted">Cant:</label>
                  <input 
                    type="number" 
                    v-model.number="prenda.cantidadSeleccionada" 
                    min="1" 
                    :max="obtenerStockMaximo(prenda)"
                    @input="validarCantidad(prenda)"
                    class="form-control form-control-sm rounded-pill shadow-sm border-danger-subtle text-center"
                  >
                </div>
                <div class="col-12 mt-0">
                  <span class="text-muted" style="font-size: 0.65rem;">Stock disp: {{ obtenerStockMaximo(prenda) }}</span>
                </div>
              </div>

              <button 
                @click="agregarAlCarrito(prenda)" 
                :disabled="obtenerStockMaximo(prenda) <= 0"
                class="btn btn-danger btn-sm w-100 rounded-pill fw-bold shadow-sm py-2"
              >
                {{ obtenerStockMaximo(prenda) > 0 ? 'Agregar' : 'Sin Stock' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="imagenZoom" class="modal-zoom-overlay animate__animated animate__fadeIn" @click="imagenZoom = null">
      <button class="btn-cerrar-zoom" @click.stop="imagenZoom = null"><i class="bi bi-x-lg"></i></button>
      <img :src="imagenZoom" class="img-zoom-full animate__animated animate__zoomIn" @click.stop>
    </div>

    <div v-if="mostrarCarrito" class="modal-overlay d-flex align-items-center justify-content-center px-3">
      <div class="modal-content p-4 shadow-lg animate__animated animate__fadeInUp">
        <h4 class="fw-bold mb-4 text-dark"><i class="bi bi-cart-check text-danger me-2"></i>Tu Pedido</h4>
        <div v-if="carrito.length === 0" class="text-center py-4 text-muted">El carrito está vacío</div>
        <div v-else class="contenedor-items-carrito mb-4 px-1">
          <div v-for="(p, i) in carrito" :key="i" class="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
              <div class="fw-bold small text-dark">{{ p.descripcion }}</div>
              <div class="text-muted extra-small">Talle: {{ p.talle }} | Cant: {{ p.cantidad }} | ${{ p.precio * p.cantidad }}</div>
            </div>
            <button @click="carrito.splice(i, 1)" class="btn btn-sm text-danger border-0"><i class="bi bi-trash"></i></button>
          </div>
          <div class="d-flex justify-content-between mt-3 fw-bold fs-5 text-danger">
            <span>Total:</span><span>$ {{ totalCarrito }}</span>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button @click="mostrarCarrito = false" class="btn btn-light w-100 rounded-pill fw-bold border text-uppercase" style="font-size: 0.8rem;">Seguir comprando</button>
          <button v-if="carrito.length > 0" @click="confirmarPedido" class="btn btn-danger w-100 rounded-pill fw-bold shadow text-uppercase" style="font-size: 0.8rem;">Finalizar pedido</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarPago" class="modal-overlay d-flex align-items-center justify-content-center px-3">
      <div class="modal-content p-4 text-center animate__animated animate__zoomIn">
        <i class="bi bi-wallet2 text-danger display-4 mb-3"></i>
        <h4 class="fw-bold">Confirmar Transferencia</h4>
        <div class="small text-muted mb-4 text-start bg-light p-3 rounded-4 border">
          Total a pagar: <strong class="text-danger">$ {{ totalCarrito }}</strong>
          <hr class="my-2">
          <strong>Nombre y Apellido:</strong> Adrian Manzanos<br>
          <strong>CBU:</strong> 0170182740000032568543<br>
          <strong>Alias:</strong> Adrianmanzanos.bbva<br>
          <strong>Banco:</strong> BBVA
        </div>
        <div class="alert alert-info extra-small py-2 border-0 mb-4">
          Para confirmar el pedido, enviá el comprobante a <b>tesoreria@arbitroshandball.com.ar</b>.
        </div>
        <button @click="realizarPedidoFinal" class="btn btn-danger w-100 rounded-pill fw-bold shadow-lg py-3" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO' }}
        </button>
        <button @click="mostrarPago = false" class="btn btn-link text-muted small text-decoration-none mt-2">Volver</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Realizar Pedido | AAAB',
  meta: [
    { name: 'description', content: 'Realizá tu pedido de indumentaria para los torneos de la Asociación Argentina de Árbitros de Balonmano.' },
    { property: 'og:title', content: 'Realizar Pedido | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

// Inyectamos el notificador global
const notificar = inject('notificar');

const listaAgrupada = ref([]);
const busqueda = ref('');
const carrito = ref([]);
const mostrarCarrito = ref(false);
const mostrarPago = ref(false);
const cargando = ref(false);
const imagenZoom = ref(null);

const catalogoImagenes = {
  "CHOMBAS - HUMMEL": ["chomba-hummel.webp", "chomba-back-hummel.webp"],
  "REMERA AMARILLA - CH1": ["amarillo-ch1.webp"],
  "REMERA NEGRA - HUMMEL": ["negra-hummel.webp"],
  "REMERA NARANJA - HUMMEL": ["naranja-hummel.webp"],
  "REMERA VERDE AGUA - HIGH RUNNER": ["verde-agua-hr.webp"],
  "REMERA NEGRA - HIGH RUNNER": ["negra-hr.webp"],
  "REMERA NARANJA - HIGH RUNNER": ["naranja-hr.webp"],
  "REMERA CELESTE - HIGH RUNNER": ["celeste-hr.webp"],
  "SHORT CABALLERO - HUMMEL": ["short-hombre-hummel.webp"],
  "SHORT DAMA - HUMMEL": ["short-mujer-hummel.webp"],
  "SHORT CABALLERO - HIGH RUNNER": ["short-hombre-hr.webp"],
  "SHORT DAMA - HIGH RUNNER": ["short-mujer-hr.webp"],
  "CHOMBAS - HIGH RUNNER": ["chomba-hr.webp"],
  "BUZO - HUMMEL": ["buzo-hummel.webp"],
  "CAMPERA - HIGH RUNNER": ["campera-hr.webp"],
  "PANTALON LARGO - HIGH RUNNER": ["pantalon-hr.webp"]
};

const obtenerImagenActual = (prenda) => {
  const fotos = prenda.archivo_imagen.split(",") || [];
  const index = prenda.fotoActualIndex || 0;
  const archivo = fotos[index] || fotos[0];
  if (archivo) {
    return new URL(`/src/assets/fotos/${archivo}`, import.meta.url).href;
  }
  return "https://placehold.co/400x400?text=Indumentaria";
};

const obtenerTotalImagenes = (desc) => (catalogoImagenes[desc] || []).length;

const cambiarFoto = (prenda, delta) => {
  const total = obtenerTotalImagenes(prenda.descripcion);
  let current = prenda.fotoActualIndex || 0;
  current = (current + delta + total) % total;
  prenda.fotoActualIndex = current;
};

const obtenerStockMaximo = (prenda) => {
  const talleInfo = prenda.items[prenda.itemSeleccionado]
  return talleInfo ? talleInfo.cantidad : 0
};

const validarCantidad = (prenda) => {
  const max = obtenerStockMaximo(prenda)
  if (prenda.cantidadSeleccionada > max) prenda.cantidadSeleccionada = max
  if (prenda.cantidadSeleccionada < 1) prenda.cantidadSeleccionada = 1
};

const abrirZoom = (url) => { imagenZoom.value = url; };

const cargarStock = async () => {
  const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });
  if (respuesta.ok) {
    listaAgrupada.value = respuesta.payload;
    /*
    const mapaAgrupado = {};
    rawData.forEach(item => {
      const descripcionLimpia = item.descripcion.split(/ - TALLE/i)[0].trim();
      const talleEncontrado = item.descripcion.split(/TALLE /i)[1] || 'S/T';
      if (!mapaAgrupado[descripcionLimpia]) {
        mapaAgrupado[descripcionLimpia] = {
          descripcionLimpia,
          precio_unitario: item.precio_unitario,
          tallesDisponibles: [],
          talleSeleccionado: talleEncontrado,
          cantidadSeleccionada: 1,
          fotoActualIndex: 0
        };
      }
      mapaAgrupado[descripcionLimpia].tallesDisponibles.push({ 
        id: item.id, 
        talle: talleEncontrado,
        cantidadStock: item.cantidad 
      });
    });
    listaAgrupada.value = Object.values(mapaAgrupado);
    */
  }
};

const stockFiltrado = computed(() => {
  return listaAgrupada.value
    .filter(p => p.descripcion.toLowerCase().includes(busqueda.value.toLowerCase()))
    .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
});

const totalCarrito = computed(() => {
  return carrito.value.reduce((total, p) => total + (p.precio * p.cantidad), 0);
});

const agregarAlCarrito = (prenda) => {
  const itemTalle = prenda.items[prenda.itemSeleccionado]
  // Validamos que haya stock real antes de agregar
  if (itemTalle.cantidad <= 0) {
    notificar({ titulo: 'Sin Stock', mensaje: 'Lo sentimos, este talle se acaba de agotar.', tipo: 'danger' });
    return;
  }
  carrito.value.push({
    id_item: prenda.id_item,
    id_talle: itemTalle.id,
    descripcion: prenda.descripcion,
    precio: itemTalle.precio_unitario,
    talle: itemTalle.talle,
    cantidad: prenda.cantidadSeleccionada
  });
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
        mensaje: 'Tu pedido se registró con éxito. Recordá enviar el comprobante de transferencia.',
        tipo: 'success'
      });
      carrito.value = [];
      mostrarPago.value = false;
      await cargarStock(); // Refrescamos stock después del pedido
    } else {
      notificar({
        titulo: 'Error',
        mensaje: 'No pudimos procesar tu pedido. Intentá nuevamente.',
        tipo: 'danger'
      });
    }
  } catch{
    notificar({ titulo: 'Error de Red', mensaje: 'Error al conectar con el servidor.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarStock);
</script>

<style scoped>
.tarjeta-prenda-invertida { 
  border-radius: 20px; 
  transition: all 0.3s ease; 
  border: none !important; 
  background-color: #f1f5f9; 
  display: flex;
  flex-direction: column;
}

@media (min-width: 992px) {
  .tarjeta-prenda-invertida:hover { 
    transform: translateY(-5px); 
    box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; 
  }
}

/* ZOOM & IMAGEN */
.cursor-zoom { cursor: zoom-in; width: 100%; height: 100%; }
.zoom-icon-overlay {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.05); color: #666;
  border-radius: 50%; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s; z-index: 2;
}
.contenedor-imagen-superior:hover .zoom-icon-overlay { opacity: 1; }

.contenedor-imagen-superior { 
  background-color: #ffffff;
  height: 180px; 
  overflow: hidden; 
  border-radius: 20px 20px 0 0;
  z-index: 1;
}

.foto-prenda {
  max-width: 175%;
  max-height: 175%;
  object-fit: contain;
  mix-blend-mode: multiply;
  pointer-events: none; /* Evita que la img bloquee el click del div zoom */
}

/* BOTONES GALERÍA */
.btn-nav-foto {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.8); border: none; border-radius: 50%;
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  color: #dc2626; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.indicador-fotos {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem;
  padding: 2px 10px; border-radius: 12px; z-index: 5;
}

.cuerpo-gris-inferior {
  padding: 12px !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  border-radius: 0 0 20px 20px;
}

.extra-small-mobile { font-size: 0.8rem; line-height: 1.2; }
.extra-small-label { font-size: 0.65rem; display: block; margin-bottom: 2px; }
h5 { font-size: 1.2rem; }

.form-select-sm, .form-control-sm { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
.btn-danger { background-color: #dc2626; border: none; }

@media (max-width: 768px) {
  .contenedor-imagen-superior { height: 150px; }
}

/* MODALES */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; border-radius: 30px; width: 92%; max-width: 420px; border: none; }
.contenedor-items-carrito { max-height: 250px; overflow-y: auto; }
.modal-zoom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
.img-zoom-full { max-width: 95%; max-height: 85vh; border-radius: 10px; }
.btn-cerrar-zoom { position: absolute; top: 20px; right: 20px; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; z-index: 3001; }
</style>
