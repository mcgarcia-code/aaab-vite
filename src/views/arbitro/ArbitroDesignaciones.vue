```vue
<template>
  <div class="arbitros-designaciones">
    <h2>Designaciones de Partidos</h2>
    <table v-if="designaciones.length" class="designaciones-table">
      <thead>
        <tr>
          <th>Cancha</th>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Categoría</th>
          <th>Equipo Local</th>
          <th>Equipo Visitante</th>
          <th>Pareja Arbitral</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="designacion in designaciones" :key="designacion.id">
          <td>{{ designacion.cancha }}</td>
          <td>{{ formatDate(designacion.fecha) }}</td>
          <td>{{ designacion.hora }}</td>
          <td>{{ designacion.categoria }}</td>
          <td>{{ designacion.equipo_local }}</td>
          <td>{{ designacion.equipo_visitante }}</td>
          <td>{{ designacion.pareja_arbitral || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay designaciones disponibles.</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../api/api';

const designaciones = ref([]);
const error = ref('');

onMounted(async () => {
  try {
    let s = {
      entity:"arbitros",
      action:"designaciones",
    }
    const data = await api.get(s);
    designaciones.value = data.data;
  } catch (err) {
    error.value = err.message;
  }
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<style scoped>
.arbitros-designaciones {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
}

.designaciones-table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.error {
  color: red;
}
</style>