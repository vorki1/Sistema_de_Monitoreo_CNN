<template>
  <v-container fluid class="subareas-view">
    <v-row class="fill-height" no-gutters>
      <!-- MENÚ LATERAL -->
      <v-col cols="12" md="4" lg="3" class="menu-lateral">
        <v-btn
          icon
          variant="text"
          class="flecha-volver"
          @click="volver"
        >
          ←
        </v-btn>

        <h1 class="titulo">
          Subáreas
        </h1>

        <v-btn
          v-for="subarea in subareas"
          :key="subarea"
          block
          class="card-subarea"
          @click="abrirSubarea(subarea)"
        >
          {{ subarea }}
        </v-btn>
      </v-col>

      <!-- CONTENIDO -->
      <v-col
        cols="12"
        md="8"
        lg="9"
        class="contenido"
        :style="{ backgroundImage: `url(${imagenSubareas})` }"
      >
        <div class="overlay"></div>

        <v-card class="contenido-card" elevation="4" color="white">
          <v-card-text>
            <h2>Área {{ area }}</h2>
            <p>Selecciona una subárea para continuar.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { obtenerSubareas } from '../service/instrumentoService'
import imagenSubareas from '../../assets/imagen-subarea.png'
const route = useRoute()
const router = useRouter()

const area = Number(route.params.area)

const subareas = ref<string[]>([])

const ordenSubareas = [
  'Chancado Primario',
  'Chancado Secundario',
  'Chancado Terciario',
  'Chancado Cuaternario',
  'Acopio Fino',
  'Vacio'
]

function ordenarSubareas(listaSubareas: string[]) {
  return listaSubareas.sort((a, b) => {
    const indexA = ordenSubareas.indexOf(a)
    const indexB = ordenSubareas.indexOf(b)

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b)
    }

    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })
}

function abrirSubarea(subarea: string) {
  router.push(`/areas/${area}/subareas/${encodeURIComponent(subarea)}`)
}

function volver() {
  router.back()
}

onMounted(async () => {
  try {
    const respuesta = await obtenerSubareas(area)
    subareas.value = ordenarSubareas(respuesta)
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.subareas-view {
  min-height: 100vh;
  padding: 0;
  background: #f5f7fa;
}

.menu-lateral {
  min-height: 100vh;
  background: #d9d9d9;
  padding: 35px 16px;

  display: flex;
  flex-direction: column;
  align-items: center;

  overflow-y: auto;
}

.flecha-volver {
  font-size: 42px;
  font-weight: bold;
  color: black !important;
  margin-bottom: 45px;
  line-height: 1;
}

.titulo {
  color: #005494;
  font-size: clamp(26px, 4vw, 32px);
  font-weight: 900;
  margin-bottom: 40px;
  text-align: center;
}

.card-subarea {
  min-height: 85px;
  max-width: 380px;
  margin-bottom: 15px;

  background: #005494 !important;
  color: white !important;
  border: 2px solid black;

  font-size: 22px;
  font-weight: 900;
  border-radius: 0;
  white-space: normal;
  text-align: center;
}

.card-subarea:hover {
  opacity: 0.85;
}
.overlay {
  position: absolute;
  inset: 0;

  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.20) 18%,
    rgba(255,255,255,0.06) 35%,
    rgba(255,255,255,0) 50%
  );

  z-index: 0;
}
.contenido {
  position: relative;
  min-height: 100vh;
  padding: 30px;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.contenido-card {
  position: relative;
  z-index: 1;

  border-radius: 16px;
  color: #1e293b !important;

  background: rgba(255,255,255,0.93) !important;
  backdrop-filter: blur(6px);
}

.contenido-card h2 {
  color: #005494;
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 900;
  margin-bottom: 10px;
}

.contenido-card p {
  color: #334155;
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 960px) {
  .menu-lateral {
    min-height: auto;
    padding: 28px 18px;
  }

  .contenido {
    min-height: auto;
    padding: 22px;
  }
}

@media (max-width: 480px) {
  .flecha-volver {
    margin-bottom: 25px;
    font-size: 36px;
  }

  .titulo {
    margin-bottom: 28px;
  }

  .card-subarea {
    min-height: 72px;
    font-size: 19px;
  }

  .contenido {
    padding: 16px;
  }
}
</style>