<template>
  <div class="panel-layout">
   <div class="panel-cuerpo">

    <!-- ============ MENÚ LATERAL (solo escritorio) ============ -->
    <aside :class="['panel-lateral d-none d-lg-flex', { colapsado: menuColapsado }]" aria-label="Menú del panel">
      <!-- Ocultar / mostrar el menú (queda solo la columna de íconos) -->
      <button type="button" class="lateral-link lateral-toggle" @click="alternarMenuLateral"
              :aria-expanded="!menuColapsado" :title="menuColapsado ? 'Mostrar menú' : 'Ocultar menú'">
        <i :class="['bi', menuColapsado ? 'bi-chevron-double-right' : 'bi-chevron-double-left']"></i>
        <span class="lateral-texto">Ocultar menú</span>
      </button>

      <button type="button" class="lateral-perfil" @click="mostrarMenuPerfil = !mostrarMenuPerfil"
              :aria-expanded="mostrarMenuPerfil" aria-haspopup="true" aria-label="Abrir menú de perfil" title="Mi perfil">
        <img :src="urlFoto" @error="onErrorFoto" class="perfil-img" alt="">
        <span class="lateral-texto d-flex flex-column align-items-start min-w-0 flex-grow-1">
          <span class="lateral-nombre text-truncate">{{ nombreFormateado }}</span>
          <span class="subtitulo-perfil">Árbitro · ID {{ arbitro.id }}</span>
        </span>
        <i class="lateral-texto bi bi-chevron-down chevron-perfil" :class="{ girado: mostrarMenuPerfil }"></i>
      </button>

      <nav class="lateral-nav">
        <RouterLink to="/panel-arbitro" class="lateral-link" exact-active-class="activo" title="Inicio">
          <i class="bi bi-house-door"></i><span class="lateral-texto">Inicio</span>
        </RouterLink>

        <template v-for="grupo in gruposModulos" :key="grupo.categoria">
          <p class="lateral-categoria"><span class="lateral-texto">{{ grupo.categoria }}</span></p>
          <component
            v-for="item in grupo.items"
            :key="item.title"
            :is="item.href ? 'a' : 'RouterLink'"
            v-bind="item.href ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' } : { to: item.to, activeClass: 'activo' }"
            class="lateral-link"
            :title="item.title"
          >
            <i :class="item.icon"></i>
            <span class="lateral-texto flex-grow-1 text-truncate">{{ item.title }}</span>
            <i v-if="item.href" class="lateral-texto bi bi-box-arrow-up-right lateral-externo"></i>
          </component>
        </template>
      </nav>

      <button type="button" class="lateral-link lateral-salir" @click="cerrarSesion" title="Cerrar sesión">
        <i class="bi bi-box-arrow-right"></i><span class="lateral-texto">Cerrar sesión</span>
      </button>
    </aside>

    <div class="panel-principal">
    <!-- ============ HEADER UNIFICADO ============ -->
    <header class="panel-header">
      <div class="panel-header-inner d-flex align-items-center gap-2 px-3 px-md-4 py-2">

        <!-- Escritorio: el perfil está en el menú lateral, acá solo el saludo -->
        <h1 v-if="esInicio" class="titulo-seccion text-truncate m-0 d-none d-lg-block">Hola, {{ primerNombre }}</h1>

        <!-- Inicio (celular y tablet): foto + saludo, abre el menú de perfil -->
        <div v-if="esInicio" class="position-relative min-w-0 d-lg-none">
          <button type="button" class="btn-perfil" @click="mostrarMenuPerfil = !mostrarMenuPerfil"
                  :aria-expanded="mostrarMenuPerfil" aria-haspopup="true" aria-label="Abrir menú de perfil">
            <img :src="urlFoto" @error="onErrorFoto" class="perfil-img" alt="">
            <span class="d-flex flex-column align-items-start min-w-0">
              <span class="saludo text-truncate">Hola, {{ primerNombre }}</span>
              <span class="subtitulo-perfil">Árbitro · ID {{ arbitro.id }}</span>
            </span>
            <i class="bi bi-chevron-down chevron-perfil" :class="{ girado: mostrarMenuPerfil }"></i>
          </button>
        </div>

        <!-- Secciones internas: flecha para volver + título -->
        <template v-else>
          <button type="button" class="btn-icono" @click="handleVolver" :aria-label="esRutaProfunda ? 'Volver atrás' : 'Volver al inicio'">
            <i class="bi bi-arrow-left"></i>
          </button>
          <h1 class="titulo-seccion text-truncate m-0">{{ tituloSeccion }}</h1>
        </template>

        <div class="dropdown ms-auto">
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
    <div v-if="mostrarMenuPerfil" class="menu-perfil-fondo" @click="cerrarMenuPerfil"></div>
    <section v-if="mostrarMenuPerfil" class="menu-perfil shadow-lg" aria-label="Menú de perfil">
      <div class="menu-perfil-asa d-md-none"></div>

      <div class="d-flex flex-column align-items-center gap-2 px-3 pt-3 pb-3">
        <div class="perfil-wrap">
          <img :src="urlFoto" @error="onErrorFoto" class="perfil-img-grande" role="button" alt="Ver foto de perfil ampliada"
               @click="abrirFotoAmpliada">
          <button type="button" class="btn-editar-foto" @click="abrirSelectorFoto" aria-label="Cambiar foto de perfil">
            <i class="bi bi-camera-fill"></i>
          </button>
        </div>
        <span class="nombre-perfil text-center">{{ nombreFormateado }}</span>
        <span class="id-perfil">ID Árbitro {{ arbitro.id }}</span>
      </div>

      <div class="border-top">
        <RouterLink to="/panel-arbitro/datos" class="opcion-perfil" @click="cerrarMenuPerfil">
          <span class="opcion-icono"><i class="bi bi-person-lines-fill"></i></span>
          <span class="flex-grow-1">Datos personales</span>
          <i class="bi bi-chevron-right text-secondary"></i>
        </RouterLink>
        <RouterLink to="/panel-arbitro/credencial" class="opcion-perfil" @click="cerrarMenuPerfil">
          <span class="opcion-icono"><i class="bi bi-person-badge"></i></span>
          <span class="flex-grow-1 d-flex flex-column">
            Ver credencial
            <small class="opcion-desc">Carnet oficial {{ anioActual }}</small>
          </span>
          <i class="bi bi-chevron-right text-secondary"></i>
        </RouterLink>
        <button type="button" class="opcion-perfil" @click="abrirSelectorFoto">
          <span class="opcion-icono"><i class="bi bi-camera"></i></span>
          <span class="flex-grow-1">Cambiar foto</span>
        </button>
      </div>
      <div class="border-top">
        <button type="button" class="opcion-perfil opcion-salir" @click="cerrarSesion">
          <span class="opcion-icono"><i class="bi bi-box-arrow-right"></i></span>
          <span class="flex-grow-1">Cerrar sesión</span>
        </button>
      </div>
    </section>

    <div class="container-fluid panel-contenido px-3 px-md-4 py-2">
      <RouterView />
    </div>
    </div>
   </div>

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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import '@/assets/css/panel-arbitro.css'
import ToastNotificacion from '@/components/ToastNotificacion.vue'
import { useModulosArbitro } from '@/composables/useModulosArbitro'

