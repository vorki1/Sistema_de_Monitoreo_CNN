let RETORNO_DETALLE = null
function renderDetalleInstrumento(identificador,retorno = null) {
  actualizarNavbar('areas')
  RETORNO_DETALLE = retorno
  const app = document.getElementById('app')

  const instrumento = obtenerInstrumentoPorId(identificador)
  const alertas = obtenerAlertasPorInstrumento(identificador)

  if (!instrumento && !alertas.length) {
    app.innerHTML = `
      <section class="detalle-view">
        <div class="detalle-card">
          <button class="detalle-volver" onclick="renderAreas()">←</button>
          <p>No se encontró información para el instrumento ${identificador}.</p>
        </div>
      </section>
    `
    return
  }

  const info = instrumento || alertas[0]

  app.innerHTML = `
    <section class="detalle-view">
      <article class="detalle-card">
        <button class="btn-volver" onclick="volverDesdeDetalle()">
          <img src="assets/icon-volver.svg" alt="Volver">
        </button>

        <h2>Información del Instrumento</h2>

        <table class="tabla-detalle">
          <tbody>
            <tr>
              <th>ID</th>
              <td>${info.Identificador || '-'}</td>
            </tr>
            <tr>
              <th>TAG</th>
              <td>${info.Nombre_TAG || '-'}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>${info.Descripcion || '-'}</td>
            </tr>
            <tr>
              <th>Área</th>
              <td>${info.Area || '-'}</td>
            </tr>
            <tr>
              <th>Subárea</th>
              <td>${info.Subarea || '-'}</td>
            </tr>
            <tr>
              <th>Sistema</th>
              <td>${info.Sistema || '-'}</td>
            </tr>
            <tr>
              <th>Unidad</th>
              <td>${info.Unidad_de_Ingenieria || '-'}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="detalle-card">
        <h2>Alertas asociadas</h2>
        ${renderAlertasInstrumento(alertas)}
      </article>
    </section>
  `
}

function volverDesdeDetalle() {
  if (!RETORNO_DETALLE) {
    actualizarNavbar('areas')
    renderAreas()
    return
  }

  if (RETORNO_DETALLE.tipo === 'dashboard') {
    actualizarNavbar('dashboard')
    renderDashboard()
    return
  }

  if (RETORNO_DETALLE.tipo === 'sistemas') {
    actualizarNavbar('areas')
    renderSistemas(RETORNO_DETALLE.area, RETORNO_DETALLE.subarea)
    return
  }

  if (RETORNO_DETALLE.tipo === 'treemap') {
    actualizarNavbar('treemap')

    TREEMAP_NIVEL = RETORNO_DETALLE.nivel
    TREEMAP_SUBAREA = RETORNO_DETALLE.subarea
    TREEMAP_SISTEMA = RETORNO_DETALLE.sistema

    dibujarTreemap()
    return
  }

  actualizarNavbar('areas')
  renderAreas()
}

function obtenerInstrumentoPorId(identificador) {
  const data = DATOS_APP.instrumentos.instrumentos || DATOS_APP.instrumentos || []

  return data.find(inst => String(inst.Identificador) === String(identificador))
}

function obtenerAlertasPorInstrumento(identificador) {
  const alertas = DATOS_APP.datosInstrumentos.alertas || []

  return alertas.filter(alerta => String(alerta.Identificador) === String(identificador))
}

