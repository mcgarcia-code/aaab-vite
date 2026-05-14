<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-box-seam-fill me-1"></i> Gestión de Inventario
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ stockFiltrado.length }} modelos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo Item</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS (Acordeón en móvil) -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Inventario</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-6">
              <div class="input-group input-group-sm shadow-sm">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3"><i class="bi bi-search"></i></span>
                <input v-model="filtros.modelo" type="text" class="form-control border-start-0 py-2" placeholder="Buscar por nombre de modelo...">
              </div>
            </div>
            <div class="col-12 col-md-auto d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 fw-bold py-2 shadow-sm">APLICAR FILTRO</button>
            </div>
          </div>
        </div>

        <div class="card-body p-3 p-md-4">
          <!-- GRILLA DE CARDS -->
          <div class="row g-3 g-md-4">
            <div v-for="modelo in stockPaginado" :key="modelo.id_item" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="card h-100 border shadow-sm tarjeta-stock-admin overflow-hidden">

                <!-- FOTO CON ACCIONES -->
                <div class="bg-white contenedor-foto-admin d-flex align-items-center justify-content-center position-relative border-bottom">
                  <img :src="obtenerImagen(modelo)" class="img-fluid foto-gestion" alt="Modelo">
                  <div class="acciones-flotantes-modelo">
                    <button @click="abrirModalEdicion(modelo)" class="btn-editar-flotante shadow" title="Editar item">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button @click="eliminarItem(modelo)" class="btn-eliminar-flotante shadow" title="Eliminar item">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>

                <!-- CONTENIDO CUERPO -->
                <div class="card-body p-3 bg-light d-flex flex-column text-center">
                  <div class="mb-2" style="min-height: 48px;">
                    <h6 class="fw-bold text-dark m-0 text-uppercase text-truncate-2 small">
                      {{ modelo.descripcion }}
                    </h6>
                      <span
                        v-if="modelo.admite_encargo"
                        class="badge bg-warning-subtle text-dark border border-warning mt-1"
                        style="font-size: 0.65rem;"
                      >
                        <i class="bi bi-box-seam-fill me-1"></i> ADMITE ENCARGO
                      </span>
                  </div>

                  <!-- TALLES Y STOCK -->
                  <div class="d-flex flex-wrap justify-content-center gap-1 mb-3">
                    <span v-for="(item, k) in modelo.items" :key="k"
                      :class="['badge-talle', item.cantidad < 5 ? 'bajo-stock' : '']">
                      {{ item.talle }}: <b>{{ item.cantidad }}</b>
                    </span>
                  </div>

                  <!-- PRECIO -->
                  <div class="mt-auto pt-2 border-top">
                    <span class="x-small text-muted text-uppercase fw-bold">Precio Sugerido</span>
                    <div class="fw-bold text-success fs-5">${{ modelo.precio_general }}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="stockPaginado.length === 0" class="text-center p-5 bg-light rounded border mt-3">
            <span class="material-icons text-muted opacity-50" style="font-size: 48px;">inventory_2</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No se encontró indumentaria.</p>
          </div>

          <!-- PAGINACIÓN -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-5" v-if="totalPaginas > 1">
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

    <!-- MODAL DE GESTIÓN (REUTILIZA TU LÓGICA) -->
    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      :titulo="modoModal === 'editar' ? 'Gestionar Modelo' : 'Nuevo Modelo'"
      :icono="modoModal === 'editar' ? 'inventory' : 'add_circle'"
      :colorIcono="modoModal === 'editar' ? 'bg-primary text-white' : 'bg-danger text-white'"
      maxWidth="650px"
    >
      <div class="row g-3 text-start p-1">
        <div class="col-md-8 col-12">
          <label class="small fw-bold text-muted text-uppercase mb-1">Nombre del Modelo *</label>
          <input v-model="formModal.descripcion" type="text" class="form-control shadow-none py-2" placeholder="Ej: REMERA NEGRA - HUMMEL">
        </div>

        <div class="col-md-4 col-12">
          <label class="small fw-bold text-muted text-uppercase mb-1">Precio ($) *</label>
          <input v-model.number="formModal.precioGeneral" type="number" min="0" class="form-control shadow-none fw-bold text-success py-2" placeholder="0.00">
        </div>

        <div class="col-12">
          <div class="form-check form-switch p-3 bg-light border rounded d-flex align-items-center justify-content-between">
            <div class="pe-3">
              <label class="form-check-label fw-bold d-block mb-0 h6" for="switchEncargo" style="cursor: pointer;">
                Permitir encargos sin stock
              </label>
              <span class="text-muted small">El usuario podrá pedirlo aunque el stock sea cero.</span>
            </div>
            <input class="form-check-input shadow-none fs-3 m-0" type="checkbox" role="switch" id="switchEncargo" v-model="formModal.admite_encargo" style="cursor: pointer;">
          </div>
        </div>

        <div class="col-12">
          <label class="small fw-bold text-muted text-uppercase mb-1">Imágenes del Modelo</label>
          <div class="border rounded-3 p-4 text-center bg-light border-dashed">
            <input type="file" @change="manejarArchivos" accept="image/*" multiple class="form-control form-control-sm mb-2 shadow-none">
            <div v-if="archivosSeleccionados.length > 0" class="text-start mt-3">
              <span class="x-small fw-bold text-success d-block mb-2">Archivos ({{ archivosSeleccionados.length }}):</span>
              <ul class="list-group list-group-flush border rounded overflow-hidden shadow-sm">
                <li v-for="(file, i) in archivosSeleccionados" :key="i" class="list-group-item d-flex justify-content-between align-items-center bg-white py-1">
                  <span class="x-small text-muted text-truncate w-75">{{ file.name }}</span>
                  <button @click="eliminarArchivo(i)" class="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">
                    <i class="bi bi-x fs-5"></i>
                  </button>
                </li>
              </ul>
            </div>
            <span class="x-small text-muted" v-else>Formatos: .webp, .png, .jpg</span>
          </div>
        </div>

        <div v-if="modoModal === 'editar'" class="col-12 mt-3">
          <label class="small fw-bold text-muted text-uppercase mb-2 d-block border-bottom pb-1">Cantidades por Talle</label>
          <div class="row g-2">
            <div v-for="(t, index) in formModal.items" :key="index" class="col-6 col-md-4">
              <div class="d-flex align-items-center p-2 bg-light rounded border border-secondary-subtle shadow-sm">
                <span class="fw-bold text-danger me-2 text-center" style="width: 35px;">{{ t.talle }}</span>
                <div class="input-group input-group-sm">
                  <input v-model.number="t.cantidad" type="number" min="0" class="form-control text-center shadow-none fw-bold border-secondary-subtle">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarModal" class="btn btn-light border-0 px-4 fw-bold rounded-pill">CANCELAR</button>
        <button @click="guardarCambios" class="btn btn-danger px-4 fw-bold shadow-sm rounded-pill" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          GUARDAR CAMBIOS
        </button>
      </template>
    </ModalBase>

    <ModalExito
      :visible="mostrarModalEliminar"
      titulo="Eliminar Modelo"
      mensaje="¿Estás seguro que querés eliminar este modelo del inventario?"
      tipo="danger"
      :tieneAccion="true"
      @cerrar="mostrarModalEliminar = false"
      @confirmar="confirmarEliminacionItem"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';
