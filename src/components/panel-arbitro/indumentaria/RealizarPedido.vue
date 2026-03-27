

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
      <div v-for="prenda in stockFiltrado" :key="prenda.descripcionLimpia" class="col-6 col-md-4 col-lg-3 text-center">
        <div class="card h-100 border-0 shadow-sm tarjeta-prenda-invertida overflow-hidden">
          
          <div 
            class="bg-white d-flex align-items-center justify-content-center contenedor-imagen-superior cursor-zoom"
            @click="abrirZoom(obtenerImagen(prenda.descripcionLimpia))"
          >
            <img 
              :src="obtenerImagen(prenda.descripcionLimpia)" 
              class="img-fluid foto-prenda"
              alt="Indumentaria"
            >
            <div class="zoom-icon-overlay">
              <i class="bi bi-search"></i>
            </div>
          </div>
          
          <div class="card-body p-2 p-md-3 d-flex flex-column cuerpo-gris-inferior">
            <h6 class="fw-bold text-dark mb-1 text-uppercase extra-small-mobile">{{ prenda.descripcionLimpia }}</h6>
            <h5 class="fw-bold text-danger mb-2 mb-md-3">$ {{ prenda.precio_unitario }}</h5>
            
            <div class="mt-auto">
              <label class="small fw-bold text-muted mb-1 d-none d-md-block">Elegí tu talle:</label>
              <select v-model="prenda.talleSeleccionado" class="form-select form-select-sm rounded-pill mb-2 mb-md-3 shadow-sm border-danger-subtle bg-white">
                <option v-for="t in prenda.tallesDisponibles" :key="t.id" :value="t.talle">
                  {{ t.talle }}
                </option>
              </select>

              <button @click="agregarAlCarrito(prenda)" class="btn btn-danger btn-sm w-100 rounded-pill fw-bold shadow-sm py-2">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="imagenZoom" class="modal-zoom-overlay animate__animated animate__fadeIn" @click="imagenZoom = null">
      <button class="btn-cerrar-zoom" @click="imagenZoom = null">
        <i class="bi bi-x-lg"></i>
      </button>
      <img :src="imagenZoom" class="img-zoom-full animate__animated animate__zoomIn">
    </div>

    <div v-if="mostrarCarrito" class="modal-overlay d-flex align-items-center justify-content-center px-3">
      <div class="modal-content p-4 shadow-lg animate__animated animate__fadeInUp">
        <h4 class="fw-bold mb-4 text-dark"><i class="bi bi-cart-check text-danger me-2"></i>Tu Pedido</h4>
        <div v-if="carrito.length === 0" class="text-center py-4 text-muted">El carrito está vacío</div>
        <div v-else class="contenedor-items-carrito mb-4 px-1">
          <div v-for="(p, i) in carrito" :key="i" class="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
              <div class="fw-bold small text-dark">{{ p.descripcion }}</div>
              <div class="text-muted extra-small">Talle: {{ p.talle }} | ${{ p.precio }}</div>
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
        <button @click="realizarPedidoFinal" class="btn btn-danger w-100 rounded-pill fw-bold shadow-lg py-3">Confirmar Pedido</button>
        <button @click="mostrarPago = false" class="btn btn-link text-muted small text-decoration-none mt-2">Volver</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head'


