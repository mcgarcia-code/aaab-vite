<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-white m-0 fs-2">Inventario Agrupado</h2>
        <p class="small text-white opacity-75 m-0">Gestioná el stock por modelo y talles</p>
      </div>
      <button @click="abrirModalNuevo()" class="btn btn-light rounded-pill px-4 shadow-sm fw-bold text-danger">
        <i class="bi bi-plus-lg me-2"></i> Item
      </button>
    </div>

    <div class="mb-4">
      <input 
        v-model="filtroTexto" 
        type="text" 
        class="form-control rounded-pill shadow-sm px-4 border-0 input-filtro-custom" 
        placeholder="Buscar modelo..."
      >
    </div>

    <div class="row g-3">
      <div v-for="(modelo, key) in listaStock" :key="key" class="col-6 col-md-4 col-lg-3">
        <div class="card h-100 border-0 shadow-sm tarjeta-stock-admin overflow-hidden">
          
          <div class="bg-white contenedor-foto-admin d-flex align-items-center justify-content-center position-relative">
            <img :src="obtenerImagen(modelo.archivo_imagen)" class="img-fluid foto-gestion" alt="Modelo">
            <button @click="abrirModalEdicion(modelo)" class="btn-editar-flotante shadow">
              <i class="bi bi-pencil-fill"></i>
            </button> 
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

    <div v-if="mostrarModal" class="modal-overlay d-flex align-items-center justify-content-center px-3">
      <div class="modal-content animate__animated animate__zoomIn p-4 shadow-lg border-0">
        <div class="text-center mb-3">
          <h4 class="fw-bold m-0">{{ editando ? 'Gestionar Stock' : 'Nuevo Modelo' }}</h4>
        </div>

        <div class="contenedor-formulario-scroll px-1">
          <template v-if="!editando">
            <div class="mb-4">
              <label class="form-label small fw-bold text-muted d-block">Imágenes del Modelo (.webp)</label>
              <div v-for="(foto, idx) in formulario.fotos" :key="idx" class="d-flex align-items-center gap-2 mb-2">
                <div @click="$refs['fileInput' + idx][0].click()" class="upload-box-mini p-2 border rounded-3 bg-light cursor-pointer flex-grow-1 text-center">
                  <i class="bi bi-image text-danger me-2"></i>
                  <span class="extra-small text-muted">{{ foto.nombreArchivo || 'Click para subir foto ' + (idx + 1) }}</span>
                  <input type="file" :ref="'fileInput' + idx" class="d-none" accept=".webp" @change="v => manejarArchivo(v, idx)">
                </div>
                <button v-if="formulario.fotos.length > 1" @click="eliminarSlotFoto(idx)" class="btn btn-sm btn-outline-danger border-0">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-muted">Nombre del Modelo</label>
                <input v-model="formulario.descripcion" type="text" class="form-control rounded-pill px-3 shadow-sm border" placeholder="Ej: REMERA NEGRA - HUMMEL">
              </div>
              <button @click="agregarSlotFoto" class="btn btn-sm btn-outline-secondary w-100 rounded-pill mt-1 extra-small fw-bold">
                <i class="bi bi-plus-circle me-1"></i> Agregar otra imagen
              </button>
            </div>
          </template>
          <template v-else>
            <div class="mb-3">
              <label class="form-label small fw-bold text-muted">Nombre del Modelo</label>
              <input v-model="formulario.descripcion" type="text" class="form-control rounded-pill px-3 shadow-sm border" placeholder="Ej: REMERA NEGRA - HUMMEL">
            </div>
            <label class="form-label small fw-bold text-muted">Stock por Talle y Precio (Obligatorio > 0)</label>
            <div class="contenedor-edicion-talles mb-4">
              <div v-for="(t, index) in formulario.items" :key="index" class="fila-talle-edit mb-2 p-2 rounded-3 bg-light border">
                <div class="row align-items-center g-2">
                  <div class="col-2 fw-bold text-danger text-center">{{ t.talle }}</div>
                  <div class="col-6">
                    <div class="input-group input-group-sm border rounded-pill bg-white overflow-hidden shadow-sm">
                      <button @click="t.cantidad > 0 ? t.cantidad-- : null" class="btn btn-light border-0 px-2">-</button>
                      <input v-model.number="t.cantidad" type="number" class="form-control text-center border-0 fw-bold p-0">
                      <button @click="t.cantidad++" class="btn btn-light border-0 px-2">+</button>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="position-relative">
                      <span class="position-absolute start-0 top-50 translate-middle-y ms-2 extra-small text-muted">$</span>
                      <input v-model.number="t.precio_unitario" type="number" class="form-control form-control-sm rounded-pill text-end fw-bold ps-3 shadow-sm" placeholder="0">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="d-flex gap-2">
          <button @click="cerrarModal" class="btn btn-light rounded-pill w-100 fw-bold border">Cerrar</button>
          <button @click="guardarCambiosAgrupados" class="btn btn-danger rounded-pill w-100 fw-bold shadow text-uppercase" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
            Guardar Todo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { api } from '@/api/api';

