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

        <div class="user-header d-flex align-items-center mb-4 p-2 p-md-3 rounded-4 shadow">
          <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="perfil-img me-2 me-md-3 shadow-sm" alt="Foto de perfil">
          <div class="min-w-0">
            <h2 class="text-white fw-bold m-0 fs-5 fs-md-3" style="line-height: 1.2;">
              Hola, {{ nombreFormateado }} 👋
            </h2>
            <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
              <span class="badge bg-danger px-2 py-1 shadow-sm text-truncate" style="max-width: 100%;">{{ alumno.usuario }}</span>
              <span v-if="ESTADOS_CURSO[alumno.estado]" class="badge px-2 py-1 shadow-sm" :class="ESTADOS_CURSO[alumno.estado].clase">
                {{ ESTADOS_CURSO[alumno.estado].etiqueta }}
              </span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { auth } from '@/api/auth'
import { ESTADOS_CURSO, urlFotoCurso, FOTO_POR_DEFECTO } from '@/composables/useCursoArbitro'

useHead({
  title: 'Panel del Curso | AAAB',
  meta: [{ name: 'description', content: 'Panel de los alumnos del curso de árbitros de la AAAB.' }],
})

const route = useRoute()
const router = useRouter()

// Datos del alumno en sesión. La foto se versiona para refrescarla al cambiarla
// desde Datos Personales (evento 'foto-curso-actualizada').
const alumno = ref(auth.getUser() || {})
const versionFoto = ref(Date.now())

const urlFoto = computed(() => urlFotoCurso(alumno.value.dni, versionFoto.value))

const nombreFormateado = computed(() =>
  String(alumno.value.nombre || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
)

const volver = () => router.push('/panel-curso')
const cerrarSesion = () => auth.logout()

const refrescarFoto = () => { versionFoto.value = Date.now() }
const refrescarAlumno = () => { alumno.value = auth.getUser() || {} }

onMounted(() => {
  if (auth.isLoggedIn()) auth.startInactivityTimer()
  window.addEventListener('foto-curso-actualizada', refrescarFoto)
  window.addEventListener('storage', refrescarAlumno)
})

onBeforeUnmount(() => {
  window.removeEventListener('foto-curso-actualizada', refrescarFoto)
  window.removeEventListener('storage', refrescarAlumno)
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
}
.perfil-img {
  width: clamp(50px, 10vw, 70px);
  height: clamp(50px, 10vw, 70px);
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dc2626;
  flex-shrink: 0;
}
.min-w-0 { min-width: 0; }
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
