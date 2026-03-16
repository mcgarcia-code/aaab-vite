<template>
  <div class="admin-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow">
      <span class="navbar-brand fw-bold">Gestión AAAB</span>
      <button @click="salir" class="btn btn-outline-danger btn-sm">Cerrar Sesión</button>
    </nav>
    
    <div class="container-fluid py-4">
      <RouterView /> 
    </div>
  </div>
</template>

<script setup>
import { auth } from '@/api/auth';
const salir = () => auth.logout();
</script>

<style scoped>
.admin-layout { 
  min-height: 100vh; 
  background-color: #f8f9fa; 
}

/* Opcional: un pequeño padding extra para que la tabla no toque los bordes pegados */
.container-fluid {
  padding-left: 20px;
  padding-right: 20px;
}
</style>