function renderAlertasInstrumento(alertas) {

  if (!alertas.length) {
    return `
      <div class="sin-datos-detalle">
        Este instrumento no tiene alertas activas.
      </div>
    `
  }

  return `
    <div class="lista-alertas-detalle">

      ${alertas.map((alerta, index) => {

        const nivel = alerta.Nivel_Alerta || '-'
        const tipo = alerta.Tipo_Alerta || '-'

        const descripcionNivel = obtenerDescripcionNivelAlerta(nivel)
        const descripcionTipo = obtenerDescripcionTipoAlerta(tipo)

        return `
          <div class="alerta-detalle ${claseTarjetaAlerta(nivel)}">

            <div class="alerta-detalle-header">

              <div>
                <span class="numero-alerta-detalle">
                  Alerta ${index + 1}
                </span>

                <strong>
                  ${alerta.Nombre_TAG || '-'}
                </strong>
              </div>

              <span class="chip-alerta ${claseNivelAlerta(nivel)}">
                ${nivel}
              </span>

            </div>

            <div class="alerta-detalle-datos">

              <p>
                <strong>Tipo:</strong>
                ${formatearTexto(tipo)}
              </p>

              <p>
                <strong>Inicio:</strong>
                ${formatearFechaDashboard(alerta.Fecha_Inicio_Alarma)}
              </p>

              <p>
                <strong>Última actualización:</strong>
                ${formatearFechaDashboard(alerta.Fecha_Ultima_Actualizacion)}
              </p>

              <p>
                <strong>Ciclos:</strong>
                ${alerta.Ciclos_Alarma || '-'}
                <span class="ciclos-ayuda">
                  (1 ciclo = 10 minutos)
                </span>
              </p>

            </div>

            <div
              class="
                interpretacion-alerta
                ${claseInterpretacionNivel(nivel)}
              "
            >

              <h3>
                Interpretación de la alerta
              </h3>

              <div class="interpretacion-referencia">

                Alerta ${index + 1}

                <span>
                  •
                </span>

                ${formatearTexto(nivel)}

                <span>
                  •
                </span>

                ${formatearTexto(tipo)}

              </div>

              <div class="interpretacion-bloque">

                <span class="interpretacion-etiqueta">
                  Nivel de alerta
                </span>

                <strong class="interpretacion-valor">
                  ${formatearTexto(nivel)}
                </strong>

                <p>
                  ${descripcionNivel}
                </p>

              </div>

              <div class="interpretacion-separador"></div>

              <div class="interpretacion-bloque">

                <span class="interpretacion-etiqueta">
                  Tipo de alerta
                </span>

                <strong class="interpretacion-valor">
                  ${formatearTexto(tipo)}
                </strong>

                <p>
                  ${descripcionTipo}
                </p>

              </div>

            </div>

          </div>
        `
      }).join('')}

    </div>
  `
}

function obtenerDescripcionNivelAlerta(nivel) {

  const nivelNormalizado = normalizarTexto(nivel)

  if (nivelNormalizado.includes('PREVENTIVO')) {
    return 'Se detectó una condición que requiere observación y seguimiento preventivo.'
  }

  if (nivelNormalizado.includes('CRITICO')) {
    return 'Se detectó una condición que requiere una revisión prioritaria del instrumento y de su comportamiento.'
  }

  if (nivelNormalizado.includes('EMERGENCIA')) {
    return 'Se detectó una condición de alta severidad que debe ser evaluada inmediatamente.'
  }

  return 'No existe una descripción disponible para este nivel de alerta.'
}

function obtenerDescripcionTipoAlerta(tipo) {

  const tipoNormalizado = normalizarTexto(tipo)
    .replaceAll(' ', '_')

  if (tipoNormalizado.includes('SENAL_CONGELADA')) {
    return 'La señal permanece sin variaciones durante un período continuo de 1 hora.'
  }

  if (tipoNormalizado.includes('MEDIA_CONGELADA')) {
    return 'La señal se encuentra actualmente estática en un valor determinado, aunque el instrumento presentaba variaciones anteriormente.'
  }

  if (tipoNormalizado.includes('TODOS_CERO')) {
    return 'La señal permanece en valor cero de forma continua, sin presentar variaciones ni valores que aporten información sobre el comportamiento del instrumento.'
  }

  if (tipoNormalizado.includes('CAMBIO_BRUSCO')) {
    return 'Se detecta una variación repentina y significativa en el valor de la señal respecto de su comportamiento reciente.'
  }

  if (tipoNormalizado.includes('OSCILACION')) {
    return 'La señal presenta variaciones repetitivas o inestables durante el período analizado.'
  }

  if (tipoNormalizado.includes('RECUPERADA')) {
    return 'La señal vuelve a presentar un comportamiento normal después de haber estado en una condición de alerta.'
  }

  return 'No existe una descripción disponible para este tipo de alerta.'
}

function claseInterpretacionNivel(nivel) {

  const nivelNormalizado = normalizarTexto(nivel)

  if (nivelNormalizado.includes('PREVENTIVO')) {
    return 'interpretacion-preventivo'
  }

  if (nivelNormalizado.includes('CRITICO')) {
    return 'interpretacion-critico'
  }

  if (nivelNormalizado.includes('EMERGENCIA')) {
    return 'interpretacion-emergencia'
  }

  return 'interpretacion-normal'
}
function claseTarjetaAlerta(nivel) {

  const nivelNormalizado = normalizarTexto(nivel)

  if (nivelNormalizado.includes('PREVENTIVO')) {
    return 'tarjeta-alerta-preventivo'
  }

  if (nivelNormalizado.includes('CRITICO')) {
    return 'tarjeta-alerta-critico'
  }

  if (nivelNormalizado.includes('EMERGENCIA')) {
    return 'tarjeta-alerta-emergencia'
  }

  return 'tarjeta-alerta-normal'
}