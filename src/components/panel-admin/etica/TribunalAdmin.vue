<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- Manejo de margen inferior responsivo con mb-4 y mb-md-5 -->
    <div class="dashboard-header mb-4 mb-md-5 mt-4 text-start">
      <div class="d-flex align-items-center justify-content-start gap-3">
        <div class="main-icon-container flex-shrink-0">
          <i class="bi bi-shield-exclamation text-danger"></i>
        </div>
        <div>
          <!-- Tipografía adaptativa para el título -->
          <h4 class="fw-bold text-white m-0 fs-5 fs-md-4">Tribunal de Ética</h4>
          <p class="text-white opacity-75 m-0" style="font-size: 0.85rem;">Gestión de medidas disciplinarias y resoluciones oficiales</p>
        </div>
      </div>
    </div>

    <div class="row g-3 g-md-4">
      <div v-for="item in opcionesTribunal" :key="item.title" class="col-12 col-md-6">
        <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">

          <!-- Todo el layout de la tarjeta pasado a clases nativas de Bootstrap -->
          <div class="modern-menu-card d-flex align-items-center gap-3 p-4 p-md-3 bg-white w-100 h-100 shadow-sm">

            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center">
              <i :class="item.icon"></i>
            </div>

            <div class="flex-grow-1">
              <h5 class="fw-bold m-0 text-dark" style="font-size: 1.1rem;">{{ item.title }}</h5>
              <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.85rem;">{{ item.desc }}</p>
            </div>

            <div class="card-arrow text-secondary fs-5">
              <i class="bi bi-chevron-right"></i>
            </div>

          </div>

        </RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Tribunal de Ética | AAAB',
  meta: [
    { name: 'description', content: 'Panel centralizado para la gestión de sanciones y ética profesional.' },
    { property: 'og:title', content: 'Tribunal de Ética | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const opcionesTribunal = [
  {
    to: '/panel-admin/tribunal/sanciones',
    title: 'Listado de Sanciones',
    icon: 'bi bi-journal-text',
    desc: 'Consultar, editar o dar de baja sanciones vigentes e históricas.'
  },
  {
    to: '/panel-admin/tribunal/cargar-sancion',
    title: 'Cargar Sanción',
    icon: 'bi bi-shield-plus',
    desc: 'Registrar una nueva resolución disciplinaria en el legajo del árbitro.'
  }
];
</script>

<style scoped>
/* ====================================================
   ESTILOS DE LA CABECERA
   ==================================================== */
.main-icon-container {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ====================================================
   TARJETAS DE NAVEGACIÓN
   ==================================================== */
.modern-menu-card {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* El tamaño del ícono escala automáticamente gracias a clamp() */
.icon-box {
  width: clamp(48px, 10vw, 52px);
  height: clamp(48px, 10vw, 52px);
  background: #fef2f2;
  color: #dc2626;
  border-radius: 14px;
  font-size: clamp(1.3rem, 3vw, 1.5rem);
  transition: all 0.3s ease;
}

.card-arrow {
  transition: all 0.3s ease;
}

/* --- EFECTOS HOVER --- */
.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06) !important;
}

.modern-menu-card:hover .icon-box {
  background: #dc2626;
  color: white;
  transform: scale(1.05);
}

.modern-menu-card:hover .card-arrow {
  color: #dc2626;
  transform: translateX(4px);
}

.animate__animated { animation-duration: 0.5s; }

/* Eliminamos todas las @media queries, ahora es todo dinámico con Bootstrap y CSS moderno. */
</style>