// Inyectamos el notificador global
const notificar = inject('notificar');

const listaStock = ref([]);
const filtroTexto = ref('');
const mostrarModal = ref(false);
const editando = ref(false);
const cargando = ref(false)
const archivos = ref([])
const formulario = ref({ nombre: '', talles: [], fotos: [] });

const tallesEstandar = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];

// --- Lógica de Fotos ---
const agregarSlotFoto = () => { formulario.value.fotos.push({ nombreArchivo: '' }); };
const eliminarSlotFoto = (idx) => {
  archivos.value.splice(idx, 1)
  formulario.value.fotos.splice(idx, 1) 
};
const manejarArchivo = (event, idx) => {
  archivos.value.push(event.target.files[0])
  const file = event.target.files[0];
  if (file) formulario.value.fotos[idx].nombreArchivo = file.name;
};
/*
const stockAgrupado = computed(() => {
  const mapa = {};
  listaStockRaw.value.forEach(item => {
    const nombreModelo = item.descripcion.split(/ - TALLE/i)[0].trim();
    const talleNombre = item.descripcion.split(/TALLE /i)[1] || 'S/T';

    if (!mapa[nombreModelo]) {
      mapa[nombreModelo] = {
        nombre: nombreModelo,
        precio_referencia: item.precio_unitario,
        talles: []
      };
    }
    mapa[nombreModelo].talles.push({
      id: item.id,
      talle: talleNombre,
      cantidad: item.cantidad,
      precio: item.precio_unitario
    });
  });
  return Object.values(mapa).filter(m => m.nombre.toLowerCase().includes(filtroTexto.value.toLowerCase())).sort((a, b) => a.nombre.localeCompare(b.nombre));
});
*/

const obtenerStock = async () => {
  const res = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });
  if (res.ok) listaStock.value = res.payload;
};

const abrirModalEdicion = (modelo) => {
  editando.value = true;

  let tallesExistentes = []
  modelo.items.forEach(v=>{
    tallesExistentes.push(v.talle)
  });
  
  tallesEstandar.forEach(talle => {
    if (!tallesExistentes.includes(talle)) {
      modelo.items.push({
        id: null,
        talle: talle,
        cantidad: 0,
        precio_unitario: modelo.precio_unitario,
      });
    }
  });

  const orden = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7 };
  modelo.items.sort((a, b) => (orden[a.talle] || 99) - (orden[b.talle] || 99));

  formulario.value = {
    id_item: modelo.id_item,
    descripcion: modelo.descripcion,
    precioUnitario: modelo.precio_unitario,
    items: modelo.items,
    fotos: []
  };
  mostrarModal.value = true;
};

const abrirModalNuevo = () => {
  editando.value = false;
  formulario.value = { 
    descripcion: '', 
    fotos: [{ nombreArchivo: '' }], 
    //talles: tallesEstandar.map(t => ({ id: null, talle: t, cantidad: 0, precio: 0 })) 
  };
  mostrarModal.value = true;
};

