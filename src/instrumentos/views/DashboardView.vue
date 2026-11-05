<template>
  <v-container fluid class="dashboard">
    <v-row align="center" justify="space-between" class="mb-6">
      <v-col cols="auto">
        <v-btn icon variant="text" class="flecha-volver" @click="volver">
          ←
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-chip color="green" variant="tonal" size="large">
          ● En línea
        </v-chip>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="titulo">Monitor de alarmas</h1>
        <p class="subtitulo">Resumen de sensores con alertas activas</p>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card
          class="kpi-card preventivo"
          :class="{ activa: filtroNivelTabla === 'PREVENTIVO' }"
          elevation="4"
          color="white"
          @click="filtrarPorNivel('PREVENTIVO')"
        >
          <v-card-text>
            <p class="kpi-label">Alertas en preventivo</p>
            <h2 :class="{ cero: conteosAnimados.preventivo === 0 }">
              {{ conteosAnimados.preventivo }}
            </h2>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="kpi-card critico"
          :class="{ activa: filtroNivelTabla === 'CRITICO' }"
          elevation="4"
          color="white"
          @click="filtrarPorNivel('CRITICO')"
        >
          <v-card-text>
            <p class="kpi-label">Alertas en crítico</p>
            <h2 :class="{ cero: conteosAnimados.critico === 0 }">
              {{ conteosAnimados.critico }}
            </h2>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          class="kpi-card emergencia"
          :class="{ activa: filtroNivelTabla === 'EMERGENCIA' }"
          elevation="4"
          color="white"
          @click="filtrarPorNivel('EMERGENCIA')"
        >
          <v-card-text>
            <p class="kpi-label">Alertas en emergencia</p>
            <h2 :class="{ cero: conteosAnimados.emergencia === 0 }">
              {{ conteosAnimados.emergencia }}
            </h2>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card class="panel-card" elevation="4" color="white">
          <v-card-title class="panel-title">
            Alertas de la planta

            <v-chip
              v-if="filtroNivelTabla"
              size="small"
              class="chip-filtro"
              closable
              @click:close="limpiarFiltroNivel"
            >
              Filtro: {{ filtroNivelTabla }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="contenedor-tabla">
              <v-table fixed-header height="390" class="tabla-alertas">
                <thead>
                  <tr>
                    <th>Nombre Sensor</th>
                    <th>Equipo</th>
                    <th>Tipo de falla</th>
                    <th>Nivel</th>
                    <th>Hora</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(alerta, index) in alertasTablaFiltrada"
                    :key="index"
                  >
                    <td>{{ alerta.sensor }}</td>
                    <td>{{ alerta.equipo }}</td>
                    <td>{{ alerta.tipo }}</td>
                    <td>
                      <v-chip size="small" :class="claseNivel(alerta.nivel)">
                        {{ alerta.nivel }}
                      </v-chip>
                    </td>
                    <td>{{ formatearFecha(alerta.fecha) }}</td>
                  </tr>

                  <tr v-if="alertasTablaFiltrada.length === 0">
                    <td colspan="5" class="sin-datos">
                      No hay alertas para el filtro seleccionado
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="panel-card" elevation="4" color="white">
          <v-card-title class="panel-title">
            Fallas por subárea
          </v-card-title>

          <v-card-text>
            <div class="lista-subareas">
              <div
                v-for="(subarea, index) in fallasPorSubarea"
                :key="subarea.nombre"
                class="fila-subarea"
              >
                <span class="nombre-subarea">{{ subarea.nombre }}</span>

                <v-progress-linear
                  :model-value="subarea.porcentaje"
                  height="18"
                  rounded
                  :class="`barra-${index % 5}`"
                />

                <strong>{{ subarea.cantidad }}</strong>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-6">
      <v-col cols="12" md="4">
        <v-card class="estadistica-card" elevation="4" color="white">
          <v-card-title>Sensores analizados</v-card-title>

          <v-card-text>
            <h2>
              {{ estadisticas?.sensores?.con_fallas ?? 0 }}
              /
              {{ estadisticas?.sensores?.total ?? 0 }}
            </h2>

            <p>
              sensores con fallas del total analizado
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="estadistica-card" elevation="4" color="white">
          <v-card-title>Sistema con más alertas</v-card-title>

          <v-card-text>
            <h2>
              {{ estadisticas?.sistema_mas_alertas?.sistema || 'Sin alertas' }}
            </h2>

            <p>
              {{ estadisticas?.sistema_mas_alertas?.cantidad_alertas ?? 0 }}
              alertas activas
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="estadistica-card" elevation="4" color="white">
          <v-card-title>Distribución de alertas</v-card-title>

          <v-card-text>
            <div class="lista-alertas-estadisticas">
              <div>
                <span>Preventivas</span>
                <strong>{{ estadisticas?.cantidad_alertas?.preventivas ?? 0 }}</strong>
              </div>

              <div>
                <span>Críticas</span>
                <strong>{{ estadisticas?.cantidad_alertas?.criticas ?? 0 }}</strong>
              </div>

              <div>
                <span>Emergencias</span>
                <strong>{{ estadisticas?.cantidad_alertas?.emergencias ?? 0 }}</strong>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerAlertasInstrumentos, obtenerEstadisticasAlertas } from '../service/instrumentoService'

