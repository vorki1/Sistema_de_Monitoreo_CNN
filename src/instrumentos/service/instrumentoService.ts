import { api } from './api'

export interface SistemaSubarea {
  subarea: string
  sistemas: string[]
}

export interface AreaJerarquia {
  area: number
  subareas: SistemaSubarea[]
}

export interface JerarquiaPlanta {
  jerarquia: AreaJerarquia[]
}

let jerarquiaCache: JerarquiaPlanta | null = null

export async function obtenerJerarquia(): Promise<JerarquiaPlanta> {

  if (jerarquiaCache) {
    return jerarquiaCache
  }

  const response = await api.get<JerarquiaPlanta>(
    '/jerarquia.json'
  )

  jerarquiaCache = response.data

  return response.data
}

export async function obtenerAreas(): Promise<number[]> {
  const data = await obtenerJerarquia()

  return data.jerarquia
  .map(area => area.area)
  .sort((a, b) => a - b)
}

export async function obtenerSubareas(
  areaBuscada: number
): Promise<string[]> {

  const data = await obtenerJerarquia()

  const area = data.jerarquia.find(
    a => a.area === areaBuscada
  )

  if (!area) {
    return []
  }

  return area.subareas.map(
    s => s.subarea
  )
}

export async function obtenerSistemas(
  areaBuscada: number,
  subareaBuscada: string
): Promise<string[]> {

  const data = await obtenerJerarquia()

  const area = data.jerarquia.find(
    a => a.area === areaBuscada
  )

  if (!area) {
    return []
  }

  const subarea = area.subareas.find(
    s => s.subarea === subareaBuscada
  )

  if (!subarea) {
    return []
  }

  return subarea.sistemas
}

export async function obtenerInstrumentos(sistema: string) {
    const response = await api.get(
        `/instrumento/sistemas/${sistema}/instrumentos`
    )
    return response.data
}

export interface InformacionGeneral {
    Identificador: number
    Nombre_TAG: string
    Descripcion: string
    Area: number
    Subarea: string
    Sistema: string
    TAG_OPC: string
    Unidad_de_Ingenieria: string
}

export async function obtenerHistoricoInstrumento(
    id: number,
    minutos: number
) {
    const response = await api.get(
        `/instrumento/${id}/historico?minutos=${minutos}`
    )

    return response.data
}
export async function obtenerAlertasInstrumentos() {
  const response = await api.get(
    '/datos_instrumentos.json'
  )

  return response.data.alertas
}

export async function obtenerAlertas(
  soloActivas = true,
  page = 1,
  limit = 100
) {
  const response = await api.get('/alertas/', {
    params: {
      solo_activas: soloActivas,
      page,
      limit
    }
  })

  return response.data
}

export async function obtenerEstadisticasAlertas() {
  const response = await api.get(
    '/datos_instrumentos.json'
  )

  return response.data.estadisticas
}

export interface InstrumentosJson {
  instrumentos: InformacionGeneral[]
}

let instrumentosCache: InstrumentosJson | null = null

export async function obtenerInstrumentosJson(): Promise<InstrumentosJson> {
  if (instrumentosCache) {
    return instrumentosCache
  }

  const response = await api.get<InstrumentosJson>(
    '/instrumentos.json'
  )

  instrumentosCache = response.data

  return response.data
}

export async function obtenerInfoInstrumento(
  id: number
): Promise<InformacionGeneral | null> {
  const data = await obtenerInstrumentosJson()

  const instrumento = data.instrumentos.find(
    item => Number(item.Identificador) === Number(id)
  )

  return instrumento ?? null
}