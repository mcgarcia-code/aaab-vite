<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-red-700">Listado de Sanciones</h2>
      <router-link 
        to="/panel-admin/tribunal/cargar-sancion" 
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
      >
        + Cargar Nueva
      </router-link>
    </div>
    
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <p class="p-4 text-gray-500 italic">Cargando historial de sanciones...</p>
      </div>
  </div>
</template>

<script setup>

import { useHead } from '@vueuse/head';
// Título y descripción específicos
useHead({
  title: 'Listado de Sanciones | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Sección de gestión de sanciones para los árbitros de la Asociación Argentina de Árbitros de Balonmano.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Listado de Sanciones | AAAB',
    },
    {
      property: 'og:description',
      content: 'Sección de gestión de sanciones para los árbitros de la Asociación Argentina de Árbitros de Balonmano.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})
</script>