const router = useRouter()

const alertas = ref<any[]>([])
const filtroNivelTabla = ref('')

const conteosAnimados = ref({
  preventivo: 0,
  critico: 0,
  emergencia: 0
})

const alertasTabla = ref<any[]>([])
const fallasPorSubarea = ref<any[]>([])
const estadisticas = ref<any | null>(null)

const alertasTablaFiltrada = computed(() => {
  if (!filtroNivelTabla.value) {
    return alertasTabla.value
  }

  return alertasTabla.value.filter((alerta: any) => {
    return normalizarTexto(alerta.nivel).includes(filtroNivelTabla.value)
  })
})

function volver() {
  router.back()
}

function filtrarPorNivel(nivel: string) {
  if (filtroNivelTabla.value === nivel) {
    filtroNivelTabla.value = ''
    return
  }

  filtroNivelTabla.value = nivel
}

function limpiarFiltroNivel() {
  filtroNivelTabla.value = ''
}

function normalizarTexto(valor: any) {
  return String(valor || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function formatearTexto(valor: any) {
  return String(valor || '')
    .trim()
    .replaceAll('_', ' ')
}

function formatearFecha(fecha: string) {
  if (!fecha) return 'Sin fecha'

  const fechaConvertida = new Date(fecha)

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

function calcularConteos() {
  const sensoresPreventivo = new Set<string>()
  const sensoresCritico = new Set<string>()
  const sensoresEmergencia = new Set<string>()

  alertas.value.forEach((alerta: any) => {
    if (alerta.Alarma_Activa !== true) return

    const sensor = String(alerta.Nombre_TAG || alerta.Identificador || 'Sin sensor')
    const nivel = normalizarTexto(alerta.Nivel_Alerta)

    if (nivel.includes('PREVENTIVO')) sensoresPreventivo.add(sensor)
    if (nivel.includes('CRITICO')) sensoresCritico.add(sensor)
    if (nivel.includes('EMERGENCIA')) sensoresEmergencia.add(sensor)
  })

  return {
    preventivo: sensoresPreventivo.size,
    critico: sensoresCritico.size,
    emergencia: sensoresEmergencia.size
  }
}

function generarTablaAlertas() {
  alertasTabla.value = alertas.value
    .filter((alerta: any) => alerta.Alarma_Activa === true)
    .map((alerta: any) => ({
      sensor: alerta.Nombre_TAG || 'Sin sensor',
      equipo: alerta.Sistema || 'Sin equipo',
      tipo: formatearTexto(alerta.Tipo_Alerta),
      nivel: formatearTexto(alerta.Nivel_Alerta),
      fecha: alerta.Fecha_Inicio_Alarma
    }))
    .sort((a: any, b: any) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
}

function generarFallasPorSubarea() {
  const conteo: Record<string, number> = {}

  alertas.value.forEach((alerta: any) => {
    if (alerta.Alarma_Activa !== true) return

    const subarea = alerta.Subarea || 'Sin subárea'
    conteo[subarea] = (conteo[subarea] || 0) + 1
  })

  const mayor = Math.max(...Object.values(conteo), 1)

  fallasPorSubarea.value = Object.entries(conteo)
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: Math.round((cantidad / mayor) * 100)
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

function animarNumero(
  clave: 'preventivo' | 'critico' | 'emergencia',
  valorFinal: number,
  duracion = 900
) {
  if (valorFinal === 0) {
    conteosAnimados.value[clave] = 0
    return
  }

  const inicio = performance.now()

  function actualizar(tiempoActual: number) {
    const progreso = Math.min((tiempoActual - inicio) / duracion, 1)
    conteosAnimados.value[clave] = Math.floor(progreso * valorFinal)

    if (progreso < 1) {
      requestAnimationFrame(actualizar)
    } else {
      conteosAnimados.value[clave] = valorFinal
    }
  }

  requestAnimationFrame(actualizar)
}

function claseNivel(nivel: string) {
  const nivelNormalizado = normalizarTexto(nivel)

  if (nivelNormalizado.includes('EMERGENCIA')) return 'nivel-emergencia'
  if (nivelNormalizado.includes('CRITICO')) return 'nivel-critico'
  if (nivelNormalizado.includes('PREVENTIVO')) return 'nivel-preventivo'

  return 'nivel-sin-alerta'
}

function cargarDashboard() {
  const conteosFinales = calcularConteos()

  conteosAnimados.value = {
    preventivo: 0,
    critico: 0,
    emergencia: 0
  }

  animarNumero('preventivo', conteosFinales.preventivo)
  animarNumero('critico', conteosFinales.critico)
  animarNumero('emergencia', conteosFinales.emergencia)

  generarTablaAlertas()
  generarFallasPorSubarea()
}

onMounted(async () => {
  alertas.value = await obtenerAlertasInstrumentos()
  estadisticas.value = await obtenerEstadisticasAlertas()
  console.log(estadisticas.value)
  cargarDashboard()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 28px 30px 40px;
  background: #f8fafc;
}

.flecha-volver {
  font-size: 42px;
  font-weight: bold;
  color: black !important;
  line-height: 1;
}

.titulo {
  color: #005494;
  font-size: clamp(28px, 5vw, 38px);
  font-weight: 900;
  margin: 0;
}

.subtitulo {
  color: #334155;
  font-size: 18px;
  margin-top: 10px;
}

.kpi-card,
.panel-card {
  background: white !important;
  color: #1e293b !important;
}

.kpi-card {
  border-radius: 16px;
  min-height: 130px;
  cursor: pointer;
  transition: 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
}

.kpi-card.activa {
  box-shadow: 0 0 0 4px rgba(0, 84, 148, 0.22) !important;
  transform: translateY(-3px);
}

.kpi-label {
  color: #334155 !important;
  font-size: 16px;
  font-weight: 900;
  margin-bottom: 12px;
}

.kpi-card h2 {
  font-size: 42px;
  font-weight: 900;
  margin: 0;
  line-height: 1;
}

.kpi-card h2.cero {
  color: black !important;
}

.preventivo {
  border: 2px solid #facc15;
}

.preventivo h2 {
  color: #facc15;
}

.critico {
  border: 2px solid #f97316;
}

.critico h2 {
  color: #f97316;
}

.emergencia {
  border: 2px solid #dc2626;
}

.emergencia h2 {
  color: #dc2626;
}

.panel-card {
  border: 2px solid #d1d5db;
  border-radius: 16px;
  min-height: 500px;
}

.panel-title {
  color: #005494 !important;
  font-size: 24px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.chip-filtro {
  background: #005494 !important;
  color: white !important;
  font-weight: 900;
}

.contenedor-tabla {
  width: 100%;
  overflow-x: hidden;
}

.tabla-alertas {
  width: 100%;
  table-layout: fixed;
  background: white !important;
  color: #1e293b !important;
}

:deep(.v-table) {
  background: white !important;
  color: #1e293b !important;
}

:deep(.v-table__wrapper) {
  background: white !important;
  overflow-x: hidden !important;
}

:deep(table) {
  width: 100%;
  table-layout: fixed;
  background: white !important;
}

:deep(thead) {
  background: #005494 !important;
}

:deep(th) {
  background: #005494 !important;
  color: white !important;
  font-weight: 800 !important;
  white-space: normal !important;
  word-break: break-word;
  overflow-wrap: anywhere;
  padding: 10px 8px !important;
  font-size: 13px;
}

:deep(td) {
  background: white !important;
  color: #1e293b !important;
  font-size: 13px;
  font-weight: 600;
  white-space: normal !important;
  word-break: break-word;
  overflow-wrap: anywhere;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 10px 8px !important;
}

:deep(th:nth-child(1)),
:deep(td:nth-child(1)) {
  width: 34%;
}

:deep(th:nth-child(2)),
:deep(td:nth-child(2)) {
  width: 12%;
}

:deep(th:nth-child(3)),
:deep(td:nth-child(3)) {
  width: 20%;
}

:deep(th:nth-child(4)),
:deep(td:nth-child(4)) {
  width: 18%;
}

:deep(th:nth-child(5)),
:deep(td:nth-child(5)) {
  width: 16%;
}

.sin-datos {
  text-align: center !important;
  color: #64748b !important;
  padding: 30px !important;
  font-weight: 800;
}

.nivel-preventivo {
  background: #facc15 !important;
  color: #1f2937 !important;
  font-weight: 900;
}

.nivel-critico {
  background: #f97316 !important;
  color: white !important;
  font-weight: 900;
}

.nivel-emergencia {
  background: #dc2626 !important;
  color: white !important;
  font-weight: 900;
}

.nivel-sin-alerta {
  background: #64748b !important;
  color: white !important;
  font-weight: 900;
}

.lista-subareas {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 390px;
  overflow-y: auto;
  padding-right: 8px;
}

.fila-subarea {
  display: grid;
  grid-template-columns: 170px 1fr 40px;
  align-items: center;
  gap: 14px;
}

.nombre-subarea {
  color: #334155 !important;
  font-weight: 900;
}

.fila-subarea strong {
  color: #1e293b !important;
  font-size: 16px;
}

:deep(.v-progress-linear) {
  background: #e5e7eb !important;
}

.barra-0 :deep(.v-progress-linear__determinate) {
  background: #dc2626 !important;
}

.barra-1 :deep(.v-progress-linear__determinate) {
  background: #f97316 !important;
}

.barra-2 :deep(.v-progress-linear__determinate) {
  background: #facc15 !important;
}

.barra-3 :deep(.v-progress-linear__determinate) {
  background: #005494 !important;
}

.barra-4 :deep(.v-progress-linear__determinate) {
  background: #2563eb !important;
}

@media (max-width: 600px) {
  .dashboard {
    padding: 18px;
  }

  .panel-card {
    min-height: auto;
  }

  .fila-subarea {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .fila-subarea strong {
    text-align: right;
  }

  :deep(th),
  :deep(td) {
    font-size: 12px;
    padding: 8px 6px !important;
  }
}
.estadistica-card {
  border: 2px solid #d1d5db;
  border-radius: 16px;
  min-height: 150px;
}

.estadistica-card :deep(.v-card-title) {
  color: #005494;
  font-size: 20px;
  font-weight: 900;
}

.estadistica-card h2 {
  color: #1e293b;
  font-size: 34px;
  font-weight: 900;
  margin-bottom: 8px;
}

.estadistica-card p {
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
}
</style>