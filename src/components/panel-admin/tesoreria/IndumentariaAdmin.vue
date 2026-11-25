<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <p class="seccion-descripcion seccion-descripcion-oscura">Stock y pedidos</p>
    <ListaModulos :grupos="[{ items }]" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useModulosAdmin } from '@/composables/useModulosAdmin'
import ListaModulos from '@/components/comunes/ListaModulos.vue'

useHead({ title: 'Indumentaria | AAAB' })

// Stock y Pedidos (Pedidos muestra cuántos hay nuevos sin procesar)
const { cargarPermisos, subseccionesDe, cargarPendientes } = useModulosAdmin()
const items = subseccionesDe('/panel-admin/tesoreria/indumentaria')

onMounted(async () => {
  await cargarPermisos()
  cargarPendientes()
})
</script>

<style scoped>
</style>
