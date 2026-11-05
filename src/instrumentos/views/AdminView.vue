<template>
  <v-container fluid class="admin-view">
    <v-row class="mb-6" align="center">
      <v-col cols="auto">
        <v-btn
          icon
          class="btn-volver"
          @click="volver"
        >
          ←
        </v-btn>
      </v-col>

      <v-col>
        <h1 class="titulo">Panel de Administración</h1>
        <p class="subtitulo">Control de procesos internos del sistema</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- MATRIZ B -->
      <v-col cols="12" md="6">
        <v-card class="admin-card">
          <v-card-title class="card-title">Matriz B</v-card-title>

          <v-card-text>
            <div class="estado-box">
              <span>Estado actual:</span>

              <v-chip
                :color="estadoMatrizB ? 'red' : 'green'"
                variant="tonal"
              >
                {{ estadoMatrizB ? 'En proceso' : 'Disponible' }}
              </v-chip>
            </div>

            <p class="descripcion">
              Desde aquí puedes ejecutar la construcción de la Matriz B en segundo plano.
            </p>

            <v-btn
              block
              color="primary"
              class="mb-3"
              :loading="cargando"
              :disabled="estadoMatrizB || cargando"
              @click="ejecutarMatrizB"
            >
              {{ estadoMatrizB ? 'Matriz B en proceso...' : 'Ejecutar Matriz B' }}
            </v-btn>

            <v-btn
              block
              color="blue-grey-lighten-4"
              variant="flat"
              @click="cargarEstado"
            >
              Actualizar estado
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ÚLTIMA ACTUALIZACIÓN -->
      <v-col cols="12" md="6">
        <v-card class="admin-card">
          <v-card-title class="card-title">Última actualización</v-card-title>

          <v-card-text>
            <p class="descripcion">
              Estado del archivo de métricas de la Matriz B.
            </p>

            <v-chip
              :color="existeArchivoMetricas ? 'green' : 'red'"
              variant="tonal"
              size="large"
              class="chip-fecha"
            >
              <v-icon start>
                {{ existeArchivoMetricas ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>

              <span v-if="existeArchivoMetricas">
                Última actualización: {{ ultimaActualizacion }}
              </span>

              <span v-else>
                Archivo de métricas no disponible
              </span>
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- IMPORTAR EXCEL -->
      <v-col cols="12" md="6">
        <v-card class="admin-card">
          <v-card-title class="card-title">Importar Excel</v-card-title>

          <v-card-text>
            <p class="descripcion">
              Espacio reservado para subir archivos Excel al sistema.
            </p>

            <v-file-input
              v-model="archivoSeleccionado"
              label="Seleccionar archivo Excel"
              accept=".xlsx,.xls"
              prepend-icon="mdi-file-excel"
              variant="outlined"
              clearable
              show-size
              density="comfortable"
            />

            <v-btn
              block
              color="primary"
              class="mt-3"
              :loading="importandoExcel"
              :disabled="!archivoSeleccionado || importandoExcel"
              @click="subirExcel"
            >
              {{ importandoExcel ? 'Importando...' : 'Subir Excel' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- EXPORTAR EXCEL -->
      <v-col cols="12" md="6">
        <v-card class="admin-card">
          <v-card-title class="card-title">Exportar Excel</v-card-title>

          <v-card-text>
            <p class="descripcion">
              Espacio reservado para descargar información del sistema en formato Excel.
            </p>

            <v-btn
              block
              color="primary"
              :loading="exportandoExcel"
              :disabled="exportandoExcel"
              @click="descargarExcel"
            >
              {{ exportandoExcel ? 'Exportando...' : 'Exportar Excel' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="mensaje" class="mt-4">
      <v-col cols="12">
        <v-alert type="info" variant="tonal" closable>
          {{ mensaje }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  iniciarMatrizB,
  obtenerEstadoMatrizB,
  obtenerUltimaActualizacionMatrizBase,
  exportarExcel,
  importarExcel
} from '../service/adminService'

const router = useRouter()

const estadoMatrizB = ref(false)
const cargando = ref(false)
const mensaje = ref('')
const ultimaActualizacion = ref('')
const existeArchivoMetricas = ref(false)
const archivoSeleccionado = ref<File | File[] | null>(null)
const exportandoExcel = ref(false)
const importandoExcel = ref(false)

function volver() {
  router.back()
}

async function cargarEstado() {
  try {
    const data = await obtenerEstadoMatrizB()
    estadoMatrizB.value = data.matriz_b_en_proceso
  } catch (error) {
    console.error(error)
    mensaje.value = 'No se pudo obtener el estado de la Matriz B'
  }
}

async function cargarUltimaActualizacion() {
  try {
    const data = await obtenerUltimaActualizacionMatrizBase()

    existeArchivoMetricas.value = data.existe

    ultimaActualizacion.value =
      data.fecha_ultima_actualizacion_formateada || 'Sin fecha disponible'
  } catch (error) {
    console.error(error)
    existeArchivoMetricas.value = false
    ultimaActualizacion.value = ''
  }
}

async function ejecutarMatrizB() {
  try {
    cargando.value = true
    mensaje.value = ''

    const data = await iniciarMatrizB()

    mensaje.value = data.mensaje
    await cargarEstado()
    await cargarUltimaActualizacion()
  } catch (error) {
    console.error(error)
    mensaje.value = 'Error al iniciar la Matriz B'
  } finally {
    cargando.value = false
  }
}

async function descargarExcel() {
  try {
    exportandoExcel.value = true
    mensaje.value = ''

    await exportarExcel()

    mensaje.value = 'Excel exportado correctamente'
  } catch (error) {
    console.error(error)
    mensaje.value = 'No se pudo exportar el Excel'
  } finally {
    exportandoExcel.value = false
  }
}

async function subirExcel() {
  const archivo = Array.isArray(archivoSeleccionado.value)
    ? archivoSeleccionado.value[0]
    : archivoSeleccionado.value

  if (!archivo) {
    mensaje.value = 'Debes seleccionar un archivo Excel'
    return
  }

  try {
    importandoExcel.value = true
    mensaje.value = ''

    const data = await importarExcel(archivo)

    mensaje.value = data.mensaje || 'Excel importado correctamente'
    archivoSeleccionado.value = null
  } catch (error) {
    console.error(error)
    mensaje.value = 'No se pudo importar el Excel'
  } finally {
    importandoExcel.value = false
  }
}

onMounted(async () => {
  await cargarEstado()
  await cargarUltimaActualizacion()
})
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: #f4f6f8;
  padding: 32px;
  color: #1f2937;
}

.titulo {
  margin: 0;
  font-size: clamp(26px, 4vw, 40px);
  color: #0f2744;
  font-weight: 800;
}

.subtitulo {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 17px;
}

.btn-volver {
  width: 58px;
  height: 58px;
  background: #111827;
  color: white;
  font-size: 24px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.admin-card {
  height: 100%;
  min-height: 300px;
  border-radius: 18px;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}

.card-title {
  color: #0f2744;
  font-size: 24px;
  font-weight: 800;
  padding: 22px 24px 8px;
}

.descripcion {
  color: #64748b;
  margin-bottom: 22px;
  font-size: 16px;
}

.estado-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  color: #334155;
  padding: 16px 18px;
  border-radius: 14px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.chip-fecha {
  max-width: 100%;
  white-space: normal;
  height: auto;
  padding: 10px 14px;
}

:deep(.v-card-text) {
  color: #1f2937;
  padding: 14px 24px 24px;
}

:deep(.v-field) {
  background: #ffffff;
  color: #1f2937;
}

:deep(.v-label) {
  color: #64748b;
}

:deep(.v-field__input) {
  color: #1f2937;
}

:deep(.v-icon) {
  color: inherit;
}

@media (max-width: 600px) {
  .admin-view {
    padding: 18px;
  }

  .btn-volver {
    width: 50px;
    height: 50px;
  }

  .estado-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-card {
    min-height: auto;
  }
}
</style>