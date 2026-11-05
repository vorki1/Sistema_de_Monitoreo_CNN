<template>
  <v-card
    class="area-card"
    elevation="8"
    rounded="lg"
    hover
    @click="$emit('click')"
  >
    <v-card-title class="justify-center text-center">
      {{ titulo }}
    </v-card-title>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.area-card {
  cursor: pointer;
  transition: transform 0.2s ease;

  height: 180px; /* antes 120px */

  display: flex;
  align-items: center;
  justify-content: center;
}

.area-card:hover {
  transform: translateY(-4px);
}

.area-card :deep(.v-card-title) {
  font-size: 1.8rem; /* tamaño del texto */
  font-weight: 600;
}
</style>