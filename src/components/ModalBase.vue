<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 1040;">
      
      <div 
        class="modal-content-exito animate__animated animate__zoomIn p-0 mx-auto" 
        :style="{ maxWidth: maxWidth, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '20px', background: '#ffffff', overflow: 'hidden' }"
      >
        
        <!-- HEADER -->
        <div class="flex-shrink-0 p-3 p-md-4 border-bottom bg-white" style="position: relative; z-index: 10;">
          
          <div class="position-relative text-center w-100">

            <!-- BOTÓN CERRAR -->
            <button 
              @click="$emit('close')" 
              class="btn btn-light rounded-circle d-flex align-items-center justify-content-center position-absolute top-50 end-0 translate-middle-y"
              style="width: 35px; height: 35px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 0;"
            >
              <span class="material-icons" style="font-size: 18px; color: #000;">close</span>
            </button>

            <!-- CONTENIDO CENTRADO -->
            <div class="d-flex flex-column align-items-center justify-content-center">

              <!-- ICONO -->
              <div 
                v-if="icono" 
                class="icon-circle-mini d-flex align-items-center justify-content-center rounded-circle mb-2"
                :class="colorIcono"
                style="width: 40px; height: 40px;"
              >
                <span class="material-icons" style="font-size: 20px;">
                  {{ icono }}
                </span>
              </div>

              <!-- TITULO / SLOT -->
              <div class="fw-bold" style="color: #0f172a; font-size: 1.15rem;">
                <slot name="header">
                  {{ titulo }}
                </slot>
              </div>

            </div>

          </div>

        </div>

        <!-- BODY -->
        <div class="flex-grow-1 p-4 bg-white" style="overflow-y: auto;">
          <slot></slot>
        </div>

        <!-- FOOTER -->
        <div v-if="$slots.footer" class="p-3 border-top bg-light d-flex justify-content-center gap-3">
          <slot name="footer"></slot>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Props que recibe el componente para configurarse
defineProps({
  show: { type: Boolean, required: true },
  titulo: { type: String, default: 'Modal' },
  icono: { type: String, default: null }, // ej: 'edit', 'manage_search'
  colorIcono: { type: String, default: 'bg-info text-white' }, // clases de bootstrap
  maxWidth: { type: String, default: '500px' }
});

// Eventos que emite hacia el componente padre
defineEmits(['close']);
</script>

<style scoped>
.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;}
.icon-circle-mini { background: #e0f2fe; color: #0284c7; }
</style>