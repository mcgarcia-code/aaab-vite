<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">

        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2" style="font-size: 1.25rem;">
              <i class="bi bi-box-seam-fill me-1"></i> Gestión de Inventario
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ stockFiltrado.length }} modelos</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
              <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
            </button>

            <button @click="limpiarFiltros" class="btn-action btn-clear" title="Limpiar Filtros">
              <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn-action btn-clear-checks" title="Nuevo Modelo">
              <span class="material-icons">add_box</span> <span class="btn-text">Nuevo Item</span>
            </button>

            <button @click="exportarExcel" class="btn-action btn-export" title="Exportar a Excel">
              <span class="material-icons">download</span> <span class="btn-text">Excel</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only-flex flex-column animate__animated animate__fadeInDown animate__faster" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase" style="letter-spacing: 0.5px;">Filtrar Inventario</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1 bg-white shadow-sm" style="line-height: 1;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>
          <input v-model="filtros.modelo" placeholder="Buscar modelo..." class="form-control bg-white shadow-sm border-secondary-subtle" style="font-size: 16px;">
          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm">Aplicar Filtro</button>
        </div>

        <div class="card-body p-3 p-md-4">
          
          <div class="mb-4 desktop-only">
            <input 
              v-model="filtros.modelo" 
              type="text" 
              class="form-control rounded-pill shadow-sm px-4 border input-filtro-custom" 
              placeholder="Buscar modelo..."
            >
          </div>

          <div class="row g-3">
            <div v-for="modelo in stockPaginado" :key="modelo.id_item" class="col-12 col-md-4 col-lg-3">
              <div class="card h-100 border-0 shadow-sm tarjeta-stock-admin overflow-hidden">
                
                <div class="bg-white contenedor-foto-admin d-flex align-items-center justify-content-center position-relative border-bottom">
                  <img :src="obtenerImagen(modelo.archivo_imagen)" class="img-fluid foto-gestion" alt="Modelo">
                  <div class="acciones-flotantes-modelo">
                    <button @click="abrirModalEdicion(modelo)" class="btn-editar-flotante shadow" title="Editar item">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button @click="eliminarItem(modelo)" class="btn-eliminar-flotante shadow" title="Eliminar item">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>

                <div class="card-body p-3 cuerpo-gris-admin text-center d-flex flex-column">
                  <div class="contenedor-titulo-stock mb-2">
                    <h6 class="fw-bold text-dark m-0 text-uppercase text-truncate-2">
                      {{ modelo.descripcion }}
                    </h6>
                  </div>
                  
                  <div class="d-flex flex-wrap justify-content-center gap-1 mb-3">
                    <span v-for="(item, k) in modelo.items" :key="k" 
                      :class="['badge-talle', item.cantidad < 5 ? 'bajo-stock' : '']">
                      {{ item.talle }}: <b>{{ item.cantidad }}</b>
                    </span>
                  </div>

                  <div class="mt-auto pt-2 border-top text-center">
                    <span class="small text-muted">Precio Sugerido:</span>
                    <div class="fw-bold text-success fs-5">${{ modelo.precio_unitario }}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div v-if="stockPaginado.length === 0" class="text-center p-5 bg-light rounded shadow-sm border mt-3">
            <span class="material-icons text-muted" style="font-size: 48px;">inventory_2</span>
            <p class="text-muted mt-2 mb-0 fw-bold">No se encontró indumentaria.</p>
          </div>

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

        </div> </div> </div>

    <Teleport to="body">
    <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10001;">
      <div class="modal-content-exito animate__animated animate__zoomIn p-0 overflow-hidden shadow-lg" style="max-width: 650px; width: 95%;">
        
        <div class="p-4 border-bottom text-center" :class="modoModal === 'editar' ? 'bg-light' : 'bg-danger-subtle'">
          <div class="icon-circle-exito bg-white shadow-sm mb-2" style="width: 60px; height: 60px;">
            <span class="material-icons" :class="modoModal === 'editar' ? 'text-primary' : 'text-danger'">{{ modoModal === 'editar' ? 'inventory' : 'add_circle' }}</span>
          </div>
          <h4 class="fw-bold m-0 text-dark">{{ modoModal === 'editar' ? 'Gestionar Modelo' : 'Nuevo Modelo' }}</h4>
          <p v-if="modoModal === 'editar'" class="text-muted small m-0 mt-1">ID #{{ formModal.id_item }}</p>
        </div>

        <div class="p-4" style="max-height: 60vh; overflow-y: auto;">
          <div class="row g-3 text-start">
            
            <div class="col-12">
              <label class="small fw-bold">Nombre del Modelo *</label>
              <input v-model="formModal.descripcion" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: REMERA NEGRA - HUMMEL">
            </div>

            <div class="col-12">
              <label class="small fw-bold">Imágenes del Modelo (.webp, .png, .jpg)</label>
              <div class="border rounded p-3 text-center bg-light" style="border-style: dashed !important; border-color: #cbd5e1 !important;">
                
                <input type="file" @change="manejarArchivos" accept="image/*" multiple class="form-control form-control-sm mb-2 shadow-none border-secondary-subtle">
                
                <div v-if="archivosSeleccionados.length > 0" class="text-start mt-2">
                  <span class="extra-small fw-bold text-success d-block mb-2">Archivos seleccionados ({{ archivosSeleccionados.length }}):</span>
                  <ul class="list-group mb-0 gap-1">
                    <li v-for="(file, i) in archivosSeleccionados" :key="i" class="list-group-item d-flex justify-content-between align-items-center py-1 px-2 border border-secondary-subtle rounded shadow-sm bg-white">
                      <span class="extra-small text-muted text-truncate" style="max-width: 85%;">{{ file.name }}</span>
                      <button @click="eliminarArchivo(i)" class="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 22px; height: 22px;" title="Quitar imagen">
                        <span class="material-icons" style="font-size: 14px;">close</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <span class="extra-small text-muted" v-else>Seleccioná una o más imágenes.</span>
                
              </div>
            </div>

            <div v-if="modoModal === 'editar'" class="col-12 mt-4">
              <label class="small fw-bold mb-2 d-block border-bottom pb-1">Stock y Precio por Talle</label>
              
              <div v-for="(t, index) in formModal.items" :key="index" class="row g-2 align-items-center mb-2 p-2 bg-light rounded border border-secondary-subtle">
                <div class="col-2 fw-bold text-center text-danger">{{ t.talle }}</div>
                
                <div class="col-5">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white text-muted border-secondary-subtle" style="font-size: 0.75rem;">Cant:</span>
                    <input v-model.number="t.cantidad" type="number" min="0" class="form-control text-center shadow-none fw-bold border-secondary-subtle">
                  </div>
                </div>

                <div class="col-5">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white text-muted border-secondary-subtle" style="font-size: 0.75rem;">$</span>
                    <input v-model.number="t.precio_unitario" type="number" min="0" class="form-control text-end shadow-none fw-bold border-secondary-subtle" placeholder="Precio">
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="p-3 border-top d-flex gap-2 justify-content-end bg-light">
          <button @click="cerrarModal" class="btn btn-light border px-4 fw-bold rounded-pill">CANCELAR</button>
          <button @click="guardarCambios" class="btn btn-danger px-4 fw-bold shadow-sm rounded-pill" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            GUARDAR
          </button>
        </div>

      </div>
    </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head';
