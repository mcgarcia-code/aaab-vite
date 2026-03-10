<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="row g-3 animate__animated animate__fadeIn">
    
    <div class="col-md-6">
      <RouterLink to="/panel-arbitro/licencia" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-calendar-check fs-1 text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Solicitar Licencia</h5>
          <p class="small text-muted m-0">Inasistencias con 9 días de antelación.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-md-6">
      <RouterLink to="/panel-arbitro/disponibilidad" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-clock-history fs-1 text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Disponibilidad</h5>
          <p class="small text-muted m-0">Solicitar modificación de horarios.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-md-6">
      <RouterLink to="/panel-arbitro/datos" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-person-lines-fill fs-1 text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Datos Personales</h5>
          <p class="small text-muted m-0">Ver legajo y cambiar contraseña.</p>
        </div>
      </RouterLink>
    </div>

    <div class="col-md-6">
      <RouterLink to="/panel-arbitro/sanciones" class="text-decoration-none">
        <div class="menu-card shadow">
          <i class="bi bi-shield-exclamation fs-1 text-danger"></i>
          <h5 class="mt-2 fw-bold text-dark">Tribunal de Ética</h5>
          <p class="small text-muted m-0">Consulta de sanciones vigentes.</p>
        </div>
      </RouterLink>
    </div>

  </div>
</template>

<style scoped>
.menu-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 35px 20px;
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

.menu-card:hover {
  transform: translateY(-5px);
  background-color: #f8fafc;
  border-bottom: 4px solid #dc2626;
}

.menu-card i {
  transition: transform 0.3s ease;
}

.menu-card:hover i {
  transform: scale(1.1);
}

.text-danger { color: #dc2626 !important; }
</style>