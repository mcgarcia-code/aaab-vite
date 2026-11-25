import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'

import App from '@/App.vue'
import router from '@/router'
// Bootstrap a medida (solo los componentes que se usan, ver el archivo)
import '@/assets/scss/bootstrap.scss'
// Colores por tema (claro / oscuro) como variables CSS
import '@/assets/css/tema.css'
import { iniciarTema } from '@/composables/useTema'
// JS de Bootstrap: solo los dos plugins que usa el sitio (data-bs-toggle="collapse" y "dropdown")
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap-icons/font/bootstrap-icons.css'
// Solo las animaciones de animate.css que usa el sitio (ver el archivo)
import '@/assets/css/animaciones.css'
// Utilidades propias que reemplazan estilos inline repetidos
import '@/assets/css/utilidades.css'
// Píldoras de estado (aprobado, pendiente, rechazado, anulado...) compartidas por todas las secciones
import '@/assets/css/estados.css'

// Aplica el tema guardado antes de montar, para que no parpadee
iniciarTema()

const app = createApp(App)
app.use(createHead())
app.use(router)
app.mount('#app')
