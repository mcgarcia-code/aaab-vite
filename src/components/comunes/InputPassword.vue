<template>
  <div>
    <div class="position-relative">
      <!-- Los atributos (id, class, placeholder, autocomplete, maxlength, required…) van al input -->
      <input v-bind="$attrs" v-model="modelo" :type="visible ? 'text' : 'password'" :disabled="disabled" class="input-con-ojo">
      <button type="button" class="btn-ver-password" :disabled="disabled"
              :title="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :aria-pressed="visible" :aria-controls="$attrs.id"
              @click="visible = !visible">
        <i class="bi" :class="visible ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
      </button>
    </div>
    <!-- El mensaje va acá porque el input queda envuelto y Bootstrap solo muestra el .invalid-feedback que está al lado -->
    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Campo de contraseña con el ojo para mostrar u ocultar lo escrito (login, recuperar clave, registro…).
// Uso: <InputPassword v-model="password" id="..." class="form-control" :class="{ 'is-invalid': ... }" :error="mensaje" />
defineOptions({ inheritAttrs: false })

const modelo = defineModel({ type: String, default: '' })
defineProps({
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }   // mensaje de error debajo del campo (junto con la clase is-invalid)
})

const visible = ref(false)
</script>

<style scoped>
/* El campo deja lugar a la derecha para el ojo */
.input-con-ojo {
  padding-right: 3rem;
}
/* Con error, Bootstrap dibuja un ícono rojo a la derecha: se corre a la izquierda del ojo */
.input-con-ojo.is-invalid {
  padding-right: 4.75rem;
  background-position: right 2.9rem center;
}

.btn-ver-password {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--o-texto-medio, #64748b);
  font-size: 1.1rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.btn-ver-password:hover:not(:disabled),
.btn-ver-password:focus-visible {
  color: #dc2626;
  background-color: var(--o-rojo-fondo, #fff5f5);
  outline: none;
}
</style>
