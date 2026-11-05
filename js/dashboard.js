let FILTRO_NIVEL_DASHBOARD = ''

function renderDashboard() {
  actualizarNavbar('dashboard')

  const app = document.getElementById('app')

  const datos = DATOS_APP.datosInstrumentos || {}
  const estadisticas = datos.estadisticas || {}
  const alertas = (datos.alertas || []).filter(
    alerta => alerta.Alarma_Activa === true
  )

  const sensores = estadisticas.sensores || {}
  const sistemaMasAlertas = estadisticas.sistema_mas_alertas || {}

  const conteos = calcularConteosDashboard(alertas)
  const alertasTabla = generarAlertasTablaDashboard(alertas)

  const alertasFiltradas = FILTRO_NIVEL_DASHBOARD
    ? alertasTabla.filter(alerta =>
        normalizarTexto(alerta.nivel).includes(FILTRO_NIVEL_DASHBOARD)
      )
    : alertasTabla

  app.innerHTML = `
    <section class="dashboard-view">

      <div class="dashboard-top-row">
        <span class="estado-linea">
          ● En línea
        </span>
      </div>

      <div class="dashboard-header">

        <div class="dashboard-title-row">

          <h2>
            Estado Operacional de Planta
          </h2>

          <button
            class="info-button-dashboard"
            onclick="mostrarInfoAlerta(event, 'GENERAL')"
            aria-label="Información general sobre las alertas"
          >
            ?
          </button>

        </div>

        <p>
          Resumen del estado actual de los sistemas e instrumentos monitoreados
        </p>

      </div>

      <div class="dashboard-top-cards">

        ${renderKpiCard(
          'PREVENTIVO',
          'Alertas en preventivo',
          conteos.preventivo,
          'preventivo-card'
        )}

        ${renderKpiCard(
          'CRITICO',
          'Alertas en crítico',
          conteos.critico,
          'critico-card'
        )}

        ${renderKpiCard(
          'EMERGENCIA',
          'Alertas en emergencia',
          conteos.emergencia,
          'emergencia-card'
        )}

      </div>

      <div class="dashboard-main-grid">

        <article class="dashboard-card panel-card-dashboard">

          <div class="panel-title-dashboard">

            <h3>
              Alertas de la planta
            </h3>

            <button
              class="info-button-dashboard info-button-panel"
              onclick="mostrarInfoAlerta(event, 'TIPOS_ALERTA')"
              aria-label="Información sobre los tipos de alerta"
            >
              ?
            </button>

            ${
              FILTRO_NIVEL_DASHBOARD
                ? `
                  <button
                    class="chip-filtro-dashboard"
                    onclick="limpiarFiltroDashboard()"
                  >
                    Filtro: ${FILTRO_NIVEL_DASHBOARD} ×
                  </button>
                `
                : ''
            }

          </div>

          ${renderTablaDashboard(alertasFiltradas)}

        </article>

        <article class="dashboard-card panel-card-dashboard">

          <h3>
            Fallas por subárea
          </h3>

          ${renderFallasPorSubareaDashboard(alertas)}

        </article>

      </div>

      <div class="dashboard-bottom-grid">

        <article
          class="dashboard-card estadistica-card-dashboard sensores-card"
        >

          <h3>
            Sensores analizados
          </h3>

          ${renderIndicadorSensores(alertas, sensores)}

        </article>

        <article
          class="dashboard-card estadistica-card-dashboard sistema-destacado"
        >

          <h3>
            Sistema con más alertas
          </h3>

          <div class="sistema-alerta-box">

            <div class="icono-sistema">
              !
            </div>

            <div>

              <strong>
                ${sistemaMasAlertas.sistema || 'Sin alertas'}
              </strong>

              <p>
                ${sistemaMasAlertas.cantidad_alertas || 0}
                alertas activas
              </p>

            </div>

          </div>

          <span class="etiqueta-sistema">
            Mayor concentración de eventos
          </span>

        </article>

        <article
          class="dashboard-card estadistica-card-dashboard"
        >

          <h3>
            Distribución de alertas
          </h3>

          ${renderGraficoAlertas(conteos)}

        </article>

      </div>

    </section>
  `
}


