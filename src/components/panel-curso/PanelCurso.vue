<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold text-truncate fs-6 fs-md-5">Panel Curso AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3 fw-bold rounded-pill">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="container-fluid px-3 px-md-4 py-2">
      <div class="mx-auto">

        <div class="user-header d-flex align-items-center justify-content-between gap-2 mb-4 p-2 p-md-3 rounded-4 shadow">
          <div class="d-flex align-items-center min-w-0">
            <div class="perfil-wrap me-2 me-md-3 flex-shrink-0">
              <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="perfil-img shadow-sm" alt="Foto de perfil" role="button" @click="mostrarFotoAmpliada = true">
              <button type="button" class="btn-editar-foto shadow-sm" @click.stop="abrirSelectorFoto" aria-label="Cambiar foto de perfil">
                <i class="bi bi-camera-fill"></i>
              </button>
              <input ref="inputFoto" type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="alSeleccionarFoto">
            </div>
            <div class="min-w-0">
              <h2 class="text-white fw-bold m-0 fs-5 fs-md-3" style="line-height: 1.2;">
                Hola, {{ nombreFormateado }} 👋
              </h2>
              <div class="d-flex flex-wrap align-items-center gap-1 mt-1">
                <span v-if="MODALIDADES_CURSO[alumno.modalidad_curso]" class="badge px-2 py-1 shadow-sm" :class="MODALIDADES_CURSO[alumno.modalidad_curso].clase">
                  {{ MODALIDADES_CURSO[alumno.modalidad_curso].etiqueta }}
                </span>
                <span v-if="ESTADOS_CURSO[alumno.estado]" class="badge px-2 py-1 shadow-sm" :class="ESTADOS_CURSO[alumno.estado].clase">
                  {{ ESTADOS_CURSO[alumno.estado].etiqueta }}
                </span>
              </div>
            </div>
          </div>

          <!-- NOTIFICACIONES -->
          <div ref="contenedorNotificaciones" class="position-relative flex-shrink-0">
            <button
              type="button"
              class="btn border-0 bg-transparent p-1 p-md-2 position-relative notification-btn"
              :aria-expanded="mostrarNotificaciones"
              aria-label="Notificaciones"
              @click="alternarNotificaciones"
            >
              <i class="bi bi-bell-fill fs-4 text-white"></i>
              <span v-if="noLeidas.length" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light contador">
                {{ noLeidas.length }}
              </span>
            </button>

            <div v-if="mostrarNotificaciones" class="panel-notificaciones shadow-lg bg-white">
              <div class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <h6 class="m-0 fw-bold text-dark">Notificaciones</h6>
                <span v-if="noLeidas.length" class="badge bg-danger rounded-pill">{{ noLeidas.length }} nuevas</span>
              </div>
              <div class="lista-notificaciones">
                <div v-for="n in notificaciones.slice(0, 8)" :key="n.id" class="p-3 border-bottom" :class="{ 'bg-light': !n.leida }">
                  <div class="d-flex gap-3 align-items-start">
                    <div class="icono-notif flex-shrink-0" :class="ICONOS[n.tipo]?.bg || 'bg-secondary'">
                      <i :class="['bi', ICONOS[n.tipo]?.icono || 'bi-bell', 'text-white']"></i>
                    </div>
                    <div class="min-w-0">
                      <p class="mb-1 text-dark small fw-bold">{{ n.titulo }}</p>
                      <p class="mb-1 text-muted texto-notif">{{ n.mensaje }}</p>
                      <small class="text-muted fw-bold" style="font-size: 0.65rem;">{{ fechaHoraDMA(n.fecha) }}</small>
                    </div>
                  </div>
                </div>
                <div v-if="!notificaciones.length" class="p-4 text-center text-muted">
                  <i class="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
                  <small>No tenés notificaciones</small>
                </div>
              </div>
              <div class="p-2 text-center border-top bg-light">
                <RouterLink to="/panel-curso/historial-notificaciones" class="btn btn-link btn-sm text-decoration-none fw-bold p-0" @click="mostrarNotificaciones = false">
                  Ver todas
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <div v-if="route.name !== 'PanelInicioCurso'" class="mb-4">
          <button @click="volver" class="btn-volver shadow-sm">
            <i class="bi bi-arrow-left me-2"></i> Volver al Menú
          </button>
        </div>

        <RouterView />
      </div>
    </div>

    <div v-if="mostrarFotoAmpliada" class="foto-overlay" @click="mostrarFotoAmpliada = false">
      <button type="button" class="foto-overlay-cerrar" @click.stop="mostrarFotoAmpliada = false" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
      <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="foto-overlay-img shadow-lg" alt="Foto de perfil" @click.stop>
    </div>

    <div v-if="mostrarModalFoto" class="foto-overlay" @click.self="cancelarFoto">
      <div class="modal-foto shadow-lg">
        <h5 class="fw-bold text-dark mb-3">Recortá tu foto de perfil</h5>
        <div v-if="previewUrl" class="cropper-wrap mb-3">
          <Cropper ref="cropperRef" class="cropper" :src="previewUrl" :stencil-props="{ aspectRatio: 3 / 4 }" image-restriction="stencil" />
        </div>
        <p class="text-muted small text-center mb-3">Esta foto se usará en tu panel y en tu credencial digital del curso.</p>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary rounded-pill fw-bold flex-grow-1" @click="cancelarFoto" :disabled="subiendoFoto">Cancelar</button>
          <button type="button" class="btn btn-danger rounded-pill fw-bold flex-grow-1 d-flex justify-content-center align-items-center" @click="confirmarFoto" :disabled="subiendoFoto || !previewUrl">
            <span v-if="subiendoFoto" class="spinner-border spinner-border-sm me-2"></span>
            {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <ToastNotificacion ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { auth } from '@/api/auth'
import { api } from '@/api/api'
import ToastNotificacion from '@/components/ToastNotificacion.vue'
import { ESTADOS_CURSO, MODALIDADES_CURSO, urlFotoCurso, FOTO_POR_DEFECTO } from '@/composables/useCursoArbitro'
import { useNotificacionesCurso, ICONOS_NOTIFICACION as ICONOS } from '@/composables/useNotificacionesCurso'
import { fechaHoraDMA } from '@/utils/fechas'

useHead({
  title: 'Panel del Curso | AAAB',
  meta: [{ name: 'description', content: 'Panel de los aspirantes del curso de árbitros de la AAAB.' }],
})

const route = useRoute()
const router = useRouter()

const toastRef = ref(null)
const toast = (m) => toastRef.value?.mostrar(m)
provide('toast', toast)

// La foto se versiona para que el navegador la vuelva a pedir después de cambiarla
const alumno = ref(auth.getUser() || {})
const versionFoto = ref(Date.now())
const urlFoto = computed(() => urlFotoCurso(alumno.value.dni, versionFoto.value))
const nombreFormateado = computed(() =>
  String(alumno.value.nombre || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
)

const volver = () => router.push('/panel-curso')
const cerrarSesion = () => auth.logout()

// ─── Notificaciones ──────────────────────────────────────────────
const { notificaciones, noLeidas, cargar: cargarNotificaciones, marcarLeidas } = useNotificacionesCurso()
const mostrarNotificaciones = ref(false)
const contenedorNotificaciones = ref(null)

const alternarNotificaciones = () => {
  mostrarNotificaciones.value = !mostrarNotificaciones.value
  if (mostrarNotificaciones.value && noLeidas.value.length) marcarLeidas()
}

const cerrarAlClickearAfuera = (e) => {
  if (mostrarNotificaciones.value && contenedorNotificaciones.value && !contenedorNotificaciones.value.contains(e.target)) {
    mostrarNotificaciones.value = false
  }
}

const refrescarFoto = () => { versionFoto.value = Date.now() }
const refrescarAlumno = () => { alumno.value = auth.getUser() || {} }

// ─── Foto de perfil (con recorte) ────────────────────────────────
const MAX_MB = 5
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']
const inputFoto = ref(null)
const cropperRef = ref(null)
const mostrarModalFoto = ref(false)
const mostrarFotoAmpliada = ref(false)
const subiendoFoto = ref(false)
const previewUrl = ref('')

const abrirSelectorFoto = () => inputFoto.value?.click()

const alSeleccionarFoto = (e) => {
  const archivo = e.target.files?.[0]
  e.target.value = ''
  if (!archivo) return
  if (!TIPOS_FOTO.includes(archivo.type)) {
    toast({ tipo: 'danger', titulo: 'Formato no válido', mensaje: 'Usá una imagen JPG, PNG o WEBP.' })
    return
  }
  if (archivo.size > MAX_MB * 1024 * 1024) {
    toast({ tipo: 'warning', titulo: 'Imagen muy pesada', mensaje: `La imagen supera los ${MAX_MB} MB. Elegí una más liviana.` })
    return
  }
  previewUrl.value = URL.createObjectURL(archivo)
  mostrarModalFoto.value = true
}

const cerrarModalFoto = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  mostrarModalFoto.value = false
}

const cancelarFoto = () => {
  if (!subiendoFoto.value) cerrarModalFoto()
}

const obtenerRecorteBlob = () => new Promise((resolve, reject) => {
  const canvas = cropperRef.value?.getResult()?.canvas
  if (!canvas) {
    reject(new Error('No se pudo procesar el recorte'))
    return
  }
  canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))), 'image/jpeg', 0.9)
})

