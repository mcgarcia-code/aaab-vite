<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <p class="seccion-descripcion seccion-descripcion-oscura">Hacé y seguí tus pedidos</p>
    <ListaModulos :grupos="grupos" />
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import ListaModulos from '@/components/comunes/ListaModulos.vue'

useHead({
  title: 'Indumentaria | AAAB',
  meta: [
    { name: 'description', content: 'Gestión de indumentaria oficial para los árbitros de la AAAB.' }
  ],
})

// Mismo título y descripción que muestra cada sección al entrar
const grupos = [
  {
    items: [
      { to: '/panel-arbitro/indumentaria/nuevo', title: 'Nuevo pedido', icon: 'bi bi-cart-plus', desc: 'Armá tu pedido de temporada' },
      { to: '/panel-arbitro/indumentaria/mis-pedidos', title: 'Pedidos', icon: 'bi bi-list-check', desc: 'Estado de tus solicitudes' }
    ]
  }
]
</script>

<style scoped>
.animate__animated { animation-duration: 0.5s; }
</style>
