<template>
  <Teleport to="body">
    
    <div 
      v-if="show" 
      class="modal-overlay-exito animate__animated animate__fadeIn"
      style="z-index: 1040;"
      @click.self="cerrar"
    >

      <div 
        ref="modalRef"
        class="modal-content-exito animate__animated animate__zoomIn p-0 mx-auto"
        :style="modalStyle"
        tabindex="-1"
      >
        
        <div class="flex-shrink-0 p-3 border-bottom bg-white position-relative">

<button 
  @click="cerrar" 
  class="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center p-0"
  style="width: 35px; height: 35px; border: 1px solid #e2e8f0;"
>
  <span class="material-icons" style="font-size: 20px;">close</span>
</button>

          <div class="text-center px-3">

            <div 
              v-if="icono" 
              class="icon-circle-mini mx-auto mb-2 d-flex align-items-center justify-content-center"
              :class="colorIcono"
              style="width: 40px; height: 40px;"
            >
              <span class="material-icons ">{{ icono }}</span>
            </div>

            <div class="fw-bold" style="font-size: 1.1rem;">
              <slot name="header">
                {{ titulo }}
              </slot>
            </div>

          </div>
        </div>

        <div class="flex-grow-1 p-3 p-md-4 bg-white" style="overflow-y: auto;">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="p-3 border-top bg-light d-flex justify-content-center gap-3">
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
  maxWidth: { type: String, default: '500px' }
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


// Observador unificado y corregido
watch(() => props.show, async (val) => {
  if (val) {
    // Solo bloqueamos el scroll
    document.body.style.overflow = 'hidden';
    
    // Enfocamos el modal
    await nextTick();
    modalRef.value?.focus();
  } else {
    // Restauramos el scroll
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keydown', handleTab);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keydown', handleTab);
  
  // Por seguridad, restauramos el scroll si el componente se destruye
  document.body.style.overflow = '';
});


//  MOBILE FIRST
const modalStyle = computed(() => ({
  width: '100%',
  maxWidth: props.maxWidth,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: window.innerWidth < 576 ? '16px' : '20px',
  background: '#ffffff',
  overflow: 'hidden'
}));
</script>

<style scoped>
.modal-overlay-exito {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center; 
  padding: 10px;

}

.modal-content-exito {
  outline: none;
}

.icon-circle-mini {
  background: #e0f2fe;
  color: #0284c7;
  border-radius: 50%;
}

</style>