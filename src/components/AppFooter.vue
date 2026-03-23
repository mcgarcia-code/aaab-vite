<template>
  <footer class="main-footer">
    <div class="container">
      <div class="footer-content py-5">
        <div class="row gy-5">

          <div class="col-lg-8">
            <h6 class="footer-title">Canales de Comunicación</h6>
            <div class="row">
              <div class="col-md-6">
                <div class="contact-item">
                  <i class="bi bi-info-circle"></i>
                  <div class="contact-text">
                    <a href="mailto:secretaria@arbitroshandball.com.ar">Secretaría</a>
                    <span>Consultas generales e institucionales</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-cash-stack"></i>
                  <div class="contact-text">
                    <a href="mailto:tesoreria@arbitroshandball.com.ar">Tesorería</a>
                    <span>Pagos de cuotas y aranceles</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-calendar-event"></i>
                  <div class="contact-text">
                    <a href="mailto:designaciones@arbitroshandball.com.ar">Designaciones</a>
                    <span>Información sobre arbitrajes asignados</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-shield-check"></i>
                  <div class="contact-text">
                    <a href="mailto:representante@arbitroshandball.com.ar">Representante Arbitral</a>
                    <span>Comunicación oficial con los clubes</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="contact-item">
                  <i class="bi bi-book"></i>
                  <div class="contact-text">
                    <a href="mailto:cursos@arbitroshandball.com.ar">Cursos</a>
                    <span>Inscripciones y consultas a cursos de capacitación</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-card-checklist"></i>
                  <div class="contact-text">
                    <a href="mailto:licencias@arbitroshandball.com.ar">Licencias</a>
                    <span>Solicitud de licencias</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-file-earmark-text"></i>
                  <div class="contact-text">
                    <a href="mailto:informes@arbitroshandball.com.ar">Informes</a>
                    <span>Envío de informes de partidos exclusivo para árbitros</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="bi bi-receipt"></i>
                  <div class="contact-text">
                    <a href="mailto:facturas@arbitroshandball.com.ar">Facturación</a>
                    <span>Consultas sobre partidos no abonados o facturas pendientes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="brand-section text-center text-lg-end">
              <img :src="logo" alt="AAAB Logo" class="footer-logo mb-3" />
              <h5 class="tagline">CAMBIA TU VISIÓN</h5>
              <h5 class="tagline highlight">HACETE ÁRBITRO</h5>

              <div class="social-wrapper mt-4">
                <p class="small text mb-2">Seguinos en redes</p>
                <div class="social-links">
                  <a href="https://www.instagram.com/arbitros.balonmano/" target="_blank"><i class="bi bi-instagram"></i></a>
                  <a href="https://x.com/aaabalonmano" target="_blank"><i class="bi bi-twitter-x"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright-bar">
      <div class="container text-center">
        <span>MCG Solutions © 2026 | Asociación de Árbitros de Handball</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import logo from '@/assets/fotos/logo.png'
</script>


<style scoped>
.main-footer {
  background-color: #212529;
  color: #ffffff;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;}

.footer-title {
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 2px;
  color: #c82333;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

/* Items de contacto */
.contact-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.contact-item i {
  color: #c82333;
  font-size: 1.2rem;
  margin-right: 15px;
  margin-top: 2px;
}

.contact-text a {
  display: block;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: 0.3s;
}

.contact-text a:hover {
  color: #c82333;
}

.contact-text span {
  display: block;
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 2px;
}

/* Lado derecho */
.footer-logo {
  max-width: 130px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
}

.tagline {
  font-weight: 900;
  letter-spacing: 3px;
  margin: 0;
  font-size: 1.2rem;
  color: #ffffff;
}

.tagline.highlight {
  color: #c82333;
}

.social-links a {
  color: #ffffff;
  font-size: 1.5rem;
  margin-left: 20px;
  transition: 0.3s;
}

.social-links a:hover {
  color: #c82333;
  transform: translateY(-3px);
  display: inline-block;
}

/* Barra inferior */
.copyright-bar {
  background-color: #0a0a0a;
  padding: 10px 0;
  border-top: 1px solid #1a1a1a;
}

.copyright-bar span {
  color: #444;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

@media (max-width: 991px) {
  .brand-section {
    border-top: 1px solid #1a1a1a;
    padding-top: 3rem;
  }
}
</style>
