<template>
  <!-- Wrapper global para garantizar que el footer siempre quede abajo (Sticky Footer nativo) -->
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />

    <!-- flex-grow-1 hace que el main ocupe todo el espacio sobrante empujando el footer -->
    <main class="flex-grow-1">
      <RouterView />
    </main>

    <AppFooter />
  </div>

  <ModalExito
    :visible="modalConfig.visible"
    :titulo="modalConfig.titulo"
    :mensaje="modalConfig.mensaje"
    :tipo="modalConfig.tipo"
    :tieneAccion="modalConfig.tieneAccion"
    @cerrar="cerrarModal"
    @confirmar="ejecutarAccion"
  />
</template>

<script setup>
import { reactive, provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import ModalExito from './components/ModalExito.vue'

const modalConfig = reactive({
  visible: false,
  titulo: '',
  mensaje: '',
  tipo: 'success',
  tieneAccion: false,
  accionConfirmar: null
})

const abrirModal = ({ titulo, mensaje, tipo = 'success', alConfirmar = null }) => {
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
</script>

<style>
/* Estilos Globales para toda la aplicación */
body {
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  background-color: #f8f9fa; /* Equivale al bg-light de Bootstrap */
  overflow-x: hidden;
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
