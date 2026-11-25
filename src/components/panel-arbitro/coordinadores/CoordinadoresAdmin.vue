<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <p class="seccion-descripcion seccion-descripcion-oscura">Exámenes y reuniones</p>
    <ListaModulos :grupos="grupos" />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import ListaModulos from '@/components/comunes/ListaModulos.vue'

useHead({
  title: 'Coordinadores | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de coordinadores para los árbitros de la AAAB.' }
  ],
})

// Mismo título y descripción que muestra cada sección al entrar
const grupos = [
  {
    items: [
      { to: '/panel-arbitro/coordinadores/reuniones-mensuales', title: 'Reuniones mensuales', icon: 'bi bi-clipboard-data-fill', desc: 'Presentes y ausentes de cada reunión' },
      { to: '/panel-arbitro/coordinadores/disponibilidad-horaria', title: 'Disponibilidad horaria', icon: 'bi bi-clock-history', desc: 'Horarios de los árbitros de tu grupo' },
      { to: '/panel-arbitro/coordinadores/resumen-arbitros', title: 'Planilla general de árbitros', icon: 'bi bi-table', desc: 'Asambleas, recuperatorios y reuniones' },
      { to: '/panel-arbitro/coordinadores/planilla-general-observaciones', title: 'Planilla general de observaciones', icon: 'bi bi-clipboard2-data-fill', desc: 'Observaciones de los árbitros de tus grupos' },
      { to: '/panel-arbitro/coordinadores/informes-coordinadores', title: 'Informes', icon: 'bi bi-file-earmark-text-fill', desc: 'Informes de los árbitros' }
    ]
  }
]
</script>

<style scoped>
</style>
