<template>
  <div class="panel-layout">
    <div class="panel-cuerpo">

      <!-- ============ MENÚ LATERAL (solo escritorio) ============ -->
      <MenuLateral
        inicio="/panel-admin"
        :grupos="gruposModulos"
        :nombre="nombreAdmin"
        :subtitulo="etiquetaRol(admin.rol)"
        clave-almacenamiento="panelAdmin.menuColapsado"
        @salir="cerrarSesion"
      />

      <div class="panel-principal">
        <!-- ============ HEADER UNIFICADO ============ -->
        <header class="panel-header">
          <div class="panel-header-inner d-flex align-items-center gap-2 px-3 px-md-4 py-2">

            <!-- Inicio: fecha (celular) + saludo + cargo -->
            <div v-if="esInicio" class="min-w-0">
              <span class="fecha-hoy d-lg-none">{{ fechaHoy }}</span>
              <h1 class="titulo-seccion text-truncate m-0">Hola, {{ primerNombre }}</h1>
              <span class="cargo">{{ etiquetaRol(admin.rol) }}</span>
            </div>

            <!-- Secciones: flecha para volver + título -->
            <template v-else>
              <button type="button" class="btn-icono" @click="handleVolver" :aria-label="esRutaProfunda ? 'Volver atrás' : 'Volver al inicio'">
                <i class="bi bi-arrow-left"></i>
              </button>
              <h1 class="titulo-seccion text-truncate m-0">{{ tituloSeccion }}</h1>
            </template>

            <!-- Celular: cerrar sesión (en escritorio está en el menú lateral) -->
            <button v-if="esInicio" type="button" class="btn-icono ms-auto d-lg-none" @click="cerrarSesion" aria-label="Cerrar sesión" title="Cerrar sesión">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </header>

        <div class="container-fluid panel-contenido px-3 px-md-4 py-2">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { auth } from '@/api/auth'
import { useHead } from '@vueuse/head'
import { etiquetaRol, buscarSeccionAdmin } from '@/config/modulosAdmin'
import { useModulosAdmin } from '@/composables/useModulosAdmin'
import MenuLateral from '@/components/comunes/MenuLateral.vue'
import '@/assets/css/panel.css'

const route = useRoute()
const router = useRouter()

const admin = ref(auth.getUser() || {})

// Capitaliza cada palabra respetando tildes y ñ
const nombreAdmin = computed(() => {
  const nombre = admin.value.nombre || 'Administrador'
  return nombre.toLowerCase().replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase())
})

const primerNombre = computed(() => nombreAdmin.value.split(' ')[0])

// Fecha de hoy para el saludo del Inicio en celular (ej. "Jueves 20 de noviembre")
const fechaHoy = (() => {
  const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})()

// =======================================================
// HEADER: inicio vs secciones
// =======================================================
const esInicio = computed(() => route.name === 'AdminInicio')

const tituloSeccion = computed(() => buscarSeccionAdmin(route.path)?.title || 'Panel de gestión')

// Si la URL tiene más de 2 segmentos (ej: /panel-admin/tesoreria/aportes-pagos/valores) es una subsección
const esRutaProfunda = computed(() => {
  const segmentos = route.path.split('/').filter(p => p !== '')
  return segmentos.length > 3
})

const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back()
  } else {
    router.push('/panel-admin')
  }
}

const cerrarSesion = () => {
  auth.logout()
}

// =======================================================
// MÓDULOS (menú lateral) Y PENDIENTES
// =======================================================
const { cargarPermisos, gruposModulos, cargarPendientes } = useModulosAdmin()

onMounted(async () => {
  if (auth.isLoggedIn()) {
    admin.value = auth.getUser()
  }
  await cargarPermisos(true)
  cargarPendientes()
})

useHead({
  title: 'Panel de Gestión | AAAB',
  meta: [
    { name: 'description', content: 'Sección de administración para el panel de inicio de árbitros AAAB.' },
    { property: 'og:title', content: 'Panel de Gestión | AAAB' },
    { property: 'og:description', content: 'Sección de administración para el panel de inicio de árbitros AAAB.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
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

.min-w-0 { min-width: 0; }

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

.titulo-seccion {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  min-width: 0;
}

.fecha-hoy {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
}

.cargo {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
}

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
</style>
