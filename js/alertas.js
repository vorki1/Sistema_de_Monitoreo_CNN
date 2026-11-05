let ALERTAS_FILTRADAS_SISTEMA = []
let FILTRO_TIPO_ALERTA = ''
let FILTRO_NIVEL_ALERTA = ''

function renderAlertasSeleccionadas(area, subarea) {
  const contenedor = document.getElementById('tabla-alertas-sistema')
  if (!contenedor) return

  ALERTAS_FILTRADAS_SISTEMA = obtenerAlertasSeleccionadas(area, subarea)
  FILTRO_TIPO_ALERTA = ''
  FILTRO_NIVEL_ALERTA = ''

  contenedor.innerHTML = `
    <section class="alertas-panel">
      <div class="filtros-alertas filtros-alertas-dropdown">
        <fieldset class="filtro-busqueda">
          <legend>Búsqueda general</legend>
          <input 
            id="filtro-sensor"
            type="text"
            placeholder="Buscar sensor, descripción, equipo o alerta..."
            oninput="aplicarFiltrosAlertas()"
          >
        </fieldset>

        <fieldset class="dropdown-filtro">
          <legend>Tipo alarma</legend>

          <button class="dropdown-filtro-btn" onclick="toggleDropdownFiltro('tipo')">
            <span id="texto-filtro-tipo">Todos</span>
            <span class="flecha-dropdown">▾</span>
          </button>

          <div class="dropdown-filtro-menu" id="dropdown-tipo">
            ${renderOpcionesDropdown('tipo', obtenerOpcionesUnicas(ALERTAS_FILTRADAS_SISTEMA, 'Tipo_Alerta'))}
          </div>
        </fieldset>

        <fieldset class="dropdown-filtro">
          <legend>Nivel</legend>

          <button class="dropdown-filtro-btn" onclick="toggleDropdownFiltro('nivel')">
            <span id="texto-filtro-nivel">Todos</span>
            <span class="flecha-dropdown">▾</span>
          </button>

          <div class="dropdown-filtro-menu" id="dropdown-nivel">
            ${renderOpcionesDropdownNivel(
              obtenerOpcionesUnicas(ALERTAS_FILTRADAS_SISTEMA, 'Nivel_Alerta')
            )}
          </div>
        </fieldset>
      </div>

      <div id="tabla-alertas-contenido">
        ${renderTablaAlertasSistema(ALERTAS_FILTRADAS_SISTEMA)}
      </div>
    </section>
  `
}

