let SISTEMAS_SELECCIONADOS = []

function renderSistemas(area, subarea) {

  actualizarNavbar('areas')

  const app = document.getElementById('app')

  const subareaEncontrada = obtenerSubarea(area, subarea)

  if (!subareaEncontrada) {

    app.innerHTML = `
      <p>
        No se encontró la subárea ${subarea}
      </p>
    `

    return
  }

  SISTEMAS_SELECCIONADOS = []

  app.innerHTML = `
    <section class="sistemas-view">

      <div
        class="overlay-sistemas-mobile"
        onclick="cerrarPanelSistemas()"
      ></div>

      <aside class="menu-lateral sistemas-menu">

        <button
          class="flecha-volver"
          onclick="renderSubareas('${area}')"
        >
          ←
        </button>

        <h1 class="titulo-sistemas">
          Sistemas de ${subarea}
        </h1>

        <div class="acciones-sistemas">

          <button
            class="btn-accion"
            onclick="seleccionarTodo('${area}', '${subarea}')"
          >
            Seleccionar todo
          </button>

          <button
            class="btn-accion btn-limpiar"
            onclick="limpiarSeleccion('${area}', '${subarea}')"
          >
            Limpiar selección
          </button>

        </div>

        <div class="selector-lista">

          ${subareaEncontrada.sistemas.map(sistema => `
            <button
              class="card-sistema"
              data-sistema="${sistema}"
              onclick="toggleSistema(
                '${area}',
                '${subarea}',
                '${sistema}',
                this
              )"
            >
              ${sistema}
            </button>
          `).join('')}

        </div>

      </aside>

      <section class="contenido-sistemas">

        <button
          class="info-button-sistemas"
          onclick="mostrarInfoSistemas(event)"
          aria-label="Información sobre los sistemas"
        >
          ?
        </button>

        <button
          class="btn-volver-sistema-mobile"
          onclick="renderSubareas('${area}')"
        >
          <img
            src="assets/icon-volver.svg"
            alt="Volver"
          >
        </button>

        <div class="encabezado-sistemas-mobile">

          <h2 class="titulo-area">
            Área ${area}
          </h2>

          <p class="subtitulo-subarea">
            ${subarea}
          </p>

          <button
            class="btn-abrir-sistemas"
            onclick="abrirPanelSistemas()"
          >
            ☰ Seleccionar sistemas
          </button>

        </div>

        <div id="tabla-alertas-sistema"></div>

      </section>

    </section>
  `

  renderAlertasSeleccionadas(area, subarea)
}


/* =========================================================
   INFORMACIÓN DE SISTEMAS
   ========================================================= */

function mostrarInfoSistemas(event) {

  if (event) {
    event.stopPropagation()
  }

  const contenido = `
    <div class="info-alerta-subtitulo">

      <h4>
        ¿Qué es un sistema?
      </h4>

      <p>
        Un sistema corresponde a un activo o componente físico de la planta
        cuya condición operacional es monitoreada mediante instrumentos
        asociados.
      </p>

      <p class="info-sistema-parrafo">
        Estos instrumentos permiten observar el comportamiento del activo
        y detectar posibles condiciones anómalas durante su operación.
      </p>

    </div>

    <div class="info-separador"></div>

    <div class="info-alerta-subtitulo">

      <h4>
        ¿Cómo se organiza dentro de la planta?
      </h4>

      <p>
        Cada sistema pertenece a una subárea específica y, por consecuencia,
        forma parte del área operacional a la que esa subárea se encuentra
        asociada.
      </p>

    </div>

    <div class="info-tipos-lista">

      <div class="info-tipo-item">

        <strong>
          Área
        </strong>

        <span>
          Representa una división operacional mayor dentro de la planta.
        </span>

      </div>

      <div class="info-tipo-item">

        <strong>
          Subárea
        </strong>

        <span>
          Corresponde a una división interna del área y puede contener uno
          o varios sistemas.
        </span>

      </div>

      <div class="info-tipo-item">

        <strong>
          Sistema
        </strong>

        <span>
          Es el activo o componente físico que se monitorea mediante uno
          o varios instrumentos para conocer su condición operacional.
        </span>

      </div>

      <div class="info-tipo-item">

        <strong>
          Instrumentos
        </strong>

        <span>
          Son los elementos que entregan las señales utilizadas para observar
          el comportamiento del sistema y generar alertas cuando se detectan
          condiciones anómalas.
        </span>

      </div>

    </div>

    <div class="info-alerta-nota">

      <strong>
        ¿Cómo utilizar esta sección?
      </strong>

      Selecciona uno o varios sistemas para visualizar las alertas activas
      de los instrumentos asociados a esos activos.

    </div>
  `

  abrirModalInfoSistemas(
    'Sistemas de la planta',
    contenido
  )
}


