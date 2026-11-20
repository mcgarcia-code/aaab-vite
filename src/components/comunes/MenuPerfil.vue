<template>
  <!-- Menú que se abre al tocar el usuario: hoja desde abajo en celular, panel en escritorio -->
  <div v-if="abierto" class="menu-perfil-fondo" @click="emit('cerrar')"></div>
  <section v-if="abierto" class="menu-perfil shadow-lg" aria-label="Menú de perfil">
    <div class="menu-perfil-asa d-md-none"></div>

    <div class="d-flex flex-column align-items-center gap-2 px-3 pt-3 pb-3">
      <div class="perfil-wrap">
        <img :src="foto" @error="(e) => emit('error-foto', e)" class="perfil-img-grande" role="button" alt="Ver foto de perfil ampliada"
             @click="emit('ampliar-foto')">
        <button type="button" class="btn-editar-foto" @click="emit('cambiar-foto')" aria-label="Cambiar foto de perfil">
          <i class="bi bi-camera-fill"></i>
        </button>
      </div>
      <span class="nombre-perfil text-center">{{ nombre }}</span>
      <span class="id-perfil">{{ subtitulo }}</span>
    </div>

    <div class="border-top">
      <RouterLink :to="rutaDatos" class="opcion-perfil" @click="emit('cerrar')">
        <span class="opcion-icono"><i class="bi bi-person-lines-fill"></i></span>
        <span class="flex-grow-1">Datos personales</span>
        <i class="bi bi-chevron-right text-secondary"></i>
      </RouterLink>
      <RouterLink :to="rutaCredencial" class="opcion-perfil" @click="emit('cerrar')">
        <span class="opcion-icono"><i class="bi bi-person-badge"></i></span>
        <span class="flex-grow-1 d-flex flex-column">
          Ver credencial
          <small class="opcion-desc">{{ textoCredencial }}</small>
        </span>
        <i class="bi bi-chevron-right text-secondary"></i>
      </RouterLink>
      <button type="button" class="opcion-perfil" @click="emit('cambiar-foto')">
        <span class="opcion-icono"><i class="bi bi-camera"></i></span>
        <span class="flex-grow-1">Cambiar foto</span>
      </button>
    </div>
    <div class="border-top">
      <button type="button" class="opcion-perfil opcion-salir" @click="emit('salir')">
        <span class="opcion-icono"><i class="bi bi-box-arrow-right"></i></span>
        <span class="flex-grow-1">Cerrar sesión</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// Menú de perfil común a panel-arbitro y panel-curso
const props = defineProps({
  abierto: { type: Boolean, default: false },
  foto: { type: String, default: '' },
  nombre: { type: String, default: '' },
  subtitulo: { type: String, default: '' },
  rutaDatos: { type: String, required: true },
  rutaCredencial: { type: String, required: true },
  textoCredencial: { type: String, default: '' }
})

const emit = defineEmits(['cerrar', 'cambiar-foto', 'ampliar-foto', 'salir', 'error-foto'])

const alPresionarTecla = (e) => {
  if (e.key === 'Escape' && props.abierto) emit('cerrar')
}

onMounted(() => window.addEventListener('keydown', alPresionarTecla))
onUnmounted(() => window.removeEventListener('keydown', alPresionarTecla))
</script>

<style scoped>
/* Celular: hoja que sube desde abajo. Escritorio: panel bajo el perfil del menú lateral */
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

.nombre-perfil { font-size: 1.1rem; font-weight: 800; color: #0f172a; }

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

.opcion-desc { font-size: 0.75rem; font-weight: 500; color: #64748b; }

.opcion-salir { color: #b91c1c; }
.opcion-salir .opcion-icono { background: #fef2f2; color: #b91c1c; }
</style>