import ModalExito from '@/components/ModalExito.vue';

useHead({
  title: 'Inventario | AAAB',
  meta: [{ name: 'description', content: 'Gestión de inventario de indumentaria.' }],
});

const notificar = inject('notificar');

const listaStock = ref([]);
const cargando = ref(false);

const filtros = reactive({ modelo: '' });
const mostrarFiltrosMobile = ref(false);

const tallesEstandar = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Único'];
const ordenTalles = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8, '4XL': 9, 'Único': 10 };

const anchoPantalla = ref(window.innerWidth);
const actualizarAncho = () => { anchoPantalla.value = window.innerWidth; };

const paginaActual = ref(1);
const registrosPorPagina = computed(() => anchoPantalla.value <= 768 ? 6 : 16);

const mostrarModal = ref(false);
const modoModal = ref('nuevo');
const archivosSeleccionados = ref([]);

const mostrarModalEliminar = ref(false);
const itemAEliminar = ref(null);

const formModal = ref({ id_item: null, descripcion: '', precioGeneral: 0, admite_encargo: false, items: [] });

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const stockFiltrado = computed(() => {
  return listaStock.value.filter(l => normalizar(l.descripcion).includes(normalizar(filtros.modelo)));
});

const totalPaginas = computed(() => Math.ceil(stockFiltrado.value.length / registrosPorPagina.value) || 1);
const stockPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
  return stockFiltrado.value.slice(inicio, inicio + registrosPorPagina.value);
});

