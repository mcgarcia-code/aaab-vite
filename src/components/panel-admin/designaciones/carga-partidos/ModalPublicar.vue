<template>
  <ModalBase
    :show="show"
    titulo="Publicar Designaciones"
    icono="publish"
    colorIcono="bg-danger text-white"
    maxWidth="600px"
    @close="emit('close')"
  >
    <div class="alert alert-info small py-2 px-3 d-flex align-items-center gap-2">
      <i class="bi bi-info-circle-fill"></i>
      <span>Se publicarán los <strong>{{ cantidadAPublicar }}</strong> partidos designados de las fechas tildadas como una <strong>publicación nueva</strong>: se genera el PDF para la web pública y cada árbitro verá sus partidos en su panel.</span>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Fechas a publicar</label>
      <div class="d-flex flex-column gap-1 border rounded p-2">
        <label v-for="f in fechas" :key="f.clave" class="d-flex align-items-center gap-2 small mb-0 cursor-pointer">
          <input
            type="checkbox"
            class="form-check-input m-0 flex-shrink-0"
            :checked="fechasSeleccionadas.includes(f.clave)"
            @change="emit('toggle-fecha', f.clave)"
          >
          <span>{{ f.etiqueta }}</span>
          <span class="badge bg-light text-dark border ms-auto">{{ f.cantidad }}</span>
        </label>
      </div>
    </div>

    <div v-if="hayCambios" class="alert alert-primary small py-2 px-3 d-flex align-items-center gap-2">
      <i class="bi bi-pencil-square"></i>
      <span>Hay cambios recientes: se terminan de guardar automáticamente antes de publicar.</span>
    </div>

    <div v-if="totalADesignar > 0" class="alert alert-danger small py-2 px-3 d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-circle-fill"></i>
      <span>Hay <strong>{{ totalADesignar }}</strong> partidos sin árbitros en las fechas tildadas: esos <strong>no</strong> se publican. Están marcados en rojo en la grilla.</span>
    </div>

    <div v-if="totalSinMatch > 0" class="alert alert-warning small py-2 px-3 d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>Hay <strong>{{ totalSinMatch }}</strong> árbitros sin coincidencia en el padrón: esos partidos <strong>no</strong> les van a aparecer en su panel. Están marcados en amarillo en la grilla.</span>
    </div>

    <template #footer>
      <button
        type="button"
        @click="emit('close')"
        class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
        :disabled="publicando"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="emit('publicar')"
        class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
        :disabled="publicando || fechasSeleccionadas.length === 0"
      >
        <span v-if="publicando" class="spinner-border spinner-border-sm me-2"></span>
        {{ publicando ? 'Publicando...' : 'Publicar Ahora' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Publicar las designaciones de las fechas tildadas (PDF para la web + panel de los árbitros).
// fechas: [{ clave, etiqueta, cantidad }] (las mismas de las pestañas por día)
defineProps({
  show: { type: Boolean, default: false },
  fechas: { type: Array, default: () => [] },
  fechasSeleccionadas: { type: Array, default: () => [] },
  cantidadAPublicar: { type: Number, default: 0 },
  hayCambios: { type: Boolean, default: false },
  totalADesignar: { type: Number, default: 0 },
  totalSinMatch: { type: Number, default: 0 },
  publicando: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'toggle-fecha', 'publicar'])
</script>
