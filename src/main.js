import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import store from "./stores/auth"
// Imports de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
const app = createApp(App)
app.use(createPinia())
app.use(store)
app.use(router)
app.mount('#app')
// Exponer el store globalmente para depuración
window.$store = store; // Ahora puedes usar $store en la consola
