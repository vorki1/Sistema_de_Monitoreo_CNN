<template>
  <v-container fluid class="areas-view">
    <v-row class="fill-height" no-gutters>
      <v-col cols="12" md="4" lg="3" class="menu-lateral">
        <h1 class="titulo">Listado de Áreas</h1>

        <v-btn
          v-for="area in areas"
          :key="area"
          block
          class="card-area"
          @click="abrirArea(area)"
        >
          Área {{ area }}
        </v-btn>
      </v-col>

      <v-col
        cols="12"
        md="8"
        lg="9"
        class="contenido"
        :style="{ backgroundImage: `url(${imagenArea})` }"
      >
        <div class="overlay"></div>

        <div class="bienvenida">
          <h2>Visualizador Operacional</h2>
          <p>
            Selecciona un área para revisar subáreas, sistemas e instrumentos.
          </p>
        </div>

        <div class="botones-inferiores">
          <v-btn color="primary" size="large" class="boton-inferior" @click="irDashboard">
            📊 Dashboard
          </v-btn>

          <v-btn color="primary" size="large" class="boton-inferior" @click="abrirTreemap">
            📊 Treemap
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerAreas } from '../service/instrumentoService'
import imagenArea from '../../assets/imagen-area.png'
interface Usuario {
  id: number
  username: string
  nombre: string
  rol: string
  activo: boolean
}

const router = useRouter()

const areas = ref<number[]>([])
const usuarioActual = ref<Usuario | null>(null)


function cargarUsuario() {
  const usuarioStorage = localStorage.getItem('usuario')

  if (!usuarioStorage) {
    usuarioActual.value = null
    return
  }

  usuarioActual.value = JSON.parse(usuarioStorage)
}

function abrirArea(area: number) {
  router.push(`/areas/${area}`)
}

function abrirTreemap() {
  router.push('/treemap')
}

function irDashboard() {
  router.push('/dashboard')
}


onMounted(async () => {
  cargarUsuario()

  try {
    areas.value = await obtenerAreas()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.areas-view {
  min-height: 100vh;
  padding: 0;
  background: #f4f6f8;
}

.menu-lateral {
  min-height: 100vh;
  background: #d9d9d9;
  padding: 55px 16px 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.titulo {
  color: #005494;
  font-size: clamp(26px, 4vw, 32px);
  font-weight: bold;
  margin-bottom: 40px;
  text-align: center;
}

.card-area {
  min-height: 85px;
  max-width: 380px;
  margin-bottom: 15px;
  background: #005494 !important;
  color: white !important;
  border: 2px solid black;
  font-size: 22px;
  font-weight: bold;
  border-radius: 0;
}

.card-area:hover {
  opacity: 0.85;
}

.boton-menu {
  max-width: 380px;
  min-height: 55px;
  font-size: 18px;
  font-weight: bold;
}

.contenido {
  position: relative;
  min-height: 100vh;
  padding: 40px;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}
.overlay {
  position: absolute;
  inset: 0;

  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.70) 0%,
    rgba(255,255,255,0.40) 20%,
    rgba(255,255,255,0.12) 40%,
    rgba(255,255,255,0.00) 65%
  );

  z-index: 0;
}
.bienvenida {
  max-width: 720px;
}

.bienvenida h2 {
  color: #005494;
  font-size: 34px;
  margin-bottom: 10px;
}

.bienvenida p {
  color: #333;
  font-size: 18px;
}
.bienvenida,
.botones-inferiores {
  position: relative;
  z-index: 1;
}
.usuario {
  margin-top: 20px;
}

.botones-inferiores {
  position: absolute;
  right: 35px;
  bottom: 35px;
  display: flex;
  gap: 15px;
}

.boton-inferior {
  min-width: 160px;
  min-height: 58px;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

@media (max-width: 960px) {
  .menu-lateral {
    min-height: auto;
    padding: 32px 18px;
  }

  .contenido {
    min-height: 220px;
    padding-bottom: 120px;
  }

  .botones-inferiores {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 18px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .boton-inferior {
    flex: 1;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .titulo {
    margin-bottom: 28px;
  }

  .card-area {
    min-height: 72px;
    font-size: 20px;
  }

  .botones-inferiores {
    flex-direction: column;
  }

  .boton-inferior {
    width: 100%;
  }
}
</style>