/* =========================================================
   MODAL DE INFORMACIÓN DE SISTEMAS
   ========================================================= */

function abrirModalInfoSistemas(titulo, contenido) {

  cerrarModalInfoSistemas()

  const modal = document.createElement('div')

  modal.id = 'modal-info-sistemas'
  modal.className = 'modal-info-dashboard'

  modal.innerHTML = `
    <div
      class="modal-info-dashboard-overlay"
      onclick="cerrarModalInfoSistemas()"
    ></div>

    <div
      class="modal-info-dashboard-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-info-sistemas"
    >

      <div class="modal-info-dashboard-header">

        <h3 id="titulo-modal-info-sistemas">
          ${titulo}
        </h3>

        <button
          class="modal-info-dashboard-close"
          onclick="cerrarModalInfoSistemas()"
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
   CERRAR MODAL DE SISTEMAS
   ========================================================= */

function cerrarModalInfoSistemas() {

  const modal =
    document.getElementById('modal-info-sistemas')

  if (modal) {
    modal.remove()
  }

  document.body.style.overflow = ''
}


/* =========================================================
   PANEL DE SISTEMAS
   ========================================================= */

function abrirPanelSistemas() {

  document
    .querySelector('.sistemas-menu')
    ?.classList.add('menu-abierto')

  document
    .querySelector('.overlay-sistemas-mobile')
    ?.classList.add('activo')
}


function cerrarPanelSistemas() {

  document
    .querySelector('.sistemas-menu')
    ?.classList.remove('menu-abierto')

  document
    .querySelector('.overlay-sistemas-mobile')
    ?.classList.remove('activo')
}


/* =========================================================
   SELECCIÓN DE SISTEMAS
   ========================================================= */

function toggleSistema(
  area,
  subarea,
  sistema,
  boton
) {

  const index =
    SISTEMAS_SELECCIONADOS.indexOf(sistema)

  if (index >= 0) {

    SISTEMAS_SELECCIONADOS.splice(index, 1)

    boton.classList.remove('sistema-activo')

  } else {

    SISTEMAS_SELECCIONADOS.push(sistema)

    boton.classList.add('sistema-activo')
  }

  renderAlertasSeleccionadas(
    area,
    subarea
  )
}


function seleccionarTodo(area, subarea) {

  const subareaEncontrada =
    obtenerSubarea(
      area,
      subarea
    )

  SISTEMAS_SELECCIONADOS = [
    ...subareaEncontrada.sistemas
  ]

  document
    .querySelectorAll('.card-sistema')
    .forEach(boton => {

      boton.classList.add(
        'sistema-activo'
      )
    })

  renderAlertasSeleccionadas(
    area,
    subarea
  )
}


function limpiarSeleccion(area, subarea) {

  SISTEMAS_SELECCIONADOS = []

  document
    .querySelectorAll('.card-sistema')
    .forEach(boton => {

      boton.classList.remove(
        'sistema-activo'
      )
    })

  renderAlertasSeleccionadas(
    area,
    subarea
  )
}


/* =========================================================
   OBTENER SUBÁREA
   ========================================================= */

function obtenerSubarea(area, subarea) {

  const areaEncontrada =
    obtenerArea(area)

  if (!areaEncontrada) {
    return null
  }

  return areaEncontrada
    .subareas
    .find(
      item =>
        item.subarea === subarea
    )
}


/* =========================================================
   CERRAR MODAL CON ESC
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Escape') {
      cerrarModalInfoSistemas()
    }

  }
)