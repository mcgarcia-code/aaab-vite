<template>
  <div class="animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3">
        <h4 class="text-danger fw-bold m-0">Mi Rendimiento</h4>
        <p class="text-muted small m-0">Seguimiento de desempeño, exámenes y observaciones de campo.</p>
      </div>
      
      <div class="card-body p-0">
        <div class="text-center py-5">
          <i class="bi bi-graph-up-arrow text-primary display-1 opacity-25"></i>
          <h5 class="mt-3 fw-bold text-dark">Módulo en Desarrollo</h5>
          <p class="text-muted small px-4">
            Próximamente podrás visualizar aquí tus <strong>estadísticas</strong>, resultados de <strong>exámenes</strong> teóricos y las <strong>observaciones</strong> técnicas de tus partidos.
          </p>
          <div class="mt-3">
            <span class="badge rounded-pill bg-light text-dark border">Versión 2.0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm">
      <div class="d-flex">
        <i class="bi bi-info-square-fill me-3 fs-4 text-dark"></i>
        <div class="small text-dark">
          Los datos de rendimiento son cargados por la AAAB y nuestros Observadores Oficiales. 
          Si tenés dudas sobre tus registros actuales, contactate con la coordinación técnica.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { useHead } from '@vueuse/head';

// Título y descripción específicos para SEO y WhatsApp
useHead({
  title: 'Mi Rendimiento | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Consulta tus estadísticas, exámenes y observaciones de desempeño arbitral.',
    },
    {
      property: 'og:title',
      content: 'Mi Rendimiento | AAAB',
    },
    {
      property: 'og:description',
      content: 'Consulta tus estadísticas, exámenes y observaciones de desempeño arbitral.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png',
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
});

// Por ahora no necesitamos lógica de fetch ya que es un "Próximamente"
</script>

<style scoped>
/* ====================================================
   1. ESTRUCTURA BASE MAESTRA
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 80px;
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  height: 100%;
  border-radius: 12px;
}

/* Cabecera Estándar (Por si el componente la usa) */
.header-section { 
    background: white; padding: 15px 25px; border-radius: 8px; 
    display: flex; justify-content: space-between; margin-bottom: 15px; 
    border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    align-items: center; 
}
.header-info { display: flex; flex-direction: column; }
.header-actions { display: flex; gap: 8px; }
.btn-action, .btn-clear { border: none; cursor: pointer; }
.btn-clear:hover { background-color: #e2e8f0 !important; }
.btn-text { display: inline; }

/* ====================================================
   2. COMPONENTES ESPECÍFICOS DE ESTA VISTA
   ==================================================== */
.card { border-radius: 15px; overflow: hidden; background: #ffffff; }
.card-header { border-bottom: 1px solid #f1f5f9; }

.text-primary { color: #0d6efd !important; }
.display-1 { font-size: 5rem; font-weight: bold; }

/* ====================================================
   3. 📱 RESPONSIVE DESIGN (Tiered Layout)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

/* --- Laptops y Tablets Grandes (Hasta 1024px) --- */
@media (max-width: 1024px) {
    .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
    .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* --- Tablets y Móviles (Hasta 768px) --- */
@media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: block !important; }
    .mobile-only-flex { display: flex !important; }
}

/* --- Smartphones (Hasta 600px - Estandarizado) --- */
@media (max-width: 600px) {
    /* AIRE LATERAL DE 10px: La vista respira y no se pega a los bordes */
    .full-screen-wrapper { 
        padding: 0 10px !important; 
        width: 100% !important; 
        margin: 0 !important; 
        transform: none !important; 
        left: 0 !important;
    }
    
    .admin-panel { padding: 15px 0 !important; border-radius: 0; }

    /* CABECERA ESTÁNDAR MÓVIL: Título a la izquierda, botones centrados */
    .header-section { 
        padding: 15px !important; flex-direction: column; 
        align-items: flex-start; text-align: left; gap: 15px; 
    }
    .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
    .header-info h4, h4 { font-size: 1.2rem !important; margin: 0; text-align: left; }
    
    .header-actions { 
        width: 100%; display: flex; flex-direction: row; 
        flex-wrap: wrap; justify-content: center; gap: 8px; 
    }
    .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
    .btn-text { display: none !important; }

    /* AJUSTES ESPECÍFICOS DEL COMPONENTE */
    .display-1 { font-size: 3.5rem; }
    .card-header h4 { font-size: 1.2rem !important; }
}
</style>