function renderKpiCard(nivel, label, valor, clase) {
  const activa =
    FILTRO_NIVEL_DASHBOARD === nivel
      ? 'activa'
      : ''

  return `
    <article
      class="dashboard-card kpi-card-dashboard ${clase} ${activa}"
      onclick="filtrarDashboardPorNivel('${nivel}')"
    >

      <div class="kpi-card-header-dashboard">

        <p>
          ${label}
        </p>

        <button
          class="info-button-dashboard"
          onclick="mostrarInfoAlerta(event, '${nivel}')"
          aria-label="Información sobre ${label}"
        >
          ?
        </button>

      </div>

      <h2 class="${valor === 0 ? 'cero' : ''}">
        ${valor}
      </h2>

    </article>
  `
}


/* =========================================================
   TIPOS DE ALERTA
   ========================================================= */

function renderTiposAlertaInfo() {
  return `
    <div class="info-tipos-alerta">

      <div class="info-alerta-subtitulo">

        <h4>
          ¿Qué son los tipos de alerta?
        </h4>

        <p>
          Los tipos de alerta identifican el comportamiento anómalo
          detectado durante el análisis de la señal.
        </p>

      </div>

      <div class="info-tipos-lista">

        <div class="info-tipo-item">

          <strong>
            Señal congelada
          </strong>

          <span>
            La señal permanece sin variaciones durante un período continuo de
            <strong>1 hora</strong>.
          </span>

        </div>

        <div class="info-tipo-item">

          <strong>
            Media congelada
          </strong>

          <span>
            La señal se encuentra actualmente estática en un valor determinado,
            aunque el instrumento presentaba variaciones anteriormente.
          </span>

        </div>

        <div class="info-tipo-item">

          <strong>
            Todos cero
          </strong>

          <span>
            La señal permanece en valor cero de forma continua, sin presentar
            variaciones ni valores que aporten información sobre el
            comportamiento del instrumento.
          </span>

        </div>

        <div class="info-tipo-item">

          <strong>
            Cambio brusco
          </strong>

          <span>
            Se detecta una variación repentina y significativa en el valor de
            la señal respecto de su comportamiento reciente.
          </span>

        </div>

        <div class="info-tipo-item">

          <strong>
            Oscilación
          </strong>

          <span>
            La señal presenta variaciones repetitivas o inestables durante el
            período analizado.
          </span>

        </div>

        <div class="info-tipo-item">

          <strong>
            Recuperada
          </strong>

          <span>
            La señal vuelve a presentar un comportamiento normal después de
            haber estado en una condición de alerta.
          </span>

        </div>

      </div>

    </div>
  `
}


/* =========================================================
   INFORMACIÓN DE ALERTAS
   ========================================================= */

