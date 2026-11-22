<template>
  <div class="panel-layout">
    <div class="panel-cuerpo">

      <!-- ============ MENÚ LATERAL (solo escritorio) ============ -->
      <MenuLateral
        inicio="/panel-curso"
        :grupos="gruposModulos"
        :nombre="nombreFormateado"
        :subtitulo="subtituloAlumno"
        :foto="urlFoto"
        perfil-interactivo
        clave-almacenamiento="panelCurso.menuColapsado"
        :perfil-abierto="mostrarMenuPerfil"
        @perfil="mostrarMenuPerfil = !mostrarMenuPerfil"
        @salir="cerrarSesion"
        @error-foto="(e) => e.target.src = FOTO_POR_DEFECTO"
      />

      <div class="panel-principal">
        <!-- ============ HEADER UNIFICADO ============ -->
        <header class="panel-header">
          <div class="panel-header-inner d-flex align-items-center gap-2 px-3 px-md-4 py-2">

            <!-- Inicio: foto (celular, lleva al Menú) + fecha (celular) + saludo y estado del curso -->
            <div v-if="esInicio" class="d-flex align-items-center gap-3 min-w-0">
              <RouterLink to="/panel-curso/menu" class="d-lg-none flex-shrink-0" aria-label="Ir al menú y perfil">
                <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="perfil-img" alt="">
              </RouterLink>
              <div class="min-w-0">
                <span class="fecha-hoy d-lg-none">{{ fechaHoy }}</span>
                <h1 class="titulo-seccion text-truncate m-0">Hola, {{ primerNombre }}</h1>
                <div class="d-flex flex-wrap align-items-center gap-1 mt-1">
                  <span v-if="MODALIDADES_CURSO[alumno.modalidad_curso]" class="badge px-2 py-1" :class="MODALIDADES_CURSO[alumno.modalidad_curso].clase">
                    {{ MODALIDADES_CURSO[alumno.modalidad_curso].etiqueta }}
                  </span>
                  <span v-if="ESTADOS_CURSO[estadoAlumno]" class="badge px-2 py-1" :class="ESTADOS_CURSO[estadoAlumno].clase">
                    {{ ESTADOS_CURSO[estadoAlumno].etiqueta }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pestaña Menú (celular): no lleva flecha para volver -->
            <h1 v-else-if="esMenu" class="titulo-seccion text-truncate m-0">Menú</h1>

            <!-- Secciones: flecha para volver + título -->
            <template v-else>
              <button type="button" class="btn-icono" @click="volver" aria-label="Volver al inicio">
                <i class="bi bi-arrow-left"></i>
              </button>
              <h1 class="titulo-seccion text-truncate m-0">{{ tituloSeccion }}</h1>
            </template>

            <!-- NOTIFICACIONES (escritorio; en celular están en la barra inferior) -->
            <div ref="contenedorNotificaciones" class="position-relative flex-shrink-0 ms-auto d-none d-lg-block">
              <button
                type="button"
                class="btn-icono position-relative"
                :aria-expanded="mostrarNotificaciones"
                :aria-label="noLeidas.length ? `Notificaciones, ${noLeidas.length} sin leer` : 'Notificaciones'"
                @click="alternarNotificaciones"
              >
                <i class="bi bi-bell-fill"></i>
                <span v-if="noLeidas.length" class="badge-notif">{{ noLeidas.length }}</span>
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
                        <small class="text-muted fw-bold texto-075">{{ fechaHoraDMA(n.fecha) }}</small>
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
        </header>

        <!-- ============ MENÚ DE PERFIL (igual que panel-arbitro) ============ -->
        <MenuPerfil
          :abierto="mostrarMenuPerfil"
          :foto="urlFoto"
          :nombre="nombreFormateado"
          :subtitulo="subtituloAlumno"
          ruta-datos="/panel-curso/datos-curso"
          ruta-credencial="/panel-curso/credencial-curso"
          :texto-credencial="`Credencial de aspirante ${anioActual}`"
          @cerrar="mostrarMenuPerfil = false"
          @cambiar-foto="mostrarMenuPerfil = false; abrirSelectorFoto()"
          @ampliar-foto="mostrarMenuPerfil = false; editorFoto?.ampliar()"
          @salir="cerrarSesion"
          @error-foto="(e) => e.target.src = FOTO_POR_DEFECTO"
        />

        <div class="container-fluid panel-contenido px-3 px-md-4 py-2">
          <RouterView />
        </div>
      </div>
    </div>

    <!-- ============ BARRA INFERIOR (celular y tablet) ============ -->
    <BarraInferior :items="itemsBarraInferior" />

    <!-- Foto de perfil: ampliada y cambio con recorte -->
    <EditorFotoPerfil
      ref="editorFoto"
      :foto="urlFoto"
      :foto-por-defecto="FOTO_POR_DEFECTO"
      entity="perfil_curso_arbitro"
      action="actualizarFotoCurso"
      texto-ayuda="Esta foto se usará en tu panel y en tu credencial digital del curso."
      @actualizada="avisarFotoActualizada"
      @aviso="toast"
    />

    <ToastNotificacion ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import EditorFotoPerfil from '@/components/comunes/EditorFotoPerfil.vue'
import { auth } from '@/api/auth'
import ToastNotificacion from '@/components/ToastNotificacion.vue'
import { ESTADOS_CURSO, MODALIDADES_CURSO, urlFotoCurso, FOTO_POR_DEFECTO } from '@/composables/useCursoArbitro'
import { useNotificacionesCurso, ICONOS_NOTIFICACION as ICONOS } from '@/composables/useNotificacionesCurso'
import { fechaHoraDMA } from '@/utils/fechas'
import { proveerPerfilCurso } from '@/composables/usePerfilCurso'
import { useModulosCurso, TITULOS_SECCION_CURSO } from '@/composables/useModulosCurso'
import MenuLateral from '@/components/comunes/MenuLateral.vue'
import MenuPerfil from '@/components/comunes/MenuPerfil.vue'
import BarraInferior from '@/components/comunes/BarraInferior.vue'
import '@/assets/css/panel.css'

useHead({
  title: 'Panel del Curso | AAAB',
  meta: [{ name: 'description', content: 'Panel de los aspirantes del curso de árbitros de la AAAB.' }],
})

const route = useRoute()
const router = useRouter()

const toastRef = ref(null)
const toast = (m) => toastRef.value?.mostrar(m)
provide('toast', toast)

// Perfil compartido con todas las vistas del panel (se pide una sola vez)
const { perfil, cargar: cargarPerfil } = proveerPerfilCurso()

// La foto se versiona para que el navegador la vuelva a pedir después de cambiarla
const alumno = ref(auth.getUser() || {})
const versionFoto = ref(Date.now())
const urlFoto = computed(() => urlFotoCurso(alumno.value.dni, versionFoto.value))
// El estado sale del perfil (actualizado); mientras carga, del usuario de la sesión
const estadoAlumno = computed(() => perfil.value?.estado || alumno.value.estado)
// Capitaliza cada palabra respetando tildes y ñ
const nombreFormateado = computed(() =>
  String(alumno.value.nombre || '').toLowerCase().replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase())
)
const primerNombre = computed(() => nombreFormateado.value.split(' ')[0] || '')

