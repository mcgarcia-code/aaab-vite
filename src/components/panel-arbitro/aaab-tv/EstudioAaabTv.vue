<template>
  <div>
    <div class="pasos mb-3" role="tablist" aria-label="Pasos del estudio">
      <button type="button" role="tab" :aria-selected="paso === 'panel'" :class="{ activo: paso === 'panel' }" @click="paso = 'panel'">
        <span class="numero">1</span> Mi panel
      </button>
      <button type="button" role="tab" :aria-selected="paso === 'analizar'" :class="{ activo: paso === 'analizar' }" @click="paso = 'analizar'">
        <span class="numero">2</span> Analizar
      </button>
      <!-- Videos externos (ej. de WhatsApp): solo quienes pueden publicar -->
      <button v-if="puedePublicar" type="button" role="tab" :aria-selected="paso === 'subir'" :class="{ activo: paso === 'subir' }" @click="paso = 'subir'">
        <i class="bi bi-cloud-arrow-up" aria-hidden="true"></i> Subir video
      </button>
    </div>
    <MiPanelTags v-if="paso === 'panel'" />
    <SubirVideoExterno v-else-if="paso === 'subir' && puedePublicar" @publicado="emit('publicado')" />
    <AnalisisPartido v-else @publicado="emit('publicado')" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

// Panel de botones del usuario (con servidor, el mismo en todos sus dispositivos)
onMounted(cargarPanel)
</script>

<style scoped>
.pasos {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--o-borde, #e2e8f0);
  overflow-x: auto;
  scrollbar-width: none;
}
.pasos button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px 10px;
  margin-bottom: -1px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  font-weight: 800;
  white-space: nowrap;
  color: var(--o-texto-suave, #64748b);
}
.pasos button + button { margin-left: 12px; }
.pasos button.activo { color: var(--o-texto, #0f172a); border-bottom-color: #dc2626; }
.numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--o-chip, #e2e8f0);
  color: var(--o-texto, #0f172a);
  font-size: 0.75rem;
}
.pasos button.activo .numero { background: #dc2626; color: #fff; }
</style>
