<template>
  <v-container fluid class="vista-sistemas">
    <v-overlay
      v-model="cargandoAlertas"
      persistent
      class="loading-overlay"
    >
      <div class="loading-box">
        <v-progress-circular
          indeterminate
          size="70"
          width="6"
          color="primary"
        />
        <p>Cargando alertas...</p>
      </div>
    </v-overlay>

    <v-row class="fill-height" no-gutters>
      <!-- MENÚ LATERAL -->
      <v-col cols="12" md="4" lg="3" class="menu-lateral">
        <v-btn
          icon
          variant="text"
          class="boton-volver-icono"
          @click="volver"
        >
          ←
        </v-btn>

        <h2 class="titulo-menu">
          Sistemas de {{ subarea }}
        </h2>

        <div class="acciones-sistemas">
          <v-btn
            block
            class="btn-accion"
            @click="seleccionarTodo"
          >
            Seleccionar todo
          </v-btn>

          <v-btn
            block
            class="btn-accion btn-limpiar"
            @click="limpiarSeleccion"
          >
            Limpiar selección
          </v-btn>
        </div>

        <div class="selector-lista">
          <v-card
            v-for="sistema in sistemas"
            :key="sistema"
            class="item-sistema"
            :class="{ seleccionado: sistemasSeleccionados.includes(sistema) }"
            elevation="3"
            @click="toggleSistema(sistema)"
          >
            <v-card-text class="item-sistema-content">
              <span class="nombre-sistema">
                {{ sistema }}
              </span>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- CONTENIDO -->
      <v-col cols="12" md="8" lg="9" class="contenido">
        <h1 class="titulo-principal">
          Área {{ area }}
        </h1>

        <v-card class="panel-tabla" elevation="4" color="white">
          <v-card-text>
            <v-row class="mb-4" dense>
              <v-col cols="12" sm="6" lg="4">
                <v-select
                  v-model="filtroSensor"
                  :items="sensoresDisponibles"
                  label="Sensor"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>

              <v-col cols="12" sm="6" lg="4">
                <v-select
                  v-model="filtroTipoAlarma"
                  :items="tiposDisponibles"
                  label="Tipo Alarma"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>

              <v-col cols="12" sm="6" lg="4">
                <v-select
                  v-model="filtroNivel"
                  :items="nivelesDisponibles"
                  label="Nivel"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
            </v-row>

            <div class="tabla-wrapper">
              <v-table fixed-header height="520" class="tabla-instrumentos">
                <thead>
                  <tr>
                    <th>Sensor</th>
                    <th>Descripción</th>
                    <th>Equipo</th>
                    <th>Tipo de Alarma</th>
                    <th>Nivel</th>
                    <th>Hora de Alarma</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="alarma in alarmasMostradas"
                    :key="`${alarma.Identificador}-${alarma.Sistema}-${alarma.Tipo_Alerta}-${alarma.Nivel_Alerta}`"
                    class="fila-clickable"
                    @click="irADetalleInstrumento(alarma.Identificador)"
                  >
                    <td>{{ alarma.Nombre_TAG }}</td>
                    <td>{{ alarma.Descripcion }}</td>
                    <td>{{ alarma.Sistema }}</td>
                    <td>{{ alarma.Tipo_Alerta }}</td>

                    <td>
                      <v-chip
                        size="small"
                        :class="claseNivel(alarma.Nivel_Alerta)"
                      >
                        {{ alarma.Nivel_Alerta }}
                      </v-chip>
                    </td>

                    <td>{{ formatearFecha(alarma.Fecha_Inicio_Alarma) }}</td>
                  </tr>

                  <tr v-if="alarmasMostradas.length === 0">
                    <td colspan="6" class="sin-datos">
                      No hay sensores con alertas para los filtros seleccionados
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  obtenerSistemas,
  obtenerAlertasInstrumentos
} from '../service/instrumentoService'

interface AlertaJson {
  Identificador: number
  Nombre_TAG: string
  Descripcion: string
  Unidad_de_Ingenieria: string
  Area: number
  Subarea: string
  Sistema: string
  Tipo_Alerta: string
  Nivel_Alerta: string
  Fecha_Inicio_Alarma: string
  Fecha_Ultima_Actualizacion: string
  Fecha_Fin: string | null
  Ciclos_Alarma: number
  Alarma_Activa: boolean
}

interface AlarmaTabla {
  Identificador: number
  Nombre_TAG: string
  Descripcion: string
  Sistema: string
  Tipo_Alerta: string
  Nivel_Alerta: string
  Fecha_Inicio_Alarma: string
  Ciclos_Alarma: number
}

const route = useRoute()
const router = useRouter()

