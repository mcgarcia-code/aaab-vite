<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <p class="seccion-descripcion seccion-descripcion-oscura">Valores, movimientos y cierres</p>
    <ListaModulos v-if="items.length" :grupos="[{ items }]" />
    <EstadoVacio v-else icono="bi-lock" titulo="No tenés acceso a estas secciones"
                 mensaje="Pedile a un administrador el permiso de configuración de tesorería." class="bg-white rounded-4" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useModulosAdmin } from '@/composables/useModulosAdmin'
import ListaModulos from '@/components/comunes/ListaModulos.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'

useHead({ title: 'Aportes y pagos | AAAB' })

// Solo las subsecciones que el usuario tiene permitidas (Valores, Recargos, Movimientos, Cierres, Estado de cuenta)
const { cargarPermisos, subseccionesDe } = useModulosAdmin()
const items = subseccionesDe('/panel-admin/tesoreria/aportes-pagos')

onMounted(() => cargarPermisos())
</script>

<style scoped>
</style>
