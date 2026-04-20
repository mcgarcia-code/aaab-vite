<template>
  <div class="panel-aaab">
    <h2 class="titulo">Estado de Rendimiento - Grupo Flor</h2>

    <div class="grid-container">
      <div
        class="card"
        v-for="(arbitro, index) in arbitros"
        :key="index"
      >
        <h3 class="nombre">{{ arbitro.nombre }}</h3>

        <div class="grafico-circular" :style="obtenerGradiente(arbitro)"></div>

        <div class="leyenda">
          <div class="item-leyenda">
            <span class="punto t"></span>Teórico: {{ formatNota(arbitro.teorico) }}
          </div>
          <div class="item-leyenda">
            <span class="punto f"></span>Físico: {{ formatNota(arbitro.fisico) }}
          </div>
          <div class="item-leyenda">
            <span class="punto p"></span>Asistencia: {{ arbitro.presente === 'X' ? 'Sí' : 'No' }}
          </div>
          <div class="item-leyenda">
            <span class="punto c"></span>Cancha: {{ formatNota(arbitro.cancha) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Array reactivo con los datos del CSV.
// En producción podrías llenar este array leyendo el archivo con una librería como PapaParse.
const arbitros = ref([
  { nombre: 'Aguirre, Santiago', teorico: 'AUS', fisico: 'AUS', presente: '', cancha: '' },
  { nombre: 'Britez, Patricio Nahuel', teorico: 0.56, fisico: 9.5, presente: 'X', cancha: '' },
  { nombre: 'Cáceres, Roberto Carlos', teorico: 0.88, fisico: 9.5, presente: 'X', cancha: '' },
  { nombre: 'Cascia, Rodrigo', teorico: 0.52, fisico: 'DESAPROBADO', presente: 'X', cancha: '' },
  { nombre: 'Casco, Nicolas Martin', teorico: 1, fisico: 9.5, presente: 'X', cancha: '' },
  { nombre: 'De Simone, Marcia Luciana', teorico: 0.8, fisico: 8.5, presente: 'X', cancha: 3.15 },
  { nombre: 'Ferretti, Melina', teorico: 0.72, fisico: 8.5, presente: 'X', cancha: 5.25 },
  { nombre: 'Fuente, Camila', teorico: 0.88, fisico: 9.3, presente: 'X', cancha: 5.25 },
  { nombre: 'Gauna, Candela', teorico: 0.96, fisico: 9.5, presente: 'X', cancha: 5.25 },
  { nombre: 'Guerrero, Ivan Agustín', teorico: 1, fisico: 9.5, presente: 'X', cancha: 5.25 }
]);

// Función para limpiar la visualización de las notas en la leyenda
const formatNota = (nota) => {
  if (!nota || nota === 'AUS' || nota === 'DESAPROBADO') return nota || '-';
  return nota;
};

// Lógica central para pintar las 4 porciones del gráfico
const obtenerGradiente = (arbitro) => {
  // 1. Teórico: Verde si es >= 0.6, Amarillo si desaprobó, Gris si no hay nota/ausente
  const t = parseFloat(arbitro.teorico);
  const colT = !isNaN(t) ? (t >= 0.6 ? '#4bc0c0' : '#ffce56') : '#eeeeee';

  // 2. Físico: Rosa oscuro si aprobó (ej. >= 6), Naranja si desaprobó, Gris si no hay nota
  const f = parseFloat(arbitro.fisico);
  const colF = !isNaN(f) ? (f >= 6 ? '#ff6384' : '#ff9f40') : '#eeeeee';

  // 3. Presente: Morado si tiene la X, Gris si faltó
  const colP = arbitro.presente === 'X' ? '#9966ff' : '#eeeeee';

  // 4. Cancha: Azul si tiene evaluación cargada, Gris si está pendiente
  const c = parseFloat(arbitro.cancha);
  const colC = !isNaN(c) && c > 0 ? '#36a2eb' : '#eeeeee';

  // Generamos el conic-gradient en 4 ángulos de 90 grados
  return {
    background: `conic-gradient(
      ${colT} 0deg 90deg,
      ${colF} 90deg 180deg,
      ${colP} 180deg 270deg,
      ${colC} 270deg 360deg
    )`
  };
};
</script>

<style scoped>
.panel-aaab {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.titulo {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.grid-container {
  display: grid;
  /* El grid se adapta automáticamente al ancho de la pantalla */
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.nombre {
  font-size: 15px;
  color: #333;
  margin-bottom: 20px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grafico-circular {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  margin: 0 auto;
  border: 3px solid #f0f0f0;
}

.leyenda {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  font-size: 12px;
  color: #555;
  text-align: left;
  padding-left: 10px;
}

.item-leyenda {
  display: flex;
  align-items: center;
}

.punto {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
}

/* Colores de los indicadores de la leyenda */
.punto.t { background-color: #4bc0c0; }
.punto.f { background-color: #ff6384; }
.punto.p { background-color: #9966ff; }
.punto.c { background-color: #36a2eb; }
</style>
