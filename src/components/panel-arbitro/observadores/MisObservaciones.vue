<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-blue-700">Mis Observaciones Realizadas</h2>
        <p class="text-gray-500 text-sm">Historial de evaluaciones de desempeño arbitral.</p>
      </div>
      <router-link 
        to="/panel-arbitro/observaciones/carga" 
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition shadow-sm"
      >
        + Nueva Evaluación
      </router-link>
    </div>

    <div class="mb-4 flex gap-2">
      <input type="text" placeholder="Buscar por árbitro..." class="border p-2 rounded w-full md:w-64 text-sm" />
      <button class="bg-gray-100 px-4 py-2 rounded text-sm hover:bg-gray-200">Filtrar</button>
    </div>

    <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Árbitro</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-gray-400 italic">
              No has cargado observaciones recientemente.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head';

// Título y descripción específicos para la página de Tesorería AAAB
useHead({
  title: 'Mis Observaciones Realizadas| AAAB',
  meta: [
    {
      name: 'description',
      content: 'Verifica y gestiona las evaluaciones de desempeño arbitral que has realizado para los árbitros de la Asociación Argentina de Árbitros de Balonmano.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Mis Observaciones Realizadas | AAAB',
    },
    {
      property: 'og:description',
      content: 'Verifica y gestiona las evaluaciones de desempeño arbitral que has realizado para los árbitros de la Asociación Argentina de Árbitros de Balonmano.',
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