// Módulos del menú lateral (escritorio)
const { gruposModulos } = useModulosArbitro()

// Menú lateral oculto (solo íconos): se recuerda en este navegador
const CLAVE_MENU_COLAPSADO = 'panelArbitro.menuColapsado'

const leerMenuColapsado = () => {
  try {
    return localStorage.getItem(CLAVE_MENU_COLAPSADO) === '1'
  } catch {
    return false
  }
}

const menuColapsado = ref(leerMenuColapsado())

const alternarMenuLateral = () => {
  menuColapsado.value = !menuColapsado.value
  try {
    localStorage.setItem(CLAVE_MENU_COLAPSADO, menuColapsado.value ? '1' : '0')
  } catch {
    // Sin almacenamiento (modo privado): el menú funciona igual, solo no se recuerda
  }
}

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
  InformesArbitro: 'Informes'
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
  padding-bottom: 40px;
}

/* ============ MENÚ LATERAL (escritorio) ============ */
/* Sin scroll propio: ocupa todo el largo de la página
   (se estira con el contenido y como mínimo llena la pantalla) */
.panel-lateral {
  flex: 0 0 264px;
  flex-direction: column;
  gap: 4px;
  min-height: 100vh;
  padding: 16px 12px;
  background: #0b1222;
  border-right: 1px solid #1e293b;
  z-index: 95;
}

