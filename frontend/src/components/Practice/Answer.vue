<template>
  <div>
    <div>題目類型：{{ questionType }}</div>
    <div v-if="questionType === '選擇題'"></div>
    <div v-else-if="questionType === '填空題'"></div>
    <div v-else-if="questionType === '簡答題'"></div>
  </div>
</template>
<script setup>
const props = defineProps({
  questionType: {
    type: String,
    required: true,
  },
})
</script>
