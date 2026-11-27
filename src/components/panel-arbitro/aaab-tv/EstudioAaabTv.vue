<template>
  <div>
    <PestanasSeccion v-model="paso" :pestanas="pestanas" class="mb-3" aria-label="Pasos del estudio" />
    <MiPanelTags v-if="paso === 'panel'" />
    <SubirVideoExterno v-else-if="paso === 'subir' && puedePublicar" @publicado="emit('publicado')" />
    <AnalisisPartido v-else-if="paso === 'vivo'" key="vivo" vista="vivo" @ir-revisar="paso = 'revisar'" />
    <AnalisisPartido v-else key="revisar" vista="revisar" @publicado="emit('publicado')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import MiPanelTags from '@/components/panel-arbitro/aaab-tv/MiPanelTags.vue'
import AnalisisPartido from '@/components/panel-arbitro/aaab-tv/AnalisisPartido.vue'
import SubirVideoExterno from '@/components/panel-arbitro/aaab-tv/SubirVideoExterno.vue'
import { useAaabTv } from '@/composables/useAaabTv'

// Estudio de AAAB TV: Mi panel, En vivo (marcar y guardar el evento), Revisar evento (video, clips y publicar) y Subir video.
// Lo usan el panel árbitro (AaabTv.vue) y el coordinador general en el panel admin (AaabTvAdmin.vue).
const emit = defineEmits(['publicado'])
const { sesion, puedePublicar, cargarPanel } = useAaabTv()

// Dónde arrancar: marcando (en vivo corriendo o tags sin guardar), revisando (evento abierto) o en "Mi panel"
const pasoInicial = () => {
  if (sesion.reloj.corriendo || (sesion.tags.length && !sesion.idEvento)) return 'vivo'
  if (sesion.idEvento) return 'revisar'
  return 'panel'
}
const paso = ref(pasoInicial())

// Pasos del estudio. Subir video (videos externos, ej. de WhatsApp): solo quienes pueden publicar
const pestanas = computed(() => [
  { clave: 'panel', etiqueta: 'Mi panel', icono: 'bi-ui-checks-grid' },
  { clave: 'vivo', etiqueta: 'En vivo', icono: 'bi-record-circle' },
  { clave: 'revisar', etiqueta: 'Revisar evento', icono: 'bi-film' },
  ...(puedePublicar.value ? [{ clave: 'subir', etiqueta: 'Subir video', icono: 'bi-cloud-arrow-up' }] : [])
])

// Panel de botones del usuario (con servidor, el mismo en todos sus dispositivos)
onMounted(cargarPanel)
</script>

