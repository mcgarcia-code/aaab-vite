<template>
  <ModalBase :show="show" :hay-cambios="hayCambiosEdicion" titulo="Editar informe" icono="edit" colorIcono="bg-danger text-white" maxWidth="640px" @close="emit('close')">
    <div v-if="informe" class="text-start">

      <!-- Datos automáticos (solo lectura) -->
      <template v-if="conDatosPartido">
        <div class="row g-2 mb-3">
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Fecha</label>
            <input aria-label="Fecha" type="text" class="form-control form-control-sm bg-light input-readonly" :value="fechaArg(informe.fecha_partido, 'S/F')" readonly>
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small fw-bold text-dark mb-1">Categoría</label>
            <input aria-label="Categoría" type="text" class="form-control form-control-sm bg-light input-readonly" :value="informe.categoria || '-'" readonly>
          </div>
          <div class="col-12">
            <label class="form-label small fw-bold text-dark mb-1">Encuentro</label>
            <input aria-label="Encuentro" type="text" class="form-control form-control-sm bg-light input-readonly" :value="informe.encuentro" readonly>
          </div>
          <div class="col-12" v-if="informe.delegado_tecnico">
            <label class="form-label small fw-bold text-dark mb-1">Delegado técnico (cargó el informe)</label>
            <input aria-label="Delegado técnico (cargó el informe)" type="text" class="form-control form-control-sm bg-light input-readonly" :value="informe.delegado_tecnico" readonly>
          </div>
        </div>

        <hr class="my-3">
      </template>

      <div class="mb-3">
        <label class="form-label small fw-bold text-dark mb-1">Torneo *</label>
        <select aria-label="Torneo" v-model="formEdit.torneo" class="form-select form-select-sm shadow-none">
          <option v-for="t in OPCIONES_TORNEO" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
        </select>
      </div>
      <div class="row g-2 mb-3">
        <div class="col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Implicado *</label>
          <input aria-label="Implicado" v-model="formEdit.implicado" type="text" class="form-control form-control-sm shadow-none">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Sanción *</label>
          <input aria-label="Sanción" v-model="formEdit.sancion" type="text" class="form-control form-control-sm shadow-none">
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-bold text-dark mb-1">Institución a la que pertenece *</label>
        <select aria-label="Institución a la que pertenece" v-model="formEdit.institucion" class="form-select form-select-sm shadow-none">
          <option value="local">{{ informe.equipo_local }}</option>
          <option value="visitante">{{ informe.equipo_visitante }}</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label small fw-bold text-dark mb-1">Motivo y descripción *</label>
        <textarea aria-label="Motivo y descripción" v-model="formEdit.motivo_descripcion" class="form-control shadow-none" rows="4"></textarea>
      </div>

      <!-- ARCHIVOS YA ADJUNTOS -->
      <div class="mb-3" v-if="informe.archivos && informe.archivos.length">
        <label class="form-label small fw-bold text-dark mb-1">
          <i class="bi bi-paperclip me-1"></i>Archivos adjuntos actuales
        </label>
        <ul class="list-group list-group-flush border rounded">
          <li
            v-for="(arc, idx) in informe.archivos"
            :key="'exist-'+idx"
            class="list-group-item d-flex justify-content-between align-items-center py-2 px-2 small"
            :class="{ 'text-decoration-line-through text-muted opacity-75': archivosAEliminar.includes(arc.id) }"
          >
            <span class="text-break d-flex align-items-center gap-2 min-w-0">
              <i class="bi bi-file-earmark-text text-danger flex-shrink-0"></i>
              <span class="text-truncate">{{ arc.archivo_nombre }}</span>
            </span>
            <button
              type="button"
              v-if="informeEditable(informe)"
              @click="toggleEliminarArchivo(arc.id)"
              class="btn btn-sm btn-link p-0 ms-2 flex-shrink-0"
              :class="archivosAEliminar.includes(arc.id) ? 'text-secondary' : 'text-danger'"
              :title="archivosAEliminar.includes(arc.id) ? 'Deshacer' : 'Quitar'"
            >
              <i class="bi" :class="archivosAEliminar.includes(arc.id) ? 'bi-arrow-counterclockwise' : 'bi-x-circle-fill'"></i>
            </button>
          </li>
        </ul>
      </div>

      <!-- AGREGAR NUEVOS ARCHIVOS (solo mientras el informe sea editable) -->
      <div class="mb-1" v-if="informeEditable(informe)">
        <label class="form-label small fw-bold text-dark mb-1">
          <i class="bi bi-plus-circle me-1"></i>Agregar archivos <span class="text-muted fw-normal">(opcional)</span>
        </label>
        <input
          ref="inputArchivosEdit"
          type="file"
          class="form-control form-control-sm shadow-none"
          multiple
          @change="onArchivosEditSeleccionados"
        >
        <p class="text-muted small mt-1 mb-2">
          Podés adjuntar fotos, videos u otros documentos. Máx. 10&nbsp;MB por archivo.
        </p>

        <ul v-if="formEdit.archivos_nuevos.length" class="list-group list-group-flush border rounded">
          <li
            v-for="(arc, idx) in formEdit.archivos_nuevos"
            :key="'nuevo-'+idx"
            class="list-group-item d-flex justify-content-between align-items-center py-2 px-2 small"
          >
            <span class="text-break d-flex align-items-center gap-2 min-w-0">
              <i class="bi bi-file-earmark-plus text-success flex-shrink-0"></i>
              <span class="text-truncate">{{ arc.name }}</span>
            </span>
            <button
              type="button"
              @click="quitarArchivoEdit(idx)"
              class="btn btn-sm btn-link text-danger p-0 ms-2 flex-shrink-0"
              title="Quitar"
            >
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <template #footer="{ cerrar }">
      <button type="button" @click="cerrar" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1 border" :disabled="procesando">Cancelar</button>
      <button type="button" @click="guardarEdicion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="procesando || !edicionValida">
        <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span> Guardar cambios
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import { api } from '@/api/api'
import { fechaArg } from '@/utils/fechas'
import { OPCIONES_TORNEO, informeEditable } from '@/utils/informes'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'

