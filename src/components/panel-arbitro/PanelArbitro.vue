<template>
  <div class="panel-layout">
   <div class="panel-cuerpo">

    <!-- ============ MENÚ LATERAL (solo escritorio) ============ -->
    <MenuLateral
      inicio="/panel-arbitro"
      :grupos="gruposModulos"
      :nombre="nombreFormateado"
      :subtitulo="`Árbitro · ID ${arbitro.id}`"
      :foto="urlFoto"
      perfil-interactivo
      :perfil-abierto="mostrarMenuPerfil"
      clave-almacenamiento="panelArbitro.menuColapsado"
      @perfil="mostrarMenuPerfil = !mostrarMenuPerfil"
      @salir="cerrarSesion"
      @error-foto="onErrorFoto"
    />

    <div class="panel-principal">
    <!-- ============ HEADER UNIFICADO ============ -->
    <header class="panel-header">
      <div class="panel-header-inner d-flex align-items-center gap-2 px-3 px-md-4 py-2">

        <!-- Inicio: foto (solo celular, lleva al Menú) + fecha (solo celular) + saludo.
             En escritorio la foto está en el menú lateral -->
        <div v-if="esInicio" class="d-flex align-items-center gap-3 min-w-0">
          <RouterLink to="/panel-arbitro/menu" class="d-lg-none flex-shrink-0" aria-label="Ir al menú y perfil">
            <img :src="urlFoto" @error="onErrorFoto" class="perfil-img" alt="">
          </RouterLink>
          <div class="min-w-0">
            <span class="fecha-hoy d-lg-none">{{ fechaHoy }}</span>
            <h1 class="titulo-seccion text-truncate m-0">Hola, {{ primerNombre }}</h1>
          </div>
        </div>

        <!-- Pestaña Menú (celular): es una pestaña, no lleva flecha para volver -->
        <h1 v-else-if="esMenu" class="titulo-seccion text-truncate m-0">Menú</h1>

        <!-- Secciones internas: flecha para volver + título -->
        <template v-else>
          <button type="button" class="btn-icono" @click="handleVolver" :aria-label="esRutaProfunda ? 'Volver atrás' : 'Volver al inicio'">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h1 class="titulo-seccion text-truncate m-0">{{ tituloSeccion }}</h1>
        </template>

        <!-- Campanita solo en escritorio: en celular las notificaciones están en la barra inferior -->
        <div class="dropdown ms-auto d-none d-lg-block">
            <button class="btn-icono position-relative" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false"
                    :aria-label="notificacionesNoLeidas > 0 ? `Notificaciones, ${notificacionesNoLeidas} sin leer` : 'Notificaciones'">
              <i class="bi bi-bell-fill"></i>
              <span v-if="notificacionesNoLeidas > 0" class="badge-notif">{{ notificacionesNoLeidas }}</span>
            </button>

            <!-- Agregamos w-100 y max-width para que sea responsivo nativamente sin romper la pantalla en móviles -->
            <ul class="dropdown-menu dropdown-menu-end shadow-lg py-0 overflow-hidden dropdown-notificaciones" style="max-width: 95vw;">
              <li class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <h6 class="m-0 fw-bold text-dark">Nuevas Notificaciones</h6>
                <span v-if="notificacionesNoLeidas > 0" class="badge bg-danger rounded-pill">{{ notificacionesNoLeidas }}</span>
              </li>

              <div class="notification-list">
                <li v-for="notif in notificacionesPendientes" :key="notif.id" class="border-bottom bg-light bg-opacity-50">
                  <a class="dropdown-item py-3 px-3 cursor-pointer text-wrap" @click.stop="marcarLeidas()">
                    <div class="d-flex gap-3 align-items-start">
                      <div class="icon-circle flex-shrink-0 shadow-sm" :class="getIconoNotificacion(notif.tipo).bg">
                        <i :class="['bi', getIconoNotificacion(notif.tipo).icono, 'text-white']"></i>
                      </div>
                      <div class="flex-grow-1">
                        <p class="mb-1 text-dark small fw-bold" style="line-height: 1.2;">
                          {{ notif.titulo }}
                          <span class="d-inline-block ms-1 bg-danger rounded-circle" style="width: 6px; height: 6px;"></span>
                        </p>
                        <p class="mb-1 text-muted" style="font-size: 0.75rem; line-height: 1.3;">{{ notif.mensaje }}</p>
                        <small class="text-muted fw-bold" style="font-size: 0.65rem;">{{ notif.fecha }}</small>
                      </div>
                    </div>
                  </a>
                </li>

                <li v-if="notificacionesPendientes.length === 0" class="p-4 text-center text-muted">
                  <i class="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
                  <small>No tenés notificaciones nuevas</small>
                </li>
              </div>

              <li class="p-2 text-center border-top bg-light d-flex flex-column gap-2">
                <button v-if="notificacionesNoLeidas > 0" @click.stop="marcarLeidas" class="btn btn-link btn-sm text-decoration-none text-muted small fw-bold p-0">
                  Marcar como leídas
                </button>
                <RouterLink to="/panel-arbitro/historial-notificaciones" class="btn btn-link btn-sm text-decoration-none text-primary small fw-bold p-0">
                  Ver historial completo
                </RouterLink>
              </li>
            </ul>
        </div>
      </div>
    </header>

    <input ref="inputFoto" type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="onFotoSeleccionada">

    <!-- ============ MENU DE PERFIL ============ -->
    <MenuPerfil
      :abierto="mostrarMenuPerfil"
      :foto="urlFoto"
      :nombre="nombreFormateado"
      :subtitulo="`ID Árbitro ${arbitro.id}`"
      ruta-datos="/panel-arbitro/datos"
      ruta-credencial="/panel-arbitro/credencial"
      :texto-credencial="`Carnet oficial ${anioActual}`"
      @cerrar="cerrarMenuPerfil"
      @cambiar-foto="abrirSelectorFoto"
      @ampliar-foto="abrirFotoAmpliada"
      @salir="cerrarSesion"
      @error-foto="onErrorFoto"
    />

    <div class="container-fluid panel-contenido px-3 px-md-4 py-2">
      <RouterView />
    </div>
    </div>
   </div>

    <!-- ============ BARRA INFERIOR (celular y tablet) ============ -->
    <BarraInferior :items="itemsBarraInferior" />

    <div v-if="mostrarFotoAmpliada" class="foto-overlay" @click="mostrarFotoAmpliada = false">
      <button class="foto-overlay-cerrar" @click.stop="mostrarFotoAmpliada = false" aria-label="Cerrar">
        <i class="bi bi-x-lg"></i>
      </button>
      <img :src="urlFoto" class="foto-overlay-img shadow-lg" @click.stop>
    </div>

    <!-- Modal de recorte de la nueva foto -->
    <div v-if="mostrarModalFoto" class="foto-overlay" @click.self="cancelarFoto">
      <div class="modal-foto shadow-lg">
        <h5 class="fw-bold text-dark mb-3">Recortá tu foto de perfil</h5>

        <div v-if="previewUrl" class="cropper-wrap mb-3">
          <Cropper
            ref="cropperRef"
            class="cropper"
            :src="previewUrl"
            :stencil-props="{ aspectRatio: 3 / 4 }"
            image-restriction="stencil"
          />
        </div>

        <p class="text-muted small text-center mb-3">
          Esta foto se usará en tu panel y en tu credencial digital.
        </p>

        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary rounded-pill fw-bold flex-grow-1" @click="cancelarFoto" :disabled="subiendoFoto">
            Cancelar
          </button>
          <button class="btn btn-danger rounded-pill fw-bold flex-grow-1 d-flex justify-content-center align-items-center" @click="confirmarFoto" :disabled="subiendoFoto || !previewUrl">
            <span v-if="subiendoFoto" class="spinner-border spinner-border-sm me-2"></span>
            {{ subiendoFoto ? 'Subiendo...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toasts de feedback -->
    <ToastNotificacion ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import '@/assets/css/panel.css'
import ToastNotificacion from '@/components/ToastNotificacion.vue'
import { useModulosArbitro } from '@/composables/useModulosArbitro'
import MenuLateral from '@/components/comunes/MenuLateral.vue'
import MenuPerfil from '@/components/comunes/MenuPerfil.vue'
import BarraInferior from '@/components/comunes/BarraInferior.vue'

// Módulos del menú lateral (escritorio)
const { gruposModulos } = useModulosArbitro()

const route = useRoute()
const router = useRouter()

// Referencia al componente de toasts
const toastRef = ref(null)

// Datos del Árbitro
const arbitro = ref(auth.getUser() || {})
const mostrarFotoAmpliada = ref(false)

// Cache-buster: se actualiza al subir una foto nueva para forzar la recarga de la imagen
const versionFoto = ref(Date.now())

const urlFoto = computed(() => {
  if (!arbitro.value || !arbitro.value.dni) {
    return FOTO_POR_DEFECTO
  }
  const dniLimpio = String(arbitro.value.dni).trim()
  return `https://arbitroshandball.com.ar/uploads/carnet-arbitros/${dniLimpio}.webp?t=${versionFoto.value}`
})

const FOTO_POR_DEFECTO = 'https://ui-avatars.com/api/?name=Sin+Foto&background=334155&color=fff'

const onErrorFoto = (e) => {
  if (e.target.src !== FOTO_POR_DEFECTO) e.target.src = FOTO_POR_DEFECTO
}

// Capitaliza cada palabra respetando tildes y ñ (\b\w no las reconoce)
const nombreFormateado = computed(() => {
  const nombre = arbitro.value.nombre || ''
  return nombre.toLowerCase().replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase())
})

const primerNombre = computed(() => nombreFormateado.value.split(' ')[0] || '')

// =======================================================
// HEADER: inicio vs secciones internas
// =======================================================
const esInicio = computed(() => route.name === 'PanelInicio')
const esMenu = computed(() => route.name === 'PanelMenu')

// Barra inferior (celular): Inicio · Designaciones · Avisos (notificaciones sin leer) · Menú
const itemsBarraInferior = computed(() => [
  { to: '/panel-arbitro', label: 'Inicio', icono: 'bi-house-door', iconoActivo: 'bi-house-door-fill', exacta: true },
  { to: '/panel-arbitro/designaciones', label: 'Designaciones', icono: 'bi-calendar4-week' },
  { to: '/panel-arbitro/historial-notificaciones', label: 'Avisos', icono: 'bi-bell', badge: notificacionesNoLeidas.value || null },
  { to: '/panel-arbitro/menu', label: 'Menú', icono: 'bi-list' }
])

// Fecha de hoy para el saludo del Inicio en celular (ej. "Jueves 20 de noviembre")
const fechaHoy = (() => {
  const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})()

const TITULOS_SECCION = {
  PanelLicencia: 'Licencias',
  PanelDatos: 'Datos personales',
  PanelDisponibilidad: 'Disponibilidad',
  PanelSanciones: 'Tribunal de Ética',
  PanelCredencial: 'Credencial digital',
  PanelRendimiento: 'Rendimiento',
  PanelMisObservaciones: 'Observaciones recibidas',
  PanelAportes: 'Aportes',
  Observaciones: 'Observaciones realizadas',
  ObservacionesCarga: 'Partidos Fe.Me.Bal',
  ObservacionesMias: 'Historial de observaciones',
  ObservacionesMini: 'Encuentros de Mini',
  PanelCoordinadoresAdmin: 'Coordinadores',
  CoordinadoresResumen: 'Planilla general de árbitros',
  CoordinadoresReuniones: 'Reuniones mensuales',
  CoordinadoresDisponibilidad: 'Disponibilidad horaria',
  CoordinadoresPlanillaGeneralObservaciones: 'Planilla general de observaciones',
  InformesCoordinadores: 'Informes',
  PanelIndumentaria: 'Indumentaria',
  RealizarPedido: 'Nuevo pedido',
  MisPedidos: 'Pedidos',
  InstitucionesCuit: 'Facturación',
  HistorialNotificacionesArbitro: 'Notificaciones',
  PanelContactosCelulares: 'Contactos',
  DelegadoTecnico: 'Delegado técnico',
  DesignacionesArbitro: 'Designaciones',
  ExamenAsamblea: 'Exámenes',
  InformesArbitro: 'Informes',
  PanelMenu: 'Menú'
}

const tituloSeccion = computed(() => TITULOS_SECCION[route.name] || 'Panel árbitro')

// =======================================================
// MENU DE PERFIL
// =======================================================
const mostrarMenuPerfil = ref(false)
const anioActual = new Date().getFullYear()

const cerrarMenuPerfil = () => {
  mostrarMenuPerfil.value = false
}

const abrirFotoAmpliada = () => {
  cerrarMenuPerfil()
  mostrarFotoAmpliada.value = true
}

const onTeclaMenuPerfil = (e) => {
  if (e.key === 'Escape' && mostrarMenuPerfil.value) cerrarMenuPerfil()
}

// Si cambia la ruta (ej: atrás del navegador) el menú no queda abierto
watch(() => route.fullPath, cerrarMenuPerfil)

const esRutaProfunda = computed(() => {
  const segmentos = route.path.split('/').filter(p => p !== '')
  return segmentos.length > 2
})

const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back()
  } else {
    router.push('/panel-arbitro')
  }
}

