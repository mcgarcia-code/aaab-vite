<template>
  <div class="arbitros-perfil">
    <h2>Perfil del Árbitro</h2>
    <form @submit.prevent="saveProfile" class="profile-form">
      <div class="form-group">
        <label for="apellido">Apellido</label>
        <input id="apellido" v-model="form.apellido" type="text" required />
      </div>
      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="form.nombre" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div class="form-group">
        <label for="telefono">Teléfono Celular</label>
        <input id="telefono" v-model="form.telefono" type="text" />
      </div>
      <div class="form-group">
        <label for="dni">DNI</label>
        <input id="dni" v-model="form.dni" type="text" />
      </div>
      <div class="form-group">
        <label for="fecha_nacimiento">Fecha de Nacimiento</label>
        <input id="fecha_nacimiento" v-model="form.fecha_nacimiento" type="date" />
      </div>
      <div class="form-group">
        <label for="direccion">Dirección</label>
        <input id="direccion" v-model="form.direccion" type="text" />
      </div>
      <div class="form-group">
        <label for="localidad">Localidad</label>
        <input id="localidad" v-model="form.localidad" type="text" />
      </div>
      <div class="form-group">
        <label>Disponibilidad Sábado</label>
        <div class="disponibilidad">
          <input v-model="form.disponibilidad_sabado_desde" type="time" />
          <span>a</span>
          <input v-model="form.disponibilidad_sabado_hasta" type="time" />
          <label><input v-model="form.sabado_fulltime" type="checkbox" /> Full Time</label>
          <label><input v-model="form.sabado_no_arbitra" type="checkbox" /> No Arbitra</label>
        </div>
      </div>
      <div class="form-group">
        <label>Disponibilidad Domingo</label>
        <div class="disponibilidad">
          <input v-model="form.disponibilidad_domingo_desde" type="time" />
          <span>a</span>
          <input v-model="form.disponibilidad_domingo_hasta" type="time" />
          <label><input v-model="form.domingo_fulltime" type="checkbox" /> Full Time</label>
          <label><input v-model="form.domingo_no_arbitra" type="checkbox" /> No Arbitra</label>
        </div>
      </div>
      <div class="form-group">
        <label for="observaciones">Observaciones</label>
        <textarea id="observaciones" v-model="form.observaciones" rows="4"></textarea>
      </div>
      <button type="submit" class="save-button">Guardar Cambios</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Perfil actualizado correctamente</p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../api/api';

const form = ref({
  apellido: '',
  nombre: '',
  email: '',
  telefono: '',
  dni: '',
  fecha_nacimiento: '',
  direccion: '',
  localidad: '',
  disponibilidad_sabado_desde: '',
  disponibilidad_sabado_hasta: '',
  sabado_fulltime: false,
  sabado_no_arbitra: false,
  disponibilidad_domingo_desde: '',
  disponibilidad_domingo_hasta: '',
  domingo_fulltime: false,
  domingo_no_arbitra: false,
  observaciones: '',
});
const error = ref('');
const success = ref(false);

onMounted(async () => {
  try {
    const data = await api.get('?entity=arbitros&action=info');
    Object.assign(form.value, data.data);
  } catch (err) {
    error.value = err.message;
  }
});

const saveProfile = async () => {
  try {
    await api.post('?entity=arbitros&action=info', form.value);
    success.value = true;
    error.value = '';
    setTimeout(() => (success.value = false), 3000);
  } catch (err) {
    error.value = err.message;
    success.value = false;
  }
};
</script>

<style scoped>
.arbitros-perfil {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
}

.profile-form {
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

.disponibilidad {
  display: flex;
  gap: 10px;
  align-items: center;
}

.disponibilidad label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.save-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>