<template>
  <div class="menu-admin py-3 animate__animated animate__fadeIn">

    <!-- ============ PERFIL ============ -->
    <section class="tarjeta-perfil d-flex align-items-center gap-3 p-3">
      <span class="menu-iniciales">{{ iniciales }}</span>
      <div class="min-w-0">
        <p class="menu-nombre text-truncate m-0">{{ nombreAdmin }}</p>
        <p class="menu-cargo m-0">{{ etiquetaRol(admin.rol) }}</p>
      </div>
    </section>

    <!-- ============ APARIENCIA ============ -->
    <SelectorTema />

    <!-- ============ BUSCADOR DE MÓDULOS ============ -->
    <label class="buscador">
      <i class="bi bi-search"></i>
      <input v-model="busqueda" type="search" placeholder="Buscar un módulo… (ej. licencias)" aria-label="Buscar un módulo">
      <button v-if="busqueda" type="button" class="buscador-limpiar" @click="busqueda = ''" aria-label="Borrar búsqueda">
        <i class="bi bi-x-lg"></i>
      </button>
    </label>

    <!-- ============ MÓDULOS ============ -->
    <ListaModulos v-if="gruposFiltrados.length" :grupos="gruposFiltrados" en-columnas />
    <p v-else class="sin-resultados">No hay módulos con “{{ busqueda }}”.</p>

    <!-- ============ CERRAR SESIÓN ============ -->
    <button type="button" class="btn-cerrar-sesion" @click="cerrarSesion">
      <i class="bi bi-box-arrow-right"></i> Cerrar sesión
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { auth } from '@/api/auth'
import { etiquetaRol } from '@/config/modulosAdmin'
import { normalizarTexto } from '@/utils/texto'
import { useModulosAdmin } from '@/composables/useModulosAdmin'
import ListaModulos from '@/components/comunes/ListaModulos.vue'
import SelectorTema from '@/components/comunes/SelectorTema.vue'

useHead({ title: 'Menú | Panel de Gestión AAAB' })

const admin = ref(auth.getUser() || {})

const nombreAdmin = computed(() => {
  const nombre = admin.value.nombre || 'Administrador'
  return nombre.toLowerCase().replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase())
})

const iniciales = computed(() =>
  nombreAdmin.value.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
)

const cerrarSesion = () => {
  auth.logout()
}

// ============ BÚSQUEDA (sin importar tildes ni mayúsculas) ============
const { cargarPermisos, gruposModulos } = useModulosAdmin()
const busqueda = ref('')

const gruposFiltrados = computed(() => {
  const texto = normalizarTexto(busqueda.value.trim())
  if (!texto) return gruposModulos.value
  return gruposModulos.value
    .map(grupo => ({
      ...grupo,
      items: grupo.items.filter(item =>
        normalizarTexto(item.title).includes(texto) ||
        normalizarTexto(item.desc).includes(texto) ||
        normalizarTexto(grupo.categoria).includes(texto)
      )
    }))
    .filter(grupo => grupo.items.length > 0)
})

onMounted(() => cargarPermisos())
</script>

<style scoped>
.menu-admin {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.min-w-0 { min-width: 0; }

/* ============ PERFIL ============ */
.tarjeta-perfil {
  background: var(--t-tarjeta);
  border-radius: 16px;
}

.menu-iniciales {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 50%;
  background: #334155;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.menu-nombre { font-size: 1.05rem; font-weight: 800; color: var(--t-texto); }
.menu-cargo { font-size: 0.85rem; color: var(--t-texto-medio); }

/* ============ BUSCADOR ============ */
.buscador {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  background: var(--t-baldosa);
  border: 1px solid var(--t-baldosa-borde);
  border-radius: 14px;
  color: var(--t-sobre-fondo-suave);
}
.buscador:focus-within { border-color: var(--t-sobre-fondo-suave); }

.buscador input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--t-baldosa-texto);
  font-size: 1rem;
}
.buscador input::placeholder { color: var(--t-sobre-fondo-suave); }
.buscador input::-webkit-search-cancel-button { display: none; }

.buscador-limpiar {
  border: 0;
  background: none;
  color: var(--t-sobre-fondo-suave);
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
  color: var(--t-sobre-fondo-suave);
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
  border: 1px solid var(--t-barra-salir-borde);
  background: transparent;
  color: var(--t-barra-salir);
  font-size: 0.95rem;
  font-weight: 700;
}
.btn-cerrar-sesion:hover { background: var(--t-barra-salir-hover); }

.animate__animated { animation-duration: 0.4s; }
</style>