const cerrarSesion = () => {
  cerrarMenuPerfil()
  auth.logout()
}

// =======================================================
// LÓGICA DE FOTO DE PERFIL (con recorte)
// =======================================================

const inputFoto = ref(null)
const cropperRef = ref(null)
const mostrarModalFoto = ref(false)
const subiendoFoto = ref(false)
const previewUrl = ref('')

const MAX_MB = 5
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']

const abrirSelectorFoto = () => {
  cerrarMenuPerfil()
  inputFoto.value?.click()
}

const onFotoSeleccionada = (e) => {
  const archivo = e.target.files?.[0]
  // Limpiamos el input para poder volver a elegir el mismo archivo si se cancela
  e.target.value = ''
  if (!archivo) return

  // Validación de tipo
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    toastRef.value?.mostrar({
      tipo: 'danger',
      titulo: 'Formato no válido',
      mensaje: 'Usá una imagen JPG, PNG o WEBP.'
    })
    return
  }

  // Validación de peso
  if (archivo.size > MAX_MB * 1024 * 1024) {
    toastRef.value?.mostrar({
      tipo: 'warning',
      titulo: 'Imagen muy pesada',
      mensaje: `La imagen supera los ${MAX_MB} MB. Elegí una más liviana.`
    })
    return
  }

  previewUrl.value = URL.createObjectURL(archivo)
  mostrarModalFoto.value = true
}

