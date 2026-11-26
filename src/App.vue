<template>
  <!-- Wrapper global para garantizar que el footer siempre quede abajo (Sticky Footer nativo) -->
  <div class="d-flex flex-column min-vh-100">
    <!-- En la app instalada no van el menú ni el footer del sitio web: se navega con los paneles -->
    <AppHeader v-if="!esApp" />

    <!-- flex-grow-1 hace que el main ocupe todo el espacio sobrante empujando el footer -->
    <main class="flex-grow-1">
      <RouterView />
    </main>

    <AppFooter v-if="!esApp" />
  </div>

  <ModalExito
    :visible="modalConfig.visible"
    :titulo="modalConfig.titulo"
    :mensaje="modalConfig.mensaje"
    :tipo="modalConfig.tipo"
    :tieneAccion="modalConfig.tieneAccion"
    :texto-confirmar="modalConfig.textoConfirmar"
    :texto-cancelar="modalConfig.textoCancelar"
    @cerrar="cerrarModal"
    @confirmar="ejecutarAccion"
  />

  <ToastNotificacion ref="toastRef" />

  <!-- App instalable: versión nueva, sin conexión, instalar -->
  <AvisosApp />
</template>

<script setup>
import { reactive, provide, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ModalExito from '@/components/ModalExito.vue'
import ToastNotificacion from '@/components/ToastNotificacion.vue'
import AvisosApp from '@/components/comunes/AvisosApp.vue'
import { esAppInstalada } from '@/utils/app'

const esApp = esAppInstalada()

const modalConfig = reactive({
  visible: false,
  titulo: '',
  mensaje: '',
  tipo: 'success',
  tieneAccion: false,
  accionConfirmar: null,
  textoConfirmar: '',
  textoCancelar: ''
})

const abrirModal = ({ titulo, mensaje, tipo = 'success', alConfirmar = null, textoConfirmar = '', textoCancelar = '' }) => {
  modalConfig.textoConfirmar = textoConfirmar
  modalConfig.textoCancelar = textoCancelar
  modalConfig.titulo = titulo || (tipo === 'success' ? '¡Cambios Guardados!' : '¿Estás seguro?')
  modalConfig.mensaje = mensaje || (tipo === 'success' ? 'La información se actualizó correctamente.' : 'Esta acción no se puede deshacer.')
  modalConfig.tipo = tipo
  modalConfig.accionConfirmar = alConfirmar
  // Convertimos a booleano: si hay función, tieneAccion es true
  modalConfig.tieneAccion = !!alConfirmar
  modalConfig.visible = true
}

const cerrarModal = () => {
  modalConfig.visible = false
  modalConfig.accionConfirmar = null
  modalConfig.tieneAccion = false
}

const ejecutarAccion = () => {
  if (modalConfig.accionConfirmar) {
    modalConfig.accionConfirmar()
  }
  cerrarModal()
}

provide('notificar', abrirModal)

// Toast: avisos breves de éxito/error/atención que se autocierran.
// A diferencia de notificar (modal), no interrumpe ni pide confirmación.
const toastRef = ref(null)
const toast = ({ titulo = '', mensaje = '', tipo = 'success', duracion = 4000 } = {}) => {
  toastRef.value?.mostrar({ titulo, mensaje, tipo, duracion })
}

provide('toast', toast)
</script>

<style>
/* Estilos Globales para toda la aplicación */
body {
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  background-color: #f8f9fa; /* Equivale al bg-light de Bootstrap */
  overflow-x: hidden;
}

/* App instalada: la pantalla queda fija como una app (sin rebote ni arrastre lateral de toda la página) */
@media (display-mode: standalone) {
  html,
  body {
    overscroll-behavior: none;
    overflow-x: clip;
  }
}

/* Animaciones globales de scroll reveal */
.fade-in-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
