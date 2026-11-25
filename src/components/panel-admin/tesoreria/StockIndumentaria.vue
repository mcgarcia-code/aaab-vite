<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Talles, ingresos y cantidades · Total: {{ stockFiltrado.length }} modelos</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar -->
            <BotonHerramienta tipo="actualizar" :cargando="cargandoTabla" @click="obtenerStock" />

            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />
            <BotonHerramienta tipo="limpiar" @click="limpiarFiltros" />
            <BotonHerramienta tipo="nuevo" texto="Nuevo item" icono="bi-plus-square" @click="abrirModalNuevo" />
            <BotonHerramienta tipo="excel" @click="exportarExcel" />
          </div>
        </div>

        <!-- PANEL DE FILTROS (Acordeón en móvil) -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Inventario</span>
            <button type="button" aria-label="Cerrar filtros" title="Cerrar filtros" @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-6">
              <div class="input-group input-group-sm shadow-sm">
                <span class="input-group-text bg-white border-end-0 text-muted ps-3"><i class="bi bi-search"></i></span>
                <input aria-label="Buscar por nombre de modelo" v-model="filtros.modelo" type="text" class="form-control border-start-0 py-2" placeholder="BUSCAR POR NOMBRE DE MODELO...">
              </div>
            </div>
            <div class="col-12 col-md-auto d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-3 p-md-4">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargandoTabla" texto="Cargando inventario" />

          <template v-else>
          <!-- GRILLA DE CARDS -->
          <div class="row g-3 g-md-4">
            <div v-for="modelo in stockPaginado" :key="modelo.id_item" class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="card h-100 border shadow-sm tarjeta-stock-admin overflow-hidden">

                <!-- FOTO CON ACCIONES -->
                <div class="bg-white contenedor-foto-admin d-flex align-items-center justify-content-center position-relative border-bottom">
                  <img loading="lazy" decoding="async" :src="obtenerImagen(modelo)" class="img-fluid foto-gestion" alt="Modelo">
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
                        class="badge bg-warning-subtle text-dark border border-warning mt-1 texto-065"
                       
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
          <EstadoVacio v-if="stockPaginado.length === 0" icono="bi-box-seam" titulo="No se encontró indumentaria" />

          <!-- PAGINACIÓN -->
          <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="mt-5" />
          </template>

        </div>
      </div>
    </div>

    <!-- MODAL DE GESTIÓN (REUTILIZA TU LÓGICA) -->
    <ModalBase
      :show="mostrarModal"
      :hay-cambios="hayCambios"
      @close="cerrarModal"
      :titulo="modoModal === 'editar' ? 'Gestionar Modelo' : 'Nuevo Modelo'"
      :icono="modoModal === 'editar' ? 'inventory' : 'add_circle'"
      :colorIcono="modoModal === 'editar' ? 'bg-danger text-white' : 'bg-danger text-white'"
      maxWidth="650px"
    >
      <div class="row g-3 text-start p-1">
        <div class="col-md-8 col-12">
          <label class="small fw-bold text-muted text-uppercase mb-1">Nombre del Modelo *</label>
          <input aria-label="Nombre del Modelo" v-model="formModal.descripcion" type="text" class="form-control shadow-none py-2" placeholder="Ej: REMERA NEGRA - HUMMEL">
        </div>

        <div class="col-md-4 col-12">
          <label class="small fw-bold text-muted text-uppercase mb-1">Precio ($) *</label>
          <input aria-label="Precio ($)" v-model.number="formModal.precioGeneral" type="number" min="0" class="form-control shadow-none fw-bold text-success py-2" placeholder="0.00">
        </div>

        <div class="col-12">
          <div class="form-check form-switch p-3 bg-light border rounded d-flex align-items-center justify-content-between">
            <div class="pe-3">
              <label class="form-check-label fw-bold d-block mb-0 h6 cursor-pointer" for="switchEncargo">
                Permitir encargos sin stock
              </label>
              <span class="text-muted small">El usuario podrá pedirlo aunque el stock sea cero.</span>
            </div>
            <input class="form-check-input shadow-none fs-3 m-0 cursor-pointer" type="checkbox" role="switch" id="switchEncargo" v-model="formModal.admite_encargo">
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
                  <button type="button" aria-label="Quitar imagen" title="Quitar imagen" @click="eliminarArchivo(i)" class="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;">
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
                  <input :aria-label="`Cantidad del talle ${t.talle}`" v-model.number="t.cantidad" type="number" min="0" class="form-control text-center shadow-none fw-bold border-secondary-subtle">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer="{ cerrar }">
        <button @click="cerrar" class="btn btn-light border-0 px-4 fw-bold rounded-pill">CANCELAR</button>
        <button @click="guardarCambios" class="btn btn-danger px-4 fw-bold shadow-sm rounded-pill" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          GUARDAR CAMBIOS
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, onMounted, onUnmounted, computed, reactive, inject, watch } from 'vue'
import { normalizarTexto } from '@/utils/texto'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { cargarExcelJS } from '@/utils/librerias'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'

