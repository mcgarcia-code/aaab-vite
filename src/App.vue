<template>
  <AppHeader />
  <main>
    <RouterView />
  </main>
  <AppFooter />

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
  tieneAccion: false, // Indica si debe mostrar botones de Confirmar/Cancelar
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
/* Estilos Globales */
body {
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  background-color: #f8f9fa;
  overflow-x: hidden;
}

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

