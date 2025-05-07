<template>
  <div class="container d-flex flex-column align-items-center mt-5 gap-3">
    <!-- 下拉選單 -->
    <div class="dropdown-container text-center">
      <label for="dropdown" class="form-label fw-bold text-lg">選擇練習方式：</label>
      <select
        id="dropdown"
        class="form-select custom-dropdown text-center"
        v-model="selectedOption"
        @change="handleSelection"
      >
        <option value="">選擇模式</option>
        <option value="option1">自選題目</option>
        <option value="option2">隨機出題</option>
        <option value="option3">錯最多的題目</option>
      </select>
    </div>

    <p class="text-s">{{ content[selectedOption] }}</p>

    <div v-if="selectedOption" class="content-box border p-4 shadow text-center mb-4">
      <Questions
        :selectedOption="selectedOption"
        :questions="questions"
        :questionCount="questionCount"
        @update-selected="handleSelectedQuestion"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Questions from './Practice/Questions.vue'

const selectedOption = ref('')
const questionCount = ref(5)
const selectedQuestions = ref([])

const content = {
  option1: '請在下方勾選要練習的題目!',
  option2: '請在下方選取要練習的題目數!',
  option3: '請在下方選取要練習的題目數!',
}

const questions = ref([
  { id: 1, question: '問題1', wrongCount: 8, image: '/images/1.jpg' },
  { id: 2, question: '問題2', wrongCount: 0, image: '/images/2.jpg' },
  { id: 3, question: '問題3', wrongCount: 3, image: '/images/3.jpg' },
  { id: 4, question: '問題4', wrongCount: 5, image: '/images/4.jpg' },
])

const handleSelection = () => {
  selectedQuestions.value = []
}

const handleSelectedQuestion = (questions) => {
  selectedQuestions.value = questions
  console.log('使用者選擇了:', selectedQuestions.value)
  emit('start-practice', selectedQuestions.value)
}

const startPractice = () => {
  console.log('進入練習模式，題目如下：', selectedQuestions.value)
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropdown-container {
  width: 300px;
}

.content-box {
  width: 75vw;
  background: #f9fcff;
  border-radius: 10px;
  padding: 20px;
}

.text-lg {
  color: #408ee7;
  font-size: 25px;
}

.text-s {
  color: #578bc7;
  font-size: 15px;
}
</style>