// Edición de un informe (árbitro que lo cargó y coordinador): torneo, implicado, sanción,
// institución, motivo y archivos. Guarda con informes/actualizarInforme y, al terminar,
// actualiza el mismo objeto del informe (la tabla se refresca sola) y emite "guardado".
//  - conDatosPartido: muestra arriba fecha, categoría, encuentro y delegado (solo lectura)
const props = defineProps({
  show: { type: Boolean, default: false },
  informe: { type: Object, default: null },
  conDatosPartido: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'guardado'])
const toast = inject('toast')

const procesando = ref(false)
const inputArchivosEdit = ref(null)
const archivosAEliminar = ref([])  // ids de archivos existentes a borrar
const formEdit = reactive({
  torneo: '', implicado: '', sancion: '', institucion: '', motivo_descripcion: '',
  archivos_nuevos: []  // File[] (binario, multipart)
})

const edicionValida = computed(() =>
  formEdit.torneo && formEdit.implicado.trim() && formEdit.sancion.trim() && formEdit.institucion && formEdit.motivo_descripcion.trim()
)

// Al abrir, se cargan los datos del informe en el formulario
watch(() => props.show, (abierto) => {
  if (!abierto || !props.informe) return
  const inf = props.informe
  formEdit.torneo = inf.torneo || ''
  formEdit.implicado = inf.implicado || ''
  formEdit.sancion = inf.sancion || ''
  formEdit.institucion = inf.institucion || ''
  formEdit.motivo_descripcion = inf.motivo_descripcion || ''
  formEdit.archivos_nuevos = []
  archivosAEliminar.value = []
  if (inputArchivosEdit.value) inputArchivosEdit.value.value = ''
}, { immediate: true })

const { hayCambios: hayCambiosEdicion } = useCambiosSinGuardar(
  () => ({ ...formEdit, archivos_nuevos: formEdit.archivos_nuevos.map(f => f.name), eliminar: [...archivosAEliminar.value].sort() }),
  () => props.show
)

// Límite por archivo (10 MB)
const MAX_ARCHIVO_BYTES = 10 * 1024 * 1024

const onArchivosEditSeleccionados = (e) => {
  const files = Array.from(e.target.files || [])
  for (const file of files) {
    if (file.size > MAX_ARCHIVO_BYTES) {
      toast({ titulo: 'Archivo muy grande', mensaje: `"${file.name}" supera los 10 MB y no se adjuntó.`, tipo: 'warning' })
      continue
    }
    formEdit.archivos_nuevos.push(file)
  }
  if (inputArchivosEdit.value) inputArchivosEdit.value.value = ''
}

const quitarArchivoEdit = (idx) => {
  formEdit.archivos_nuevos.splice(idx, 1)
}

const toggleEliminarArchivo = (id) => {
  const i = archivosAEliminar.value.indexOf(id)
  if (i === -1) archivosAEliminar.value.push(id)
  else archivosAEliminar.value.splice(i, 1)
}

const guardarEdicion = async () => {
  if (!edicionValida.value || !props.informe) return
  const inf = props.informe
  const institucionNombre = formEdit.institucion === 'local' ? inf.equipo_local : inf.equipo_visitante

  procesando.value = true
  try {
    const fd = new FormData()
    fd.append('id_informe', inf.id)
    fd.append('torneo', formEdit.torneo)
    fd.append('implicado', formEdit.implicado.trim())
    fd.append('sancion', formEdit.sancion.trim())
    fd.append('institucion', formEdit.institucion)
    fd.append('institucion_nombre', institucionNombre)
    fd.append('motivo_descripcion', formEdit.motivo_descripcion.trim())
    // ids a eliminar como JSON string
    fd.append('archivos_eliminar', JSON.stringify(archivosAEliminar.value))
    // archivos nuevos binarios
    formEdit.archivos_nuevos.forEach(file => fd.append('archivos_nuevos[]', file, file.name))

    const res = await api.postFile({
      entity: 'informes',
      action: 'actualizarInforme',
      payload: fd
    })
    if (res.ok || res.success) {
      Object.assign(inf, {
        torneo: formEdit.torneo,
        implicado: formEdit.implicado.trim(),
        sancion: formEdit.sancion.trim(),
        institucion: formEdit.institucion,
        institucion_nombre: institucionNombre,
        motivo_descripcion: formEdit.motivo_descripcion.trim()
      })
      // Reflejar cambios de archivos: el backend devuelve la lista final
      if (res.payload && Array.isArray(res.payload.archivos)) {
        inf.archivos = res.payload.archivos
      }
      emit('guardado', inf)
      emit('close')
      toast({ titulo: 'Informe actualizado', mensaje: 'Se guardaron los cambios.', tipo: 'success' })
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'Error del servidor')
    }
  } catch (err) {
    console.error('Error al editar informe:', err)
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo guardar.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.input-readonly { cursor: default; }
.input-readonly:focus { border-color: var(--o-borde, #dee2e6); box-shadow: none; }
</style>
