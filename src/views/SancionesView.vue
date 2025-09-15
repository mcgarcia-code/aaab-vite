<script setup>
import { ref, onMounted } from 'vue'
import { api } from "@/api/api"
import store from "@/stores/auth"
// --- STATE ---
const nuevaSancion = ref({
  arbitro: '',
  motivo: '',
  articulo: '',
  sancion: '',
  desde: '',
  hasta: '',
})
const sanciones = ref(null)
const arbitros = ref(null)
const isAdmin = ref(false)

// --- LIFECYCLE ---
onMounted(() => {
  fetchSanciones()
  fetchArbitros()
  isAdmin.value = store.user ? true : false
})
async function fetchSanciones(){
  let s = "?entity=sanciones&action=listar"
  let data = await api.get(s)
  sanciones.value = data.sanciones
}
async function fetchArbitros(){
  let s = "?entity=arbitros&action=listar"
  let data = await api.get(s)
  arbitros.value = data.arbitros
}
// --- ACTIONS ---
function guardarSancion() {
  if (!nuevaSancion.value.arbitro) return
  let d = {
    entity:'sanciones',
    action:'agregar',
    data: nuevaSancion.value
  }
  api.post("/", d);
  nuevaSancion.value = {
    arbitro: '',
    motivo: '',
    articulo: '',
    sancion: '',
    desde: '',
    hasta: '',
  }
}
</script>

<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div v-if="isAdmin" class="card shadow-sm mb-5 admin-card">
        <div class="card-body p-4">
          <h3 class="card-title mb-3 text-dark">Agregar Nueva Sanción</h3>
          <div class="row g-3">
            <div class="col-md-6">
              <select
                class="form-control"
                v-model="nuevaSancion.arbitro"
              >
                <option selected disabled>Seleccione un arbitro...</option>
                <option
                  v-for="arbitro in arbitros"
                  v-bind:key="arbitro.id"
                  :value="arbitro.id"
                >
                  {{ arbitro.apellido }}, {{ arbitro.nombre }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Motivo"
                v-model="nuevaSancion.motivo"
              />
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Artículo"
                v-model="nuevaSancion.articulo"
              />
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Sanción (ej: 3 fechas)"
                v-model="nuevaSancion.sancion"
              />
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Desde (dd/mm/yyyy)"
                v-model="nuevaSancion.desde"
              />
            </div>
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Hasta (dd/mm/yyyy o Indefinido)"
                v-model="nuevaSancion.hasta"
              />
            </div>
          </div>
          <button @click="guardarSancion" class="btn btn-danger mt-3">Guardar Sanción</button>
        </div>
      </div>

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Listado Oficial de Sanciones</h1>
        <p class="lead text-white-50">Este listado muestra el historial completo de sanciones.</p>
      </div>
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <!-- <div v-if="sancionesStore.loading" class="text-center text-white">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div> -->
          <div class="table-responsive shadow rounded">
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
                <tr v-for="sancion in sanciones" :key="sancion.id">
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Código CSS limpio y sin caracteres invisibles */
.dark-background-section {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('../assets/sanciones-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}
.admin-card {
  background-color: #f8f9fa;
}
</style>