import { WEB_URL } from '@/config/env'


useHead({
  title: 'Inventario | AAAB',
  meta: [{ name: 'description', content: 'Gestión de inventario de indumentaria.' }],
});

const notificar = inject('notificar');

const listaStock = ref([]);
const cargando = ref(false);

const filtros = reactive({ modelo: '' });
const mostrarFiltrosMobile = ref(false);

// ESCALA OFICIAL Y ORDEN
const tallesEstandar = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const ordenTalles = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8, '4XL': 9 };

// --- LÓGICA DE PAGINACIÓN RESPONSIVE ---
const anchoPantalla = ref(window.innerWidth);
const actualizarAncho = () => { anchoPantalla.value = window.innerWidth; };

const paginaActual = ref(1);
// 6 registros en móvil, 12 en escritorio
const registrosPorPagina = computed(() => anchoPantalla.value <= 768 ? 6 : 15);

// Modal Variables
const mostrarModal = ref(false);
const modoModal = ref('nuevo');
const archivosSeleccionados = ref([]);

const formModal = ref({ id_item: null, descripcion: '', precioUnitario: 0, items: [] });

// Filtros y Paginación
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const stockFiltrado = computed(() => {
  return listaStock.value.filter(l => normalizar(l.descripcion).includes(normalizar(filtros.modelo)));
});