// Modalidad · estado del curso (para el menú lateral y el Menú)
const subtituloAlumno = computed(() =>
  [MODALIDADES_CURSO[alumno.value.modalidad_curso]?.etiqueta, ESTADOS_CURSO[estadoAlumno.value]?.etiqueta].filter(Boolean).join(' · ') || 'Aspirante'
)

// Fecha de hoy para el saludo del Inicio en celular (ej. "Jueves 20 de noviembre")
const fechaHoy = (() => {
  const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})()

// ─── Header y menú lateral ───────────────────────────────────────
const esInicio = computed(() => route.name === 'PanelInicioCurso')
const esMenu = computed(() => route.name === 'PanelMenuCurso')
const tituloSeccion = computed(() => TITULOS_SECCION_CURSO[route.name] || 'Panel del curso')

const { gruposModulos } = useModulosCurso(estadoAlumno)

// Menú de perfil (al tocar el usuario en el menú lateral). Se cierra al cambiar de página
const mostrarMenuPerfil = ref(false)
const anioActual = new Date().getFullYear()
watch(() => route.fullPath, () => { mostrarMenuPerfil.value = false })

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

// ─── Foto de perfil (ampliar / cambiar con recorte: EditorFotoPerfil) ───
const editorFoto = ref(null)
const abrirSelectorFoto = () => editorFoto.value?.abrirSelector()
// Otras vistas (credencial, menú) escuchan este evento para refrescar la foto
const avisarFotoActualizada = () => window.dispatchEvent(new Event('foto-curso-actualizada'))

