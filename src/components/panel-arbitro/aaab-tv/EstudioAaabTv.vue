<template>
  <div>
    <PestanasSeccion v-model="paso" :pestanas="pestanas" class="mb-3" aria-label="Pasos del estudio" />
    <MiPanelTags v-if="paso === 'panel'" />
    <SubirVideoExterno v-else-if="paso === 'subir' && puedePublicar" @publicado="emit('publicado')" />
    <AnalisisPartido v-else @publicado="emit('publicado')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import MiPanelTags from '@/components/panel-arbitro/aaab-tv/MiPanelTags.vue'
import AnalisisPartido from '@/components/panel-arbitro/aaab-tv/AnalisisPartido.vue'
import SubirVideoExterno from '@/components/panel-arbitro/aaab-tv/SubirVideoExterno.vue'
import { useAaabTv } from '@/composables/useAaabTv'

// Estudio de AAAB TV: Mi panel, Analizar y Subir video.
// Lo usan el panel árbitro (AaabTv.vue) y el coordinador general en el panel admin (AaabTvAdmin.vue).
const emit = defineEmits(['publicado'])
const { sesion, puedePublicar, cargarPanel } = useAaabTv()

// Si todavía no hay tags, se arranca por "Mi panel"; si ya hay, por "Analizar"
const paso = ref(sesion.tags.length ? 'analizar' : 'panel')

// Pasos del estudio. Subir video (videos externos, ej. de WhatsApp): solo quienes pueden publicar
const pestanas = computed(() => [
  { clave: 'panel', etiqueta: 'Mi panel', icono: 'bi-ui-checks-grid' },
  { clave: 'analizar', etiqueta: 'Analizar', icono: 'bi-camera-reels' },
  ...(puedePublicar.value ? [{ clave: 'subir', etiqueta: 'Subir video', icono: 'bi-cloud-arrow-up' }] : [])
])

// Panel de botones del usuario (con servidor, el mismo en todos sus dispositivos)
onMounted(cargarPanel)
</script>