const totalPaginas = computed(() => Math.ceil(stockFiltrado.value.length / registrosPorPagina.value) || 1);
const stockPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
  return stockFiltrado.value.slice(inicio, inicio + registrosPorPagina.value);
});

// FUNCIÓN: Cambiar página y scrollear arriba SOLO EN MOBILE
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { 
  if (nuevo === 0) paginaActual.value = 1;
  else if (paginaActual.value > nuevo) paginaActual.value = nuevo; 
});

// API Calls
const obtenerStock = async () => {
  cargando.value = true;
  const res = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });
  if (res.ok) {
    // 1. Convertimos XXXL a 3XL y filtramos 5XL apenas llegan de la BD
    res.payload.forEach(modelo => {
      modelo.items.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL'; });
      modelo.items = modelo.items.filter(i => tallesEstandar.includes(i.talle));
      modelo.items.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99));
    });
    listaStock.value = res.payload;
  }
  cargando.value = false;
};

// Acciones Modal
const abrirModalNuevo = () => {
  modoModal.value = 'nuevo';
  archivosSeleccionados.value = [];
  formModal.value = { 
    id_item: null, 
    descripcion: '', 
    precioUnitario: 0, 
    items: []
  };
  mostrarModal.value = true;
};

const abrirModalEdicion = (modelo) => {
  modoModal.value = 'editar';
  archivosSeleccionados.value = [];
  
  // Convertimos XXXL a 3XL para la edición y filtramos 5XL
  let itemsCombinados = JSON.parse(JSON.stringify(modelo.items));
  itemsCombinados.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL'; });
  itemsCombinados = itemsCombinados.filter(i => tallesEstandar.includes(i.talle));

  let tallesExistentes = itemsCombinados.map(v => v.talle);

  tallesEstandar.forEach(talle => {
    if (!tallesExistentes.includes(talle)) {
      itemsCombinados.push({ id: null, talle: talle, cantidad: 0, precio_unitario: modelo.precio_unitario });
    }
  });

  // Orden correcto de los talles
  itemsCombinados.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99));

  formModal.value = {
    id_item: modelo.id_item,
    descripcion: modelo.descripcion,
    precioUnitario: modelo.precio_unitario,
    items: itemsCombinados
  };
  
  mostrarModal.value = true;
};

const confirmarEliminacionItem = async (item) => {
  const r = await api.post({
    entity: 'indumentaria',
    action: 'eliminarItem',
    payload: { id_item: item.id_item }
  });

  if (r.ok) {
    const indice = listaStock.value.findIndex(modelo => modelo.id_item === item.id_item);
    if (indice !== -1) {
      listaStock.value.splice(indice, 1);
    }

    notificar({
      titulo: 'Item eliminado',
      mensaje: 'El item fue eliminado correctamente.',
      tipo: 'success'
    });
  } else {
    notificar({
      titulo: 'Error',
      mensaje: 'No se pudo eliminar el item.',
      tipo: 'danger'
    });
  }
};

const eliminarItem = (item) => {
  notificar({
    titulo: '¿Eliminar Item?',
    mensaje: `Se eliminará "${item.descripcion}" del inventario.`,
    tipo: 'danger',
    alConfirmar: () => confirmarEliminacionItem(item)
  });
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

  // 1. Buscamos el precio principal (el primero mayor a 0)
  const precioRef = modoModal.value === 'editar'
    ? formModal.value.items.find(t => t.precio_unitario > 0)?.precio_unitario || 0
    : 0;

  if (modoModal.value === 'editar' && precioRef <= 0) {
    notificar({ titulo: 'Atención', mensaje: 'Debes ingresar un precio válido en al menos un talle.', tipo: 'warning' });
    return;
  }

  // 2. FORZAMOS A GUARDAR TODOS LOS TALLES. 
  const itemsTodos = modoModal.value === 'editar'
    ? formModal.value.items.map(t => ({
    id: t.id,
    talle: t.talle,
    cantidad: t.cantidad || 0,
    precioUnitario: t.precio_unitario > 0 ? t.precio_unitario : precioRef
    }))
    : [];

  cargando.value = true;
  let res;

  if (modoModal.value === 'editar') {
    const payload = {
      id_item: formModal.value.id_item,
      descripcion: formModal.value.descripcion.toUpperCase(),
      precioUnitario: precioRef,
      items: itemsTodos
    };
    res = await api.post({ entity: 'indumentaria', action: 'actualizarStock', payload });
  } else {
    const formData = new FormData();
    formData.append('descripcion', formModal.value.descripcion.toUpperCase());
    formData.append('items', JSON.stringify([]));
    
    if (archivosSeleccionados.value.length > 0) {
      archivosSeleccionados.value.forEach(file => {
        formData.append('fotos[]', file);
      });
    }

    res = await api.postFile({ entity: 'indumentaria', action: 'agregarItem', payload: formData });
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

const obtenerImagen = (nombre) => {
  const primeraFoto = nombre ? nombre.split(',')[0] : null;
  return primeraFoto ? `${WEB_URL}/fotos/${encodeURIComponent(primeraFoto)}` : "  https://placehold.co/400x400?text=Indumentaria";
};

const exportarExcel = () => {
  const data = stockFiltrado.value.map(item => {
    let row = { 'ID Item': item.id_item, 'Modelo': item.descripcion, 'Precio Referencia': `$${item.precio_unitario}` };
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

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', actualizarAncho);
  obtenerStock();
});

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAncho);
});
</script>

