let TREEMAP_NIVEL = 'subarea'
let TREEMAP_SUBAREA = ''
let TREEMAP_SISTEMA = ''

function renderTreemap() {
  actualizarNavbar('treemap')
  TREEMAP_NIVEL = 'subarea'
  TREEMAP_SUBAREA = ''
  TREEMAP_SISTEMA = ''
  dibujarTreemap()
}

function dibujarTreemap() {
  const app = document.getElementById('app')
  const alertas = obtenerAlertasTreemap()
  const datos = obtenerDatosTreemap(alertas)

  app.innerHTML = `
    <section class="pagina-treemap">
      <div class="treemap-header">

        <div class="treemap-title-row">

          <h1>
            Treemap de Alertas
          </h1>

          <button
            class="info-button-dashboard"
            onclick="mostrarInfoAlerta(event, 'GENERAL')"
            aria-label="Información general sobre las alertas"
          >
            ?
          </button>

        </div>

        <p>
          Selecciona un bloque para profundizar desde subáreas hacia sistemas e instrumentos con alertas activas.
        </p>

      </div>

      <div class="ruta-treemap">
        <button class="btn-ruta-principal" onclick="volverTreemapSubareas()">
          Subáreas
        </button>

        ${
          TREEMAP_SUBAREA
            ? `
              <button class="btn-ruta" onclick="volverTreemapSistemas()">
                ${TREEMAP_SUBAREA}
              </button>
            `
            : ''
        }

        ${
          TREEMAP_SISTEMA
            ? `
              <span class="chip-ruta">
                ${TREEMAP_SISTEMA}
              </span>
            `
            : ''
        }
      </div>

      <article class="treemap-card">
        ${
          datos.length
            ? renderBloquesTreemap(datos)
            : `<div class="estado-treemap">No hay alertas para mostrar</div>`
        }
      </article>
    </section>
  `
}

function obtenerAlertasTreemap() {
  return (DATOS_APP.datosInstrumentos.alertas || []).filter(alerta => {
    return alerta.Alarma_Activa === true && puntajeNivelTreemap(alerta.Nivel_Alerta) > 0
  })
}

function obtenerDatosTreemap(alertas) {
  if (TREEMAP_NIVEL === 'subarea') {
    return agruparTreemap(alertas, 'Subarea')
  }

  if (TREEMAP_NIVEL === 'sistema') {
    const filtradas = alertas.filter(alerta => alerta.Subarea === TREEMAP_SUBAREA)
    return agruparTreemap(filtradas, 'Sistema')
  }

  const filtradas = alertas.filter(alerta =>
    alerta.Subarea === TREEMAP_SUBAREA &&
    alerta.Sistema === TREEMAP_SISTEMA
  )

  return filtradas.map(alerta => ({
    nombre: alerta.Nombre_TAG || 'Sin sensor',
    valor: 1,
    nivel: puntajeNivelTreemap(alerta.Nivel_Alerta),
    identificador: alerta.Identificador,
    descripcion: alerta.Descripcion || '',
    tipo: alerta.Tipo_Alerta || '',
    nivelTexto: alerta.Nivel_Alerta || ''
  }))
}

function agruparTreemap(alertas, campo) {
  const grupos = {}

  alertas.forEach(alerta => {
    const clave = alerta[campo] || 'Sin dato'

    if (!grupos[clave]) {
      grupos[clave] = []
    }

    grupos[clave].push(alerta)
  })

  return Object.entries(grupos)
    .map(([nombre, items]) => {
      const nivelMaximo = Math.max(...items.map(item => puntajeNivelTreemap(item.Nivel_Alerta)))

      return {
        nombre,
        valor: items.length,
        nivel: nivelMaximo,
        emergencia: items.filter(item => puntajeNivelTreemap(item.Nivel_Alerta) === 3).length,
        critico: items.filter(item => puntajeNivelTreemap(item.Nivel_Alerta) === 2).length,
        preventivo: items.filter(item => puntajeNivelTreemap(item.Nivel_Alerta) === 1).length
      }
    })
    .sort((a, b) => b.valor - a.valor)
}

function renderBloquesTreemap(datos) {
  const total = datos.reduce((acc, item) => acc + item.valor, 0)

  return `
    <div class="treemap-grid">
      ${datos.map(item => {
        const proporcion = Math.max((item.valor / total) * 100, 12)

        return `
          <button
            class="bloque-treemap ${claseColorTreemap(item.nivel)}"
            style="flex-basis:${proporcion}%"
            onclick="clickTreemap('${escapeHTML(item.nombre)}', '${item.identificador || ''}')"
            title="${item.nombre}"
          >
            <strong>${item.nombre}</strong>
            <span>${item.valor} alerta${item.valor === 1 ? '' : 's'}</span>
            ${renderResumenNiveles(item)}
          </button>
        `
      }).join('')}
    </div>
  `
}

function renderResumenNiveles(item) {
  if (TREEMAP_NIVEL === 'sensor') {
    return `<small>${item.nivelTexto || '-'}</small>`
  }

  return `
    <small>
      E: ${item.emergencia || 0} · 
      C: ${item.critico || 0} · 
      P: ${item.preventivo || 0}
    </small>
  `
}

function clickTreemap(nombre, identificador) {
  if (TREEMAP_NIVEL === 'subarea') {
    TREEMAP_SUBAREA = nombre
    TREEMAP_SISTEMA = ''
    TREEMAP_NIVEL = 'sistema'
    dibujarTreemap()
    return
  }

  if (TREEMAP_NIVEL === 'sistema') {
    TREEMAP_SISTEMA = nombre
    TREEMAP_NIVEL = 'sensor'
    dibujarTreemap()
    return
  }

  if (TREEMAP_NIVEL === 'sensor' && identificador) {
    renderDetalleInstrumento(
      identificador,
      {
        tipo: 'treemap',
        nivel: TREEMAP_NIVEL,
        subarea: TREEMAP_SUBAREA,
        sistema: TREEMAP_SISTEMA
      }
    )
  }
}

function volverTreemapSubareas() {
  TREEMAP_NIVEL = 'subarea'
  TREEMAP_SUBAREA = ''
  TREEMAP_SISTEMA = ''
  dibujarTreemap()
}

function volverTreemapSistemas() {
  TREEMAP_NIVEL = 'sistema'
  TREEMAP_SISTEMA = ''
  dibujarTreemap()
}

function puntajeNivelTreemap(nivel) {
  const texto = String(nivel || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (texto.includes('EMERGENCIA')) return 3
  if (texto.includes('CRITICO')) return 2
  if (texto.includes('PREVENTIVO')) return 1

  return 0
}

function claseColorTreemap(nivel) {
  if (nivel === 3) return 'treemap-emergencia'
  if (nivel === 2) return 'treemap-critico'
  if (nivel === 1) return 'treemap-preventivo'
  return 'treemap-normal'
}

function escapeHTML(valor) {
  return String(valor || '')
    .replaceAll("'", "\\'")
    .replaceAll('"', '&quot;')
}