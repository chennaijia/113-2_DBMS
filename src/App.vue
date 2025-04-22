<!-- src/App.vue -->
<template>
  <div class="container">
    <Sidebar />
    <iframe
      name="contentFrame"
      :src="frameSrc"
      style="width: 100%; height: 90vh; border: none"
    ></iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const frameSrc = ref('pages/homepage.html')
</script>

<style scoped>
/* 可放主頁樣式 */
</style>