const confirmarFoto = async () => {
  if (subiendoFoto.value || !previewUrl.value) return
  subiendoFoto.value = true
  try {
    const blob = await obtenerRecorteBlob()
    const formData = new FormData()
    formData.append('fotos', new File([blob], 'perfil.jpg', { type: 'image/jpeg' }))
    const res = await api.postFile({ entity: 'perfil_curso_arbitro', action: 'actualizarFotoCurso', payload: formData })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo actualizar la foto')
    window.dispatchEvent(new Event('foto-curso-actualizada'))
    cerrarModalFoto()
    toast({ tipo: 'success', titulo: 'Foto actualizada', mensaje: 'Tu foto de perfil se guardó correctamente.' })
  } catch (e) {
    toast({ tipo: 'danger', titulo: 'Error', mensaje: e.message || 'Ocurrió un error al subir la foto.' })
  } finally {
    subiendoFoto.value = false
  }
}

onMounted(() => {
  if (auth.isLoggedIn()) auth.startInactivityTimer()
  cargarNotificaciones()
  window.addEventListener('foto-curso-actualizada', refrescarFoto)
  window.addEventListener('storage', refrescarAlumno)
  document.addEventListener('click', cerrarAlClickearAfuera)
})

onBeforeUnmount(() => {
  window.removeEventListener('foto-curso-actualizada', refrescarFoto)
  window.removeEventListener('storage', refrescarAlumno)
  document.removeEventListener('click', cerrarAlClickearAfuera)
})
</script>