useHead({
  title: 'Inventario | AAAB',
  meta: [{ name: 'description', content: 'Gestión de inventario de indumentaria.' }],
})

const notificar = inject('notificar')
const toast = inject('toast')

const listaStock = ref([])
const cargando = ref(false)
const cargandoTabla = ref(false)

const filtros = reactive({ modelo: '' })
const mostrarFiltrosMobile = ref(false)

const tallesEstandar = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Único']
const ordenTalles = { 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, 'XXL': 7, '3XL': 8, '4XL': 9, 'Único': 10 }

const anchoPantalla = ref(window.innerWidth)
const actualizarAncho = () => { anchoPantalla.value = window.innerWidth }

const paginaActual = ref(1)
const registrosPorPagina = computed(() => anchoPantalla.value <= 768 ? 6 : 16)

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
const archivosSeleccionados = ref([])

const itemAEliminar = ref(null)

const formModal = ref({ id_item: null, descripcion: '', precioGeneral: 0, admite_encargo: false, items: [] })
const { hayCambios } = useCambiosSinGuardar(
  () => ({ form: formModal.value, archivos: archivosSeleccionados.value.length }),
  mostrarModal
)


const stockFiltrado = computed(() => {
  return listaStock.value.filter(l => normalizarTexto(l.descripcion).includes(normalizarTexto(filtros.modelo)))
})

const { totalPaginas, paginados: stockPaginado } = usePaginacion(stockFiltrado, registrosPorPagina, paginaActual)


watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => {
  if (nuevo === 0) paginaActual.value = 1
  else if (paginaActual.value > nuevo) paginaActual.value = nuevo
})

const obtenerStock = async () => {
  cargandoTabla.value = true
  try {
    const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerStock' })

    if (respuesta.ok) {
      listaStock.value = (respuesta.payload || []).map(prenda => {
        prenda.items.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL' })
        prenda.items = prenda.items.filter(i => tallesEstandar.includes(i.talle))
        prenda.items.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99))

        return {
          ...prenda,
          itemSeleccionado: 0,
          cantidadSeleccionada: 1,
          fotoActualIndex: 0
        }
      })
    }
  } catch (err) {
    console.error("Error al cargar el inventario:", err)
  } finally {
    cargandoTabla.value = false
  }
}

const abrirModalNuevo = () => {
  modoModal.value = 'nuevo'
  archivosSeleccionados.value = []
  formModal.value = {
    id_item: null,
    descripcion: '',
    precioGeneral: 0, // Reinicia el precio general
    admite_encargo: false,
    items: []
  }
  mostrarModal.value = true
}

const abrirModalEdicion = (modelo) => {
  modoModal.value = 'editar'
  archivosSeleccionados.value = []

  let itemsCombinados = JSON.parse(JSON.stringify(modelo.items))
  itemsCombinados.forEach(i => { if (i.talle === 'XXXL') i.talle = '3XL' })
  itemsCombinados = itemsCombinados.filter(i => tallesEstandar.includes(i.talle))

  let tallesExistentes = itemsCombinados.map(v => v.talle)

  tallesEstandar.forEach(talle => {
    if (!tallesExistentes.includes(talle)) {
      itemsCombinados.push({ id: null, talle: talle, cantidad: 0, precio_general: modelo.precio_general })
    }
  })

  itemsCombinados.sort((a, b) => (ordenTalles[a.talle] || 99) - (ordenTalles[b.talle] || 99))

  formModal.value = {
    id_item: modelo.id_item,
    descripcion: modelo.descripcion,
    precioGeneral: modelo.precio_general, // Asigna el precio general al abrir
    admite_encargo: modelo.admite_encargo,
    items: itemsCombinados
  }

  mostrarModal.value = true
}

const eliminarItem = (item) => {
  itemAEliminar.value = item

  notificar({
    titulo: 'Eliminar Modelo',
    mensaje: '¿Estás seguro que querés eliminar este modelo del inventario?',
    tipo: 'danger',
    alConfirmar: confirmarEliminacionItem
  })
}