const cargandoAlertas = ref(false)
let intervaloAlertas: number | undefined

const area = Number(route.params.area)
const subarea = String(route.params.subarea)

const sistemas = ref<string[]>([])
const sistemasSeleccionados = ref<string[]>([])
const alertas = ref<AlertaJson[]>([])
const alarmasFiltradas = ref<AlarmaTabla[]>([])

const filtroSensor = ref('')
const filtroTipoAlarma = ref('')
const filtroNivel = ref('')

const alarmasMostradas = computed(() => {
  return alarmasFiltradas.value.filter(alarma => {
    const sensorOK =
      filtroSensor.value === '' ||
      filtroSensor.value === null ||
      alarma.Nombre_TAG === filtroSensor.value

    const tipoOK =
      filtroTipoAlarma.value === '' ||
      filtroTipoAlarma.value === null ||
      alarma.Tipo_Alerta === filtroTipoAlarma.value

    const nivelOK =
      filtroNivel.value === '' ||
      filtroNivel.value === null ||
      alarma.Nivel_Alerta === filtroNivel.value

    return sensorOK && tipoOK && nivelOK
  })
})

const sensoresDisponibles = computed(() => {
  return [...new Set(alarmasFiltradas.value.map(a => a.Nombre_TAG))]
})

const tiposDisponibles = computed(() => {
  return [...new Set(alarmasFiltradas.value.map(a => a.Tipo_Alerta))]
})

const nivelesDisponibles = computed(() => {
  return [...new Set(alarmasFiltradas.value.map(a => a.Nivel_Alerta))]
})

function volver() {
  router.back()
}

function limpiarFiltros() {
  filtroSensor.value = ''
  filtroTipoAlarma.value = ''
  filtroNivel.value = ''
}

function seleccionarTodo() {
  sistemasSeleccionados.value = [...sistemas.value]
  limpiarFiltros()
  cargarAlarmas()
}

function limpiarSeleccion() {
  sistemasSeleccionados.value = []
  limpiarFiltros()
  cargarAlarmas()
}

function toggleSistema(sistema: string) {
  const index = sistemasSeleccionados.value.indexOf(sistema)

  if (index >= 0) {
    sistemasSeleccionados.value.splice(index, 1)
  } else {
    sistemasSeleccionados.value.push(sistema)
  }

  limpiarFiltros()
  cargarAlarmas()
}

async function cargarAlertasDesdeBackend() {
  try {
    alertas.value = await obtenerAlertasInstrumentos()
    cargarAlarmas()
  } catch (error) {
    console.error('Error al actualizar alertas:', error)
  }
}

function cargarAlarmas() {
  const resultado: AlarmaTabla[] = []

  const alertasActivas = alertas.value.filter(alerta => {
    return (
      alerta.Alarma_Activa &&
      alerta.Subarea === subarea &&
      sistemasSeleccionados.value.includes(alerta.Sistema)
    )
  })

  alertasActivas.forEach(alerta => {
    const tipos = alerta.Tipo_Alerta
      .split(',')
      .map(tipo => tipo.trim())

    const niveles = alerta.Nivel_Alerta
      .split(',')
      .map(nivel => nivel.trim())

    tipos.forEach((tipo, index) => {
      resultado.push({
        Identificador: alerta.Identificador,
        Nombre_TAG: alerta.Nombre_TAG,
        Descripcion: alerta.Descripcion,
        Sistema: alerta.Sistema,
        Tipo_Alerta: tipo,
        Nivel_Alerta: niveles[index] || niveles[0],
        Fecha_Inicio_Alarma: alerta.Fecha_Inicio_Alarma,
        Ciclos_Alarma: alerta.Ciclos_Alarma
      })
    })
  })

  alarmasFiltradas.value = resultado.sort((a, b) => {
    return (
      new Date(b.Fecha_Inicio_Alarma).getTime() -
      new Date(a.Fecha_Inicio_Alarma).getTime()
    )
  })
}

function claseNivel(nivel: string) {
  const nivelUpper = nivel.toUpperCase()

  if (nivelUpper.includes('EMERGENCIA')) return 'emergencia'
  if (nivelUpper.includes('CRITICO') || nivelUpper.includes('CRÍTICO')) return 'critico'
  if (nivelUpper.includes('PREVENTIVO')) return 'preventivo'

  return 'normal'
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-CL')
}

function irADetalleInstrumento(id: number) {
  router.push(`/instrumento/${id}`)
}

const TIEMPO_ACTUALIZACION = 120000