const cancelarFoto = () => {
  if (subiendoFoto.value) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  mostrarModalFoto.value = false
}

// Toma el recorte del cropper y lo devuelve como Blob (archivo real para subir por FormData)
const obtenerRecorteBlob = () => {
  return new Promise((resolve, reject) => {
    const resultado = cropperRef.value?.getResult()
    if (!resultado || !resultado.canvas) {
      reject(new Error('No se pudo procesar el recorte'))
      return
    }
    // Exportamos a JPEG; el backend lo convierte a WEBP y lo guarda como {dni}.webp
    resultado.canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la imagen'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.9
    )
  })
}

const confirmarFoto = async () => {
  if (subiendoFoto.value || !previewUrl.value) return
  subiendoFoto.value = true

  try {
    const blob = await obtenerRecorteBlob()
    // Convertimos el blob en File para que $_FILES['fotos']['name'] tenga un nombre/extensión válidos
    const archivo = new File([blob], 'perfil.jpg', { type: 'image/jpeg' })

    // api.postFile espera que el payload sea un FormData; los archivos van
    // dentro con append. Usamos 'fotos' para que en el back llegue como
    // $_FILES['fotos'] (mismo patrón que indumentaria).
    const formData = new FormData()
    formData.append('fotos', archivo)

    const res = await api.postFile({
      entity: 'datos_personales',
      action: 'actualizarFoto',
      payload: formData
    })

    if (res.ok) {
      // Forzamos la recarga de la imagen en el panel (y en la credencial la próxima vez que se abra)
      versionFoto.value = Date.now()
      // Cerramos el modal directamente. No usamos cancelarFoto() acá porque su
      // guarda (if subiendoFoto) todavía es true en este punto y no cerraría.
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
      mostrarModalFoto.value = false
      toastRef.value?.mostrar({
        tipo: 'success',
        titulo: 'Foto actualizada',
        mensaje: 'Tu foto de perfil se guardó correctamente.'
      })
    } else {
      toastRef.value?.mostrar({
        tipo: 'danger',
        titulo: 'No se pudo actualizar',
        mensaje: res.payload?.mensaje || 'Intentá de nuevo en unos minutos.'
      })
    }
  } catch (error) {
    console.error('Error al subir la foto', error)
    toastRef.value?.mostrar({
      tipo: 'danger',
      titulo: 'Error',
      mensaje: 'Ocurrió un error al procesar o subir la foto.'
    })
  } finally {
    subiendoFoto.value = false
  }
}

