<script setup>
// Ya no se necesita la lógica de login, el script puede quedar casi vacío
import logo from '@/assets/logo.png'
</script>

<template>
  <div>
    <footer class="main-footer text-white pt-5 pb-4">
      <div class="container text-center text-md-start">
        <div class="row align-items-center justify-content-between">
          <div class="col-md-4 col-lg-4 mt-3">
            <h6 class="text-uppercase fw-bold mb-3">Contacto</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="mailto:aaabdesignaciones@gmail.com" class="footer-link">
                  <i class="bi bi-envelope-fill me-2"></i> Designaciones
                </a>
              </li>
              <li class="mb-2">
                <a href="mailto:aaabsecretria@gmail.com" class="footer-link">
                  <i class="bi bi-envelope-fill me-2"></i> Secretaría
                </a>
              </li>
              <li>
                <a href="mailto:aaabetica@gmail.com" class="footer-link">
                  <i class="bi bi-envelope-fill me-2"></i> Tribunal de Ética
                </a>
              </li>
            </ul>
          </div>

          <div class="col-md-4 col-lg-4 mt-3 text-center">
            <img :src="logo" alt="AAAB Logo" class="footer-logo mb-3" />
            <p class="tagline text-uppercase fw-bold">Cambia tu visión</p>
            <p class="tagline text-uppercase fw-bold">Hacete Árbitro</p>
          </div>

          <div class="col-md-4 col-lg-4 mt-3 text-md-end text-center">
            <h6 class="text-uppercase fw-bold mb-3">Seguinos en nuestras <br />redes sociales</h6>
            <div class="social-icons">
              <a
                href="https://www.instagram.com/arbitros.balonmano/"
                target="_blank"
                rel="noopener noreferrer"
                class="social-icon"
                aria-label="Instagram"
              >
                <i class="bi bi-instagram"></i>
              </a>
              <a
                href="https://x.com/aaabalonmano"
                target="_blank"
                rel="noopener noreferrer"
                class="social-icon"
                aria-label="Twitter X"
              >
                <i class="bi bi-twitter-x"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <div class="copyright-bar text-center p-3">
      MCG Solutions © 2025 Asociación de Árbitros de Handball
    </div>
  </div>
</template>

<style scoped>
/* (Los estilos no necesitan cambios, solo se elimina el .admin-link que no se usa) */
.main-footer {
  background-color: #212529;
}
.footer-logo {
  max-width: 120px;
  opacity: 0.9;
}
.tagline {
  color: #dee2e6;
  font-size: 1.1rem;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}
.footer-link {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.3s;
}
.footer-link:hover {
  color: #ffffff;
}
.social-icons .social-icon {
  font-size: 1.8rem;
  color: #adb5bd;
  margin: 0 10px;
  transition:
    color 0.3s,
    transform 0.3s;
  display: inline-block;
}
.social-icons .social-icon:hover {
  color: #ffffff;
  transform: translateY(-3px);
}
.copyright-bar {
  background-color: #000000;
  color: #a0a3a7;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
