<template>
  <v-container fluid class="alertas-view">
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

    <v-row class="mb-5">
      <v-col cols="12">
        <h1 class="titulo">Sábana de Alertas</h1>
        <p class="subtitulo">
          Listado general de alertas registradas en el sistema.
        </p>
      </v-col>
    </v-row>

    <v-card class="panel-card" elevation="4" color="white">
      <v-card-title class="panel-title">
        Alertas registradas

        <v-spacer />

        <v-switch
          v-model="soloActivas"
          color="primary"
          label="Solo activas"
          hide-details
          @update:model-value="cargarAlertas(1)"
        />
      </v-card-title>

      <v-card-text>
        <v-row class="mb-4" dense>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="busqueda"
              label="Buscar alerta"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtroNivel"
              :items="niveles"
              label="Nivel"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtroTipo"
              :items="tiposAlertas"
              label="Tipo de alerta"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn
              block
              color="primary"
              class="btn-recargar"
              @click="cargarAlertas(page)"
            >
              Recargar
            </v-btn>
          </v-col>
        </v-row>

        <div v-if="cargando" class="estado">
          Cargando alertas...
        </div>

        <div v-else class="tabla-contenedor">
          <v-table fixed-header height="520" class="tabla-alertas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sensor</th>
                <th>Descripción</th>
                <th>Sistema</th>
                <th>Subárea</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Activa</th>
                <th>Inicio</th>
                <th>Última actualización</th>
                <th>Fin</th>
                <th>Ciclos</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="alerta in alertasFiltradas"
                :key="alerta.id"
              >
                <td>{{ alerta.id }}</td>
                <td>{{ alerta.nombre_tag || 'Sin TAG' }}</td>
                <td>{{ alerta.descripcion || 'Sin descripción' }}</td>
                <td>{{ alerta.sistema || 'Sin sistema' }}</td>
                <td>{{ alerta.subarea || 'Sin subárea' }}</td>
                <td>{{ formatearTexto(alerta.tipo_alerta) }}</td>
                <td>
                  <v-chip size="small" :class="claseNivel(alerta.nivel_alerta)">
                    {{ formatearTexto(alerta.nivel_alerta) }}
                  </v-chip>
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="alerta.activa ? 'green' : 'grey'"
                    variant="tonal"
                  >
                    {{ alerta.activa ? 'Sí' : 'No' }}
                  </v-chip>
                </td>
                <td>{{ formatearFecha(alerta.fecha_inicio) }}</td>
                <td>{{ formatearFecha(alerta.fecha_ultima_actualizacion) }}</td>
                <td>{{ formatearFecha(alerta.fecha_fin) }}</td>
                <td>{{ alerta.ciclos }}</td>
              </tr>

              <tr v-if="alertasFiltradas.length === 0">
                <td colspan="12" class="sin-datos">
                  No hay alertas para mostrar
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <div class="paginacion">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="page <= 1 || cargando"
            @click="cargarAlertas(page - 1)"
          >
            Anterior
          </v-btn>

          <span>
            Página {{ page }} de {{ totalPages }} — Total: {{ total }}
          </span>

          <v-btn
            color="primary"
            variant="tonal"
            :disabled="page >= totalPages || cargando"
            @click="cargarAlertas(page + 1)"
          >
            Siguiente
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerAlertas } from '../service/instrumentoService'

const router = useRouter()

const alertas = ref<any[]>([])
const cargando = ref(false)

const soloActivas = ref(true)
const page = ref(1)
const limit = ref(100)
const total = ref(0)
const totalPages = ref(1)

const busqueda = ref('')
const filtroNivel = ref('')
const filtroTipo = ref('')

const niveles = ['PREVENTIVO', 'CRITICO', 'EMERGENCIA']
const tiposAlertas = [
  'CAMBIO_BRUSCO',
  'OSCILACION',
  'SENAL_CONGELADA',
  'TODOS_CERO',
  'MEDIA_CONGELADA',
  'SENAL_RECUPERADA'
]

const alertasFiltradas = computed(() => {
  return alertas.value.filter((alerta) => {
    const textoBusqueda = normalizarTexto(busqueda.value)

    const coincideBusqueda =
      !textoBusqueda ||
      normalizarTexto(alerta.nombre_tag).includes(textoBusqueda) ||
      normalizarTexto(alerta.descripcion).includes(textoBusqueda) ||
      normalizarTexto(alerta.sistema).includes(textoBusqueda) ||
      normalizarTexto(alerta.subarea).includes(textoBusqueda) ||
      normalizarTexto(alerta.tipo_alerta).includes(textoBusqueda) ||
      normalizarTexto(alerta.nivel_alerta).includes(textoBusqueda)

    const coincideNivel =
      !filtroNivel.value ||
      normalizarTexto(alerta.nivel_alerta) === normalizarTexto(filtroNivel.value)

    const coincideTipo =
      !filtroTipo.value ||
      normalizarTexto(alerta.tipo_alerta) === normalizarTexto(filtroTipo.value)

    return coincideBusqueda && coincideNivel && coincideTipo
  })
})

function volver() {
  router.back()
}

async function cargarAlertas(nuevaPagina = 1) {
  try {
    cargando.value = true
    page.value = nuevaPagina

    const response = await obtenerAlertas(
      soloActivas.value,
      page.value,
      limit.value
    )

    alertas.value = response.data || []
    total.value = response.total || 0
    totalPages.value = response.total_pages || 1
  } catch (error) {
    console.error(error)
  } finally {
    cargando.value = false
  }
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

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin fecha'

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return 'Fecha inválida'
  }

  return fechaConvertida.toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function claseNivel(nivel: string) {
  const nivelNormalizado = normalizarTexto(nivel)

  if (nivelNormalizado.includes('EMERGENCIA')) return 'nivel-emergencia'
  if (nivelNormalizado.includes('CRITICO')) return 'nivel-critico'
  if (nivelNormalizado.includes('PREVENTIVO')) return 'nivel-preventivo'

  return 'nivel-sin-alerta'
}

onMounted(() => {
  cargarAlertas()
})
</script>

<style scoped>
.alertas-view {
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

.panel-card {
  background: white !important;
  color: #1e293b !important;
  border: 2px solid #d1d5db;
  border-radius: 16px;
}

.panel-title {
  color: #005494 !important;
  font-size: 24px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn-recargar {
  min-height: 48px;
  font-weight: 900;
}

.estado {
  color: #334155;
  font-size: 18px;
  font-weight: 800;
  padding: 30px;
  text-align: center;
}

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
}

.tabla-alertas {
  min-width: 1500px;
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
  font-weight: 900 !important;
  white-space: nowrap;
  padding: 10px 12px !important;
}

:deep(td) {
  background: white !important;
  color: #1e293b !important;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 10px 12px !important;
}

.sin-datos {
  text-align: center !important;
  color: #64748b !important;
  padding: 30px !important;
  font-weight: 900;
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

.paginacion {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  color: #334155;
  font-weight: 900;
}

@media (max-width: 700px) {
  .alertas-view {
    padding: 18px;
  }

  .panel-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .paginacion {
    flex-direction: column;
  }
}
</style>