<style scoped>
/* ESTILOS WRAPPER ESTÁNDAR */
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; box-sizing: border-box; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }

/* CABECERA ORIGINAL */
.header-section { background: white; padding: 15px 25px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; }
.btn-export { background: #10b981; color: white; }

/* ESTILOS EXACTOS DE PAGINACIÓN */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: #0f172a; font-size: 0.85rem; font-weight: 600; }

/* CARDS DE STOCK - Con mayor sombra y borde para resaltar sobre el fondo blanco */
.tarjeta-stock-admin { border-radius: 20px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; border: 1px solid #e2e8f0 !important; }
.tarjeta-stock-admin:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.15) !important; }
.contenedor-foto-admin { height: 200px; padding: 15px; }
.foto-gestion { max-height: 175%; max-width: 175%; object-fit: contain; mix-blend-mode: multiply; }
.cuerpo-gris-admin { background-color: #f1f5f9; border-radius: 0 0 20px 20px; flex-grow: 1; padding: 12px !important; }

.contenedor-titulo-stock { min-height: 40px; display: flex; align-items: center; justify-content: center; }
.text-truncate-2 { font-size: 0.85rem; line-height: 1.2; }

.badge-talle { font-size: 0.65rem; background: white; padding: 3px 8px; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; white-space: nowrap; }
.bajo-stock { border-color: #fecaca; background: #fef2f2; color: #dc2626; }

.input-filtro-custom { font-size: 1rem !important; padding: 0.5rem 1rem; height: auto !important; border-color: #cbd5e1 !important; }
.input-filtro-custom:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; outline: none; border-color: #3b82f6 !important;}

.acciones-flotantes-modelo { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; z-index: 5; }
.btn-editar-flotante { width: 32px; height: 32px; border-radius: 50%; background: #212529; color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; }
.btn-editar-flotante:hover { background: #ef4444; }
.btn-eliminar-flotante { width: 32px; height: 32px; border-radius: 50%; background: #b91c1c; color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s; }
.btn-eliminar-flotante:hover { background: #7f1d1d; }

.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-content-exito { background: white; border-radius: 16px; border: none; }
.icon-circle-exito { border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

.desktop-only { display: block; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }


@media (min-width: 769px) {
  .filter-input-mobile { font-size: 0.85rem; }
}

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
  
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; width: 45px; }
}

/* LA CLAVE DE LA ESTRUCTURA MÓVIL EXACTA */
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
  
  /* Titulo a la izquierda (respetando borde rojo), botones centrados abajo */
  .header-section { padding: 15px; flex-direction: column; align-items: flex-start; text-align: left; gap: 15px; }
  .header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%;}
  .header-info h4 { font-size: 1.25rem !important; justify-content: flex-start; }
  .header-info span.counter { font-size: 0.75rem !important; }
  
  .header-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-action span.material-icons { margin: 0; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }
  
  .filter-grid-mobile { grid-template-columns: 1fr; }
  .filter-grid-mobile select.full-width { grid-column: span 1; }
}



.animate__animated { animation-duration: 0.5s; }
</style>
