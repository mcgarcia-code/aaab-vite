```vue
<template>
  <div class="arbitros-view">
    <h1>Área de Árbitros</h1>
    <p>Bienvenido, {{ userName }}!</p>

    <!-- Menú de navegación interna -->
    <nav class="sub-nav">
      <router-link to="/arbitros/lista" class="nav-link">Lista de Árbitros</router-link>
      <router-link to="/arbitros/estadisticas" class="nav-link">Estadísticas</router-link>
      <router-link to="/arbitros/perfil" class="nav-link">Perfil</router-link>
    </nav>

    <!-- Contenido dinámico de las subrutas -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

// Obtener el nombre del usuario desde Vuex
const store = useStore();
const userName = computed(() => store.state.user?.name || 'Usuario');
</script>

<style scoped>
.arbitros-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

.sub-nav {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.nav-link {
  padding: 10px 15px;
  text-decoration: none;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #007bff;
  color: white;
}

.router-link-active {
  background-color: #0056b3;
  color: white;
}
</style>
```