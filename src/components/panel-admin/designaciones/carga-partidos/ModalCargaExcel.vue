<template>
  <ModalBase
    :show="show"
    titulo="Cargar Designaciones desde Excel"
    icono="upload_file"
    colorIcono="bg-danger text-white"
    maxWidth="600px"
    @close="emit('close')"
  >
    <div class="alert alert-info small py-2 px-3 d-flex align-items-center gap-2">
      <i class="bi bi-info-circle-fill"></i>
      <span>El archivo se procesa en el servidor y sus partidos se agregan a la tabla de designaciones.</span>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">Archivo Excel</label>
      <input
        @change="emit('seleccionar', $event)"
        type="file"
        class="form-control shadow-none border-secondary-subtle"
        accept=".xlsx,.xls"
      >
      <div class="form-text small">
        Columnas esperadas: FECHA, CANCHA, CATEGORIA, HORARIO, LOCAL, VISITANTE, ARBITRO 1, ARBITRO 2.
      </div>
    </div>

    <div v-if="archivo" class="alert alert-success small py-2 px-3 mb-0 d-flex align-items-center gap-2">
      <i class="bi bi-file-earmark-excel-fill"></i>
      <span>Archivo seleccionado: <strong>{{ archivo.name }}</strong></span>
    </div>

    <template #footer>
      <button
        type="button"
        @click="emit('close')"
        class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0"
        :disabled="subiendo"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="emit('confirmar')"
        class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100"
        :disabled="subiendo || !archivo"
      >
        <span v-if="subiendo" class="spinner-border spinner-border-sm me-2"></span>
        {{ subiendo ? 'Cargando...' : 'Cargar Partidos' }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import ModalBase from '@/components/ModalBase.vue'

// Elegir el Excel de partidos y mandarlo al servidor (la carga la hace CargaPartidos)
defineProps({
  show: { type: Boolean, default: false },
  archivo: { type: Object, default: null },
  subiendo: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'seleccionar', 'confirmar'])
</script>
