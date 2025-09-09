<script setup>
import { onMounted } from 'vue'
import { useSancionesStore } from '@/stores/sanciones'
// 1. Se importa la imagen para que Vite la procese correctamente
import designacionesImg from '@/assets/designaciones-mobile.png'

// Se inicializa la tienda de sanciones
const sancionesStore = useSancionesStore()

// 2. Se cargan los datos de las sanciones cuando el componente se monta
onMounted(() => {
  sancionesStore.fetchSanciones()
})
</script>

<template>
  <div>
    <section class="designaciones-hero text-white d-flex align-items-center justify-content-center">
      <div class="container text-center text-md-start position-relative">
        <div class="row align-items-center">
          <div class="col-md-5 mb-4 mb-md-0">
            <img
              :src="designacionesImg"
              alt="Últimas designaciones en móvil"
              class="img-fluid designaciones-hero-img shadow-lg rounded"
            />
          </div>
          <div class="col-md-7">
            <p class="text-uppercase fw-bold mb-2 opacity-75">ÚLTIMA ACTUALIZACIÓN</p>
            <h1 class="display-4 fw-bold mb-3">TORNEO CLAUSURA 2025</h1>
            <p class="lead mb-4">
              ¡Grandes noticias! Ya se encuentran disponibles las designaciones para los
              emocionantes partidos del fin de semana.
            </p>
            <p class="mb-4 fs-5">
              <strong>Fecha:</strong>
              <span class="badge bg-danger fs-6 py-2 px-3 ms-2">30 y 31 de Agosto</span>
            </p>
            <a href="#" class="btn btn-danger btn-lg text-uppercase fw-bold">
              <i class="bi bi-cloud-arrow-down-fill me-2"></i> Descargar Listado
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="container my-5 py-5">
      <div class="text-center mb-5">
        <h2 class="fw-bold">Sanciones Vigentes</h2>
        <p class="lead text-muted">
          Listado de árbitros que no se encuentran habilitados para dirigir en la fecha actual.
        </p>
      </div>
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div v-if="sancionesStore.loading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div
            v-else-if="sancionesStore.sancionesVigentes.length === 0"
            class="alert alert-success text-center"
          >
            No hay sanciones vigentes para esta fecha.
          </div>
          <div v-else class="table-responsive shadow rounded">
            <table class="table table-striped table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Árbitro</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Artículo</th>
                  <th scope="col">Sanción</th>
                  <th scope="col">Desde</th>
                  <th scope="col">Hasta</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sancion in sancionesStore.sancionesVigentes" :key="sancion.id">
                  <td>{{ sancion.arbitro }}</td>
                  <td>{{ sancion.motivo }}</td>
                  <td>{{ sancion.articulo }}</td>
                  <td>{{ sancion.sancion }}</td>
                  <td>{{ sancion.desde }}</td>
                  <td>{{ sancion.hasta }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-center mt-4">
            <RouterLink to="/sanciones" class="btn btn-outline-secondary">
              Ver historial de sanciones
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Código CSS limpio y sin caracteres invisibles */
.designaciones-hero {
  min-height: 90vh;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
    url('../assets/designaciones-hero.webp');
  background-position: center;
  background-size: cover;
  color: white;
  padding: 4rem 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.designaciones-hero-img {
  max-width: 300px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

/* Estilos para la tabla de sanciones */
.table {
  font-size: 1rem; /* Ajustado para mejor legibilidad */
}

.table thead th {
  padding: 1rem;
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
}
</style>
