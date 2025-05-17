<template>
  <div>
    <div>題目類型：{{ questionType }}</div>
    <div v-if="questionType === 'open'"></div>
    <div v-else-if="questionType === 'multipleABC'"></div>
    <div v-else-if="questionType === 'multiple123'"></div>
    <div v-else-if="questionType === 'truefalse'"></div>
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