// =======================================================
// LÓGICA DE NOTIFICACIONES
// =======================================================

const notificaciones = ref([])

// 1. Filtramos solo las que no están leídas para mostrarlas en la campanita
const notificacionesPendientes = computed(() => {
  return notificaciones.value.filter(n => Number(n.leida) === 0)
})

// 2. El contador ahora se basa en el filtro anterior
const notificacionesNoLeidas = computed(() => notificacionesPendientes.value.length)

const getIconoNotificacion = (tipo) => {
  switch (tipo) {
    case 'success': return { icono: 'bi-check-circle', bg: 'bg-success' }
    case 'danger': return { icono: 'bi-exclamation-octagon', bg: 'bg-danger' }
    case 'warning': return { icono: 'bi-exclamation-triangle', bg: 'bg-warning text-dark' }
    case 'info': return { icono: 'bi-info-circle', bg: 'bg-primary' }
    default: return { icono: 'bi-bell', bg: 'bg-secondary' }
  }
}

const obtenerNotificaciones = async () => {
  try {
    const res = await api.get({ entity: 'notificaciones', action: 'obtenerNotificaciones' })
    if (res.ok) {
      notificaciones.value = res.payload
    }
  } catch (error) {
    console.error('Error cargando notificaciones', error)
  }
}

