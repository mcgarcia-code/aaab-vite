<template>
  <div class="text-start">
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <span class="fw-bold text-muted small">Informe #{{ informe.id }}</span>
      <span :class="claseEstadoInforme(informe.estado)">{{ etiquetaEstadoInforme(informe.estado) }}</span>
    </div>

    <!-- Aviso propio de cada sección (ej: informe cargado por otro) -->
    <slot name="aviso"></slot>

    <div class="row g-3">
      <div class="col-6"><DatoDetalle etiqueta="Fecha del partido" :valor="fechaArg(informe.fecha_partido, 'S/F')" /></div>
      <div class="col-6"><DatoDetalle etiqueta="Categoría" :valor="informe.categoria || '-'" /></div>
      <div class="col-12"><DatoDetalle etiqueta="Torneo" :valor="etiquetaTorneo(informe.torneo)" /></div>
      <div class="col-12"><DatoDetalle etiqueta="Encuentro" :valor="informe.encuentro" /></div>
      <div class="col-12"><DatoDetalle etiqueta="Árbitros" :valor="informe.arbitros || '-'" /></div>
      <div class="col-12" v-if="informe.delegado_tecnico">
        <DatoDetalle etiqueta="Delegado técnico (cargó el informe)" :valor="informe.delegado_tecnico" />
      </div>
      <div class="col-6"><DatoDetalle etiqueta="Implicado" :valor="informe.implicado" /></div>
      <div class="col-6"><DatoDetalle etiqueta="Sanción" :valor="informe.sancion" /></div>
      <div class="col-12"><DatoDetalle etiqueta="Institución" :valor="informe.institucion_nombre" /></div>

      <div class="col-12">
        <label class="form-label small fw-bold text-muted mb-1">Motivo y descripción</label>
        <!-- El admin lo reemplaza por un textarea cuando edita -->
        <slot name="motivo">
          <div class="border rounded p-2 bg-light small text-break texto-preformateado">{{ informe.motivo_descripcion }}</div>
        </slot>
      </div>

      <!-- Quién lo cargó (el admin le suma Larry y los coordinadores del grupo) -->
      <slot name="cargado" :texto-cargado="textoCargado" :etiqueta-cargado="etiquetaCargado">
        <div class="col-12"><DatoDetalle :etiqueta="etiquetaCargado" :valor="textoCargado" /></div>
      </slot>

      <!-- ARCHIVOS ADJUNTOS -->
      <div class="col-12" v-if="informe.archivos && informe.archivos.length">
        <label class="form-label small fw-bold text-muted mb-1">
          <i class="bi bi-paperclip me-1"></i>Archivos adjuntos ({{ informe.archivos.length }})
        </label>
        <ul class="list-group list-group-flush border rounded">
          <li
            v-for="(arc, idx) in informe.archivos"
            :key="idx"
            class="list-group-item d-flex justify-content-between align-items-center py-2 px-2 small"
          >
            <span class="text-break d-flex align-items-center gap-2 min-w-0">
              <i class="bi bi-file-earmark-arrow-down text-danger flex-shrink-0"></i>
              <span class="text-truncate">{{ arc.archivo_nombre }}</span>
            </span>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger py-0 px-2 ms-2 flex-shrink-0 d-flex align-items-center gap-1"
              :disabled="descargandoArchivo === arc.url_completa"
              title="Descargar"
              @click="emit('descargar', arc)"
            >
              <span v-if="descargandoArchivo === arc.url_completa" class="spinner-border spinner-border-sm spinner-mini"></span>
              <i v-else class="bi bi-download"></i>
              <span class="d-none d-sm-inline">Descargar</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Acciones propias de cada sección debajo de los datos (ej: cambio de estado) -->
    <slot name="despues"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DatoDetalle from '@/components/comunes/informes/DatoInforme.vue'
import { fechaArg, fechaHoraArg } from '@/utils/fechas'
import { etiquetaTorneo, etiquetaEstadoInforme, claseEstadoInforme } from '@/utils/informes'

// Datos de un informe de partido, iguales para el árbitro, el coordinador y el admin.
// Cada sección suma lo suyo con los slots: aviso, motivo, cargado y despues.
const props = defineProps({
  informe: { type: Object, required: true },
  descargandoArchivo: { type: String, default: null }
})

const emit = defineEmits(['descargar'])

const etiquetaCargado = computed(() =>
  props.informe.cargado_por_es_rol ? 'Cargado por' : (props.informe.delegado_tecnico ? 'Cargado por el delegado técnico' : 'Cargado por el árbitro')
)
const textoCargado = computed(() =>
  `${fechaHoraArg(props.informe.creado_en, '-')} — ${props.informe.cargado_por_nombre || props.informe.delegado_tecnico || props.informe.arbitros || '-'}`
)
</script>

<style scoped>
.spinner-mini { width: 12px; height: 12px; }
</style>