// Barra inferior (celular): Inicio · Cronograma · Avisos (notificaciones sin leer) · Menú
const itemsBarraInferior = computed(() => [
  { to: '/panel-curso', label: 'Inicio', icono: 'bi-house-door', iconoActivo: 'bi-house-door-fill', exacta: true },
  { to: '/panel-curso/cronograma-curso', label: 'Cronograma', icono: 'bi-calendar3-week' },
  { to: '/panel-curso/historial-notificaciones', label: 'Avisos', icono: 'bi-bell', badge: noLeidas.value.length || null },
  { to: '/panel-curso/menu', label: 'Menú', icono: 'bi-list' }
])

// Celular: la pestaña Avisos abre el historial. Al salir de ahí se dan por leídas
watch(() => route.name, (nueva, anterior) => {
  if (anterior === 'HistorialNotificacionesCurso' && nueva !== anterior && noLeidas.value.length) marcarLeidas()
})

// La pestaña Menú usa la foto y las acciones de perfil que maneja este componente
provide('panelCurso', { urlFoto, abrirSelectorFoto, cerrarSesion, nombreFormateado, subtituloAlumno, gruposModulos })

onMounted(() => {
  if (auth.isLoggedIn()) auth.startInactivityTimer()
  cargarNotificaciones()
  cargarPerfil().catch(() => {})
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
  position: relative;
  min-height: 100vh;
  background-color: var(--t-panel-fondo);
}

/* ============ ESTRUCTURA: menú lateral + contenido ============ */
.panel-cuerpo { display: flex; align-items: stretch; }
.panel-principal {
  flex: 1 1 auto;
  min-width: 0;
  /* Celular: lugar para la barra inferior fija */
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
@media (min-width: 992px) {
  .panel-principal { padding-bottom: 40px; }
}
.min-w-0 { min-width: 0; }

/* ============ HEADER UNIFICADO ============ */
.panel-header {
  background: var(--t-barra-fondo);
  border-bottom: 1px solid var(--t-barra-borde);
  position: relative;
  z-index: 90;
  margin-bottom: 8px;
}
.panel-header-inner { min-height: 68px; }
.titulo-seccion { font-size: 1.1rem; font-weight: 700; color: var(--t-barra-texto); min-width: 0; }
.fecha-hoy { display: block; font-size: 0.8rem; color: var(--t-barra-texto-suave); }
.perfil-img {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--t-avatar-borde);
}
.btn-icono {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: 0;
  background: var(--t-barra-elevado);
  color: var(--t-barra-texto);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  transition: background 0.2s;
}
.btn-icono:hover, .btn-icono:focus-visible { background: var(--t-barra-elevado-hover); }
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
  border: 2px solid var(--t-barra-fondo);
}
.min-w-0 { min-width: 0; }
.panel-notificaciones {
  position: absolute;
  right: 0;
  top: 52px;
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
</style>