const confirmarEliminacionItem = async () => {
  if (!itemAEliminar.value) return

  const r = await api.post({
    entity: 'indumentaria',
    action: 'eliminarItem',
    payload: { id_item: itemAEliminar.value.id_item }
  })

  if (r.ok) {
    const indice = listaStock.value.findIndex(modelo => modelo.id_item === itemAEliminar.value.id_item)
    if (indice !== -1) listaStock.value.splice(indice, 1)
    toast({ titulo: 'Item eliminado', mensaje: 'El item fue eliminado correctamente.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: 'No se pudo eliminar el item.', tipo: 'danger' })
  }

  itemAEliminar.value = null
}


const manejarArchivos = (event) => {
  archivosSeleccionados.value = Array.from(event.target.files)
}

const eliminarArchivo = (index) => {
  archivosSeleccionados.value.splice(index, 1)
}

const guardarCambios = async () => {
  if (!formModal.value.descripcion) {
    toast({ titulo: 'Faltan datos', mensaje: 'El nombre del modelo es obligatorio.', tipo: 'danger' })
    return
  }

  // Validación del precio general único
  if (formModal.value.precioGeneral <= 0) {
    toast({ titulo: 'Atención', mensaje: 'Debes ingresar un precio mayor a 0.', tipo: 'warning' })
    return
  }
  const itemsTodos = modoModal.value === 'editar'
    ? formModal.value.items.map(t => ({
      id: t.id,
      talle: t.talle,
      cantidad: t.cantidad || 0,
    }))
    : []
  cargando.value = true
  let res

  const flagAdmiteEncargo = formModal.value.admite_encargo ? 1 : 0

  const formData = new FormData()
  formData.append('descripcion', formModal.value.descripcion.toUpperCase())
  formData.append('admiteEncargo', flagAdmiteEncargo)
  formData.append('precioGeneral', formModal.value.precioGeneral)

  if (archivosSeleccionados.value.length > 0) {
    archivosSeleccionados.value.forEach(file => {
      formData.append('fotos[]', file)
    })
  }
  if (modoModal.value === 'editar') {
    formData.append('id_item', formModal.value.id_item)
    formData.append('items', JSON.stringify(itemsTodos))
    res = await api.postFile({
      entity: 'indumentaria',
      action: 'actualizarStock',
      payload: formData
    })
  } else {
    formData.append('items', JSON.stringify([]))
    res = await api.postFile({
      entity: 'indumentaria',
      action: 'agregarItem',
      payload: formData
    })
  }

  if (res.ok) {
    toast({ titulo: '¡Éxito!', mensaje: 'Inventario guardado correctamente.', tipo: 'success' })
    cerrarModal()
    await obtenerStock()
  } else {
    toast({ titulo: 'Error', mensaje: 'Hubo un problema al guardar el inventario.', tipo: 'danger' })
  }

  cargando.value = false
}

const cerrarModal = () => {
  mostrarModal.value = false
  cargando.value = false
}

const limpiarFiltros = () => { filtros.modelo = '' }

const obtenerImagen = (item) => {
  const primeraFoto = item.archivo_imagen ? item.archivo_imagen.split(',')[0] : null
  return primeraFoto ? item.folder_imagenes + encodeURIComponent(primeraFoto) : "https://placehold.co/400x400?text=Indumentaria"
}

const exportarExcel = async () => {
  const data = stockFiltrado.value.map(item => {
    let row = { 'ID Item': item.id_item, 'Modelo': item.descripcion, 'Precio Referencia': `$${item.precio_general}` }
    tallesEstandar.forEach(talle => {
      const stock = item.items.find(i => i.talle === talle)
      row[`Stock ${talle}`] = stock ? stock.cantidad : 0
    })
    return row
  })

  const wb = new (await cargarExcelJS()).Workbook()
  const ws = wb.addWorksheet('Inventario')

  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 16 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Inventario_Indumentaria.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  window.addEventListener('resize', actualizarAncho)
  obtenerStock()
})

onUnmounted(() => {
  window.removeEventListener('resize', actualizarAncho)
})
</script>

<style scoped>

.tarjeta-stock-admin {
  border-radius: 16px;
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
.btn-editar-flotante:hover { background: #0f172a; }
.btn-eliminar-flotante { background: #dc2626; }
.btn-eliminar-flotante:hover { background: #7f1d1d; }

.badge-talle {
  font-size: 0.65rem;
  background: var(--o-tarjeta, white);
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid var(--o-borde, #dee2e6);
  color: var(--o-texto-medio, #475569);
}

.bajo-stock {
  border-color: var(--o-rojo-borde, #fecaca);
  background: var(--o-rojo-fondo, #fef2f2);
  color: var(--o-rojo-texto, #dc2626);
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

</style>