function renderOpcionesDropdown(tipoFiltro, opciones) {
  return `
    <button onclick="seleccionarDropdownFiltro('${tipoFiltro}', '')">
      Todos
    </button>

    ${opciones.map(valor => `
      <button onclick="seleccionarDropdownFiltro('${tipoFiltro}', '${escapeHTML(valor)}')">
        ${formatearTextoFiltro(valor)}
      </button>
    `).join('')}
  `
}
function renderOpcionesDropdownNivel(opciones) {

  const ordenNiveles = [
    'PREVENTIVO',
    'CRITICO',
    'EMERGENCIA'
  ]

  const opcionesOrdenadas = ordenNiveles.filter(nivel =>
    opciones.some(opcion =>
      normalizarNivel(opcion) === nivel
    )
  )

  return `
    <button onclick="seleccionarDropdownFiltro('nivel', '')">
      Todos
    </button>

    ${opcionesOrdenadas.map(valor => `
      <button
        class="opcion-nivel-dropdown"
        onclick="seleccionarDropdownFiltro('nivel', '${valor}')"
      >
        <span class="circulo-nivel ${claseCirculoNivel(valor)}"></span>
        ${formatearTextoFiltro(valor)}
      </button>
    `).join('')}
  `
}
function normalizarNivel(nivel) {
  return String(nivel || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function claseCirculoNivel(nivel) {

  const nivelNormalizado = normalizarNivel(nivel)

  if (nivelNormalizado.includes('PREVENTIVO')) {
    return 'circulo-preventivo'
  }

  if (nivelNormalizado.includes('CRITICO')) {
    return 'circulo-critico'
  }

  if (nivelNormalizado.includes('EMERGENCIA')) {
    return 'circulo-emergencia'
  }

  return ''
}
function toggleDropdownFiltro(tipoFiltro) {
  const menu = document.getElementById(`dropdown-${tipoFiltro}`)
  if (!menu) return

  document.querySelectorAll('.dropdown-filtro-menu').forEach(item => {
    if (item !== menu) item.classList.remove('abierto')
  })

  menu.classList.toggle('abierto')
}

function seleccionarDropdownFiltro(tipoFiltro, valor) {
  if (tipoFiltro === 'tipo') {
    FILTRO_TIPO_ALERTA = valor
    document.getElementById('texto-filtro-tipo').textContent =
      valor ? formatearTextoFiltro(valor) : 'Todos'
  }

  if (tipoFiltro === 'nivel') {
    FILTRO_NIVEL_ALERTA = valor
    document.getElementById('texto-filtro-nivel').textContent =
      valor ? formatearTextoFiltro(valor) : 'Todos'
  }

  document.getElementById(`dropdown-${tipoFiltro}`)?.classList.remove('abierto')
  aplicarFiltrosAlertas()
}

function obtenerAlertasSeleccionadas(area, subarea) {
  const alertas = DATOS_APP.datosInstrumentos.alertas || []

  return alertas.filter(alerta =>
    String(alerta.Area) === String(area) &&
    alerta.Subarea === subarea &&
    alerta.Alarma_Activa === true &&
    SISTEMAS_SELECCIONADOS.includes(alerta.Sistema)
  )
}

function aplicarFiltrosAlertas() {
  const texto = normalizarFiltro(document.getElementById('filtro-sensor').value)

  const alertasFiltradas = ALERTAS_FILTRADAS_SISTEMA.filter(alerta => {
    const textoBusqueda = normalizarFiltro(`
      ${alerta.Nombre_TAG || ''}
      ${alerta.Descripcion || ''}
      ${alerta.Sistema || ''}
      ${alerta.Tipo_Alerta || ''}
      ${alerta.Nivel_Alerta || ''}
    `)

    const textoOK = !texto || textoBusqueda.includes(texto)
    const tipoOK = !FILTRO_TIPO_ALERTA || alerta.Tipo_Alerta === FILTRO_TIPO_ALERTA
    const nivelOK = !FILTRO_NIVEL_ALERTA || alerta.Nivel_Alerta === FILTRO_NIVEL_ALERTA

    return textoOK && tipoOK && nivelOK
  })

  document.getElementById('tabla-alertas-contenido').innerHTML =
    renderTablaAlertasSistema(alertasFiltradas)
}

function normalizarFiltro(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function obtenerOpcionesUnicas(lista, campo) {
  return [...new Set(lista.map(item => item[campo]).filter(Boolean))]
}

function formatearTextoFiltro(valor) {
  return String(valor || '')
    .replaceAll('_', ' ')
}

function renderTablaAlertasSistema(alertas) {
  if (!SISTEMAS_SELECCIONADOS.length) {
    return `
      <div class="sin-datos">
        Selecciona uno o más sistemas para visualizar sus alertas.
      </div>
    `
  }

  if (!alertas.length) {
    return `
      <div class="sin-datos">
        No hay sensores con alertas para los filtros seleccionados.
      </div>
    `
  }

  const filas = alertas.map(alerta => `
    <tr class="fila-clickable" onclick="renderDetalleInstrumento('${alerta.Identificador}', { tipo: 'sistemas', area: '${alerta.Area}', subarea: '${alerta.Subarea}' })">
      <td>${alerta.Nombre_TAG || '-'}</td>
      <td>
        <span class="chip-alerta ${claseNivelAlerta(alerta.Nivel_Alerta)}">
          ${alerta.Nivel_Alerta || '-'}
        </span>
      </td>
      <td>${alerta.Tipo_Alerta || '-'}</td>
      <td class="col-desktop">${alerta.Descripcion || '-'}</td>
      <td class="col-desktop">${alerta.Sistema || '-'}</td>
      <td class="col-desktop">${formatearFechaDashboard(alerta.Fecha_Inicio_Alarma)}</td>
    </tr>
  `).join('')

  return `
    <div class="tabla-wrapper">
      <table class="tabla-instrumentos tabla-mobile-prioritaria">
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Nivel</th>
            <th>Tipo alerta</th>
            <th class="col-desktop">Descripción</th>
            <th class="col-desktop">Equipo</th>
            <th class="col-desktop">Hora</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `
}

function claseNivelAlerta(nivel) {
  const nivelNormalizado = String(nivel || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (nivelNormalizado.includes('EMERGENCIA')) return 'badge-emergencia'
  if (nivelNormalizado.includes('CRITICO')) return 'badge-critico'
  if (nivelNormalizado.includes('PREVENTIVO')) return 'badge-preventivo'

  return 'badge-normal'
}

function formatearFechaDashboard(fecha) {
  if (!fecha) return 'Sin fecha'

  const fechaConvertida = new Date(fecha)

  fechaConvertida.setHours(
    fechaConvertida.getHours() - 4
  )

  if (Number.isNaN(fechaConvertida.getTime())) {
    return 'Fecha inválida'
  }

  return fechaConvertida.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}