const guardarCambiosAgrupados = async () => {
  if (!formulario.value.descripcion) {
    notificar({ titulo: 'Faltan datos', mensaje: 'El nombre del modelo es obligatorio.', tipo: 'danger' });
    return;
  }
  let res
  if (editando.value) {
    const itemsAProcesar = formulario.value.items.filter(t => t.id || (t.cantidad > 0 && t.precio_unitario > 0));
    if (itemsAProcesar.length === 0) {
      notificar({ titulo: 'Atención', mensaje: 'Debes cargar stock y precio mayor a 0 en al menos un talle.', tipo: 'danger' });
      return;
    }
    cargando.value = true;
    let items = []
    for (const t of itemsAProcesar) {
      items.push({
        id: t.id,
        talle: t.talle,
        cantidad: t.cantidad,
        precioUnitario: t.precio_unitario
      })
    }
    const payload = {
      id_item: formulario.value.id_item,
      precioUnitario: formulario.value.precioUnitario,
      descripcion: `${formulario.value.descripcion.toUpperCase()}`,
      items: items
    }
    res = await api.post({ 
      entity: 'indumentaria', 
      action: 'actualizarStock', 
      payload 
    });
  }
  else {
    const formData = new FormData()
    archivos.value.forEach(file => {
      formData.append('archivos[]', file)
    })
    res = await api.post({
      entity: 'indumentaria',
      action: 'agregarItem',
      payload: formData//formulario.value
    })
  }
  if (res.ok) {
    notificar({ titulo: '¡Éxito!', mensaje: 'Inventario actualizado correctamente.', tipo: 'success' });
    await obtenerStock();
    cerrarModal();
  } else {
    notificar({ titulo: 'Error', mensaje: 'Hubo problemas al guardar algunos talles. Verificá que tengan precio.', tipo: 'danger' });
  }
};

const cerrarModal = () => { 
  cargando.value = false
  mostrarModal.value = false
};

const obtenerImagen = (nombre) => {
  return nombre ? new URL(`/src/assets/fotos/${nombre}`, import.meta.url).href : "https://placehold.co/400x400?text=Sin+Foto";
};

onMounted(obtenerStock);
</script>

<style scoped>


.tarjeta-stock-admin { border-radius: 20px; transition: all 0.3s ease; }
.contenedor-foto-admin { height: 200px; padding: 15px; }
.foto-gestion { max-height: 175%; max-width: 175%; object-fit: contain; mix-blend-mode: multiply; }
.cuerpo-gris-admin { background-color: #f1f5f9; border-radius: 0 0 20px 20px; flex-grow: 1; padding: 12px !important; }

.input-filtro-custom {
  font-size: 1rem !important;
  padding: 0.375rem 0.75rem;
  height: auto !important;
  min-height: 32px; /* Para que no quede demasiado aplastado */
}

/* Para que al hacer clic no se ponga el borde azul de Bootstrap */
.input-filtro-custom:focus {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
  outline: none;
}

@media (max-width: 768px) {
  .tarjeta-stock-admin { min-height: 380px; }
  .contenedor-titulo-stock { min-height: 48px; display: flex; align-items: center; justify-content: center; }
  .text-truncate-2 { font-size: 0.85rem; line-height: 1.2; }
}

.badge-talle { font-size: 0.65rem; background: white; padding: 3px 8px; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; }
.bajo-stock { border-color: #fecaca; background: #fef2f2; color: #dc2626; }
.btn-editar-flotante { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: #212529; color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; z-index: 5; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 2000; }
.modal-content { background: white; border-radius: 30px; width: 100%; max-width: 450px; max-height: 90vh; display: flex; flex-direction: column; }
.contenedor-formulario-scroll { overflow-y: auto; flex-grow: 1; padding-bottom: 10px; }
.upload-box-mini { border: 1px dashed #dee2e6; transition: all 0.2s; font-size: 0.75rem; }
.upload-box-mini:hover { border-color: #dc2626; background: #fff5f5 !important; }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>