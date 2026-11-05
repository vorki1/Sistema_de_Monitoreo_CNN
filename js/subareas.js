function renderSubareas(area) {

  actualizarNavbar('areas')

  const app = document.getElementById('app')

  const areaEncontrada = obtenerArea(area)

  if (!areaEncontrada) {

    app.innerHTML = `<p>No se encontró el área ${area}</p>`

    return
  }

  app.innerHTML = `
    <section class="subareas-view">

      <aside class="menu-lateral">

        <button
          class="flecha-volver"
          onclick="renderAreas()"
        ></button>

        <div class="tarjeta-info-menu tarjeta-info-mobile">

          <h2>
            Área ${area}
          </h2>

          <p>
            Selecciona una subárea para continuar hacia sus sistemas
            y alertas activas.
          </p>

        </div>

        <div class="titulo-subareas-con-info">

          <h1 class="titulo">
            Subáreas
          </h1>

          <button
            class="info-button-dashboard"
            onclick="mostrarInfoSubareas(event)"
            aria-label="Información sobre las subáreas"
          >
            ?
          </button>

        </div>

        ${ordenarSubareas(areaEncontrada.subareas).map(item => `
          <button
            class="card-area"
            onclick="renderSistemas('${area}', '${item.subarea}')"
          >
            ${item.subarea}
          </button>
        `).join('')}

      </aside>

      <section class="contenido-subarea">

        <div class="overlay-subarea"></div>

        <div class="panel-bienvenida tarjeta-info-contenido">

          <h2>
            Área ${area}
          </h2>

          <p>
            Esta vista muestra las subáreas asociadas al área seleccionada.
            Elige una subárea para consultar sus sistemas y visualizar
            las alertas activas.
          </p>

        </div>

      </section>

    </section>
  `
}


/* =========================================================
   INFORMACIÓN DE SUBÁREAS
   ========================================================= */

function mostrarInfoSubareas(event) {

  if (event) {
    event.stopPropagation()
  }

  const contenido = `
    <div class="info-alerta-subtitulo">

      <h4>
        ¿Qué es una subárea?
      </h4>

      <p>
        Una subárea corresponde a una división interna de un área de la planta.
        Permite separar y organizar sus distintas partes operacionales para
        facilitar la navegación y el monitoreo dentro del sistema.
      </p>

      <p class="info-subarea-parrafo">
        Cada área puede estar compuesta por una o varias subáreas, dependiendo
        de cómo se encuentre estructurado el proceso, los equipos y los sistemas
        asociados a ese sector de la planta.
      </p>

    </div>

    <div class="info-separador"></div>

    <div class="info-alerta-subtitulo">

      <h4>
        ¿Cómo se organizan?
      </h4>

      <p>
        Las subáreas representan partes específicas dentro de un área mayor.
        Por ejemplo, un área puede dividirse en sectores asociados a distintas
        etapas del proceso, zonas de operación, grupos de equipos o servicios.
      </p>

    </div>

    <div class="info-tipos-lista">

      <div class="info-tipo-item">

        <strong>
          División operacional
        </strong>

        <span>
          Cada subárea agrupa una parte específica de la operación dentro
          del área seleccionada.
        </span>

      </div>

      <div class="info-tipo-item">

        <strong>
          Organización de sistemas
        </strong>

        <span>
          Dentro de una subárea se encuentran los sistemas e instrumentos
          correspondientes a esa parte de la planta.
        </span>

      </div>

      <div class="info-tipo-item">

        <strong>
          Navegación hacia el detalle
        </strong>

        <span>
          Al seleccionar una subárea puedes continuar hacia sus sistemas
          y posteriormente revisar los instrumentos y alertas asociadas.
        </span>

      </div>

    </div>

    <div class="info-alerta-nota">

      <strong>
        ¿Cómo utilizar esta sección?
      </strong>

      Selecciona una subárea para visualizar los sistemas que pertenecen
      a esa parte del área y continuar hacia el monitoreo de sus instrumentos.

    </div>
  `

  abrirModalInfoSubareas(
    'Subáreas de la planta',
    contenido
  )
}


/* =========================================================
   MODAL DE INFORMACIÓN DE SUBÁREAS
   ========================================================= */

function abrirModalInfoSubareas(titulo, contenido) {

  cerrarModalInfoSubareas()

  const modal = document.createElement('div')

  modal.id = 'modal-info-subareas'
  modal.className = 'modal-info-dashboard'

  modal.innerHTML = `
    <div
      class="modal-info-dashboard-overlay"
      onclick="cerrarModalInfoSubareas()"
    ></div>

    <div
      class="modal-info-dashboard-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-info-subareas"
    >

      <div class="modal-info-dashboard-header">

        <h3 id="titulo-modal-info-subareas">
          ${titulo}
        </h3>

        <button
          class="modal-info-dashboard-close"
          onclick="cerrarModalInfoSubareas()"
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
   CERRAR MODAL DE SUBÁREAS
   ========================================================= */

function cerrarModalInfoSubareas() {

  const modal =
    document.getElementById('modal-info-subareas')

  if (modal) {
    modal.remove()
  }

  document.body.style.overflow = ''
}


/* =========================================================
   OBTENER ÁREA
   ========================================================= */

function obtenerArea(area) {

  return DATOS_APP.jerarquia.jerarquia.find(
    item => String(item.area) === String(area)
  )
}


/* =========================================================
   ORDENAR SUBÁREAS
   ========================================================= */

function ordenarSubareas(subareas) {

  const ordenDeseado = [
    'Chancado Primario',
    'Chancado Secundario',
    'Chancado Terciario',
    'Chancado Cuaternario',
    'Chancada Terciario',
    'Acopio Fino'
  ]

  return [...subareas].sort((a, b) => {

    const nombreA = a.subarea || ''
    const nombreB = b.subarea || ''

    const indexA = ordenDeseado.indexOf(nombreA)
    const indexB = ordenDeseado.indexOf(nombreB)

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    if (indexA !== -1) {
      return -1
    }

    if (indexB !== -1) {
      return 1
    }

    return nombreA.localeCompare(nombreB, 'es')
  })
}


/* =========================================================
   CERRAR MODAL CON ESC
   ========================================================= */

document.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Escape') {
      cerrarModalInfoSubareas()
    }

  }
)