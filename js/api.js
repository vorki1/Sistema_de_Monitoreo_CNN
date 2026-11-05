const API_CONFIG = {
  baseURL: 'data'
}

async function cargarJSON(nombreArchivo) {
  const url = `${API_CONFIG.baseURL}/${nombreArchivo}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al cargar ${url}`)
  }

  return await response.json()
}

async function cargarJsonParticionado(nombreBase, claveLista) {
  const primeraParte = await cargarJSON(`${nombreBase}_1.json`)
  const totalPartes = primeraParte.total_partes || 1

  const otrasPartes = await Promise.all(
    Array.from({ length: totalPartes - 1 }, (_, i) => i + 2)
      .map(numeroParte => cargarJSON(`${nombreBase}_${numeroParte}.json`))
  )

  return [
    ...(primeraParte[claveLista] || []),
    ...otrasPartes.flatMap(parte => parte[claveLista] || [])
  ]
}

async function cargarDatosAlertas() {
  const [estadisticasJson, alertas] = await Promise.all([
    cargarJSON('datos_alertas_estadisticas.json'),
    cargarJsonParticionado('datos_alertas', 'alertas')
  ])

  return {
    estadisticas: estadisticasJson.estadisticas || {},
    alertas
  }
}

async function cargarInstrumentos() {
  const instrumentos = await cargarJsonParticionado(
    'instrumentos',
    'instrumentos'
  )

  return {
    instrumentos
  }
}

async function cargarDatosBase() {
  const [datosInstrumentos, instrumentos, jerarquia] = await Promise.all([
    cargarDatosAlertas(),
    cargarInstrumentos(),
    cargarJSON('jerarquia1.json')
  ])

  return {
    datosInstrumentos,
    instrumentos,
    jerarquia
  }
}