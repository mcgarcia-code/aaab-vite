<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import CredencialDigital from './CredencialDigital.vue'; // Importamos el componente

const mostrarCredencial = ref(false);
</script>

<template>
  <div class="row g-3 animate__animated animate__fadeIn">
    
    <div class="col-12 col-md-4">
      <RouterLink to="/panel-arbitro/datos" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-person-lines-fill text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Datos Personales</h5>
          <p class="small text-muted m-0">Ver legajo y cambiar contraseña.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-12 col-md-4">
      <RouterLink to="/panel-arbitro/disponibilidad" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-clock-history text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Disponibilidad</h5>
          <p class="small text-muted m-0">Solicitá la modificación de tus horarios.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-12 col-md-4">
      <RouterLink to="/panel-arbitro/licencia" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-calendar-check text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Solicitar Licencia</h5>
          <p class="small text-muted m-0">Inasistencias con 9 días de antelación.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-12 col-md-4" @click="mostrarCredencial = true">
      <div class="menu-card shadow">
        <i class="bi bi-person-badge text-danger"></i>
        <h5 class="mt-2 fw-bold text-dark">Credencial Digital</h5>
        <p class="small text-muted m-0">Visualizá y descargá tu carnet oficial 2026.</p>
      </div>
    </div>

    <div class="col-12 col-md-4">
      <RouterLink to="/panel-arbitro/sanciones" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-shield-exclamation text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Tribunal de Ética</h5>
          <p class="small text-muted m-0">Consultá si tenés sanciones vigentes.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-12 col-md-4">
      <RouterLink to="/panel-arbitro/rendimiento" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-graph-up-arrow text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Mi Rendimiento</h5>
          <p class="small text-muted m-0">Estadísticas, partidos y evaluaciones.</p>
        </div>
      </RouterLink>
    </div>

    <CredencialDigital :mostrar="mostrarCredencial" @cerrar="mostrarCredencial = false" />

  </div>
</template>

<style scoped>
.menu-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 25px 15px; /* Ajuste para que no sea tan alto con 3 columnas */
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 4px solid transparent;
}

.menu-card h5 {
  font-size: 1.1rem;
}

/* Iconos */
.menu-card i {
  transition: transform 0.3s ease;
  font-size: 2.2rem; 
}

@media (min-width: 768px) {
  .menu-card {
    padding: 35px 20px;
  }
  .menu-card h5 {
    font-size: 1.2rem; /* Un pelín más chico para que entre en una línea */
  }
  .menu-card i {
    font-size: 2.8rem; 
  }
}

.menu-card:hover {
  transform: translateY(-5px);
  background-color: #f8fafc;
  border-bottom: 4px solid #dc2626;
}

.menu-card:hover i {
  transform: scale(1.1);
}

.text-danger { color: #dc2626 !important; }

.row.g-3 {
  padding: 10px;
}
</style>