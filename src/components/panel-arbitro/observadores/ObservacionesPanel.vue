<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <p class="seccion-descripcion seccion-descripcion-oscura">Cargá y revisá las tuyas</p>
    <ListaModulos :grupos="grupos" />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import ListaModulos from '@/components/comunes/ListaModulos.vue'

useHead({
  title: 'Observaciones | AAAB',
  meta: [
    { name: 'description', content: 'Módulo para cargar y visualizar observaciones.' }
  ],
})

// Mismo título y descripción que muestra cada sección al entrar
const grupos = [
  {
    items: [
      { to: '/panel-arbitro/observaciones/carga', title: 'Partidos Fe.Me.Bal', icon: 'bi bi-cloud-upload', desc: 'Cargá observaciones de partidos' },
      { to: '/panel-arbitro/observaciones/observaciones-mini', title: 'Encuentros de Mini', icon: 'bi bi-people', desc: 'Observaciones del curso de árbitros' },
      { to: '/panel-arbitro/observaciones/mis-observaciones', title: 'Historial de observaciones', icon: 'bi bi-envelope-check', desc: 'Las observaciones que cargaste' }
    ]
  }
]
</script>

<style scoped>
</style>
