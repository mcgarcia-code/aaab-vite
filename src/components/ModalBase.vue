<template>
  <Teleport to="body">
    
    <div 
      v-if="show" 
      class="modal-overlay-exito animate__animated animate__fadeIn"
      style="z-index: 1040;"
      @click.self="cerrar"   <!-- CLICK FUERA -->
    >

      <div 
        class="modal-content-exito animate__animated animate__zoomIn p-0 mx-auto"
        :style="modalStyle"
      >
        
        <!-- HEADER -->
        <div class="flex-shrink-0 p-3 border-bottom bg-white position-relative">

          <!-- BOTÓN CERRAR -->
          <button 
            @click="cerrar" 
            class="btn btn-light rounded-circle d-flex align-items-center justify-content-center position-absolute top-0 end-0 m-2"
            style="width: 35px; height: 35px; border: 1px solid #e2e8f0;"
          >
            <span class="material-icons" style="font-size: 18px;">close</span>
          </button>

          <div class="text-center px-3">

            <!-- ICONO -->
            <div 
              v-if="icono" 
              class="icon-circle-mini d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
              :class="colorIcono"
              style="width: 40px; height: 40px;"
            >
              <span class="material-icons" style="font-size: 20px;">
                {{ icono }}
              </span>
            </div>

            <!-- HEADER SLOT -->
            <div class="fw-bold" style="font-size: 1.1rem;">
              <slot name="header">
                {{ titulo }}
              </slot>
            </div>

          </div>
        </div>

        <!-- BODY -->
        <div class="flex-grow-1 p-3 p-md-4 bg-white" style="overflow-y: auto;">
          <slot></slot>
        </div>

        <!-- FOOTER -->
        <div v-if="$slots.footer" class="p-3 border-top bg-light">
          <slot name="footer"></slot>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  titulo: { type: String, default: 'Modal' },
  icono: { type: String, default: null },
  colorIcono: { type: String, default: 'bg-info text-white' },
  maxWidth: { type: String, default: '500px' }
});

const emit = defineEmits(['close']);

const cerrar = () => emit('close');


// 🔥 CERRAR CON ESC
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    cerrar();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});


// 🎯 MOBILE FIRST REAL
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center; /* 👈 MOBILE FIRST */
  justify-content: center;
  padding: 10px;
}

/* 💡 Desktop cambia a centrado */
@media (min-width: 576px) {
  .modal-overlay-exito {
    align-items: center;
  }
}

.icon-circle-mini {
  background: #e0f2fe;
  color: #0284c7;
}
</style>