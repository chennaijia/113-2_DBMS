<template>
  <div class="w-100">
    <div class="d-flex mt-3 flex-grow-1 align-text-start">
      <div class="d-flex align-items-center gap-3 ms-5">
        <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
          <i class="bi bi-caret-left"></i>
          <span class="ms-2">返回</span>
        </button>
        <div class="fw-bold text-primary fs-4">{{ currentSubject }} - 錯題練習</div>
      </div>
    </div>

    <div class="container d-flex flex-column align-items-center mt-5 gap-3">
      <div class="dropdown-container text-center">
        <select id="dropdown" class="form-select custom-dropdown text-center" v-model="selectedOption"
          @change="handleSelection">
          <option value="option0">選擇模式</option>
          <option value="option1">自選題目</option>
          <option value="option2">隨機出題</option>
          <option value="option3">錯最多的題目</option>
        </select>
      </div>

      <p class="text-s">{{ content[selectedOption] }}</p>

      <div v-if="selectedOption" class="content-box border p-4 shadow text-center mb-4">
        <Questions :selectedOption="selectedOption" :questions="questions" :questionCount="questionCount"
          :currentSubject="currentSubject" :userId="userId" :total="totalQuestionCount" :bookId="book.QuestionBook_ID"
          @update-selected="handleSelectedQuestion" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Questions from './Practice/Questions.vue'

import {
  fetchQuestionsByBookPractice,
  fetchRandomQuestionsPractice,
  fetchMostWrongQuestions,
} from '@/api/questions'

// ✅ 父層接收外部傳入的 props
const props = defineProps({
  currentSubject: { type: String, required: true },
  book: Object,
  userId: { type: Number, required: true },
  questionCount: Number
})

// ✅ 對外發出事件
const emit = defineEmits(['start-practice', 'change-page'])

// ✅ 本地狀態管理
const selectedOption = ref('option0')
const questionCount = ref(1)
const selectedQuestions = ref([])
const questions = ref([])

// ✅ 練習模式對應的文字提示
const content = {
  option1: '請在下方勾選要練習的題目!',
  option2: '請在下方選取要練習的題目數!',
  option3: '請在下方選取要練習的題目數!',
}

// ✅ 根據模式選擇題目
const handleSelection = async () => {
  selectedQuestions.value = [] // 清空舊選項

  const bookId = props.book?.QuestionBook_ID
  const count = questionCount.value
  const userId = props.userId

  console.log('🚀 正在送出 API:', { bookId, userId, count })

  try {
    if (selectedOption.value === 'option1') {
      const data = await fetchQuestionsByBookPractice(bookId)
      questions.value = data
    }

    if (selectedOption.value === 'option2') {
      const data = await fetchRandomQuestionsPractice(bookId, userId, count)
      questions.value = data
    }

    if (selectedOption.value === 'option3') {
      const data = await fetchMostWrongQuestions(bookId, userId, count)
      questions.value = data
    }

    console.log('✅ 題目資料：', questions.value)

  } catch (error) {
    console.error('❌ 載入題目失敗:', error)
    alert('無法載入題目，請稍後再試')
  }
}

// ✅ 接收子元件傳回的選取題目
function handleSelectedQuestion(selected) {
  selectedQuestions.value = selected

  if (selected.length === 0) {
    alert('尚未選擇題目！')
    return
  }

  emit('start-practice', {
    mode: selectedOption.value,
    questions: selected,
    count: questionCount.value,
  })
}

// ✅ 點擊返回
function goBack() {
  emit('change-page', 'book', props.currentSubject)
}

// ✅ 初始 or userId 改變時，自動載入題目
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId) {
      handleSelection()
    }
  },
  { immediate: true }
)
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
  width: 85vw;
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
