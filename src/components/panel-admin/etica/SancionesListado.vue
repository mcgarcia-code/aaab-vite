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
// Aquí luego haremos el fetch a la base de datos de la AAAB
</script>