onMounted(async () => {
  try {
    cargandoAlertas.value = true

    sistemas.value = await obtenerSistemas(
      area,
      subarea
    )

    // Al iniciar, ningún sistema queda seleccionado
    sistemasSeleccionados.value = []

    await cargarAlertasDesdeBackend()

    intervaloAlertas = window.setInterval(async () => {
      await cargarAlertasDesdeBackend()
    }, TIEMPO_ACTUALIZACION)
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error)
  } finally {
    cargandoAlertas.value = false
  }
})

onUnmounted(() => {
  if (intervaloAlertas) {
    clearInterval(intervaloAlertas)
  }
})
</script>

<style scoped>
.vista-sistemas {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-box {
  background: white;
  padding: 32px 42px;
  border-radius: 18px;
  text-align: center;
  color: #1e293b;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.loading-box p {
  margin-top: 18px;
}

.menu-lateral {
  min-height: 100vh;
  background: #d9d9d9;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.boton-volver-icono {
  align-self: flex-start;
  color: black !important;
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 16px;
}

.titulo-menu {
  text-align: center;
  color: #005494;
  font-size: clamp(22px, 3vw, 26px);
  font-weight: 900;
  margin-bottom: 18px;
}

.acciones-sistemas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.btn-accion {
  background: #005494 !important;
  color: white !important;
  font-weight: 900 !important;
  min-height: 55px !important;
  max-height: 55px !important;
  border-radius: 10px !important;
  border: 2px solid black !important;
  letter-spacing: 0.4px;
}

.btn-limpiar {
  background: #64748b !important;
}

.selector-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.item-sistema {
  background: #005494 !important;
  color: white !important;
  border: 2px solid black;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s ease;
  min-height: 55px;
  max-height: 55px;
}

.item-sistema:hover {
  transform: translateY(-2px);
}

.item-sistema.seleccionado {
  background: #00a651 !important;
  border: 3px solid white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.35);
}

.item-sistema-content {
  min-height: 55px;
  max-height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px !important;
}

.nombre-sistema {
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  word-break: break-word;
}

.contenido {
  min-height: 100vh;
  padding: 30px;
  background: #f8fafc;
}

.titulo-principal {
  text-align: center;
  color: #005494;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 900;
  margin-bottom: 30px;
}

.panel-tabla {
  background: white !important;
  color: #1e293b !important;
  border-radius: 16px;
  border: 1px solid #d0d0d0;
}

.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
}

.tabla-instrumentos {
  background: white !important;
  color: #1e293b !important;
}

:deep(.v-table) {
  background: white !important;
}

:deep(.v-table__wrapper) {
  background: white !important;
}

:deep(table) {
  background: white !important;
}

:deep(thead) {
  background: #005494 !important;
}

:deep(th) {
  background: #005494 !important;
  color: white !important;
  padding: 12px !important;
  font-weight: 900 !important;
  white-space: nowrap;
  text-align: center !important;
}

:deep(tbody tr) {
  background: white !important;
}

:deep(td) {
  background: white !important;
  color: #1e293b !important;
  padding: 12px !important;
  border-bottom: 1px solid #e5e7eb !important;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.fila-clickable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.fila-clickable:hover td) {
  background: #eaf3fb !important;
}

.preventivo {
  background: #fff200 !important;
  color: black !important;
  font-weight: 900;
}

.critico {
  background: #ff9900 !important;
  color: black !important;
  font-weight: 900;
}

.emergencia {
  background: #ff0000 !important;
  color: white !important;
  font-weight: 900;
}

.normal {
  background: #d4edda !important;
  color: black !important;
  font-weight: 900;
}

.sin-datos {
  text-align: center !important;
  color: #64748b !important;
  padding: 30px !important;
  font-weight: 800;
}

.selector-lista::-webkit-scrollbar {
  width: 12px;
}

.selector-lista::-webkit-scrollbar-track {
  background: #bdbdbd;
  border-radius: 10px;
}

.selector-lista::-webkit-scrollbar-thumb {
  background: #777;
  border-radius: 10px;
  border: 2px solid #bdbdbd;
}

.selector-lista::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (max-width: 960px) {
  .menu-lateral {
    min-height: auto;
    max-height: 520px;
  }

  .contenido {
    min-height: auto;
    padding: 22px;
  }

  .selector-lista {
    max-height: 300px;
  }
}

@media (max-width: 600px) {
  .contenido {
    padding: 16px;
  }

  .menu-lateral {
    padding: 18px 14px;
  }

  .nombre-sistema {
    font-size: 17px;
  }

  .btn-accion,
  .item-sistema,
  .item-sistema-content {
    min-height: 50px !important;
    max-height: 50px !important;
  }

  .titulo-principal {
    margin-bottom: 20px;
  }

  :deep(td),
  :deep(th) {
    font-size: 13px;
    padding: 10px !important;
  }
}
</style>