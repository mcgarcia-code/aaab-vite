<template>
  <aside :class="['panel-lateral d-none d-lg-flex', { colapsado }]" aria-label="Menú del panel">
    <!-- Ocultar / mostrar el menú (queda solo la columna de íconos) -->
    <button type="button" class="lateral-link lateral-toggle" @click="alternar"
            :aria-expanded="!colapsado" :title="colapsado ? 'Mostrar menú' : 'Ocultar menú'">
      <i :class="['bi', colapsado ? 'bi-chevron-double-right' : 'bi-chevron-double-left']"></i>
      <span class="lateral-texto">Ocultar menú</span>
    </button>

    <!-- Perfil -->
    <component
      :is="perfilInteractivo ? 'button' : 'div'"
      :type="perfilInteractivo ? 'button' : null"
      :class="['lateral-perfil', { interactivo: perfilInteractivo }]"
      :aria-expanded="perfilInteractivo ? perfilAbierto : null"
      :aria-haspopup="perfilInteractivo ? 'true' : null"
      :aria-label="perfilInteractivo ? 'Abrir menú de perfil' : null"
      :title="nombre"
      @click="perfilInteractivo && emit('perfil')"
    >
      <img v-if="foto" :src="foto" @error="(e) => emit('error-foto', e)" class="lateral-foto" alt="">
      <span v-else class="lateral-foto lateral-iniciales">{{ iniciales }}</span>
      <span class="lateral-texto d-flex flex-column align-items-start min-w-0 flex-grow-1">
        <span class="lateral-nombre text-truncate">{{ nombre }}</span>
        <span class="lateral-subtitulo text-truncate">{{ subtitulo }}</span>
      </span>
      <i v-if="perfilInteractivo" class="lateral-texto bi bi-chevron-down lateral-chevron" :class="{ girado: perfilAbierto }"></i>
    </component>

    <nav class="lateral-nav">
      <RouterLink :to="inicio" class="lateral-link" exact-active-class="activo" title="Inicio">
        <i class="bi bi-house-door"></i><span class="lateral-texto">Inicio</span>
      </RouterLink>

      <template v-for="grupo in grupos" :key="grupo.categoria">
        <p class="lateral-categoria"><span class="lateral-texto">{{ grupo.categoria }}</span></p>
        <component
          v-for="item in grupo.items"
          :key="item.title"
          :is="item.href ? 'a' : 'RouterLink'"
          v-bind="item.href ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' } : { to: item.to, activeClass: 'activo' }"
          class="lateral-link"
          :title="item.title"
        >
          <span class="position-relative lateral-icono">
            <i :class="item.icon"></i>
            <!-- Punto rojo cuando hay pendientes (se ve también con el menú oculto) -->
            <span v-if="item.badge" class="lateral-punto"></span>
          </span>
          <span class="lateral-texto flex-grow-1 text-truncate">{{ item.title }}</span>
          <span v-if="item.badge" class="lateral-texto lateral-badge">{{ item.badge }}</span>
          <i v-if="item.href" class="lateral-texto bi bi-box-arrow-up-right lateral-externo"></i>
        </component>
      </template>
    </nav>

    <button type="button" class="lateral-link lateral-salir" @click="emit('salir')" title="Cerrar sesión">
      <i class="bi bi-box-arrow-right"></i><span class="lateral-texto">Cerrar sesión</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

// Menú lateral de escritorio, común a panel-arbitro y panel-admin.
// grupos: [{ categoria, items: [{ to | href, title, icon, badge? }] }]
const props = defineProps({
  inicio: { type: String, required: true },
  grupos: { type: Array, required: true },
  nombre: { type: String, default: '' },
  subtitulo: { type: String, default: '' },
  foto: { type: String, default: '' },
  perfilInteractivo: { type: Boolean, default: false },
  perfilAbierto: { type: Boolean, default: false },
  // Clave para recordar en este navegador si el menú quedó oculto
  claveAlmacenamiento: { type: String, default: 'panel.menuColapsado' }
})

const emit = defineEmits(['perfil', 'salir', 'error-foto'])

const iniciales = computed(() =>
  props.nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?'
)

const leerColapsado = () => {
  try {
    return localStorage.getItem(props.claveAlmacenamiento) === '1'
  } catch {
    return false
  }
}

const colapsado = ref(leerColapsado())

const alternar = () => {
  colapsado.value = !colapsado.value
  try {
    localStorage.setItem(props.claveAlmacenamiento, colapsado.value ? '1' : '0')
  } catch {
    // Sin almacenamiento (modo privado): el menú funciona igual, solo no se recuerda
  }
}
</script>

<style scoped>
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
  transition: flex-basis 0.2s ease;
}

.min-w-0 { min-width: 0; }

/* ============ PERFIL ============ */
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
.lateral-perfil.interactivo:hover { background: #1e293b; }
.lateral-perfil:focus-visible { outline: 2px solid #94a3b8; outline-offset: 2px; }

.lateral-foto {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #334155;
}

.lateral-iniciales {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #334155;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
}

.lateral-nombre {
  font-size: 0.95rem;
  font-weight: 700;
  max-width: 100%;
}

.lateral-subtitulo {
  font-size: 0.8rem;
  color: #94a3b8;
  max-width: 100%;
}

.lateral-chevron {
  font-size: 0.8rem;
  color: #94a3b8;
  transition: transform 0.2s;
}
.lateral-chevron.girado { transform: rotate(180deg); }

/* ============ NAVEGACIÓN ============ */
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
.lateral-link > .bi:first-child,
.lateral-icono .bi {
  width: 18px;
  font-size: 1rem;
  color: #94a3b8;
  text-align: center;
  display: inline-block;
}
.lateral-link:hover { background: #1e293b; color: #fff; }
.lateral-link:focus-visible { outline: 2px solid #94a3b8; outline-offset: -2px; }

/* Sección actual: fondo resaltado e ícono rojo */
.lateral-link.activo { background: #1e293b; color: #fff; font-weight: 600; }
.lateral-link.activo > .bi:first-child,
.lateral-link.activo .lateral-icono .bi { color: #f87171; }

.lateral-externo { font-size: 0.7rem; color: #64748b; }

.lateral-punto {
  position: absolute;
  top: -3px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.lateral-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #dc2626;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lateral-salir {
  margin-top: auto;
  color: #fca5a5;
}
.lateral-salir > .bi:first-child { color: #fca5a5; }

.lateral-toggle { color: #94a3b8; margin-bottom: 4px; }

/* ============ MENÚ OCULTO: solo columna de íconos ============ */
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
</style>
