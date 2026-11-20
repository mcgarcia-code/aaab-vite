<template>
  <input ref="inputFoto" type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="alSeleccionarFoto">

  <!-- ============ FOTO AMPLIADA ============ -->
  <div v-if="mostrarAmpliada" class="foto-overlay" @click="mostrarAmpliada = false">
    <button type="button" class="foto-overlay-cerrar" @click.stop="mostrarAmpliada = false" aria-label="Cerrar">
      <i class="bi bi-x-lg" aria-hidden="true"></i>
    </button>
    <img :src="foto" @error="alFallarFoto" class="foto-overlay-img shadow-lg" alt="Foto de perfil" @click.stop>
  </div>

  <!-- ============ RECORTE DE LA FOTO NUEVA ============ -->
  <div v-if="mostrarRecorte" class="foto-overlay" role="dialog" aria-modal="true" aria-labelledby="titulo-recorte-foto" @click.self="cancelar">
    <div class="modal-foto shadow-lg">
      <h5 id="titulo-recorte-foto" class="fw-bold text-dark mb-3">Recortá tu foto de perfil</h5>
      <div v-if="previewUrl" class="cropper-wrap mb-3">
        <Cropper ref="cropperRef" class="cropper" :src="previewUrl" :stencil-props="{ aspectRatio: 3 / 4 }" image-restriction="stencil" />
      </div>
      <p class="text-muted small text-center mb-3">{{ textoAyuda }}</p>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary rounded-pill fw-bold flex-grow-1" @click="cancelar" :disabled="subiendo">
          Cancelar
        </button>
        <button type="button" class="btn btn-danger rounded-pill fw-bold flex-grow-1 d-flex justify-content-center align-items-center" @click="confirmar" :disabled="subiendo || !previewUrl">
          <span v-if="subiendo" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          {{ subiendo ? 'Subiendo...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, defineAsyncComponent, h } from 'vue'
import { api } from '@/api/api'

// El recortador (~70 KB) se descarga recién cuando se abre el recorte, no al entrar al panel
const Cropper = defineAsyncComponent({
  loader: () => Promise.all([
    import('vue-advanced-cropper'),
    import('vue-advanced-cropper/dist/style.css')
  ]).then(([modulo]) => modulo.Cropper),
  loadingComponent: { render: () => h('div', { class: 'cropper d-flex align-items-center justify-content-center' }, [h('span', { class: 'spinner-border text-light', role: 'status', 'aria-label': 'Cargando' })]) },
  delay: 0
})

// Cambio de foto de perfil con recorte 3:4, común a panel árbitro y panel del curso.
// El panel lo abre con abrirSelector() / ampliar() (expuestos) y muestra los avisos que emite.
const props = defineProps({
  foto: { type: String, default: '' },
  entity: { type: String, required: true },
  action: { type: String, required: true },
  textoAyuda: { type: String, default: 'Esta foto se usará en tu panel y en tu credencial digital.' },
  fotoPorDefecto: { type: String, default: 'https://ui-avatars.com/api/?name=Sin+Foto&background=334155&color=fff' }
})

const emit = defineEmits(['actualizada', 'aviso'])

const MAX_MB = 5
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

const inputFoto = ref(null)
const cropperRef = ref(null)
const mostrarAmpliada = ref(false)
const mostrarRecorte = ref(false)
const subiendo = ref(false)
const previewUrl = ref('')

const alFallarFoto = (e) => { e.target.src = props.fotoPorDefecto }

const abrirSelector = () => inputFoto.value?.click()
const ampliar = () => { mostrarAmpliada.value = true }

const alSeleccionarFoto = (e) => {
  const archivo = e.target.files?.[0]
  // Se limpia el input para poder volver a elegir el mismo archivo si se cancela
  e.target.value = ''
  if (!archivo) return

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    emit('aviso', { tipo: 'danger', titulo: 'Formato no válido', mensaje: 'Usá una imagen JPG, PNG o WEBP.' })
    return
  }
  if (archivo.size > MAX_MB * 1024 * 1024) {
    emit('aviso', { tipo: 'warning', titulo: 'Imagen muy pesada', mensaje: `La imagen supera los ${MAX_MB} MB. Elegí una más liviana.` })
    return
  }

  previewUrl.value = URL.createObjectURL(archivo)
  mostrarRecorte.value = true
}

const cerrarRecorte = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  mostrarRecorte.value = false
}

const cancelar = () => {
  if (!subiendo.value) cerrarRecorte()
}

// Toma el recorte y lo devuelve como Blob JPEG (el backend lo convierte a WEBP)
const obtenerRecorte = () => new Promise((resolve, reject) => {
  const canvas = cropperRef.value?.getResult()?.canvas
  if (!canvas) {
    reject(new Error('No se pudo procesar el recorte'))
    return
  }
  canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))), 'image/jpeg', 0.9)
})

const confirmar = async () => {
  if (subiendo.value || !previewUrl.value) return
  subiendo.value = true
  try {
    const blob = await obtenerRecorte()
    // Va como $_FILES['fotos'] con nombre y extensión válidos
    const formData = new FormData()
    formData.append('fotos', new File([blob], 'perfil.jpg', { type: 'image/jpeg' }))

    const res = await api.postFile({ entity: props.entity, action: props.action, payload: formData })
    if (!res?.ok) throw new Error(res?.payload?.mensaje || res?.message || 'No se pudo actualizar la foto. Intentá de nuevo en unos minutos.')

    cerrarRecorte()
    emit('actualizada')
    emit('aviso', { tipo: 'success', titulo: 'Foto actualizada', mensaje: 'Tu foto de perfil se guardó correctamente.' })
  } catch (error) {
    emit('aviso', { tipo: 'danger', titulo: 'Error', mensaje: error.message || 'Ocurrió un error al procesar o subir la foto.' })
  } finally {
    subiendo.value = false
  }
}

// Si se sale del panel con el recorte abierto, se libera la imagen de memoria
onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

defineExpose({ abrirSelector, ampliar })
</script>

<style scoped>
.modal-foto {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  cursor: default;
}

.cropper-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.cropper {
  height: 320px;
  background: #1a1a1a;
}

.foto-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
  cursor: zoom-out;
}

.foto-overlay-img {
  max-width: min(90vw, 500px);
  max-height: 90vh;
  border-radius: 12px;
  border: 3px solid #fff;
  object-fit: cover;
  cursor: default;
}

.foto-overlay-cerrar {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.foto-overlay-cerrar:hover { background: #dc2626; border-color: #dc2626; }
</style>
