<template>
  <button
    type="button"
    :class="['btn boton-herramienta shadow-sm', config.clase]"
    :disabled="disabled || cargando"
    :title="textoFinal"
    :aria-label="textoFinal"
    :aria-busy="cargando ? 'true' : null"
  >
    <span v-if="cargando && tipo !== 'actualizar'" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <i v-else :class="['bi', icono || config.icono, { girando: girando && tipo === 'actualizar' }]" aria-hidden="true"></i>
    <span :class="soloIconoEnCelular ? 'd-none d-md-inline' : ''">{{ textoFinal }}</span>
    <span v-if="cantidad > 0" :class="['badge rounded-pill', config.clase === 'btn-danger' ? 'text-bg-light' : 'text-bg-danger']">{{ cantidad }}</span>
  </button>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'

// Botones de herramientas de las secciones del panel, siempre iguales:
//  - actualizar: gris, el ícono gira mientras carga
//  - limpiar:    gris, se deshabilita si no hay filtros
//  - filtros:    gris, solo en celular (abre el panel de filtros); muestra cuántos hay activos
//  - excel:      verde, spinner mientras genera el archivo
//  - nuevo:      rojo, la acción principal de la sección (Nueva observación, Nuevo pedido…)
// Orden en la barra: Filtros · Limpiar · Actualizar · Excel · Nuevo
const props = defineProps({
  tipo: {
    type: String,
    required: true,
    validator: v => ['actualizar', 'limpiar', 'filtros', 'excel', 'nuevo', 'enlace'].includes(v)
  },
  cargando: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  texto: { type: String, default: '' },
  icono: { type: String, default: '' },
  cantidad: { type: Number, default: 0 },
  soloIconoEnCelular: { type: Boolean, default: true }
})

const TIPOS = {
  actualizar: { icono: 'bi-arrow-clockwise', texto: 'Actualizar', clase: 'btn-light border' },
  limpiar: { icono: 'bi-x-circle', texto: 'Limpiar filtros', clase: 'btn-light border' },
  filtros: { icono: 'bi-funnel', texto: 'Filtros', clase: 'btn-light border' },
  excel: { icono: 'bi-file-earmark-excel', texto: 'Excel', clase: 'btn-success' },
  nuevo: { icono: 'bi-plus-lg', texto: 'Nuevo', clase: 'btn-danger' },
  enlace: { icono: 'bi-arrow-right', texto: 'Ver', clase: 'btn-light border' }
}

const config = computed(() => TIPOS[props.tipo])

// El ícono de Actualizar gira al menos una vuelta completa: si los datos
// llegan muy rápido, igual se ve que se actualizó
const VUELTA_MS = 800
const girando = ref(props.cargando)
let inicioGiro = props.cargando ? Date.now() : 0
let temporizador = null

watch(() => props.cargando, (cargandoAhora) => {
  clearTimeout(temporizador)
  if (cargandoAhora) {
    inicioGiro = Date.now()
    girando.value = true
    return
  }
  const restante = VUELTA_MS - ((Date.now() - inicioGiro) % VUELTA_MS)
  temporizador = setTimeout(() => { girando.value = false }, restante)
})

onBeforeUnmount(() => clearTimeout(temporizador))
const textoFinal = computed(() => props.texto || config.value.texto)
</script>

<style scoped>
.boton-herramienta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  min-width: 40px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.boton-herramienta .bi { font-size: 1rem; line-height: 1; }

.btn-light.boton-herramienta { color: var(--o-texto, #0f172a); }

.girando { animation: girar 0.8s linear infinite; }

@keyframes girar {
  to { transform: rotate(360deg); }
}
</style>
