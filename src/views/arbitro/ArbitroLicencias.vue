```vue
<template>
  <div class="arbitros-licencias">
    <h2>Licencias</h2>
    <h3>Licencias Activas</h3>
    <table v-if="licencias.length" class="licencias-table">
      <thead>
        <tr>
          <th>Fecha Inicio</th>
          <th>Fecha Fin</th>
          <th>Motivo</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="licencia in licencias" :key="licencia.id">
          <td>{{ formatDate(licencia.fecha_inicio) }}</td>
          <td>{{ formatDate(licencia.fecha_fin) }}</td>
          <td>{{ licencia.motivo || 'N/A' }}</td>
          <td>{{ licencia.estado }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay licencias activas.</p>

    <h3>Solicitar Nueva Licencia</h3>
    <form @submit.prevent="requestLicencia" class="licencia-form">
      <div class="form-group">
        <label for="fecha_inicio">Fecha Inicio</label>
        <input id="fecha_inicio" v-model="form.fecha_inicio" type="date" required />
      </div>
      <div class="form-group">
        <label for="fecha_fin">Fecha Fin</label>
        <input id="fecha_fin" v-model="form.fecha_fin" type="date" required />
      </div>
      <div class="form-group">
        <label for="motivo">Motivo</label>
        <textarea id="motivo" v-model="form.motivo" rows="4"></textarea>
      </div>
      <button type="submit" class="submit-button">Solicitar Licencia</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Licencia solicitada correctamente</p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../api';

const licencias = ref([]);
const form = ref({
  fecha_inicio: '',
  fecha_fin: '',
  motivo: '',
});
const error = ref('');
const success = ref(false);

onMounted(async () => {
  try {
    const data = await api.get('entity=arbitros&action=licencias');
    licencias.value = data.data;
  } catch (err) {
    error.value = err.message;
  }
});

const requestLicencia = async () => {
  try {
    await api.post('entity=arbitros&action=licencias', form.value);
    success.value = true;
    error.value = '';
    form.value = { fecha_inicio: '', fecha_fin: '', motivo: '' };
    const data = await api.get('entity=arbitros&action=licencias');
    licencias.value = data.data;
    setTimeout(() => (success.value = false), 3000);
  } catch (err) {
    error.value = err.message;
    success.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>

<style scoped>
.arbitros-licencias {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2, h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.licencias-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.licencia-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>