function mostrarInfoAlerta(event, nivel) {
  if (event) {
    event.stopPropagation()
  }

  const informacion = {

    GENERAL: {
      titulo: 'Guía de alertas',

      contenido: `

        <div class="info-alerta-subtitulo">

          <h4>
            Niveles de alerta
          </h4>

          <p class="info-alerta-introduccion">
            Los niveles de alerta representan la
            <strong>
              severidad operacional de las anomalías detectadas
            </strong>
            y permiten establecer la prioridad con la que deben ser revisadas.
          </p>

        </div>

        <div class="info-niveles-resumen">

          <div class="info-nivel-item preventivo">

            <strong>
              Preventivo
            </strong>

            <span>
              Observar y realizar seguimiento.
            </span>

          </div>

          <div class="info-nivel-item critico">

            <strong>
              Crítico
            </strong>

            <span>
              Realizar una revisión prioritaria.
            </span>

          </div>

          <div class="info-nivel-item emergencia">

            <strong>
              Emergencia
            </strong>

            <span>
              Evaluar inmediatamente la condición detectada.
            </span>

          </div>

        </div>

        <div class="info-separador"></div>

        ${renderTiposAlertaInfo()}

        <div class="info-alerta-nota">

          <strong>
            Importante:
          </strong>

          El nivel representa la severidad de la anomalía, mientras que el
          tipo de alerta describe el comportamiento detectado en la señal.
          Estos indicadores apoyan el monitoreo y no constituyen por sí solos
          un diagnóstico de falla del activo o instrumento.

        </div>
      `
    },


    TIPOS_ALERTA: {
      titulo: 'Tipos de alerta',

      contenido: `

        ${renderTiposAlertaInfo()}

        <div class="info-alerta-nota">

          <strong>
            Importante:
          </strong>

          El tipo de alerta describe el comportamiento detectado en la señal
          y no constituye por sí solo un diagnóstico de falla del activo o
          instrumento.

        </div>
      `
    },


    PREVENTIVO: {
      titulo: 'Alerta preventiva',

      contenido: `
        <div class="info-alerta-seccion">

          <h4>
            ¿Qué significa?
          </h4>

          <p>
            Se detectó un comportamiento anómalo que requiere
            seguimiento, pero que actualmente no representa una
            amenaza para la operación.
          </p>

        </div>

        <div class="info-alerta-seccion">

          <h4>
            Acción recomendada
          </h4>

          <p>
            Observar la evolución de la señal y realizar una
            revisión preventiva si el comportamiento persiste.
          </p>

        </div>

        <div
          class="
            info-alerta-prioridad
            prioridad-preventivo
          "
        >
          Prioridad: Seguimiento
        </div>
      `
    },


    CRITICO: {
      titulo: 'Alerta crítica',

      contenido: `
        <div class="info-alerta-seccion">

          <h4>
            ¿Qué significa?
          </h4>

          <p>
            Se detectó una anomalía que puede comprometer la
            confiabilidad de la medición o indicar un comportamiento
            potencialmente perjudicial para el instrumento o activo
            asociado.
          </p>

        </div>

        <div class="info-alerta-seccion">

          <h4>
            Acción recomendada
          </h4>

          <p>
            Revisar prioritariamente la condición del instrumento
            y validar el comportamiento de la señal.
          </p>

        </div>

        <div
          class="
            info-alerta-prioridad
            prioridad-critico
          "
        >
          Prioridad: Alta
        </div>
      `
    },


    EMERGENCIA: {
      titulo: 'Alerta de emergencia',

      contenido: `
        <div class="info-alerta-seccion">

          <h4>
            ¿Qué significa?
          </h4>

          <p>
            Se detectó una condición de alta severidad que puede
            estar asociada a una eventual detención del activo o
            a un desgaste significativo.
          </p>

        </div>

        <div class="info-alerta-seccion">

          <h4>
            Acción recomendada
          </h4>

          <p>
            Evaluar inmediatamente la condición del instrumento
            y del activo asociado para determinar si es necesaria
            una intervención.
          </p>

        </div>

        <div
          class="
            info-alerta-prioridad
            prioridad-emergencia
          "
        >
          Prioridad: Inmediata
        </div>
      `
    }

  }

  const info = informacion[nivel]

  if (!info) {
    return
  }

  abrirModalInfoDashboard(
    info.titulo,
    info.contenido
  )
}


