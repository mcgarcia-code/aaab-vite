<template>
  <Teleport to="body">

    <!-- OVERLAY: Usamos clases nativas para posición y centrado -->
    <div
      v-if="show"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3 modal-overlay-custom animate__animated animate__fadeIn animate__faster"
      :style="{ zIndex: zIndex }"
      @click.self="cerrar"
    >

      <!-- CONTENEDOR MODAL: rounded-4 (16px) y max-height para que no desborde la pantalla -->
      <div
        ref="modalRef"
        class="bg-white rounded-4 shadow-lg d-flex flex-column overflow-hidden animate__animated animate__zoomIn animate__faster mx-auto w-100"
        :style="[modalStyle, { maxHeight: '90vh' }]"
        tabindex="-1"
      >

        <!-- HEADER -->
        <div class="flex-shrink-0 p-3 border-bottom bg-white position-relative">

          <button
            @click="cerrar"
            class="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center p-0 border shadow-sm"
            style="width: 35px; height: 35px;"
          >
            <span class="material-icons" style="font-size: 20px;">close</span>
          </button>

          <div class="text-center px-4">
            <!-- Ícono -->
            <div
              v-if="icono"
              class="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
              :class="colorIcono || 'bg-info-subtle text-primary'"
              style="width: 45px; height: 45px;"
            >
              <span class="material-icons">{{ icono }}</span>
            </div>

            <!-- Título -->
            <div class="fw-bold fs-5 text-dark">
              <slot name="header">
                {{ titulo }}
              </slot>
            </div>
          </div>
        </div>

        <!-- BODY: overflow-auto genera el scroll interno si el contenido es muy largo -->
        <div class="flex-grow-1 p-3 p-md-4 bg-white overflow-auto">
          <slot></slot>
        </div>

        <!-- FOOTER: flex-column en móvil, flex-sm-row desde tablet -->
        <div v-if="$slots.footer" class="flex-shrink-0 p-3 border-top bg-light d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3">
          <slot name="footer"></slot>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  titulo: String,
  icono: String,
  colorIcono: { type: String, default: 'bg-info text-white' },
  maxWidth: { type: String, default: '500px' },
  zIndex: { type: [Number, String], default: 1040 }
});

const emit = defineEmits(['close']);

const modalRef = ref(null);

const cerrar = () => emit('close');


// ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) cerrar();
};

// FOCUS TRAP
const handleTab = (e) => {
  if (!props.show || e.key !== 'Tab') return;

  const focusables = modalRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (!focusables || focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};


// Observador unificado con contador de modales abiertos
watch(() => props.show, async (val) => {
  if (val) {
    // Sumamos 1 al contador de modales
    let modalCount = parseInt(document.body.dataset.modalCount || '0') + 1;
    document.body.dataset.modalCount = modalCount;

    // Bloqueamos el scroll
    document.body.style.overflow = 'hidden';

    // Enfocamos el modal
    await nextTick();
    modalRef.value?.focus();
  } else {
    // Restamos 1 al contador
    let modalCount = parseInt(document.body.dataset.modalCount || '0') - 1;
    if (modalCount < 0) modalCount = 0;
    document.body.dataset.modalCount = modalCount;

    // SOLO restauramos el scroll si ya no queda NINGÚN modal abierto
    if (modalCount === 0) {
      document.body.style.overflow = '';
    }
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keydown', handleTab);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keydown', handleTab);

  // Por seguridad, si el componente se destruye mientras estaba abierto, limpiamos su cuenta
  if (props.show) {
    let modalCount = parseInt(document.body.dataset.modalCount || '0') - 1;
    if (modalCount < 0) modalCount = 0;
    document.body.dataset.modalCount = modalCount;

    if (modalCount === 0) {
      document.body.style.overflow = '';
    }
  }
});


// Estilos computados
const modalStyle = computed(() => ({
  width: '100%',
  maxWidth: props.maxWidth,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#ffffff',
  overflow: 'hidden'
}));
</script>

<style scoped>

.modal-overlay-custom {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
}

.animate__animated {
  animation-duration: 0.3s;
}

</style>
