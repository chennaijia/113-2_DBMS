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
          :currentSubject="currentSubject" :userId="userId" :total="totalQuestionCount"
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
} from '@/api/questions.js'


const selectedOption = ref('option0')
const questionCount = ref(1)
const selectedQuestions = ref([])

const emit = defineEmits('start-practice', 'change-page')

const props = defineProps({

  currentSubject: {
    type: String,
    required: true,
  },
  book: Object,
  userId: {
    type: Number,
    required: true, // ✅ 建議加這行讓它強制需要
  },
  questionCount: Number,
})


const content = {
  option1: '請在下方勾選要練習的題目!',
  option2: '請在下方選取要練習的題目數!',
  option3: '請在下方選取要練習的題目數!',
}

const questions = ref([])

const handleSelection = async () => {


  selectedQuestions.value = []

  const bookId = props.book?.QuestionBook_ID
  const count = questionCount.value
  const userId = props.userId

  console.log('🚀 正在送出 most-wrong API with:', {
    bookId,
    userId,
    count
  })

  try {
    if (selectedOption.value === 'option1') {
      const data = await fetchQuestionsByBookPractice(bookId)
      questions.value = data
      console.log('✅ option1 題目資料：', data)
    }

    if (selectedOption.value === 'option2') {
      const data = await fetchRandomQuestionsPractice(bookId, userId, count)
      questions.value = data
      console.log('✅ option2 題目資料：', data)
    }

    if (selectedOption.value === 'option3') {
      const data = await fetchMostWrongQuestions(bookId, userId, count)
      questions.value = data
      console.log('✅ option3 題目資料：', data)
    }
  } catch (error) {
    console.error('載入題目失敗', error)
    alert('無法載入題目，請稍後再試')
  }
}

function handleSelectedQuestion(questions) {
  selectedQuestions.value = questions
  if (selectedQuestions.value.length === 0) {
    alert('尚未選擇題目！')
    return
  }
  emit('start-practice', {
    mode: selectedOption.value,
    questions: selectedQuestions.value,
    count: questionCount.value,
  })
}

function goBack() {
  emit('change-page', 'book', props.currentSubject)
}

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
