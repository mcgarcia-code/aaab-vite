<template>
  <div class="container py-2 animate__animated animate__fadeIn">
    <div class="text-center mb-5">
      <i class="bi bi-bag-fill text-danger main-icon"></i>
      <h2 class="fw-bold text-white mt-2">Mi Indumentaria</h2>
      <p class="small text-white opacity-75 m-0">Gestioná tu equipo oficial de la asociación.</p>
    </div>

    <div class="row g-4 justify-content-center">
      <div class="col-12 col-sm-6">
        <RouterLink to="/panel-arbitro/indumentaria/nuevo" class="text-decoration-none h-100 d-block">
          <div class="menu-card shadow-lg">
            <div class="icon-circle">
              <i class="bi bi-cart-plus text-danger"></i>
            </div>
            <h4 class="mt-3 fw-bold text-dark">Solicitar Indumentaria</h4>
            <p class="small text-muted m-0 px-2">Realizar un nuevo pedido de indumentaria.</p>
          </div>
        </RouterLink>
      </div>

      <div class="col-12 col-sm-6">
        <RouterLink to="/panel-arbitro/indumentaria/mis-pedidos" class="text-decoration-none h-100 d-block">
          <div class="menu-card shadow-lg">
            <div class="icon-circle">
              <i class="bi bi-list-check text-danger"></i>
            </div>
            <h4 class="mt-3 fw-bold text-dark">Mis Pedidos</h4>
            <p class="small text-muted m-0 px-2">Consultar el estado de tus solicitudes previas.</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Copiá los mismos estilos de .menu-card que tenés en los otros Admin para mantener la estética */
.main-icon { font-size: 3.2rem; filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.3)); }
.menu-card { background: #ffffff; border-radius: 20px; padding: 40px 20px; text-align: center; transition: all 0.3s ease; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #f1f5f9; }
.icon-circle { width: 80px; height: 80px; background: #fff5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
.menu-card i { font-size: 2.8rem; }
.menu-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.3) !important; border-bottom: 6px solid #dc2626; }
.menu-card:hover .icon-circle { background: #dc2626; }
.menu-card:hover i { color: white !important; }
</style>