function abrirModalInfoDashboard(titulo, contenido) {
  cerrarModalInfoDashboard()

  const modal = document.createElement('div')

  modal.id = 'modal-info-dashboard'
  modal.className = 'modal-info-dashboard'

  modal.innerHTML = `
    <div
      class="modal-info-dashboard-overlay"
      onclick="cerrarModalInfoDashboard()"
    ></div>

    <div
      class="modal-info-dashboard-content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-info-dashboard"
    >

      <div class="modal-info-dashboard-header">

        <h3 id="titulo-modal-info-dashboard">
          ${titulo}
        </h3>

        <button
          class="modal-info-dashboard-close"
          onclick="cerrarModalInfoDashboard()"
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


function cerrarModalInfoDashboard() {
  const modal =
    document.getElementById(
      'modal-info-dashboard'
    )

  if (modal) {
    modal.remove()
  }

  document.body.style.overflow = ''
}


function filtrarDashboardPorNivel(nivel) {
  FILTRO_NIVEL_DASHBOARD =
    FILTRO_NIVEL_DASHBOARD === nivel
      ? ''
      : nivel

  renderDashboard()
}


function limpiarFiltroDashboard() {
  FILTRO_NIVEL_DASHBOARD = ''

  renderDashboard()
}


function calcularConteosDashboard(alertas) {
  const preventivo = new Set()
  const critico = new Set()
  const emergencia = new Set()

  alertas.forEach(alerta => {
    const sensor = String(
      alerta.Nombre_TAG ||
      alerta.Identificador ||
      'Sin sensor'
    )

    const nivel =
      normalizarTexto(
        alerta.Nivel_Alerta
      )

    if (
      nivel.includes('PREVENTIVO')
    ) {
      preventivo.add(sensor)
    }

    if (
      nivel.includes('CRITICO')
    ) {
      critico.add(sensor)
    }

    if (
      nivel.includes('EMERGENCIA')
    ) {
      emergencia.add(sensor)
    }
  })

  return {
    preventivo: preventivo.size,
    critico: critico.size,
    emergencia: emergencia.size
  }
}


function generarAlertasTablaDashboard(alertas) {
  return alertas
    .map(alerta => ({
      id: alerta.Identificador,

      sensor:
        alerta.Nombre_TAG ||
        'Sin sensor',

      equipo:
        alerta.Sistema ||
        'Sin equipo',

      tipo:
        formatearTexto(
          alerta.Tipo_Alerta
        ),

      nivel:
        formatearTexto(
          alerta.Nivel_Alerta
        ),

      fecha:
        alerta.Fecha_Inicio_Alarma
    }))

    .sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime()
    )
}


function renderTablaDashboard(alertas) {
  if (!alertas.length) {
    return `
      <div class="sin-datos">
        No hay alertas para el filtro seleccionado.
      </div>
    `
  }

  const filas = alertas
    .map(alerta => `
      <tr
        class="fila-clickable"
        onclick="
          renderDetalleInstrumento(
            '${alerta.id}',
            { tipo: 'dashboard' }
          )
        "
      >

        <td>
          ${alerta.sensor}
        </td>

        <td>
          <span
            class="
              chip-alerta
              ${claseNivelAlerta(alerta.nivel)}
            "
          >
            ${alerta.nivel}
          </span>
        </td>

        <td>
          ${alerta.tipo}
        </td>

        <td class="col-desktop">
          ${alerta.equipo}
        </td>

        <td class="col-desktop">
          ${formatearFechaDashboard(alerta.fecha)}
        </td>

      </tr>
    `)
    .join('')

  return `
    <div class="dashboard-tabla-wrapper">

      <table
        class="
          dashboard-tabla
          tabla-mobile-prioritaria
        "
      >

        <thead>

          <tr>

            <th>
              Sensor
            </th>

            <th>
              Nivel
            </th>

            <th>
              Tipo alerta
            </th>

            <th class="col-desktop">
              Equipo
            </th>

            <th class="col-desktop">
              Hora
            </th>

          </tr>

        </thead>

        <tbody>
          ${filas}
        </tbody>

      </table>

    </div>
  `
}


function renderFallasPorSubareaDashboard(alertas) {
  const conteo = {}

  alertas.forEach(alerta => {
    const subarea =
      alerta.Subarea ||
      'Sin subárea'

    conteo[subarea] =
      (conteo[subarea] || 0) + 1
  })

  const entradas =
    Object
      .entries(conteo)
      .sort(
        (a, b) =>
          b[1] - a[1]
      )

  if (!entradas.length) {
    return `
      <div class="sin-datos">
        No hay fallas por subárea.
      </div>
    `
  }

  const mayor =
    Math.max(
      ...Object.values(conteo),
      1
    )

  return `
    <div class="lista-subareas-dashboard">

      ${
        entradas
          .map(
            ([subarea, cantidad], index) => {
              const porcentaje =
                Math.round(
                  (cantidad / mayor) * 100
                )

              return `
                <div class="fila-subarea-dashboard">

                  <span>
                    ${subarea}
                  </span>

                  <div class="barra-track-dashboard">

                    <div
                      class="
                        barra-fill-dashboard
                        barra-${index % 5}
                      "
                      style="width:${porcentaje}%"
                    ></div>

                  </div>

                  <strong>
                    ${cantidad}
                  </strong>

                </div>
              `
            }
          )
          .join('')
      }

    </div>
  `
}


function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
}


function formatearTexto(valor) {
  return String(valor || '')
    .trim()
    .replaceAll('_', ' ')
}


function formatearFechaDashboard(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const fechaConvertida =
    new Date(fecha)

  if (
    Number.isNaN(
      fechaConvertida.getTime()
    )
  ) {
    return 'Fecha inválida'
  }

  return fechaConvertida
    .toLocaleString(
      'es-CL',
      {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
}


function claseNivelAlerta(nivel) {
  const nivelNormalizado =
    normalizarTexto(nivel)

  if (
    nivelNormalizado.includes(
      'EMERGENCIA'
    )
  ) {
    return 'badge-emergencia'
  }

  if (
    nivelNormalizado.includes(
      'CRITICO'
    )
  ) {
    return 'badge-critico'
  }

  if (
    nivelNormalizado.includes(
      'PREVENTIVO'
    )
  ) {
    return 'badge-preventivo'
  }

  return 'badge-normal'
}


function renderGraficoAlertas(conteos) {
  const total =
    conteos.preventivo +
    conteos.critico +
    conteos.emergencia

  if (total === 0) {
    return `
      <div class="sin-datos">
        Sin alertas activas
      </div>
    `
  }

  const pPreventivo =
    (
      conteos.preventivo /
      total
    ) * 100

  const pCritico =
    pPreventivo +
    (
      conteos.critico /
      total
    ) * 100

  return `
    <div class="grafico-alertas-box">

      <div
        class="grafico-torta"
        style="
          background:
          conic-gradient(
            #ffd21c
            0%
            ${pPreventivo}%,

            #ff6b1a
            ${pPreventivo}%
            ${pCritico}%,

            #e60000
            ${pCritico}%
            100%
          );
        "
      >

        <div class="grafico-centro">
          ${total}
        </div>

      </div>

      <div class="leyenda-alertas">

        <div>

          <span
            class="color preventivo"
          ></span>

          Preventivas

          <strong>
            ${conteos.preventivo}
          </strong>

        </div>

        <div>

          <span
            class="color critico"
          ></span>

          Críticas

          <strong>
            ${conteos.critico}
          </strong>

        </div>

        <div>

          <span
            class="color emergencia"
          ></span>

          Emergencias

          <strong>
            ${conteos.emergencia}
          </strong>

        </div>

      </div>

    </div>
  `
}


function renderIndicadorSensores(alertas, sensores) {
  const sensoresRelevantes = new Set()

  alertas.forEach(alerta => {
    const nivel = normalizarTexto(alerta.Nivel_Alerta)

    const esCritica = nivel.includes('CRITICO')
    const esEmergencia = nivel.includes('EMERGENCIA')

    if (esCritica || esEmergencia) {
      const sensor = String(
        alerta.Nombre_TAG ||
        alerta.Identificador ||
        ''
      ).trim()

      if (sensor) {
        sensoresRelevantes.add(sensor)
      }
    }
  })

  const cantidad = sensoresRelevantes.size
  const total = sensores.total || 0

  const porcentaje = total > 0
    ? ((cantidad / total) * 100).toFixed(1)
    : '0.0'

  return `
    <div class="sensores-box sensores-box-compacto">

      <div>

        <div class="ratio-sensores">
          <strong>${cantidad}</strong>
          <span>/ ${total}</span>
        </div>

        <p>
          Alertas con alta prioridad
        </p>

      </div>

      <div class="porcentaje-principal porcentaje-compacto">
        ${porcentaje}%
        <span>del total</span>
      </div>

    </div>
  `
}


document.addEventListener(
  'keydown',
  event => {
    if (event.key === 'Escape') {
      cerrarModalInfoDashboard()
    }
  }
)