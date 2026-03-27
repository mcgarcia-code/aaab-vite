<template>
  <div v-if="visible" class="modal-overlay-exito animate__animated animate__fadeIn">
    <div class="modal-content-exito animate__animated animate__zoomIn">
      
      <div :class="['icon-circle-exito', tipo === 'danger' ? 'bg-danger-light' : 'bg-success-light']">
        <span class="material-icons">{{ tipo === 'danger' ? (tieneAccion ? 'delete_forever' : 'report_problem') : 'check' }}</span>
      </div>

      <h4 class="fw-bold mt-3">{{ titulo }}</h4>
      <p class="text-muted small mb-4">{{ mensaje }}</p>

      <div class="d-flex gap-2 justify-content-center">
        <button v-if="tieneAccion" @click="$emit('cerrar')" class="btn btn-light rounded-pill px-4 fw-bold">
          CANCELAR
        </button>
        
        <button @click="handleAccion" :class="['btn rounded-pill px-4 fw-bold shadow-sm', tipo === 'danger' ? 'btn-danger' : 'btn-dark']">
          {{ tieneAccion ? (tipo === 'danger' ? 'ELIMINAR' : 'CONFIRMAR') : 'ACEPTAR' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  titulo: String,
  mensaje: String,
  tipo: String,
  tieneAccion: Boolean // Nueva Prop clave
});

const emit = defineEmits(['cerrar', 'confirmar']);

const handleAccion = () => {
  if (props.tieneAccion) {
    emit('confirmar');
  } else {
    emit('cerrar');
  }
};
</script>

<style scoped>
.modal-overlay-exito {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7); /* Color oscuro profundo */
  backdrop-filter: blur(8px); /* Desenfoque elegante */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content-exito {
  background: white;
  border-radius: 30px;
  padding: 40px;
  width: 90%;
  max-width: 380px;
  text-align: center;
  border: none;
}

.icon-circle-exito {
  width: 80px;
  height: 80px;
  background: #dcfce7; /* Verde clarito */
  color: #166534; /* Verde oscuro */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(22, 101, 52, 0.2);
}

.icon-circle-exito .material-icons {
  font-size: 45px;
}

h4 {
  color: #1e293b;
  letter-spacing: -0.5px;
}

/* Animación extra para el botón */
.btn-dark:hover {
  transform: translateY(-2px);
  background-color: #000;
  transition: all 0.2s;
}

.bg-success-light { background: #dcfce7; color: #166534; }
.bg-danger-light { background: #fee2e2; color: #991b1b; }

.btn-danger { background-color: #dc3545; border: none; }
.btn-danger:hover { background-color: #bb2d3b; transform: translateY(-2px); }
</style>