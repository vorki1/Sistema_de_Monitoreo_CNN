<template>
  <v-container fluid class="pagina-treemap">
    <v-row align="center" class="mb-4">
      <v-col cols="auto">
        <v-btn
          icon
          variant="text"
          class="flecha-volver"
          @click="volver"
        >
          ←
        </v-btn>
      </v-col>

      <v-col>
        <h1 class="titulo">Treemap de Alertas</h1>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12">
        <div class="ruta">
          <v-btn
            color="primary"
            variant="flat"
            class="btn-ruta-principal"
            @click="volverNivelSubarea"
          >
            Subáreas
          </v-btn>

          <v-btn
            v-if="subareaSeleccionada"
            color="grey-lighten-3"
            variant="flat"
            class="btn-ruta"
            @click="volverNivelSistema"
          >
            {{ subareaSeleccionada }}
          </v-btn>

          <v-chip
            v-if="sistemaSeleccionado"
            color="primary"
            variant="tonal"
          >
            {{ sistemaSeleccionado }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-card class="treemap-card" elevation="4" color="white">
      <v-card-text>
        <div v-if="cargando" class="estado">
          <v-progress-circular
            indeterminate
            size="64"
            width="6"
            color="primary"
          />

          <p>Cargando alertas...</p>
        </div>

        <div v-else-if="sinDatos" class="estado">
          No hay alertas para mostrar
        </div>

        <div
          ref="chartRef"
          class="treemap"
          :class="{ oculto: cargando || sinDatos }"
        ></div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

import {
  obtenerAlertasInstrumentos
} from '../service/instrumentoService'

const router = useRouter()
const chartRef = ref<HTMLDivElement | null>(null)

let chart: echarts.ECharts | null = null

const cargando = ref(true)
const sinDatos = ref(false)

const nivelActual = ref<'subarea' | 'sistema' | 'sensor'>('subarea')
const subareaSeleccionada = ref('')
const sistemaSeleccionado = ref('')

const alertas = ref<any[]>([])

function volver() {
  router.back()
}

function normalizarTexto(valor: any) {
  return String(valor || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function puntajeNivel(valor: any) {
  const texto = normalizarTexto(valor)

  if (texto.includes('EMERGENCIA')) return 3
  if (texto.includes('CRITICO')) return 2
  if (texto.includes('PREVENTIVO')) return 1

  return 0
}

function colorPorNivel(nivel: number) {
  if (nivel === 3) return '#dc2626'
  if (nivel === 2) return '#f97316'
  if (nivel === 1) return '#facc15'
  return '#64748b'
}

function textoNivel(nivel: number) {
  if (nivel === 3) return 'Emergencia'
  if (nivel === 2) return 'Crítico'
  if (nivel === 1) return 'Preventivo'
  return 'Sin alerta'
}

function obtenerSubarea(row: any) {
  return row.Subarea || 'Sin subárea'
}

function obtenerSistema(row: any) {
  return row.Sistema || 'Sin sistema'
}

function obtenerSensor(row: any) {
  return row.Nombre_TAG || 'Sin sensor'
}

function filtrarAlertas() {
  return alertas.value.filter((row) => {
    if (puntajeNivel(row.Nivel_Alerta) === 0) return false

    if (nivelActual.value === 'sistema') {
      return obtenerSubarea(row) === subareaSeleccionada.value
    }

    if (nivelActual.value === 'sensor') {
      return (
        obtenerSubarea(row) === subareaSeleccionada.value &&
        obtenerSistema(row) === sistemaSeleccionado.value
      )
    }

    return true
  })
}

function contarNiveles(items: any[]) {
  return {
    emergencia: items.filter((item) => puntajeNivel(item.Nivel_Alerta) === 3).length,
    critico: items.filter((item) => puntajeNivel(item.Nivel_Alerta) === 2).length,
    preventivo: items.filter((item) => puntajeNivel(item.Nivel_Alerta) === 1).length
  }
}

function nivelMaximo(items: any[]) {
  return Math.max(...items.map((item) => puntajeNivel(item.Nivel_Alerta)), 0)
}

function agruparPor(tipo: 'subarea' | 'sistema' | 'sensor') {
  const grupos: Record<string, any[]> = {}

  filtrarAlertas().forEach((row) => {
    let clave = ''

    if (tipo === 'subarea') clave = obtenerSubarea(row)
    if (tipo === 'sistema') clave = obtenerSistema(row)
    if (tipo === 'sensor') clave = obtenerSensor(row)

    if (!grupos[clave]) grupos[clave] = []
    grupos[clave].push(row)
  })

  return Object.entries(grupos).map(([nombre, items]) => {
    const maxNivel = nivelMaximo(items)
    const niveles = contarNiveles(items)
    const primeraAlerta = items[0]

    return {
      name: nombre,
      value: items.length,
      nivelTexto: textoNivel(maxNivel),
      emergencia: niveles.emergencia,
      critico: niveles.critico,
      preventivo: niveles.preventivo,
      sensor: obtenerSensor(primeraAlerta),
      identificador: Number(primeraAlerta.Identificador),
      descripcion: primeraAlerta.Descripcion || '',
      tipoAlerta: primeraAlerta.Tipo_Alerta || '',
      nivelAlerta: primeraAlerta.Nivel_Alerta || '',
      filaOriginal: primeraAlerta,
      itemStyle: {
        color: colorPorNivel(maxNivel)
      }
    }
  })
}

function obtenerDatosActuales() {
  if (nivelActual.value === 'subarea') return agruparPor('subarea')
  if (nivelActual.value === 'sistema') return agruparPor('sistema')
  return agruparPor('sensor')
}

async function dibujarTreemap() {
  const datos = obtenerDatosActuales()

  sinDatos.value = datos.length === 0

  if (sinDatos.value) return

  await nextTick()

  if (!chartRef.value) return

  if (chart) chart.dispose()

  chart = echarts.init(chartRef.value)

  chart.setOption({
    tooltip: {
      formatter(info: any) {
        const data = info.data

        if (nivelActual.value === 'sensor') {
          return `
            <strong>${data.sensor}</strong><br/>
            ID: ${data.identificador}<br/>
            Descripción: ${data.descripcion}<br/>
            Total alertas: ${info.value}<br/>
            Emergencia: ${data.emergencia}<br/>
            Crítico: ${data.critico}<br/>
            Preventivo: ${data.preventivo}<br/>
            Nivel más alto: ${data.nivelTexto}
          `
        }

        return `
          <strong>${info.name}</strong><br/>
          Total alertas: ${info.value}<br/>
          Emergencia: ${data.emergencia}<br/>
          Crítico: ${data.critico}<br/>
          Preventivo: ${data.preventivo}<br/>
          Nivel más alto: ${data.nivelTexto}
        `
      }
    },
    series: [
      {
        type: 'treemap',
        data: datos,
        roam: false,
        nodeClick: false,
        sort: 'desc',
        label: {
          show: true,
          formatter(info: any) {
            return `${info.name}\n${info.value} alertas`
          },
          fontWeight: 'bold',
          color: '#111827'
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 4,
          gapWidth: 4
        }
      }
    ]
  })

  chart.off('click')

  chart.on('click', (params: any) => {
    const data = params.data

    if (nivelActual.value === 'subarea') {
      subareaSeleccionada.value = data.name
      sistemaSeleccionado.value = ''
      nivelActual.value = 'sistema'
      dibujarTreemap()
      return
    }

    if (nivelActual.value === 'sistema') {
      sistemaSeleccionado.value = data.name
      nivelActual.value = 'sensor'
      dibujarTreemap()
      return
    }

    if (nivelActual.value === 'sensor') {
      if (!data.identificador) {
        console.error('Sensor sin identificador:', data)
        return
      }

      router.push(`/instrumento/${data.identificador}`)
    }
  })

  setTimeout(() => {
    chart?.resize()
  }, 100)
}

async function cargarTreemap() {
  try {
    cargando.value = true

    alertas.value = await obtenerAlertasInstrumentos()

    cargando.value = false

    await nextTick()
    await dibujarTreemap()
  } catch (error) {
    console.error('Error cargando treemap:', error)
    sinDatos.value = true
    cargando.value = false
  }
}

function volverNivelSubarea() {
  nivelActual.value = 'subarea'
  subareaSeleccionada.value = ''
  sistemaSeleccionado.value = ''
  dibujarTreemap()
}

function volverNivelSistema() {
  nivelActual.value = 'sistema'
  sistemaSeleccionado.value = ''
  dibujarTreemap()
}

function redimensionar() {
  chart?.resize()
}

onMounted(() => {
  cargarTreemap()
  window.addEventListener('resize', redimensionar)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', redimensionar)

  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.pagina-treemap {
  min-height: 100vh;
  padding: 28px 30px 40px;
  background: #f8fafc;
}

.flecha-volver {
  color: black !important;
  font-size: 42px;
  font-weight: bold;
  line-height: 1;
}

.titulo {
  color: #005494;
  font-size: clamp(28px, 5vw, 38px);
  font-weight: 900;
  margin: 0;
}

.ruta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #334155;
  font-weight: 700;
}

.btn-ruta-principal,
.btn-ruta {
  font-weight: 800;
  text-transform: none;
}

.btn-ruta {
  color: #0f172a !important;
}

.treemap-card {
  background: white !important;
  color: #1e293b !important;
  border-radius: 16px;
  border: 1px solid #d1d5db;
}

.treemap {
  width: 100%;
  height: 75vh;
  min-height: 420px;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 12px;
}

.estado {
  width: 100%;
  height: 75vh;
  min-height: 420px;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;

  color: #334155;
  font-size: 20px;
  font-weight: 800;
}

.estado p {
  margin: 0;
}

.oculto {
  visibility: hidden;
  position: absolute;
  pointer-events: none;
}

@media (max-width: 600px) {
  .pagina-treemap {
    padding: 18px;
  }

  .flecha-volver {
    font-size: 36px;
  }

  .treemap,
  .estado {
    height: 65vh;
    min-height: 360px;
  }
}
</style>