const cambiarPagina = (delta) => {
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
    setTimeout(() => {
      if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => {
  if (nuevo === 0) paginaActual.value = 1;
  else if (paginaActual.value > nuevo) paginaActual.value = nuevo;
});

const obtenerStock = async () => {
  const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });

  if (respuesta.ok) {
    listaStock.value = respuesta.payload.map(prenda => {
      prenda.items.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL'; });
      prenda.items = prenda.items.filter(i => tallesEstandar.includes(i.talle));
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

const abrirModalNuevo = () => {
  modoModal.value = 'nuevo';
  archivosSeleccionados.value = [];
  formModal.value = {
    id_item: null,
    descripcion: '',
    precioGeneral: 0, // Reinicia el precio general
    admite_encargo: false,
    items: []
  };
  mostrarModal.value = true;
};

const abrirModalEdicion = (modelo) => {
  modoModal.value = 'editar';
  archivosSeleccionados.value = [];

  let itemsCombinados = JSON.parse(JSON.stringify(modelo.items));
  itemsCombinados.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL'; });
  itemsCombinados = itemsCombinados.filter(i => tallesEstandar.includes(i.talle));

  let tallesExistentes = itemsCombinados.map(v => v.talle);

  tallesEstandar.forEach(talle => {
    if (!tallesExistentes.includes(talle)) {
      itemsCombinados.push({ id: null, talle: talle, cantidad: 0, precio_general: modelo.precio_general });
    }
  });

  itemsCombinados.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99));

  formModal.value = {
    id_item: modelo.id_item,
    descripcion: modelo.descripcion,
    precioGeneral: modelo.precio_general, // Asigna el precio general al abrir
    admite_encargo: modelo.admite_encargo,
    items: itemsCombinados
  };

  mostrarModal.value = true;
};

const eliminarItem = (item) => {
  itemAEliminar.value = item;
  mostrarModalEliminar.value = true;
};

const confirmarEliminacionItem = async () => {
  if (!itemAEliminar.value) return;

  const r = await api.post({
    entity: 'indumentaria',
    action: 'eliminarItem',
    payload: { id_item: itemAEliminar.value.id_item }
  });

  if (r.ok) {
    const indice = listaStock.value.findIndex(modelo => modelo.id_item === itemAEliminar.value.id_item);
    if (indice !== -1) listaStock.value.splice(indice, 1);
    notificar({ titulo: 'Item eliminado', mensaje: 'El item fue eliminado correctamente.', tipo: 'success' });
  } else {
    notificar({ titulo: 'Error', mensaje: 'No se pudo eliminar el item.', tipo: 'danger' });
  }

  mostrarModalEliminar.value = false;
  itemAEliminar.value = null;
};


const manejarArchivos = (event) => {
  archivosSeleccionados.value = Array.from(event.target.files);
};

const eliminarArchivo = (index) => {
  archivosSeleccionados.value.splice(index, 1);
};

const guardarCambios = async () => {
  if (!formModal.value.descripcion) {
    notificar({ titulo: 'Faltan datos', mensaje: 'El nombre del modelo es obligatorio.', tipo: 'danger' });
    return;
  }

  // Validación del precio general único
  if (formModal.value.precioGeneral <= 0) {
    notificar({ titulo: 'Atención', mensaje: 'Debes ingresar un precio mayor a 0.', tipo: 'warning' });
    return;
  }
  const itemsTodos = modoModal.value === 'editar'
    ? formModal.value.items.map(t => ({
      id: t.id,
      talle: t.talle,
      cantidad: t.cantidad || 0,
    }))
    : [];
  cargando.value = true;
  let res;

  const flagAdmiteEncargo = formModal.value.admite_encargo ? 1 : 0;

  const formData = new FormData();
  formData.append('descripcion', formModal.value.descripcion.toUpperCase());
  formData.append('admiteEncargo', flagAdmiteEncargo);
  formData.append('precioGeneral', formModal.value.precioGeneral)

  if (archivosSeleccionados.value.length > 0) {
    archivosSeleccionados.value.forEach(file => {
      formData.append('fotos[]', file);
    });
  }
  console.log('formData', formData)
  if (modoModal.value === 'editar') {
    formData.append('id_item', formModal.value.id_item);
    formData.append('items', JSON.stringify(itemsTodos));
    res = await api.postFile({
      entity: 'indumentaria',
      action: 'actualizarStock',
      payload: formData
    })
  } else {
    formData.append('items', JSON.stringify([]));
    res = await api.postFile({
      entity: 'indumentaria',
      action: 'agregarItem',
      payload: formData
    });
  }

  if (res.ok) {
    notificar({ titulo: '¡Éxito!', mensaje: 'Inventario guardado correctamente.', tipo: 'success' });
    cerrarModal();
    await obtenerStock();
  } else {
    notificar({ titulo: 'Error', mensaje: 'Hubo un problema al guardar el inventario.', tipo: 'danger' });
  }

  cargando.value = false;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  cargando.value = false;
};

const limpiarFiltros = () => { filtros.modelo = ''; };

const obtenerImagen = (item) => {
  const primeraFoto = item.archivo_imagen ? item.archivo_imagen.split(',')[0] : null;
  return primeraFoto ? item.folder_imagenes + encodeURIComponent(primeraFoto) : "https://placehold.co/400x400?text=Indumentaria";
};

const exportarExcel = () => {
  const data = stockFiltrado.value.map(item => {
    let row = { 'ID Item': item.id_item, 'Modelo': item.descripcion, 'Precio Referencia': `$${item.precio_general}` };
    tallesEstandar.forEach(talle => {
      const stock = item.items.find(i => i.talle === talle);
      row[`Stock ${talle}`] = stock ? stock.cantidad : 0;
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");
  XLSX.writeFile(wb, "Inventario_Indumentaria.xlsx");
};

onMounted(() => {
  window.addEventListener('resize', actualizarAncho);
  obtenerStock();
});

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAncho);
});
</script>

<style scoped>
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
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.tarjeta-stock-admin {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.tarjeta-stock-admin:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.15) !important;
}

.contenedor-foto-admin {
  height: clamp(250px, 25vh, 250px);
  padding: 5px;
}

.foto-gestion {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.acciones-flotantes-modelo {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 5;
}

.btn-editar-flotante, .btn-eliminar-flotante {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-editar-flotante { background: #212529; }
.btn-editar-flotante:hover { background: #0d6efd; }
.btn-eliminar-flotante { background: #dc3545; }
.btn-eliminar-flotante:hover { background: #7f1d1d; }

.badge-talle {
  font-size: 0.65rem;
  background: white;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  color: #475569;
}

.bajo-stock {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}

.x-small { font-size: 0.7rem; }
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

</style>
