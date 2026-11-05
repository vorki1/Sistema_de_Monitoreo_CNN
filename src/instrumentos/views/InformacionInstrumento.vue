<template>
  <v-container fluid class="detalle-instrumento">
    <v-row class="fill-height">
      <v-col cols="12" lg="6" class="panel-col">
        <v-card class="panel-card" elevation="4" color="white">
          <v-card-text>
            <v-btn
              icon
              variant="text"
              class="boton-volver"
              @click="volver"
            >
              ←
            </v-btn>

            <h2 class="titulo-panel">Información del Instrumento</h2>

            <div v-if="instrumento" class="tabla-wrapper">
              <v-table class="tabla-instrumento">
                <tbody>
                  <tr>
                    <th>ID</th>
                    <td>{{ instrumento.Identificador }}</td>
                  </tr>

                  <tr>
                    <th>TAG</th>
                    <td>{{ instrumento.Nombre_TAG }}</td>
                  </tr>

                  <tr>
                    <th>Descripción</th>
                    <td>{{ instrumento.Descripcion }}</td>
                  </tr>

                  <tr>
                    <th>Área</th>
                    <td>{{ instrumento.Area }}</td>
                  </tr>

                  <tr>
                    <th>Subárea</th>
                    <td>{{ instrumento.Subarea }}</td>
                  </tr>

                  <tr>
                    <th>Sistema</th>
                    <td>{{ instrumento.Sistema }}</td>
                  </tr>

                  <tr>
                    <th>Unidad</th>
                    <td>{{ instrumento.Unidad_de_Ingenieria }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <p v-else class="texto-info">
              No se encontró información para este instrumento.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6" class="panel-col">
        <v-card class="panel-card panel-alertas" elevation="4" color="white">
          <v-card-title class="titulo-panel">
            Alertas asociadas
          </v-card-title>

          <v-card-text>
            <div v-if="fallasSeparadas.length > 0" class="lista-fallas">
              <v-card
                v-for="falla in fallasSeparadas"
                :key="`${falla.Identificador}-${falla.Fecha_Inicio_Alarma}-${falla.Tipo_Alerta}-${falla.Nivel_Alerta}`"
                class="falla-item"
                elevation="0"
              >
                <div class="falla-header">
                  <strong>{{ falla.Nombre_TAG }}</strong>

                  <v-chip
                    size="small"
                    class="badge-alerta"
                    :class="claseNivelAlerta(falla.Nivel_Alerta)"
                  >
                    {{ falla.Nivel_Alerta }}
                  </v-chip>
                </div>

                <p>
                  <strong>Tipo:</strong>
                  {{ falla.Tipo_Alerta }}
                </p>

                <p>
                  <strong>Inicio:</strong>
                  {{ formatearFecha(falla.Fecha_Inicio_Alarma) }}
                </p>

                <p>
                  <strong>Última actualización:</strong>
                  {{ formatearFecha(falla.Fecha_Ultima_Actualizacion) }}
                </p>

                <p>
                  <strong>Ciclos:</strong>
                  {{ falla.Ciclos_Alarma }}
                </p>
              </v-card>
            </div>

            <p v-else class="texto-info">
              No hay fallas registradas para este sensor.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  obtenerInfoInstrumento,
  obtenerAlertasInstrumentos,
  type InformacionGeneral
} from '../service/instrumentoService'

