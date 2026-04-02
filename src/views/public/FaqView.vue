<template>
  <div class="dark-background-section py-5">
    <div class="container my-5">
      <div class="text-center mb-5">
        <h1 class="fw-bold text-white">Preguntas Frecuentes</h1>
        <p class="lead text-white-50">
          Seleccioná una categoría para resolver tus dudas sobre protocolos, administración y reglamentos.
        </p>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="accordion accordion-flush" id="faqAccordion">
            <div
              v-for="(categoria, catIndex) in categorias"
              :key="categoria.titulo"
              class="accordion-item"
            >
              <h2 class="accordion-header" :id="'heading' + catIndex">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + catIndex"
                  aria-expanded="false"
                  :aria-controls="'collapse' + catIndex"
                >
                  <i :class="[categoria.icon, 'category-icon me-3']"></i>
                  <div>
                    <span class="category-title">{{ categoria.titulo }}</span>
                    <small class="category-subtitle d-block">{{ categoria.subtitulo }}</small>
                  </div>
                </button>
              </h2>
              <div
                :id="'collapse' + catIndex"
                class="accordion-collapse collapse"
                :aria-labelledby="'heading' + catIndex"
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body">
                  <div class="list-group list-group-flush">
                    <div
                      v-for="(item, pIndex) in categoria.preguntas"
                      :key="pIndex"
                      class="py-3 border-bottom"
                    >
                      <h5 class="category-title text-danger fw-bold mb-2">
                         <i class="bi bi-patch-question me-2"></i>{{ item.question }}
                      </h5>
                      <p class="mb-0 text-muted" v-html="item.answer"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Preguntas Frecuentes | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Todo lo que necesitás saber sobre protocolos, administración y reglamentos de la AAAB.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Preguntas Frecuentes | AAAB',
    },
    {
      property: 'og:description',
      content: 'Todo lo que necesitás saber sobre protocolos, administración y reglamentos de la AAAB.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

const categorias = ref([
  {
    titulo: 'Comunicaciones y Contacto',
    subtitulo: 'Canales oficiales para secretaría, tesorería y trámites generales.',
    icon: 'bi bi-envelope-paper-fill',
    preguntas: [
      {
        question: "¿A qué correo escribo por temas generales?",
        answer: "Debés dirigirte a <strong>Secretaría</strong> (secretaria@arbitroshandball.com.ar) para consultas generales, notas a la CD, solicitud de constancias o trámites sin casilla específica."
      },
      {
        question: "¿Cómo informo errores en mi liquidación o pido ropa?",
        answer: "Todo lo relacionado con balances, errores en liquidación de partidos cobrados o pedido de ropa institucional se gestiona con <strong>Tesorería</strong> (tesoreria@arbitroshandball.com.ar)."
      },
      {
        question: "¿Dónde consulto sobre cursos de formación?",
        answer: "Para capacitaciones, inscripciones a la escuela y cursos dictados por AAAB, el contacto es cursos@arbitroshandball.com.ar."
      },
      {
        question: "¿Cómo contacto al Tribunal de Ética?",
        answer: "Para descargos ante citaciones, consultas sobre sanciones o dudas sobre el Código de Ética, escribí a etica@arbitroshandball.com.ar."
      },
      {
        question: "¿A quién dirijo quejas formales de clubes o consultas reglamentarias oficiales?",
        answer: "Para quejas formales de instituciones, comunicaciones con la CAH o dudas sobre el reglamento vigente, el canal es <strong>Representante AAAB</strong> (representante@arbitroshandball.com.ar)."
      }
    ]
  },
  {
    titulo: 'Designaciones y Licencias',
    subtitulo: 'Protocolos de confirmación, rechazos y pedidos de licencia.',
    icon: 'bi bi-calendar-check-fill',
    preguntas: [
      {
        question: "¿Cómo confirmo mi designación?",
        answer: "Al recibir el email, la designación se considera <strong>confirmada automáticamente</strong>. No es necesario contestar el correo."
      },
      {
        question: "¿Qué hago si no puedo aceptar una designación?",
        answer: "Si no podés aceptarla, debés comunicarte lo antes posible vía WhatsApp con la designadora."
      },
      {
        question: "¿Cómo solicito una licencia?",
        answer: "Deben pedirse a través de la plataforma, ingresando con tu usuario y contraseña. Las mismas se solicitan con <strong>10 días de anticipación</strong>. Son por día completo y no existen licencias parciales."
      },
      {
        question: "¿Qué pasa si llego tarde a un partido de Infantiles?",
        answer: "Los árbitros que lleguen tarde a Infantiles <strong>no cobran el partido</strong>, pero tienen la obligación de dirigirlo y dejar constancia en la planilla."
      }
    ]
  },
  {
    titulo: 'Protocolo en Cancha, Planilla y Resultados',
    subtitulo: 'Horarios, validación de planillas digitales y resultados.',
    icon: 'bi bi-clipboard-check-fill',
    preguntas: [
      {
        question: "¿A qué hora debo estar en la sede?",
        answer: "Árbitros y equipos deben estar listos (cambiados y con planilla) <strong>30 minutos antes</strong> del horario de inicio. Por otro lado, los árbitros deben presentarse en la cancha <strong>45 minutos antes</strong> del horario de inicio del partido."
      },
      {
        question: "¿Cuál es el tiempo de tolerancia para iniciar?",
        answer: "Se esperan 15 minutos desde la hora de presentación. Si a los 15 minutos previos al inicio un equipo no tiene al menos 5 jugadores y planilla firmada, se suspende."
      },
      {
        question: "¿Cómo proceder si la planilla digital no funciona durante el partido?",
        answer: "Si el sistema falla, la planilla debe realizarse en papel como respaldo y, al finalizar, es obligatorio completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a> y enviar los resultados por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a>."
      },
            {
        question: "¿Es obligatorio el uso de auxiliares de mesa habilitados?",
        answer: "Sí, en categorías Mayores y niveles A y B de inferiores, es obligatorio presentar auxiliares habilitados por FEMEBAL. Si no cuentan con la habilitación, se debe asentar en observaciones."
      },
      {
        question: "¿Cómo valido la planilla digital al finalizar?",
        answer: "Es responsabilidad del árbitro validar las planillas online inmediatamente al terminar el partido ingresando con su usuario y contraseña a <a href='https://auth.sistemahandballargentina.org/oauth/login' target='_blank'>Larry Sports</a>."
      },
      {
        question: "¿Qué datos envío al WhatsApp de Resultados?",
        answer: "Enviar foto de la planilla por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a> inmediatamente al finalizar el partido con: Resultado, Categoría y Clubes (Ej: Juniors 'D' Caballeros: Larre 30 - Boca 30)."
      },
      {
        question: "¿Tiene que coincidir la planilla digital y la física?",
        answer: "Si. Antes de comenzar cada partido, es OBLIGATORIO  corroborar que la planilla digital coincida con la planilla física, tanto en jugadores como en entrenadores."
      },
        {
        question: "¿Qué hago si al finalizar el partido, hay diferencias entre la planilla digital y la de papel?",
        answer: "Si no se puede editar en el sistema, debés completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a> y enviar foto de la planilla por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a>."
      },
      {
        question: "¿Cuándo es el límite para enviar un informe escrito?",
        answer: "Los informes y fotos de planillas deben enviarse como máximo el <strong>lunes a las 12:00 pm</strong> a informes@arbitroshandball.com.ar."
      },
      {
        question: "¿Qué sucede si los oficiales de equipo no están habilitados en el sistema o llegan tarde?",
        answer: "Si un oficial no figura en la planilla digital, no puede participar, a menos que el responsable del equipo confirme que está habilitado; en ese caso, el partido puede jugarse, pero es obligatorio completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a> y enviar los resultados por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a> para su verificación. Si el oficial figura en planilla pero llega tarde, puede participar; sin embargo, si al inicio del encuentro no hay ningún oficial nivelado presente, el partido se suspende."
      },
      {
        question: "¿Qué pasa si un jugador/a o entrenador/a figura en la planilla física pero no aparece en la planilla digital?",
        answer: "En caso de detectar que algún jugador o jugadora no figura en el sistema, se debe consultar al oficial responsable ( DT ) el motivo. Si este/a confirma que el/la jugador/a está habilitado/a, podrá participar del partido. Siempre que ocurra esta situación, se deberá enviar el informe correspondiente y completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a>"
      },
      {
        question: "El equipo local tuvo un inconveniente con la planilla digital debido a que se apagó la computadora ¿Puede cargarla luego de manera offline antes de finalizar el partido?",
        answer: "Si el sistema falla, la planilla debe realizarse en papel como respaldo y, al finalizar, es obligatorio completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a> y enviar los resultados por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a>."
      },
      {
        question: "¿Qué hago si no me aparece el partido para validar?",
        answer: "En caso de que no aparezca, es obligatorio completar el <a href='https://docs.google.com/forms/d/e/1FAIpQLSdVyMWo1ub6mSVfWycI1dfiwDZQnFT62uXTCOHAYYZLjqz1gQ/viewform?pli=1' target='_blank'>Formulario</a> y enviar los resultados por <a href='https://wa.link/ztfre7' target='_blank'>WhatsApp</a>."
      },
      {
        question: "¿Qué hago si no puedo subir la foto de la planilla al formulario?o por problemas con la planilla digital?",
        answer: "Si estás cargando desde el celular, probá usar Google Chrome en modo escritorio."
      }
    ]
  },
  {
    titulo: 'Suspensión de Partidos',
    subtitulo: 'Criterios de suspensión, aranceles y fuerza mayor.',
    icon: 'bi bi-exclamation-octagon-fill',
    preguntas: [
      {
        question: "¿A quién consulto antes de suspender un partido?",
        answer: "Antes de suspender un partido por cualquier razón, deben comunicarse con el Presidente de la AAAB o la Designadora."
      },
      {
        question: "¿Cómo se cobran los aranceles por suspensión?",
        answer: "Si se suspende antes de empezar, se abona el 50% del valor. Si el partido ya inició, corresponde el 100% del arancel."
      },
      {
        question: "¿Qué pasa si un equipo no se presenta?",
        answer: "El equipo presente paga su parte (50%); el equipo ausente deberá regularizar la otra mitad posteriormente con la Asociación."
      },
      {
        question: "¿Por qué motivos es obligatorio suspender un partido?",
        answer: "El partido no debe iniciar si los arcos no están sujetos/amurados al piso o pared, si las pelotas no son los modelos oficiales de FEMEBAL o si el Oficial Responsable de Equipo no tiene la nivelación correspondiente"
      }
    ]
  },
  {
    titulo: 'Indumentaria, Equipamiento y Seguridad',
    subtitulo: 'Indumentaria de los equipos, responsabilidades del club local y resguardo de árbitros.',
    icon: 'bi bi-shield-shaded',
    preguntas: [
      {
        question: "¿Qué indumentaria deben usar los equipos?",
        answer: "Las camisetas de los equipos deben poder ser distinguibles entre sí. Un equipo debe usar color claro y el otro equipo color oscuro."
      },
      {
        question: "¿Qué pasa si tengo dudas si se diferencian los colores de las remeras de ambos equipos?",
        answer: "Siempre debe jugar un equipo con indumentaria de color claro y el otro con color oscuro. Los colores deben diferenciarse claramente entre sí y también respecto de los arqueros rivales. En total, deben distinguirse cinco colores: arquero del equipo local, arquero del equipo visitante, jugadores del equipo local, jugadores del equipo visitante y árbitros. Si no se logra esta diferenciación, el equipo local debe cambiar su indumentaria. En caso de que no pueda resolverse, el partido deberá ser suspendido."
      },
      {
        question: "¿Qué materiales debe presentar obligatoriamente el club local?",
        answer: "Dos pelotas oficiales, planilla de juego, reloj de mesa fijo, silbato, tarjetas (verdes, lesionados, excluidos) y arcos con redes en buen estado."
      },
      {
        question: "¿Quién es el responsable de nuestra seguridad?",
        answer: "El club local debe destacar una persona responsable directa de la atención y seguridad de los árbitros, quien debe firmar la planilla con nombre y apellido."
      },
      {
        question: "¿Cómo manejo el resguardo de mis efectos personales?",
        answer: "Debés solicitar un lugar seguro al club local. Según el reglamento, si no lo solicitás expresamente, no podrás efectuar reclamos por deterioro o pérdida."
      },
      {
        question: "¿Es obligatorio el responsable de árbitros en inferiores?",
        answer: "Sí, en las categorías Infantiles, Menores y Cadetes es obligatorio que figure en la planilla un responsable de árbitros designado por el local."
      },
      {
        question: "¿Cuál es la política sobre pirotecnia y elementos sonoros?",
        answer: "Está <strong>estrictamente prohibida</strong> la pirotecnia de cualquier tipo, así como bombos, redoblantes o megáfonos que afecten la seguridad o el orden <strong>en TODAS las categorías</strong>."
      }
    ]
  },
  {
    titulo: 'Facturación y Tesorería',
    subtitulo: 'Gestión de cobros, aportes obligatorios y plazos.',
    icon: 'bi bi-cash-stack',
    preguntas: [
      {
        question: "¿Cómo y cuándo debo facturar?",
        answer: "Debés realizar la factura antes del lunes post-partido. El detalle debe ser: 'Arbitraje Handball + Categoría + División + Rivales'."
      },
      {
        question: "¿Cuándo se cobran los partidos?",
        answer: "En cancha contra entrega de factura/recibo, o por transferencia antes del miércoles (si la factura se envió antes del lunes)."
      },
      {
        question: "¿De cuánto es el aporte a la Asociación?",
        answer: "El aporte es del <strong>8%</strong>. El pago de los aportes es responsabilidad de cada árbitro. En el caso de que no se abone dentro de los 10 días hábiles de haberse enviado el e-mail, tendrá un recargo del 25%."
      },
      {
        question: "¿A quién contacto por deudas de clubes  o facturas adeudadas por los árbitros?",
        answer: "Para consultas sobre facturas de partidos pendientes de cobro y reclamos por deudas de clubes, el mail es facturas@arbitroshandball.com.ar."
      },
    ]
  },
  {
    titulo: 'Categoría Mini Handball',
    subtitulo: 'Regulaciones pedagógicas y procedimientos de sede.',
    icon: 'bi bi-person-walking',
    preguntas: [
      {
        question: "¿Qué indumentaria es obligatoria para Mini?",
        answer: "Uniforme AAAB o ropa deportiva oscura (negra) sin insignias de clubes. El uso de silbato y reloj es obligatorio."
      },
      {
        question: "¿Qué sucede si un equipo de Mini no alcanza el mínimo de jugadores?",
        answer: "Se debe dejar constancia por escrito en la planilla si a las 10:45 hs no alcanzan el mínimo. No obstante, el objetivo es pedagógico, por lo que se permite que jueguen igual para fomentar el aprendizaje y la diversión."
      },
      {
        question: "¿Cómo valido las planillas en una sede de Mini?",
        answer: "El árbitro debe validar las planillas desde el usuario del club SEDE al finalizar el encuentro, usando su propio e-mail y contraseña."
      },
      {
        question: "¿Cómo se manejan los carnets en Mini?",
        answer: "Deben presentarse impresos. Si están en formato digital, pueden jugar pero se debe dejar constancia en la planilla."
      },
      {
        question: "¿Se permiten partidos mixtos en Mini?",
        answer: "Sí, está permitido jugar mixtos o mezclados entre equipos siempre que ambos técnicos estén de acuerdo, priorizando el aprendizaje."
      },
      {
        question: "¿Cómo se calcula el pago prorrateado?",
        answer: "El costo total del Encuentro de Mini se divide equitativamente según la cantidad de equipos participantes de cada club."
      },
      {
        question: "¿A dónde envío las planillas de Mini al terminar?",
        answer: "Debés enviarlas por mail a informes@arbitroshandball.com.ar con el asunto 'MINI HANDBALL SEDE X', detallando cualquier observación técnica."
      }
    ]
  },
  {
    titulo: 'Reglamentación Técnica',
    subtitulo: 'Normativas específicas para categorías Infantiles y Menores.',
    icon: 'bi bi-book-half',
    preguntas: [
      {
        question: "¿Se puede jugar sin arquero en Infantiles y Menores?",
        answer: "No. Está <strong>totalmente prohibido</strong> jugar sin arquero en las categorías Infantiles y Menores."
      },
      {
        question: "Si un jugador se lesiona, ¿Tiene que salir 3 ataques?",
        answer: "No. No se aplica la regla del jugador lesionado en Infantiles y Menores"
      },
      {
        question: "¿Qué sistemas de defensa están permitidos en Infantiles y Menores?",
        answer: "En Infantiles: individual o 3:3. En Menores: individual, 3:3 o 4:2. En el segundo tiempo de Menores se permite defender 5:1 y/o 6:0. Para más detalles: <a href='https://drive.google.com/file/d/1ui87QUfCC0w6UDhR7KOK-qpjgiL9TbVc/view' target='_blank'>Ver Reglamento de Infantiles y Menores</a>"
      },
      {
        question: "¿Qué sucede si no se respetan las defensas permitidas?",
        answer: "Se aplica Time Out con advertencia al DT, luego Time Out con 7 metros y, ante reincidencia Time Out con 7 metros más informe escrito."
      }
    ]
  }
]);
</script>

<style scoped>
.dark-background-section {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('../../assets/fotos/descargas-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-top: 70px;
}

.accordion-item {
  background-color: #ffffff;
  border: none;
  border-radius: 0.5rem !important;
  margin-bottom: 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.accordion-button {
  font-weight: 600;
  color: #343a40;
  background-color: #ffffff;
}

.accordion-button:not(.collapsed) {
  background-color: #f8f9fa;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: #dc3545;
}

.accordion-button:focus {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.category-icon {
  font-size: 1.8rem;
  color: #dc3545;
}

.category-title {
  font-size: 1.1rem;
}

.category-subtitle {
  font-size: 0.85rem;
  font-weight: 400;
  color: #6c757d;
}

.accordion-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

p {
  line-height: 1.6;
  font-size: 0.95rem;
}

.text-danger {
  color: #dc3545 !important;
}

.border-bottom:last-child {
  border-bottom: none !important;
}
</style>