<style scoped>
.panel-layout {
  min-height: 100vh;
  background-color: #0f172a;
  padding-bottom: 40px;
}
.navbar { border-bottom: 2px solid #dc2626; }
.user-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 90;
}
.perfil-wrap { position: relative; display: inline-block; line-height: 0; }
.perfil-img {
  width: clamp(50px, 10vw, 70px);
  height: clamp(50px, 10vw, 70px);
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dc2626;
  cursor: pointer;
  transition: transform 0.2s;
}
.perfil-img:hover { transform: scale(1.05); }
.btn-editar-foto {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: clamp(22px, 4vw, 26px);
  height: clamp(22px, 4vw, 26px);
  border-radius: 50%;
  background: #dc2626;
  border: 2px solid #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  padding: 0;
  transition: background 0.2s, transform 0.2s;
}
.btn-editar-foto:hover { background: #a71d2a; transform: scale(1.1); }
.modal-foto { background: #fff; border-radius: 16px; padding: 24px; width: 100%; max-width: 420px; cursor: default; }
.cropper-wrap { border-radius: 12px; overflow: hidden; border: 2px solid #dc2626; }
.cropper { height: 320px; background: #1a1a1a; }
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
  border: 3px solid #dc2626;
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
}
.foto-overlay-cerrar:hover { background: #dc2626; border-color: #dc2626; }
.min-w-0 { min-width: 0; }
.notification-btn { border-radius: 50%; width: 48px; height: 48px; }
.notification-btn:hover { background: rgba(255, 255, 255, 0.1) !important; }
.contador { transform: translate(-30%, 30%) !important; font-size: 0.65rem; }
.panel-notificaciones {
  position: absolute;
  right: 0;
  top: 56px;
  width: min(350px, 90vw);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
}
.lista-notificaciones { max-height: 50vh; overflow-y: auto; }
.icono-notif {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.texto-notif { font-size: 0.75rem; line-height: 1.3; white-space: pre-line; }
.btn-volver {
  display: inline-flex;
  align-items: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 20px;
  border-radius: 50px;
  transition: 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  font-size: 1rem;
}
.btn-volver:hover { background: #dc2626; border-color: #dc2626; }
</style>
