<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <p class="seccion-descripcion">Análisis de partidos y clips</p>
          <PestanasSeccion :model-value="vista" :pestanas="pestanasTv" llenar aria-label="AAAB TV" @update:model-value="irA" />
        </div>

        <div class="card-body p-3 p-md-4">
          <!-- ======================= AAAB TV ======================= -->
          <PortalAaabTv v-if="vista === 'tv'" @ir-estudio="irA('estudio')" />

          <!-- ======================= ESTUDIO ======================= -->
          <EstudioAaabTv v-else @publicado="irA('tv')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import PortalAaabTv from '@/components/panel-arbitro/aaab-tv/PortalAaabTv.vue'
import EstudioAaabTv from '@/components/panel-arbitro/aaab-tv/EstudioAaabTv.vue'
import { useAaabTv } from '@/composables/useAaabTv'

// AAAB TV en el panel árbitro: el portal de clips y el Estudio (Mi panel, En vivo, Revisar evento, Subir video)
useHead({ title: 'AAAB TV | AAAB' })

const route = useRoute()
const router = useRouter()
const { clipsVisibles, sesion } = useAaabTv()

// La pestaña queda en la URL (?vista=estudio) para volver al mismo lugar
const vista = computed(() => (route.query.vista === 'estudio' ? 'estudio' : 'tv'))
const irA = (destino) => router.replace({ query: destino === 'estudio' ? { vista: 'estudio' } : {} })

// Pestañas: AAAB TV con la cantidad de clips; Estudio con los clips marcados (si hay)
const pestanasTv = computed(() => [
  { clave: 'tv', etiqueta: 'AAAB TV', icono: 'bi-play-btn', cantidad: clipsVisibles.value.length },
  { clave: 'estudio', etiqueta: 'Estudio', icono: 'bi-camera-reels', cantidad: sesion.tags.length || null }
])
</script>
