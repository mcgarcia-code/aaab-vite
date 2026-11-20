import { createApp } from 'vue'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
// Bootstrap a medida (solo los componentes que se usan, ver el archivo)
import './assets/scss/bootstrap.scss'
// JS de Bootstrap: solo los dos plugins que usa el sitio (data-bs-toggle="collapse" y "dropdown")
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap-icons/font/bootstrap-icons.css'
// Solo las animaciones de animate.css que usa el sitio (ver el archivo)
import './assets/css/animaciones.css'
// Utilidades propias que reemplazan estilos inline repetidos
import './assets/css/utilidades.css'

const app = createApp(App)
app.use(createHead())
app.use(router)
app.mount('#app')
