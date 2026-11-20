<template>
  <div class="menu-panel py-3 animate__animated animate__fadeIn">

    <!-- ============ PERFIL ============ -->
    <section class="tarjeta-perfil">
      <div class="d-flex align-items-center gap-3 p-3">
        <img :src="urlFoto" @error="onErrorFoto" class="menu-foto" alt="">
        <div class="min-w-0">
          <p class="menu-nombre text-truncate m-0">{{ nombreFormateado }}</p>
          <p class="menu-id m-0">Árbitro · ID {{ arbitro.id }}</p>
        </div>
      </div>
      <RouterLink to="/panel-arbitro/datos" class="opcion-perfil">
        <i class="bi bi-person-lines-fill"></i>
        <span class="flex-grow-1">Datos personales</span>
        <i class="bi bi-chevron-right flecha"></i>
      </RouterLink>
      <RouterLink to="/panel-arbitro/credencial" class="opcion-perfil">
        <i class="bi bi-person-badge"></i>
        <span class="flex-grow-1">Credencial digital · {{ anioActual }}</span>
        <i class="bi bi-chevron-right flecha"></i>
      </RouterLink>
      <button type="button" class="opcion-perfil" @click="abrirSelectorFoto">
        <i class="bi bi-camera"></i>
        <span class="flex-grow-1">Cambiar foto</span>
      </button>
    </section>

    <!-- ============ BUSCADOR DE MÓDULOS ============ -->
    <label class="buscador">
      <i class="bi bi-search"></i>
      <input v-model="busqueda" type="search" placeholder="Buscar un módulo… (ej. licencia)" aria-label="Buscar un módulo">
      <button v-if="busqueda" type="button" class="buscador-limpiar" @click="busqueda = ''" aria-label="Borrar búsqueda">
        <i class="bi bi-x-lg"></i>
      </button>
    </label>

    <!-- ============ MÓDULOS ============ -->
    <ListaModulos v-if="gruposFiltrados.length" :grupos="gruposFiltrados" />
    <p v-else class="sin-resultados">No hay módulos con “{{ busqueda }}”.</p>

    <!-- ============ CERRAR SESIÓN ============ -->
    <button type="button" class="btn-cerrar-sesion" @click="cerrarSesion">
      <i class="bi bi-box-arrow-right"></i> Cerrar sesión
    </button>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { auth } from '@/api/auth'
import { normalizarTexto } from '@/utils/texto'
import { useModulosArbitro } from '@/composables/useModulosArbitro'
import ListaModulos from '@/components/panel-arbitro/ListaModulos.vue'

useHead({ title: 'Menú | AAAB' })

// Foto y acciones de perfil: las maneja PanelArbitro (cropper y cierre de sesión)
const panel = inject('panelArbitro')
const urlFoto = panel.urlFoto
const abrirSelectorFoto = panel.abrirSelectorFoto
const cerrarSesion = panel.cerrarSesion
const onErrorFoto = panel.onErrorFoto

const arbitro = ref(auth.getUser() || {})
const anioActual = new Date().getFullYear()

const nombreFormateado = computed(() => {
  const nombre = arbitro.value.nombre || ''
  return nombre.toLowerCase().replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase())
})

// ============ BÚSQUEDA (sin importar tildes ni mayúsculas) ============
const { gruposModulos } = useModulosArbitro()
const busqueda = ref('')

const gruposFiltrados = computed(() => {
  const texto = normalizarTexto(busqueda.value.trim())
  if (!texto) return gruposModulos.value
  return gruposModulos.value
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item =>
        normalizarTexto(item.title).includes(texto) || normalizarTexto(item.desc).includes(texto)
      )
    }))
    .filter(grupo => grupo.items.length > 0)
})
</script>

<style scoped>
.menu-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 720px;
}

.min-w-0 { min-width: 0; }

/* ============ PERFIL ============ */
.tarjeta-perfil {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.menu-foto {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.menu-nombre { font-size: 1.05rem; font-weight: 800; color: #0f172a; }
.menu-id { font-size: 0.85rem; color: #475569; }

.opcion-perfil {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border: 0;
  border-top: 1px solid #e2e8f0;
  background: none;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  text-align: left;
}
.opcion-perfil > .bi:first-child { color: #dc2626; font-size: 1.05rem; width: 20px; text-align: center; }
.opcion-perfil:hover { background: #f8fafc; }
.flecha { color: #94a3b8; font-size: 0.8rem; }

/* ============ BUSCADOR ============ */
.buscador {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  color: #94a3b8;
}
.buscador:focus-within { border-color: #94a3b8; }

.buscador input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: #fff;
  font-size: 1rem;
}
.buscador input::placeholder { color: #94a3b8; }
/* Sin la "x" nativa del input search: usamos la nuestra */
.buscador input::-webkit-search-cancel-button { display: none; }

.buscador-limpiar {
  border: 0;
  background: none;
  color: #94a3b8;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sin-resultados {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* ============ CERRAR SESIÓN ============ */
.btn-cerrar-sesion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  border-radius: 14px;
  border: 1px solid #7f1d1d;
  background: transparent;
  color: #fca5a5;
  font-size: 0.95rem;
  font-weight: 700;
}
.btn-cerrar-sesion:hover { background: #1f1215; }

.animate__animated { animation-duration: 0.4s; }
</style>