const marcarLeidas = async () => {
  try {
    const res = await api.post({ entity: 'notificaciones', action: 'marcarLeidas' })
    if (res.ok) {
      notificaciones.value.forEach(n => n.leida = 1)
    }
  } catch (error) {
    console.error('Error al marcar como leídas', error)
  }
}

// Celular: la pestaña "Avisos" abre el historial. Al salir de ahí las damos por leídas
// (al salir y no al entrar, así en el historial todavía se ven cuáles eran nuevas)
watch(() => route.name, (nueva, anterior) => {
  if (anterior === 'HistorialNotificacionesArbitro' && nueva !== anterior && notificacionesNoLeidas.value > 0) {
    marcarLeidas()
  }
})

// La pestaña Menú usa la foto y las acciones de perfil que maneja este componente
provide('panelArbitro', { urlFoto, abrirSelectorFoto, cerrarSesion, onErrorFoto })

onMounted(() => {
  window.addEventListener('keydown', onTeclaMenuPerfil)
  if (auth.isLoggedIn()) {
    auth.startInactivityTimer()
    obtenerNotificaciones()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onTeclaMenuPerfil)
})

useHead({
  title: 'Panel de Árbitro | AAAB',
  meta: [
    { name: 'description', content: 'Panel de control oficial para árbitros de la AAAB.' },
    { property: 'og:title', content: 'Panel de Árbitro | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})
</script>

<style scoped>
.panel-layout {
  position: relative;
  min-height: 100vh;
  background-color: #0f172a;
}

/* ============ ESTRUCTURA: menú lateral + contenido ============ */
.panel-cuerpo {
  display: flex;
  align-items: stretch;
}

.panel-principal {
  flex: 1 1 auto;
  min-width: 0;
  /* Celular: lugar para la barra inferior fija */
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
@media (min-width: 992px) {
  .panel-principal { padding-bottom: 40px; }
}

.fecha-hoy {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* ============ HEADER UNIFICADO ============ */
.panel-header {
  background: #0b1222;
  border-bottom: 1px solid #1e293b;
  position: relative;
  z-index: 90;
  margin-bottom: 8px;
}

.panel-header-inner {
  min-height: 68px;
}

.min-w-0 { min-width: 0; }

.btn-perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  max-width: 100%;
  padding: 4px 8px 4px 0;
  background: none;
  border: 0;
  border-radius: 12px;
  color: #fff;
  text-align: left;
}
.btn-perfil:focus-visible { outline: 2px solid #94a3b8; outline-offset: 2px; }

.perfil-img {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #334155;
}

.saludo {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  max-width: 100%;
}

.subtitulo-perfil {
  font-size: 0.8rem;
  color: #94a3b8;
}

.chevron-perfil {
  font-size: 0.8rem;
  color: #94a3b8;
  transition: transform 0.2s;
}
.chevron-perfil.girado { transform: rotate(180deg); }

.btn-icono {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 0;
  background: #1e293b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  transition: background 0.2s;
}
.btn-icono:hover, .btn-icono:focus-visible { background: #334155; }

.titulo-seccion {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  min-width: 0;
}

.badge-notif {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #dc2626;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0b1222;
}


/* Modal de recorte de foto */
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
  cursor: pointer;
  transition: background 0.2s;
}

.foto-overlay-cerrar:hover {
  background: #334155;
  border-color: #334155;
}

.dropdown-notificaciones {
  width: 350px;
  border-radius: 12px;
  margin-top: 15px;
}

.cursor-pointer {
  cursor: pointer;
}

.dropdown-item {
  transition: background-color 0.2s;
  white-space: normal;
}

.dropdown-item:active {
  background-color: #f1f5f9 !important;
  color: inherit;
}

.dropdown-item:hover {
  background-color: #e2e8f0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.notification-list {
  max-height: 50vh; /* Cambiado a vh para mejor soporte en pantallas chicas */
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}
.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.notification-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.notification-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.animate__animated { animation-duration: 0.5s; }
</style>
