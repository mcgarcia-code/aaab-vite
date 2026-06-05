<template>
  <div class="container py-5">
    <div class="card shadow border-0 text-center mx-auto" style="max-width: 700px;">
      <div class="card-body p-5">

        <i class="bi bi-tools display-1 text-warning"></i>

        <h2 class="fw-bold mt-4 mb-3">
          Sección en Construcción
        </h2>

        <p class="text-muted fs-5">
          Estamos trabajando para habilitar esta funcionalidad lo antes posible.
        </p>

        <p class="text-muted">
          Próximamente podrás acceder a todas las herramientas y opciones disponibles desde esta sección.
        </p>

        <div class="mt-4">
          <RouterLink
            to="/panel-arbitro"
            class="btn btn-danger"
          >
            <i class="bi bi-arrow-left me-2"></i>
            Volver al Panel
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
