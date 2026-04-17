<template>
  <Teleport to="body">

    <div 
      v-if="visible" 
      class="modal-overlay-exito animate__animated animate__fadeIn"
      @click.self="cerrar"
    >
      <div 
        ref="modalRef"
        class="modal-content-exito animate__animated animate__zoomIn"
        tabindex="-1"
      >
        
        <div :class="['icon-circle-exito', tipo === 'danger' ? 'bg-danger-light' : 'bg-success-light']">
          <span class="material-icons">
            {{ tipo === 'danger' ? (tieneAccion ? 'delete_forever' : 'report_problem') : 'check' }}
          </span>
        </div>

        <h4 class="fw-bold mt-3">{{ titulo }}</h4>
        <p class="text-muted small mb-4">{{ mensaje }}</p>

        <div class="d-flex gap-2 justify-content-center">
          <button 
            v-if="tieneAccion" 
            @click="cerrar" 
            class="btn btn-light rounded-pill px-4 fw-bold"
          >
            CANCELAR
          </button>
          
          <button 
            @click="handleAccion" 
            :class="['btn rounded-pill px-4 fw-bold shadow-sm', tipo === 'danger' ? 'btn-danger' : 'btn-dark']"
          >
            {{ tieneAccion ? (tipo === 'danger' ? 'ELIMINAR' : 'CONFIRMAR') : 'ACEPTAR' }}
          </button>
        </div>

      </div>
    </div>

  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, nextTick } from 'vue';

const props = defineProps({
  visible: Boolean,
  titulo: String,
  mensaje: String,
  tipo: String,
  tieneAccion: Boolean
});

const emit = defineEmits(['cerrar', 'confirmar']);

const modalRef = ref(null);

const cerrar = () => emit('cerrar');

const handleAccion = () => {
  if (props.tieneAccion) {
    emit('confirmar');
  } else {
    cerrar();
  }
};

// ESC para cerrar
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    cerrar();
  }
};

// Observar cuando se abre o cierra el modal para bloquear/desbloquear el scroll
watch(() => props.visible, async (val) => {
  if (val) {
    // Bloquea el scroll del fondo
    document.body.style.overflow = 'hidden'; 
    
    // Enfoca el modal para accesibilidad y eventos de teclado
    await nextTick();
    modalRef.value?.focus();
  } else {
    // Restaura el scroll del fondo al cerrar
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  // Por seguridad, aseguramos que el scroll regrese a la normalidad si el componente se destruye
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-overlay-exito {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 10px;
}

.modal-content-exito {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  outline: none;
}

.icon-circle-exito {
  width: 70px;
  height: 70px;
  background: #dcfce7;
  color: #166534;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle-exito .material-icons {
  font-size: 40px;
}

h4 {
  color: #1e293b;
}

.bg-success-light { background: #dcfce7; color: #166534; }
.bg-danger-light { background: #fee2e2; color: #991b1b; }

.btn-danger { background-color: #dc3545; border: none; }
.btn-danger:hover { background-color: #bb2d3b; transform: translateY(-2px); }

.btn-dark:hover {
  transform: translateY(-2px);
}
</style>