.lateral-perfil {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 12px;
  background: #111a2e;
  color: #fff;
  text-align: left;
  margin-bottom: 8px;
}
.lateral-perfil:hover { background: #1e293b; }
.lateral-perfil:focus-visible { outline: 2px solid #94a3b8; outline-offset: 2px; }

.lateral-nombre {
  font-size: 0.95rem;
  font-weight: 700;
  max-width: 100%;
}

.lateral-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lateral-categoria {
  margin: 16px 12px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
}

.lateral-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  text-align: left;
  transition: background-color 0.15s, color 0.15s;
}
.lateral-link > .bi:first-child {
  width: 18px;
  font-size: 1rem;
  color: #94a3b8;
  text-align: center;
}
.lateral-link:hover { background: #1e293b; color: #fff; }
.lateral-link:focus-visible { outline: 2px solid #94a3b8; outline-offset: -2px; }

/* Sección actual: fondo resaltado e ícono rojo */
.lateral-link.activo { background: #1e293b; color: #fff; font-weight: 600; }
.lateral-link.activo > .bi:first-child { color: #f87171; }

.lateral-externo { font-size: 0.7rem; color: #64748b; }

.lateral-salir {
  margin-top: auto;
  color: #fca5a5;
}
.lateral-salir > .bi:first-child { color: #fca5a5; }

.lateral-toggle { color: #94a3b8; margin-bottom: 4px; }

/* ============ MENÚ LATERAL OCULTO: solo columna de íconos ============ */
.panel-lateral { transition: flex-basis 0.2s ease; }

.panel-lateral.colapsado {
  flex-basis: 72px;
  padding-left: 10px;
  padding-right: 10px;
}

.panel-lateral.colapsado .lateral-texto { display: none !important; }

.panel-lateral.colapsado .lateral-link,
.panel-lateral.colapsado .lateral-perfil {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.panel-lateral.colapsado .lateral-perfil { background: transparent; }

/* Las categorías se convierten en una línea divisoria */
.panel-lateral.colapsado .lateral-categoria {
  height: 1px;
  margin: 10px 8px;
  background: #1e293b;
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

/* ============ MENU DE PERFIL ============ */
/* Celular: hoja que sube desde abajo. Escritorio: panel bajo el header */
.menu-perfil-fondo {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  z-index: 1040;
}

.menu-perfil {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1045;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding-bottom: 16px;
  max-height: 90vh;
  overflow-y: auto;
  animation: subirMenu 0.2s ease-out;
}

.menu-perfil-asa {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #cbd5e1;
  margin: 10px auto 0;
}

@keyframes subirMenu {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@media (min-width: 768px) {
  .menu-perfil-fondo { background: transparent; }
  .menu-perfil {
    position: absolute;
    top: 76px;
    left: 24px;
    right: auto;
    bottom: auto;
    width: 320px;
    border-radius: 16px;
    padding-bottom: 8px;
    animation: none;
  }
}

/* Contenedor de la foto para posicionar el botón de editar */
.perfil-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.perfil-img-grande {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  cursor: zoom-in;
}

.btn-editar-foto {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0f172a;
  border: 3px solid #fff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.btn-editar-foto:hover { background: #334155; }

.nombre-perfil {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.id-perfil {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 999px;
}

.opcion-perfil {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 56px;
  padding: 0 16px;
  background: none;
  border: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  text-decoration: none;
  text-align: left;
}
.opcion-perfil:hover { background: #f8fafc; }

.opcion-icono {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opcion-desc {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.opcion-salir { color: #b91c1c; }
.opcion-salir .opcion-icono { background: #fef2f2; color: #b91c1c; }

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
