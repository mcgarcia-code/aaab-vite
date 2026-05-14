<template>
  <Teleport to="body">

    <!-- OVERLAY: Manejado con clases nativas de posicionamiento y flexbox -->
    <div
      v-if="visible"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 modal-overlay-custom animate__animated animate__fadeIn animate__faster"
      :style="{ zIndex: zIndex }"
      @click.self="cerrar"
    >
      <!-- CONTENEDOR MODAL: rounded-4 (16px) y max-width en línea para no ensuciar el CSS -->
      <div
        ref="modalRef"
        class="bg-white rounded-4 shadow-lg p-4 p-md-5 text-center animate__animated animate__zoomIn animate__faster w-100"
        style="max-width: 380px; outline: none;"
        tabindex="-1"
      >

        <!-- ÍCONO CIRCULAR: Usamos clases sutiles de Bootstrap según el tipo -->
        <div
          class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
          :class="tipo === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'"
          style="width: 70px; height: 70px;"
        >
          <span class="material-icons" style="font-size: 40px;">
            {{ tipo === 'danger' ? (tieneAccion ? 'delete_forever' : 'report_problem') : 'check' }}
          </span>
        </div>

        <h4 class="fw-bold text-dark mt-2 mb-2">{{ titulo }}</h4>
        <p class="text-muted small mb-4">{{ mensaje }}</p>

        <!-- BOTONES: Apilados en móviles (flex-column), en línea en tablets (flex-sm-row) -->
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <button
            v-if="tieneAccion"
            @click="cerrar"
            class="btn btn-light border rounded-pill px-4 fw-bold w-100 w-sm-auto"
          >
            CANCELAR
          </button>

          <button
            @click="handleAccion"
            class="btn rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto hover-elevate"
            :class="tipo === 'danger' ? 'btn-danger' : 'btn-dark'"
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
  tieneAccion: Boolean,
  zIndex: { type: [Number, String], default: 1060 }
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

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    cerrar();
  }
};


watch(() => props.visible, async (val) => {
  if (val) {

    let modalCount = parseInt(document.body.dataset.modalCount || '0') + 1;
    document.body.dataset.modalCount = modalCount;

    document.body.style.overflow = 'hidden';


    await nextTick();
    modalRef.value?.focus();
  } else {

    let modalCount = parseInt(document.body.dataset.modalCount || '0') - 1;
    if (modalCount < 0) modalCount = 0;
    document.body.dataset.modalCount = modalCount;

    if (modalCount === 0) {
      document.body.style.overflow = '';
    }
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);

  if (props.visible) {
    let modalCount = parseInt(document.body.dataset.modalCount || '0') - 1;
    if (modalCount < 0) modalCount = 0;
    document.body.dataset.modalCount = modalCount;

    if (modalCount === 0) {
      document.body.style.overflow = '';
    }
  }
});
</script>

<style scoped>
/*
  Mantenemos solo el fondo oscuro y el desenfoque porque
  Bootstrap no tiene un filtro "blur" nativo para fondos.
*/
.modal-overlay-custom {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
}

/* Efecto hover general para los botones principales */
.hover-elevate {
  transition: transform 0.2s ease;
}

.hover-elevate:hover {
  transform: translateY(-2px);
}

.animate__animated {
  animation-duration: 0.3s;
}

</style>
