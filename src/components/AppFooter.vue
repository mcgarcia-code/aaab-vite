<template>
  <footer class="bg-dark text-white" style="font-family: 'segoe ui', Tahoma, Verdana, sans-serif;">
    <div class="container">
      <div class="py-5">
        <div class="row gy-4">

          <!-- CANALES DE COMUNICACIÓN -->
          <div class="col-12 col-lg-8">
            <h6 class="text-danger fw-bold text-uppercase mb-4" style="letter-spacing: 2px; font-size: 0.9rem;">
              Canales de Comunicación
            </h6>

            <div class="row g-3">
              <!-- Columna Izquierda (Contactos) -->
              <div class="col-12 col-md-6 d-flex flex-column gap-3">
                <div class="d-flex align-items-start">
                  <i class="bi bi-info-circle text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:secretaria@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Secretaría</a>
                    <span class="text-secondary small d-block mt-1">Consultas generales e institucionales</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-cash-stack text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:tesoreria@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Tesorería</a>
                    <span class="text-secondary small d-block mt-1">Pagos de cuotas y aranceles</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-calendar-event text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:designaciones@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Designaciones</a>
                    <span class="text-secondary small d-block mt-1">Información sobre arbitrajes asignados</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-shield-check text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:representante@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Representante Arbitral</a>
                    <span class="text-secondary small d-block mt-1">Comunicación oficial con los clubes</span>
                  </div>
                </div>
              </div>

              <!-- Columna Derecha (Contactos) -->
              <div class="col-12 col-md-6 d-flex flex-column gap-3">
                <div class="d-flex align-items-start">
                  <i class="bi bi-book text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:cursos@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Cursos</a>
                    <span class="text-secondary small d-block mt-1">Inscripciones y consultas a cursos</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-card-checklist text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:licencias@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Licencias</a>
                    <span class="text-secondary small d-block mt-1">Solicitud de licencias</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-file-earmark-text text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:informes@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Informes</a>
                    <span class="text-secondary small d-block mt-1">Envío de informes de partidos</span>
                  </div>
                </div>

                <div class="d-flex align-items-start">
                  <i class="bi bi-receipt text-danger fs-5 me-3 mt-1"></i>
                  <div>
                    <a href="mailto:facturas@arbitroshandball.com.ar" class="text-white text-decoration-none fw-bold transition-hover fs-6">Facturación</a>
                    <span class="text-secondary small d-block mt-1">Consultas sobre partidos no abonados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Separador visible solo en móviles -->
          <hr class="d-lg-none text-secondary opacity-25 my-4">

          <!-- BRANDING Y REDES SOCIALES -->
          <div class="col-12 col-lg-4">
            <div class="text-center text-lg-end">
              <img :src="logo" alt="AAAB Logo" class="footer-logo mb-3" />
              <h5 class="fw-black text-white m-0" style="letter-spacing: 3px; font-size: 1.2rem;">CAMBIA TU VISIÓN</h5>
              <h5 class="fw-black text-danger m-0" style="letter-spacing: 3px; font-size: 1.2rem;">HACETE ÁRBITRO</h5>

              <div class="mt-4">
                <p class="small text-secondary mb-2">Seguinos en redes</p>
                <div class="d-flex justify-content-center justify-content-lg-end gap-4">
                  <a href="https://www.instagram.com/arbitros.balonmano/" target="_blank" class="text-white social-link">
                    <i class="bi bi-instagram fs-4"></i>
                  </a>
                  <a href="https://x.com/aaabalonmano" target="_blank" class="text-white social-link">
                    <i class="bi bi-twitter-x fs-4"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- COPYRIGHT BAR -->
    <div class="py-3 text-center" style="background-color: #0a0a0a; border-top: 1px solid #1a1a1a;">
      <span class="small" style="color: #444; letter-spacing: 1px;">
        MCG Solutions © 2026 | Asociación de Árbitros de Handball
      </span>
    </div>
  </footer>
</template>

<script setup>
import logo from '@/assets/fotos/logo.png'
</script>

<style scoped>
.fw-black {
  font-weight: 900;
}

.footer-logo {
  max-width: 130px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
}

/* Transiciones suaves para hovers */
.transition-hover {
  transition: color 0.3s ease;
}

.transition-hover:hover {
  color: #dc3545 !important;
}

.social-link {
  transition: transform 0.3s ease, color 0.3s ease;
}

.social-link:hover {
  color: #dc3545 !important;
  transform: translateY(-3px);
}

</style>
