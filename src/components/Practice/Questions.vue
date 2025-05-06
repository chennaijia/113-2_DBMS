<template>
  <div v-if="selectedOption" class="question-container">
    <h3 class="text-primary">題目列表：</h3>
    <div class="list-group mt-3">
      <div
        v-for="(question, index) in filteredQuestions"
        :key="index"
        class="list-group-item d-flex align-items-center"
      >
        <input type="checkbox" class="form-check-input me-3" v-model="selected[index]" />
        <span class="me-3">{{ index + 1 }}</span>
        <span class="flex-grow-1">{{ question }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['selectedOption'],
  data() {
    return {
      selected: [],
      questionSets: {
        option1: ['題目 1', '題目 2', '題目 3'],
        option2: ['隨機題目 A', '隨機題目 B', '隨機題目 C'],
        option3: ['錯最多的題目 X', '錯最多的題目 Y', '錯最多的題目 Z'],
      },
    }
  },
  computed: {
    filteredQuestions() {
      return this.questionSets[this.selectedOption] || []
    },
  },
}
</script>

<style scoped>
.question-container {
  max-width: 500px;
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #ffffff, #f1f8ff);
}
</style>