interface AlertaInstrumento {
  Identificador: number
  Nombre_TAG: string
  Descripcion: string
  Unidad_de_Ingenieria: string
  Area: string
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

const route = useRoute()
const router = useRouter()

const instrumento = ref<InformacionGeneral | null>(null)
const alertas = ref<AlertaInstrumento[]>([])

const alertasInstrumento = computed(() => {
  if (!instrumento.value) return []

  return alertas.value
    .filter(alerta =>
      Number(alerta.Identificador) === Number(instrumento.value?.Identificador)
    )
    .sort((a, b) =>
      new Date(b.Fecha_Inicio_Alarma).getTime() -
      new Date(a.Fecha_Inicio_Alarma).getTime()
    )
})

const fallasSeparadas = computed(() => {
  return alertasInstrumento.value.flatMap(alerta => {
    const tipos = alerta.Tipo_Alerta.split(',').map(tipo => tipo.trim())
    const niveles = alerta.Nivel_Alerta.split(',').map(nivel => nivel.trim())

    return tipos.map((tipo, index) => ({
      ...alerta,
      Tipo_Alerta: tipo,
      Nivel_Alerta: niveles[index] ?? niveles[0] ?? 'SIN NIVEL'
    }))
  })
})

function volver() {
  router.back()
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin fecha'
  return new Date(fecha).toLocaleString('es-CL')
}

function claseNivelAlerta(nivel: string) {
  const nivelNormalizado = nivel.trim().toUpperCase()

  if (nivelNormalizado === 'PREVENTIVO') return 'nivel-preventivo'
  if (nivelNormalizado === 'CRITICO' || nivelNormalizado === 'CRÍTICO') return 'nivel-critico'
  if (nivelNormalizado === 'EMERGENCIA') return 'nivel-emergencia'

  return 'nivel-default'
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)

    instrumento.value = await obtenerInfoInstrumento(id)
    alertas.value = await obtenerAlertasInstrumentos()
  } catch (error) {
    console.error('Error cargando datos del instrumento:', error)
  }
})
</script>

<style scoped>
.detalle-instrumento {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.panel-col {
  display: flex;
}

.panel-card {
  width: 100%;
  height: calc(100vh - 40px);

  background: white !important;
  color: #1e293b !important;
  border: 1px solid #d0d0d0;
  border-radius: 16px;
}

.panel-card {
  background: white !important;
  color: #1e293b !important;
  border: 1px solid #d0d0d0;
  border-radius: 16px;
}

.panel-alertas {
  overflow-y: auto;
}

.boton-volver {
  color: black !important;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 10px;
}

.titulo-panel {
  color: #005494 !important;
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 16px;
}

.texto-info {
  color: #1e293b !important;
  font-weight: 600;
}

.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
}

.tabla-instrumento {
  background: white !important;
  color: #1e293b !important;
}

:deep(.tabla-instrumento table) {
  background: white !important;
  border-collapse: collapse;
}

:deep(.tabla-instrumento th) {
  width: 35%;
  background: #005494 !important;
  color: white !important;
  text-align: left;
  padding: 12px;
  border: 1px solid #d0d0d0;
  white-space: nowrap;
}

:deep(.tabla-instrumento td) {
  background: white !important;
  color: #1e293b !important;
  padding: 12px;
  border: 1px solid #d0d0d0;
  font-weight: 600;
}

:deep(.tabla-instrumento tr:nth-child(even) td) {
  background: #f7f7f7 !important;
}

.lista-fallas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.falla-item {
  background: #f8fafc !important;
  border-left: 4px solid #005494;
  padding: 14px;
  color: #1e293b !important;
  font-size: 15px;
  line-height: 1.5;
  border-radius: 10px;
}

.falla-item p {
  margin: 6px 0 0;
}

.falla-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.badge-alerta {
  min-width: 110px;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
}

.nivel-preventivo {
  background: #fff000 !important;
  color: black !important;
}

.nivel-critico {
  background: #f39c12 !important;
  color: black !important;
}

.nivel-emergencia {
  background: #ff1414 !important;
  color: white !important;
}

.nivel-default {
  background: #808080 !important;
  color: white !important;
}

@media (max-width: 600px) {
  .detalle-instrumento {
    padding: 14px;
  }

  .titulo-panel {
    font-size: 21px;
  }

  :deep(.tabla-instrumento th),
  :deep(.tabla-instrumento td) {
    font-size: 13px;
    padding: 10px;
  }

  .falla-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>