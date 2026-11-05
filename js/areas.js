function renderAreas() {

  actualizarNavbar('areas')

  const app = document.getElementById('app')

  const areas = DATOS_APP.jerarquia.jerarquia || []

  app.innerHTML = `
    <section class="areas-view">

      <aside class="menu-lateral">

        <div class="tarjeta-info-menu tarjeta-info-mobile">

          <h2>
            Áreas operacionales
          </h2>

          <p>
            Selecciona un área para ingresar al detalle operacional
            de sus subáreas, sistemas e instrumentos.
          </p>

        </div>

        <div class="titulo-areas-con-info">

          <h1 class="titulo">
            Listado de Áreas
          </h1>

          <button
            class="info-button-dashboard"
            onclick="mostrarInfoAreas(event)"
            aria-label="Información sobre las áreas de la planta"
          >
            ?
          </button>

        </div>

        ${areas.map(item => `
          <button
            class="card-area"
            onclick="renderSubareas('${item.area}')"
          >
            Área ${item.area}
          </button>
        `).join('')}

      </aside>

      <section class="contenido-area">

        <div class="overlay-area"></div>

        <div class="bienvenida tarjeta-info-contenido">

          <h2>
            Áreas operacionales
          </h2>

          <p>
            Selecciona un área de la planta para revisar su estructura
            operacional, navegar por sus subáreas y acceder a los sistemas
            e instrumentos monitoreados.
          </p>

        </div>

      </section>

    </section>
  `
}


/* =========================================================
   INFORMACIÓN DE ÁREAS
   ========================================================= */

function mostrarInfoAreas(event) {

  if (event) {
    event.stopPropagation()
  }

  const contenido = `
    <div class="info-alerta-subtitulo">

      <h4>
        ¿Qué representa esta sección?
      </h4>

      <p>
        Esta sección muestra las distintas áreas operacionales de la planta
        que forman parte del sistema de monitoreo.
      </p>

      <p class="info-area-parrafo">
        Cada área representa un sector determinado de la operación y agrupa
        sus respectivas subáreas, sistemas e instrumentos, permitiendo
        navegar progresivamente hasta visualizar los equipos monitoreados
        y sus alertas asociadas.
      </p>

    </div>

    <div class="info-separador"></div>

    <div class="info-alerta-subtitulo">

      <h4>
        Áreas de la planta
      </h4>

      <p>
        Las áreas se encuentran identificadas mediante una numeración que
        permite organizar los distintos sectores y etapas operacionales
        de la planta.
      </p>

    </div>

    <div class="info-tipos-lista">


      <div class="info-tipo-item">

        <strong>
          Área 3100 — Servicios Generales
        </strong>

        <span>
          Agrupa servicios generales necesarios para el funcionamiento
          de la planta, incluyendo servicios como agua potable y suministro
          de agua utilizada en el proceso minero.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3200 — Área Húmeda
        </strong>

        <span>
          Corresponde al sector de la planta asociado a las operaciones
          desarrolladas dentro del Área Húmeda.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3300 — Acopio y Roughers
        </strong>

        <span>
          Agrupa los sectores correspondientes al acopio y a los equipos
          Rougher asociados a esta etapa de la operación.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3400 — Molinos
        </strong>

        <span>
          Corresponde al sector donde se encuentran agrupados los molinos
          y los sistemas asociados a esta etapa del proceso.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3500 — Tanques y bombas
        </strong>

        <span>
          Agrupa sistemas asociados a tanques y bombas pertenecientes
          a esta etapa de la operación.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3600 — Espesador de Concentrado
        </strong>

        <span>
          Corresponde al sector asociado al espesamiento de concentrado
          y a los sistemas e instrumentos involucrados en esta etapa.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3700 — Espesador de Relaves
        </strong>

        <span>
          Corresponde al sector asociado al espesamiento de relaves
          y a los sistemas que forman parte de esta etapa del proceso.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 3800 — Bombas GEHO
        </strong>

        <span>
          Agrupa las bombas GEHO y los sistemas e instrumentos asociados
          a su monitoreo operacional.
        </span>

      </div>


      <div class="info-tipo-item">

        <strong>
          Área 4100 — Concentraducto
        </strong>

        <span>
          Corresponde al sector asociado al concentraducto y a los sistemas
          e instrumentos utilizados para monitorear su operación.
        </span>

      </div>


    </div>

    <div class="info-alerta-nota">

      <strong>
        ¿Cómo utilizar esta sección?
      </strong>

      Selecciona un área para visualizar las subáreas que la componen
      y continuar navegando hacia sus sistemas, instrumentos y alertas
      asociadas.

    </div>
  `

  abrirModalInfoAreas(
    'Áreas de la planta',
    contenido
  )
}


/* =========================================================
   MODAL DE INFORMACIÓN DE ÁREAS
   ========================================================= */

function abrirModalInfoAreas(titulo, contenido) {

  cerrarModalInfoAreas()

  const modal = document.createElement('div')

  modal.id = 'modal-info-areas'
  modal.className = 'modal-info-dashboard'

  modal.innerHTML = `
    <div
      class="modal-info-dashboard-overlay"
      onclick="cerrarModalInfoAreas()"
    ></div>

    <div
      class="modal-info-dashboard-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-info-areas"
    >

      <div class="modal-info-dashboard-header">

        <h3 id="titulo-modal-info-areas">
          ${titulo}
        </h3>

        <button
          class="modal-info-dashboard-close"
          onclick="cerrarModalInfoAreas()"
          aria-label="Cerrar ventana de información"
        >
          ×
        </button>

      </div>

      <div class="modal-info-dashboard-body">
        ${contenido}
      </div>

    </div>
  `

  document.body.appendChild(modal)

  document.body.style.overflow = 'hidden'
}


/* =========================================================
   CERRAR MODAL DE ÁREAS
   ========================================================= */

function cerrarModalInfoAreas() {

  const modal =
    document.getElementById('modal-info-areas')

  if (modal) {
    modal.remove()
  }

  document.body.style.overflow = ''
}


/* =========================================================
   CERRAR CON ESC
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Escape') {
      cerrarModalInfoAreas()
    }

  }
)