// Título y descripción específicos
useHead({
  title: 'Realizar Pedido| AAAB',
  meta: [
    {
      name: 'description',
      content: 'Realizá tu pedido de indumentaria para los torneos de la Asociación Argentina de Árbitros de Balonmano.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Realizar Pedido | AAAB',
    },
    {
      property: 'og:description',
      content: 'Realizá tu pedido de indumentaria para los torneos de la Asociación Argentina de Árbitros de Balonmano.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

const listaAgrupada = ref([]);
const busqueda = ref('');
const carrito = ref([]);
const mostrarCarrito = ref(false);
const mostrarPago = ref(false);
const imagenZoom = ref(null);

const catalogoImagenes = {
  "REMERA AMARILLA - CH1": "amarillo-ch1.webp",
  "REMERA NEGRA - HUMMEL": "negra-hummel.webp",
  "REMERA NARANJA - HUMMEL": "naranja-hummel.webp",
  "REMERA VERDE AGUA - HIGH RUNNER": "verde-agua-hr.webp",
  "REMERA NEGRA - HIGH RUNNER": "negra-hr.webp",
  "REMERA NARANJA - HIGH RUNNER": "naranja-hr.webp",
  "REMERA CELESTE - HIGH RUNNER": "celeste-hr.webp",
  "SHORT CABALLERO - HUMMEL": "short-hombre-hummel.webp",
  "SHORT DAMA - HUMMEL": "short-mujer-hummel.webp",
  "SHORT CABALLERO - HIGH RUNNER": "short-hombre-hr.webp",
  "SHORT DAMA - HIGH RUNNER": "short-mujer-hr.webp",
  "CHOMBAS - HIGH RUNNER": "chomba-hr.webp",
  "BUZO - HUMMEL": "buzo-hummel.webp",
  "CAMPERA - HIGH RUNNER": "campera-hr.webp",
  "PANTALON LARGO - HIGH RUNNER": "pantalon-hr.webp"
};

const obtenerImagen = (descripcion) => {
  const archivo = catalogoImagenes[descripcion];
  if (archivo) {
    return new URL(`/src/assets/fotos/${archivo}`, import.meta.url).href;
  }
  return "https://placehold.co/400x400?text=Indumentaria";
};

const abrirZoom = (url) => { imagenZoom.value = url; };

const cargarStock = async () => {
  const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });
  if (respuesta.ok) {
    const rawData = respuesta.payload;
    const mapaAgrupado = {};
    rawData.forEach(item => {
      const descripcionLimpia = item.descripcion.split(/ - TALLE/i)[0].trim();
      const talleEncontrado = item.descripcion.split(/TALLE /i)[1] || 'S/T';
      if (!mapaAgrupado[descripcionLimpia]) {
        mapaAgrupado[descripcionLimpia] = {
          descripcionLimpia: descripcionLimpia,
          precio_unitario: item.precio_unitario,
          tallesDisponibles: [],
          talleSeleccionado: talleEncontrado
        };
      }
      mapaAgrupado[descripcionLimpia].tallesDisponibles.push({ id: item.id, talle: talleEncontrado });
    });
    listaAgrupada.value = Object.values(mapaAgrupado);
  }
};

const stockFiltrado = computed(() => {
  return listaAgrupada.value
    .filter(p => p.descripcionLimpia.toLowerCase().includes(busqueda.value.toLowerCase()))
    .sort((a, b) => a.descripcionLimpia.localeCompare(b.descripcionLimpia));
});

const totalCarrito = computed(() => {
  return carrito.value.reduce((total, p) => total + p.precio, 0);
});

const agregarAlCarrito = (prenda) => {
  const itemTalle = prenda.tallesDisponibles.find(t => t.talle === prenda.talleSeleccionado);
  carrito.value.push({
    id: itemTalle.id,
    descripcion: prenda.descripcionLimpia,
    precio: prenda.precio_unitario,
    talle: prenda.talleSeleccionado
  });
  // Abrimos el modal inmediatamente para preguntar si sigue comprando
  mostrarCarrito.value = true;
};

const confirmarPedido = () => { mostrarCarrito.value = false; mostrarPago.value = true; };

const realizarPedidoFinal = async () => {
  const respuesta = await api.post({
    entity: 'indumentaria',
    action: 'crearPedidoMultiple',
    payload: { items: carrito.value, total: totalCarrito.value }
  });
  if (respuesta.ok) {
    alert("¡Pedido realizado con éxito!");
    carrito.value = [];
    mostrarPago.value = false;
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

.cursor-zoom { cursor: zoom-in; position: relative; }
.zoom-icon-overlay {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.05); color: #666;
  border-radius: 50%; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.cursor-zoom:hover .zoom-icon-overlay { opacity: 1; }

.contenedor-imagen-superior { 
  background-color: #ffffff;
  height: 180px; 
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; 
  padding: 5px !important; 
  border-radius: 20px 20px 0 0;
}

.foto-prenda {
  max-width: 175%;
  max-height: 175%;
  object-fit: contain;
  /* MIMETISMO: Mezcla la imagen con el fondo blanco de la card */
  mix-blend-mode: multiply;
}

.modal-zoom-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); z-index: 3000;
  display: flex; align-items: center; justify-content: center;
}
.img-zoom-full { max-width: 95%; max-height: 85vh; border-radius: 10px; }
.btn-cerrar-zoom {
  position: absolute; top: 20px; right: 20px;
  background: white; border: none; border-radius: 50%;
  width: 40px; height: 40px; font-size: 1.2rem;
}

.cuerpo-gris-inferior {
  padding: 15px !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  border-radius: 0 0 20px 20px;
}

.extra-small-mobile { font-size: 0.8rem; line-height: 1.2; }
h5 { font-size: 1.2rem; }

.form-select:focus { border-color: #dc2626; box-shadow: none; }
.btn-danger { background-color: #dc2626; border: none; }

@media (max-width: 768px) {
  .contenedor-imagen-superior { height: 150px; }
  .extra-small-mobile { font-size: 0.75rem !important; }
}

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; border-radius: 30px; width: 92%; max-width: 420px; border: none; }
.contenedor-items-carrito { max-height: 250px; overflow-y: auto; }
</style>