<template>
  <div class="dark-background-section py-5 animate__animated animate__fadeIn">
    <div class="container my-5">

      <div class="text-center mb-5">
        <h1 class="fw-bold text-white display-5">Glosario Reglas de Juego</h1>
        <p class="lead text-white-50">Términos oficiales según el reglamento de la IHF.</p>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills justify-content-center mb-5" id="glossaryTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active fw-bold px-4 py-2" id="es-tab" data-bs-toggle="pill" data-bs-target="#es-pane" type="button" role="tab" aria-controls="es-pane" aria-selected="true">
            Español
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link fw-bold px-4 py-2 ms-3" id="en-tab" data-bs-toggle="pill" data-bs-target="#en-pane" type="button" role="tab" aria-controls="en-pane" aria-selected="false">
            English
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content" id="glossaryTabsContent">

        <!-- Pestaña Español -->
        <div class="tab-pane fade show active" id="es-pane" role="tabpanel" aria-labelledby="es-tab" tabindex="0">
          <div class="row">
            <div class="col-12 mb-4">
               <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block text-uppercase" style="letter-spacing: 1px;">Glosario Reglas de Juego Handball</h2>
            </div>
            <div class="col-12">
              <div class="card bg-dark border-secondary rounded-4 shadow-lg overflow-hidden">
                <div class="table-responsive">
                  <table class="table table-dark table-striped table-hover mb-0">
                    <thead class="table-dark border-bottom border-danger">
                      <tr>
                        <th scope="col" class="py-3 px-4 w-25 text-danger">Término</th>
                        <th scope="col" class="py-3 px-4">Definición</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(term, index) in glossaryEs" :key="'es-'+index">
                        <td class="fw-bold px-4 py-3 align-middle text-white">{{ term.title }}</td>
                        <td class="px-4 py-3 align-middle text-white-50 small">{{ term.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- English Tab -->
        <div class="tab-pane fade" id="en-pane" role="tabpanel" aria-labelledby="en-tab" tabindex="0">
          <div class="row">
            <div class="col-12 mb-4">
               <h2 class="fw-bold text-white border-bottom border-danger pb-2 d-inline-block text-uppercase" style="letter-spacing: 1px;">Glossary Handball Rules</h2>
            </div>
            <div class="col-12">
              <div class="card bg-dark border-secondary rounded-4 shadow-lg overflow-hidden">
                <div class="table-responsive">
                  <table class="table table-dark table-striped table-hover mb-0">
                    <thead class="table-dark border-bottom border-danger">
                      <tr>
                        <th scope="col" class="py-3 px-4 w-25 text-danger">Term</th>
                        <th scope="col" class="py-3 px-4">Definition</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(term, index) in glossaryEn" :key="'en-'+index">
                        <td class="fw-bold px-4 py-3 align-middle text-white">{{ term.title }}</td>
                        <td class="px-4 py-3 align-middle text-white-50 small">{{ term.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
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
import { ref } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Glosario Reglas de Juego | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Glosario oficial de las reglas de juego de Handball (IHF) en español e inglés.',
    },
    {
      property: 'og:title',
      content: 'Glosario Reglas de Juego Handball',
    },
    {
      property: 'og:description',
      content: 'Glosario oficial de las reglas de juego de Handball (IHF) en español e inglés.',
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

// Datos en Español
const glossaryEs = ref([
  {
    "title": "3 metros",
    "desc": "A los adversarios no se les permite estar a menos de tres metros del jugador que ejecuta un lanzamiento franco o un saque de banda."
  },
  {
    "title": "3 pasos",
    "desc": "Un jugador que sostiene la pelota solo tiene permitido dar tres pasos; después debe driblear o pasar la pelota."
  },
  {
    "title": "7 contra 6",
    "desc": "Un equipo puede retirar al arquero para añadir un jugador de ataque adicional. Esto le da al equipo una ventaja numérica en ataque e incrementa el número de jugadores de campo a siete."
  },
  {
    "title": "Línea de 7 metros",
    "desc": "Una línea a siete metros del arco que indica desde dónde debe ejecutarse el lanzamiento de 7 metros (penal)."
  },
  {
    "title": "Lanzamiento de 7 metros",
    "desc": "Un tipo de lanzamiento ejecutado fuera de la línea del área de arco y con solo el arquero del equipo defensor entre el ejecutante y el arco."
  },
  {
    "title": "Ley de la ventaja",
    "desc": "Cláusula en las Reglas de Juego que otorga a los árbitros la facultad de permitir que el juego continúe incluso después de haberse cometido una falta, si el detener el juego castigara injustamente al equipo que sufrió la falta."
  },
  {
    "title": "Agresión",
    "desc": "Un ataque violento y deliberado contra el cuerpo de otra persona."
  },
  {
    "title": "Asistencia",
    "desc": "Un jugador completa un pase de asistencia cuando su pase conduce directamente a un gol de un compañero de equipo."
  },
  {
    "title": "Pelota",
    "desc": "Objeto esférico utilizado en el handball, disponible en diferentes tamaños que se usan de acuerdo con las distintas categorías de edad."
  },
  {
    "title": "Banco de suplentes",
    "desc": "Un banco en la zona de cambios donde los jugadores suplentes deben permanecer sentados."
  },
  {
    "title": "Tarjeta azul",
    "desc": "Los árbitros pueden mostrar una tarjeta azul además de la tarjeta roja en caso de una 'descalificación debido a una acción particularmente temeraria, particularmente peligrosa, premeditada o maliciosa', la cual también incluirá un informe escrito."
  },
  {
    "title": "Fallo / Decisión",
    "desc": "La decisión tomada por un árbitro."
  },
  {
    "title": "Línea central",
    "desc": "Línea que divide el terreno de juego en dos mitades, marcando el lugar donde se realiza el saque de centro."
  },
  {
    "title": "Cambio de lado",
    "desc": "Después del descanso del entretiempo (o a veces después del sorteo con moneda), los equipos cambian de lado."
  },
  {
    "title": "Cambio de arqueros",
    "desc": "El arquero sale del terreno de juego para ser reemplazado por el arquero suplente. Esto puede ocurrir durante el partido o antes de que se ejecute un penal."
  },
  {
    "title": "Elección de lado",
    "desc": "Después del sorteo con moneda, se permite a los equipos decidir en qué lado desean tener su zona de cambios y su arco."
  },
  {
    "title": "Aclaración(es)",
    "desc": "Utilizada para hacer más clara una declaración o enunciado de las Reglas de Juego."
  },
  {
    "title": "Sorteo con moneda",
    "desc": "La práctica de lanzar una moneda al aire para elegir entre dos alternativas."
  },
  {
    "title": "Traspasar la línea de banda",
    "desc": "La pelota sale del terreno de juego por la línea de banda."
  },
  {
    "title": "Traspasar la línea de gol",
    "desc": "La pelota está dentro del arco."
  },
  {
    "title": "Anulación de un gol",
    "desc": "El árbitro decide no validar un tanto debido a cualquier irregularidad previa al mismo."
  },
  {
    "title": "Descalificación",
    "desc": "Un jugador puede ser descalificado por los árbitros en una serie de casos especificados en el reglamento. En este caso, el árbitro muestra al jugador la tarjeta roja y este no puede regresar al terreno de juego por el resto del partido."
  },
  {
    "title": "Doble drible (infracción)",
    "desc": "Una infracción personal sancionada a un jugador que utiliza las dos manos para driblear o que se detiene con la pelota y comienza a driblear nuevamente."
  },
  {
    "title": "Sistema de timeout electrónico ('chicharra')",
    "desc": "Se utiliza un sistema electrónico de timeout de equipo en lugar de las tarjetas verdes físicas. Un botón está conectado al sistema del tablero oficial y, al presionarlo, el tiempo se detiene inmediatamente. El timeout también se indica mediante una señal acústica (chicharra)."
  },
  {
    "title": "Arco vacío",
    "desc": "Un equipo puede estar en el terreno de juego con siete jugadores de campo al mismo tiempo. Este es el caso si un jugador de campo sustituye a un arquero y, en consecuencia, su arco permanece vacío."
  },
  {
    "title": "Poner en peligro",
    "desc": "Causar peligro de lesión al adversario mediante cualquier contacto físico."
  },
  {
    "title": "Equipamiento / Vestimenta",
    "desc": "El uniforme y la vestimenta deportiva de los jugadores."
  },
  {
    "title": "Juego limpio",
    "desc": "Conformidad con las reglas establecidas; conducta íntegra y condiciones equitativas; conformidad con las reglas, el espíritu y la ética del deporte. Puede considerarse el ethos del deporte."
  },
  {
    "title": "Cambio antirreglamentario",
    "desc": "Situación en la que un jugador sale del terreno de juego fuera de la zona de cambios o ingresa al campo antes de que su compañero lo haya abandonado."
  },
  {
    "title": "Terreno de juego",
    "desc": "La cancha; una zona rectangular especialmente marcada dentro de la cual se desarrolla el partido."
  },
  {
    "title": "Señal final (silbato)",
    "desc": "El tiempo de juego finaliza con la señal final automática del tablero o del cronometrador. Si no se produce dicha señal, el árbitro hace sonar su silbato para indicar que el tiempo de juego ha terminado."
  },
  {
    "title": "Pie",
    "desc": "Una falta que se comete cuando un jugador toca la pelota con el pie o la canilla, entregándose la posesión al equipo adversario."
  },
  {
    "title": "Gesto de advertencia",
    "desc": "Un gesto manual específico de los árbitros que advierte con anticipación (para el juego pasivo)."
  },
  {
    "title": "Lanzamiento franco",
    "desc": "Un lanzamiento franco reanuda el juego tras una interrupción de los árbitros; cuando se comete una infracción de las reglas, el equipo afectado obtiene la posesión de la pelota desde el lugar donde ocurrió la infracción, sin defensores a menos de 3 metros."
  },
  {
    "title": "Línea de lanzamiento franco",
    "desc": "Línea de nueve metros que los jugadores atacantes deben abandonar antes de ejecutar un lanzamiento franco tras una falta ocurrida dentro de la misma."
  },
  {
    "title": "Final del partido",
    "desc": "El fin del juego; culminación de ambos períodos de juego (60 minutos en total)."
  },
  {
    "title": "Falta de recepción",
    "desc": "Ocurre cuando un jugador que tiene el control de la pelota la deja caer o la manipula defectuosamente mientras está en juego."
  },
  {
    "title": "Administración del partido",
    "desc": "El proceso conjunto del arbitraje dentro y fuera del terreno de juego relativo a un partido oficial, de acuerdo con las reglas de juego y los reglamentos vigentes de la competición. Implica la coordinación de tareas y actividades de los árbitros y oficiales (incluidos el cronometrador y el anotador) antes, durante y después del partido."
  },
  {
    "title": "Arco / Gol",
    "desc": "La estructura delimitada por dos postes y un travesaño en los dos extremos del terreno de juego; o la acción de convalidar un tanto."
  },
  {
    "title": "Área de arco",
    "desc": "Una zona en forma de 'D' a seis metros del arco que es de uso exclusivo para el arquero."
  },
  {
    "title": "Línea del área de arco",
    "desc": "La línea que define el área de arco; también llamada \"línea de seis metros\"."
  },
  {
    "title": "Red del arco",
    "desc": "Red sujeta a los postes del arco de tal manera que la pelota no pueda rebotar ni pasar a través de ella hacia afuera."
  },
  {
    "title": "Saque de arco",
    "desc": "Cuando la pelota traspasa la línea exterior de gol (línea de fondo) por fuera del arco, se concede un saque de arco."
  },
  {
    "title": "Línea de limitación del arquero",
    "desc": "Una línea a cuatro metros de la línea de gol que marca el límite máximo hasta donde un arquero puede adelantarse para defender un lanzamiento de 7 metros (penal); conocida como \"línea de cuatro metros\"."
  },
  {
    "title": "Tiempo / Período",
    "desc": "El tiempo (30 minutos) durante el cual se juega. Un partido de handball consta de dos tiempos de 30 minutos."
  },
  {
    "title": "Entretiempo / Descanso",
    "desc": "El intervalo de descanso entre los dos períodos de juego, que dura habitualmente 10 minutos."
  },
  {
    "title": "Infracción",
    "desc": "Violación de una norma tal como está estipulada en las Reglas de Juego."
  },
  {
    "title": "Inspección del campo",
    "desc": "Antes del inicio del partido, los árbitros verifican las condiciones de los arcos y del terreno de juego."
  },
  {
    "title": "Interrupción",
    "desc": "El juego se detiene temporalmente."
  },
  {
    "title": "Decisión conjunta",
    "desc": "Los árbitros pueden consultarse entre sí durante un partido para alcanzar una decisión común."
  },
  {
    "title": "Indumentaria (uniforme)",
    "desc": "Todas las prendas y equipamiento que usan los jugadores en un partido. Debe diferenciarlos claramente del arquero y del equipo rival."
  },
  {
    "title": "Falta de ataque",
    "desc": "Una falta cometida por un jugador atacante; contacto ilegal provocado por el equipo con posesión de la pelota."
  },
  {
    "title": "Arbitraje / Arbitrar",
    "desc": "Ejercer las funciones de árbitro en un partido."
  },
  {
    "title": "Fuera de juego / Pelota muerta",
    "desc": "Cuando la pelota no está en juego, el partido se reanuda con el lanzamiento correspondiente al motivo de la interrupción."
  },
  {
    "title": "Línea exterior de gol",
    "desc": "Línea que marca el final del terreno de juego, sin incluir la línea de gol que queda entre los postes; también llamada 'línea de fondo'."
  },
  {
    "title": "Prórroga / Tiempo extra",
    "desc": "De acuerdo con los reglamentos de la competición, si un partido termina en empate, puede jugarse una prórroga. Consta de dos tiempos de cinco minutos con un minuto de descanso entre ellos."
  },
  {
    "title": "Juego pasivo",
    "desc": "Ocurre cuando el equipo atacante no realiza una progresión suficiente en su intento de lanzar al arco."
  },
  {
    "title": "Sanción disciplinaria",
    "desc": "Las infracciones a las reglas pueden dar lugar a sanciones disciplinarias personales por parte del árbitro. Pueden comenzar con una amonestación y continuar con castigos más severos como la descalificación, etc."
  },
  {
    "title": "Terreno de juego",
    "desc": "Superficie rectangular donde se desarrolla el juego."
  },
  {
    "title": "Tiempo de juego",
    "desc": "Un partido oficial consta de dos tiempos de 30 minutos."
  },
  {
    "title": "Sanción progresiva",
    "desc": "El sistema de disciplina arbitral donde la severidad de las sanciones aumenta ante infracciones reincidentes."
  },
  {
    "title": "Protesta / Reclamación",
    "desc": "Una objeción o queja formal dirigida a la Comisión de Competición, presentada si existen motivos para suponer una aplicación incorrecta de las reglas."
  },
  {
    "title": "Sistema de intercomunicación por radio",
    "desc": "Sistema de comunicación inalámbrico utilizado por los árbitros para mantenerse en contacto constante entre sí y coordinar todas las decisiones cruciales del partido."
  },
  {
    "title": "Reingreso",
    "desc": "Un jugador que ha cumplido una exclusión por dos minutos tiene permitido ingresar nuevamente al terreno de juego."
  },
  {
    "title": "Planilla de juego / Lista de equipo",
    "desc": "Jugadores autorizados y aptos para disputar el partido (máximo 16 por equipo)."
  },
  {
    "title": "Sanción",
    "desc": "Cualquier forma de penalización o castigo disciplinario aplicado por el árbitro."
  },
  {
    "title": "Resultado / Tanteador",
    "desc": "El marcador o resultado numérico final del partido."
  },
  {
    "title": "Tablero marcador",
    "desc": "Pantalla electrónica visible fijada en el pabellón que muestra el período de juego, el tiempo transcurrido, el resultado y que también emite la señal de finalización."
  },
  {
    "title": "Cumplir una exclusión de 2 minutos",
    "desc": "El jugador sancionado debe permanecer en el banco de suplentes durante dos minutos cronometrados."
  },
  {
    "title": "Línea de banda",
    "desc": "Las líneas laterales que delimitan el terreno de juego. Las líneas perpendiculares a esta son las líneas de gol y de fondo."
  },
  {
    "title": "Cambio / Sustitución",
    "desc": "Ingreso de un jugador al campo para reemplazar a un compañero. No puede realizarse hasta que el jugador saliente haya abandonado completamente el terreno. Debe hacerse obligatoriamente dentro de la zona de cambios propia."
  },
  {
    "title": "Tecnología de la zona de cambios",
    "desc": "Sistema de microcámaras que proporciona una vista detallada de ambas zonas de cambios, ofreciendo asistencia de video para decisiones complejas en esa área."
  },
  {
    "title": "Línea de zona de cambios",
    "desc": "Línea reglamentaria que delimita el espacio por donde se permiten efectuar los cambios de jugadores."
  },
  {
    "title": "Exclusión",
    "desc": "Forma de sanción disciplinaria temporal que consiste en una salida obligatoria por dos minutos."
  },
  {
    "title": "Mesa de control",
    "desc": "Ubicada entre los bancos de suplentes. Desde allí, el partido es supervisado por los oficiales asignados (delegado, anotador y cronometrador)."
  },
  {
    "title": "Timeout de equipo",
    "desc": "Interrupción del juego solicitada por el equipo que tiene la posesión de la pelota (máximo 3 por partido, no más de 2 por tiempo)."
  },
  {
    "title": "Falta técnica",
    "desc": "Errores técnicos reglamentarios como pasos, dobles, invasión del área de arco o fallos de manejo que provocan la pérdida de la posesión (pérdida de pelota)."
  },
  {
    "title": "Oficiales técnicos",
    "desc": "Los árbitros, delegados y oficiales de mesa de la federación."
  },
  {
    "title": "Saque de banda",
    "desc": "Lanzamiento utilizado para reanudar el juego después de que la pelota ha traspasado la línea de banda."
  },
  {
    "title": "Saque de centro",
    "desc": "El lanzamiento inicial ejecutado al comienzo del partido, después de cada gol y tras el entretiempo."
  },
  {
    "title": "Zona de saque de centro",
    "desc": "Un círculo con un diámetro de cuatro metros situado en medio de la línea central, desde donde se ejecuta obligatoriamente el saque de centro."
  },
  {
    "title": "Cronometrador y anotador",
    "desc": "Personas designadas oficiales de mesa para cronometrar el tiempo y registrar los goles y sanciones en la planilla oficial de juego."
  },
  {
    "title": "Time-out / Detención del tiempo",
    "desc": "Interrupción u orden de detener el reloj del partido por una circunstancia particular decidida por los árbitros."
  },
  {
    "title": "Pasos / Caminar",
    "desc": "Infracción reglamentaria que ocurre cuando un jugador da más de tres pasos sin driblear la pelota."
  },
  {
    "title": "Pérdida de pelota",
    "desc": "Ocurre cuando un equipo cede la posesión al equipo rival al perder la pelota por cualquier circunstancia (pase interceptado, tiro errado, infracción técnica)."
  },
  {
    "title": "Conducta antideportiva",
    "desc": "Acciones de un jugador, oficial o equipo que resulten inapropiadas en el contexto del juego. No necesariamente violan una regla técnica específica, pero son reprobadas por el espíritu deportivo, los jugadores y espectadores."
  },
  {
    "title": "Prueba de video",
    "desc": "Registro fílmico de una jugada que puede reproducirse inmediatamente (por ejemplo, en cámara lenta) tras finalizar la acción, ofreciendo a los árbitros la posibilidad de revisar la situación en una pantalla antes de tomar una decisión definitiva."
  },
  {
    "title": "Amonestación",
    "desc": "Sanción con tarjeta amarilla mostrada por el árbitro como primer escalón de la estructura de sanción progresiva."
  },
  {
    "title": "Toque de silbato para saque de centro",
    "desc": "La señal acústica que realiza el árbitro para dar inicio o reanudación formal al juego."
  },
  {
    "title": "Señal de silbato",
    "desc": "Indicación o pitido característico del silbato del árbitro para impartir justicia."
  }
])

// Datos en Inglés
const glossaryEn = ref([
  {
    "title": "3 metres",
    "desc": "Opponents are not allowed to stay closer than three metres to the player taking a free throw or throw-in."
  },
  {
    "title": "3 steps",
    "desc": "A player holding the ball is only allowed to take three steps, afterwards he/she has to dribble or pass the ball."
  },
  {
    "title": "7 vs 6",
    "desc": "A team can take the goalkeeper out to add an additional attacking player. This gives the team the numerical advantage in attack and increases the number of court players to seven."
  },
  {
    "title": "7m line",
    "desc": "A line seven metres from the goal indicating from where the penalty throw is to be executed."
  },
  {
    "title": "7m throw",
    "desc": "A type of free-throw taken from out of the goal area line (approximately 6m.) and with only the goalkeeper of the defending team between the penalty taker and the goal"
  },
  {
    "title": "Advantage (rule of)",
    "desc": "A clause in the Rules of the Game that gives the referees the discretion to allow play to continue even after a foul has been committed if stopping play would unfairly punish the fouled team."
  },
  {
    "title": "Assault",
    "desc": "A forceful and deliberate attack against the body of another person."
  },
  {
    "title": "Assist",
    "desc": "A player completes an assist pass when his pass leads directly to a goal by a teammate."
  },
  {
    "title": "Ball",
    "desc": "Round object used in handball and available in different sizes utilised accordingly across the different age categories."
  },
  {
    "title": "Bench",
    "desc": "A bench in the substitution area where the substitute players have to remain seated."
  },
  {
    "title": "Blue card",
    "desc": "Referees may show a blue card in addition to the red card in the case of a 'disqualification due to a particularly reckless, particularly dangerous, premeditated or malicious action' which will also include a written report."
  },
  {
    "title": "Call",
    "desc": "The decision made by a referee."
  },
  {
    "title": "Centre line",
    "desc": "Line cutting the court in two halves marking the spot of the throw off."
  },
  {
    "title": "Change of sides",
    "desc": "After the half-time break (or sometimes after coin toss) the teams change sides."
  },
  {
    "title": "Changing goalkeepers",
    "desc": "The goalkeeper leaves court to be replaced by the substitute goalkeeper. This can occur during the game or before a penalty is executed."
  },
  {
    "title": "Choice of sides",
    "desc": "After the coin toss, the teams are allowed to decide which side they want to have their substitution area and goal."
  },
  {
    "title": "Clarification(s)",
    "desc": "Used to make a statement (from the Rule of the Game) clearer."
  },
  {
    "title": "Coin Toss",
    "desc": "The practice of throwing a coin in the air to choose between two alternatives."
  },
  {
    "title": "Cross the sideline",
    "desc": "The ball leaves the playing court on the side."
  },
  {
    "title": "Crossed the goal line",
    "desc": "The ball is in the goal."
  },
  {
    "title": "Disallowing a goal",
    "desc": "The referee decides not to validate a score for any irregularity preceding it."
  },
  {
    "title": "Disqualification",
    "desc": "A player may be disqualified by the referees for a number of cases specified in the regulations. In this case the referee shows the player the red card and he cannot return on court for the remaining part of the game."
  },
  {
    "title": "Double dribble (violation)",
    "desc": "A personal violation given to a player that either uses two hands to dribble or stops with the ball and starts dribbling again."
  },
  {
    "title": "Electronic team timeout system ('buzzer')",
    "desc": "An electronic team timeout system is used instead of the team timeout 'green' cards. A button is linked to the official scoreboard system, and, when pressed, the time is immediately stopped. The timeout is also indicated by an audio signal (buzzer)."
  },
  {
    "title": "Empty goal",
    "desc": "A team may be on the court with seven field players at the same time. This is the case if a court player substitutes a goalkeeper and, consequently, their goal stays empty."
  },
  {
    "title": "Endanger",
    "desc": "To cause danger of injury to the opponent with any physical contact."
  },
  {
    "title": "Equipment",
    "desc": "The uniform and sports equipment of the players."
  },
  {
    "title": "Fair Play",
    "desc": "Conformity to established rules; upright conduct and equitable conditions; conformity to the rules, spirit, and etiquette of sport. Can be considered the ethos of sport."
  },
  {
    "title": "Faulty substitution",
    "desc": "A situation where player leaves the court outside substitution area or enters the court before his teammate has left the court."
  },
  {
    "title": "Field of play (FOP)",
    "desc": "The court; a specially marked rectangular area within which the game is played."
  },
  {
    "title": "Final signal (whistle)",
    "desc": "The playing time ends with the automatic final signal from the scoreboard or from the timekeeper. If no such signal comes, the referee whistles to indicate that the playing time is over."
  },
  {
    "title": "Foot",
    "desc": "A foul when a player touches the ball with his foot or shin and the ball is given to the opponent team."
  },
  {
    "title": "Forewarning (signal)",
    "desc": "A specific hand signal by the referees warning in advance or beforehand (for passive play)."
  },
  {
    "title": "Free throw",
    "desc": "A free throw restarts the play after an interruption by the referees; when an infraction of the rules is committed the team fouled gets possession of the ball from the spot where the infraction took place without being defended closer than 3m."
  },
  {
    "title": "Free throw line",
    "desc": "Nine-metre line that the players have to leave before executing a free throw after a foul that occurred inside the nine-meter line."
  },
  {
    "title": "Full-time",
    "desc": "The end of the game; culmination of both playing periods (60 minutes)."
  },
  {
    "title": "Fumbling",
    "desc": "Occurs when a player, who has possession of the ball, drops or mishandles the ball that is in play."
  },
  {
    "title": "Game administration",
    "desc": "The combined process of on and off court officiating related to an official match in accordance with the rules of the game and the regulations valid for the respective competition the match belongs to. It means the coordination of tasks and activities by both referees and delegates (including timekeeper and scorekeeper) before, during and after the match."
  },
  {
    "title": "Goal",
    "desc": "The area marked by two posts and a crossbar on the two ends of the playing court."
  },
  {
    "title": "Goal area",
    "desc": "A D-shaped area six metres from the goal that is used only by the goalkeeper."
  },
  {
    "title": "Goal area line",
    "desc": "The line that defines the goal area; also called the \"six-metre line\"."
  },
  {
    "title": "Goal net",
    "desc": "A net attached to the goalposts in a way that the ball cannot rebound or pass through the goal."
  },
  {
    "title": "Goalkeeper throw",
    "desc": "When the ball crosses the outer goal line a goalkeeper throw is awarded."
  },
  {
    "title": "Goalkeeper`s restraining line",
    "desc": "A line four metres from the goal line, that marks the limit where a goalkeeper may advance to defend against a penalty throw; also known as the “four-metre line”."
  },
  {
    "title": "Half",
    "desc": "The time (30') during which play proceeds. A handball match consists of two halves 30' minutes."
  },
  {
    "title": "Half-time",
    "desc": "The intermission between the periods of the play which lasts 10 minutes."
  },
  {
    "title": "Infraction, infringement",
    "desc": "violation of a rule as transcribed in the Rule of the Game."
  },
  {
    "title": "Inspecting the playing court",
    "desc": "Prior to the start of the match, the referees check the goals and the playing court."
  },
  {
    "title": "Interruption",
    "desc": "The game is stopped."
  },
  {
    "title": "Joint decision",
    "desc": "The referees may consult each other during a game to reach a common decision."
  },
  {
    "title": "Kit (uniform)",
    "desc": "All garments and equipment worn by players involved in a match. It must differentiate them from the goalkeeper and the opponent team."
  },
  {
    "title": "Offensive foul",
    "desc": "A foul committed by an offensive player; illegal contact committed by an offensive player."
  },
  {
    "title": "Officiating",
    "desc": "To serve as a referee."
  },
  {
    "title": "Out of play",
    "desc": "When the ball is out of play, the game restarts with a throw corresponding to the reason of the interruption."
  },
  {
    "title": "Outer goal line",
    "desc": "A line marking the end of the court, not including the goal line; also called the 'back line'."
  },
  {
    "title": "Overtime",
    "desc": "According to the competition regulations, when a match ends in a draw, an overtime period may follow. This is played in two halves of five minutes with a one-minute break between them."
  },
  {
    "title": "Passive play",
    "desc": "Occurs when the attacking team does not make sufficient progress in attempting to score a goal."
  },
  {
    "title": "Personal punishment",
    "desc": "Violations to the rule may lead to personal punishment awarded by the referee. This may begin with a warning, followed by more severe punishments such as disqualification, etc."
  },
  {
    "title": "Playing court",
    "desc": "Area where the game is played."
  },
  {
    "title": "Playing time",
    "desc": "A handball match consists of two halves of 30 minutes."
  },
  {
    "title": "Progressive punishment",
    "desc": "The system of discipline where the penalties increase upon repeated occurrences."
  },
  {
    "title": "Protest",
    "desc": "A formal objection (or complaint) addressed to the Competition Management and submitted if there is a reason to suggest the incorrect application of rules."
  },
  {
    "title": "(referee) Radio communication system",
    "desc": "A wireless communication system is used by the referees to stay constantly in contact with each other and be able to communicate about all crucial decisions during a match."
  },
  {
    "title": "Re-enter",
    "desc": "A player that has been punished with a two-minute suspension is allowed to enter the playing court again."
  },
  {
    "title": "Roster",
    "desc": "Players who are eligible to play on the day of the game (max 16)."
  },
  {
    "title": "Sanction",
    "desc": "Any form of penalisation by the referee."
  },
  {
    "title": "Score",
    "desc": "The result of the game."
  },
  {
    "title": "Scoreboard",
    "desc": "A clearly visible electronic board (or cube) affixed within the playing venue that displays the playing period, time elapsed, the score, and will also signal the end of the playing period."
  },
  {
    "title": "Serving a 2-minute suspension",
    "desc": "The player stays on the substitution bench for two minutes after receiving a suspension."
  },
  {
    "title": "Sideline",
    "desc": "The lines which mark the outer boundaries of a court. The opposite of a sideline is a goal line."
  },
  {
    "title": "Substitution",
    "desc": "Player entering the court to replace a teammate. A substitution may not be made until the other player has left the court. Players must enter and leave the playing area on their own half of the court and inside the substitution area."
  },
  {
    "title": "Substitution area technology",
    "desc": "A system (micro cameras) providing a detailed view of both substitution areas, offering video assistance in case of decisions that concern the substitution areas."
  },
  {
    "title": "Substitution line",
    "desc": "Line that marks the area where the substitutions are allowed."
  },
  {
    "title": "Suspension",
    "desc": "Form of personal punishment, a two minute suspension."
  },
  {
    "title": "Table",
    "desc": "Located between the team benches. From here, the match is observed by nominated persons i.e. Delegate, Scorekeeper, and the timekeeper."
  },
  {
    "title": "Team timeout",
    "desc": "A stop in play requested by the team with the possession of the ball (3 per match)."
  },
  {
    "title": "Technical fault",
    "desc": "Technical mistakes such as steps, dribble mistakes, goal area infringement (rule technical faults) or by ball handling mistakes that lead to a loss of possession, a so called turnover."
  },
  {
    "title": "Technical officials (TOs)",
    "desc": "The EHF referees, delegates, and table officials."
  },
  {
    "title": "Throw-in",
    "desc": "The play used to restart play after the ball has gone over the sideline."
  },
  {
    "title": "Throw-off",
    "desc": "The first throw taken at the beginning of a game, after every goal, and after halftime."
  },
  {
    "title": "Throw-off area",
    "desc": "A circle with a diameter of four metres, from where throw-off is taken, placed in the middle of the centre line."
  },
  {
    "title": "Timekeeper and scorekeeper",
    "desc": "Persons nominated to observe the match from the table, and responsible for marking he time and registering the scores for the match report."
  },
  {
    "title": "Timeout",
    "desc": "Stoppage in the match for a short amount of time."
  },
  {
    "title": "Travelling",
    "desc": "A violation of the rules that occurs when a player takes too many steps without dribbling the ball."
  },
  {
    "title": "Turnover",
    "desc": "A turnover occurs when a team gives possession to the opposing team by losing the ball by any means (pass being intercepted, missed shot, infraction of the rules)."
  },
  {
    "title": "Unsportsmanlike conduct",
    "desc": "A player, official or team who have acted inappropriately in the context of the game, not necessary illegal according to the Rules of the Game but depreciated by the vast majority of both players and spectators."
  },
  {
    "title": "Video replay",
    "desc": "A video recording of an action (such as a play) that can be played back (as in slow motion) immediately after the action has been completed, offering the referees the possibility to watch a situation on TV before reaching a decision."
  },
  {
    "title": "Warning",
    "desc": "Yellow card punishment awarded by the referee as a first measure of progressive punishment."
  },
  {
    "title": "Whistle for the throw-off",
    "desc": "The referee gives the signal to start the game."
  },
  {
    "title": "Whistle signal",
    "desc": "Signal of the referee."
  }
])
</script>

<style scoped>
/* ====================================================
   FONDO GENERAL Y SECCIÓN
   ==================================================== */
.dark-background-section {
  background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('../../assets/fotos/cursos-background.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

/* ====================================================
   NAVEGACIÓN TABS
   ==================================================== */
.nav-pills .nav-link {
  color: #fff;
  background-color: transparent;
  border: 1px solid #6c757d;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-pills .nav-link.active,
.nav-pills .show > .nav-link {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

/* ====================================================
   TABLA ESTILOS
   ==================================================== */
.table {
  --bs-table-bg: transparent;
  --bs-table-color: #fff;
}

.table-hover tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Animación de entrada general */
.animate__animated {
  animation-duration: 0.8s;
}
</style>
