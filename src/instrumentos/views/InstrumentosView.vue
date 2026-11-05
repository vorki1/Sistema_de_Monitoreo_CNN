<template>
  <v-container fluid class="instrumentos-view">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="titulo">
          Instrumentos de {{ sistema }}
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="instrumento in instrumentos"
        :key="instrumento.Identificador"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="instrumento-card" elevation="4">
          <v-card-text>
            <h3>{{ instrumento.Nombre_TAG }}</h3>
            <p>ID: {{ instrumento.Identificador }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import {
  obtenerInstrumentos
} from '../service/instrumentoService'

const route = useRoute()

const sistema = String(route.params.sistema)

const instrumentos = ref<any[]>([])

onMounted(async () => {
  instrumentos.value = await obtenerInstrumentos(sistema)

  console.log(instrumentos.value)
})
</script>

<style scoped>
.instrumentos-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 28px;
}

.titulo {
  color: #005494;
  font-size: clamp(26px, 5vw, 36px);
  font-weight: 900;
  margin: 0;
}

.instrumento-card {
  background: white !important;
  color: #1e293b !important;
  border-radius: 16px;
  border: 1px solid #d0d0d0;
  min-height: 120px;
}

.instrumento-card h3 {
  color: #005494;
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 10px;
  word-break: break-word;
}

.instrumento-card p {
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

@media (max-width: 600px) {
  .instrumentos-view {
    padding: 18px;
  }
}
</style>