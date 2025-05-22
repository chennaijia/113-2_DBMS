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
        <Questions :selectedOption="selectedOption" :questions="questions" :bookId="bookId"
          :questionCount="questionCount" @update-selected="handleSelectedQuestion" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Questions from './Practice/Questions.vue'
import { fetchQuestionsByBookPractice, fetchRandomQuestionsPractice, fetchQuestionCount } from '@/api/questions'

const selectedOption = ref('option0')
const questionCount = ref(1)
const selectedQuestions = ref([])

const emit = defineEmits('start-practice', 'change-page')

const props = defineProps({
  currentSubject: {
    type: String,
    required: true,
  },
  book: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
})

const content = {
  option1: '請在下方勾選要練習的題目!',
  option2: '請在下方選取要練習的題目數!',
  option3: '請在下方選取要練習的題目數!',
}

const bookId = ref(props.book.QuestionBook_ID)
const questions = ref([])
const totalQuestionCount = ref(0)

//改好了
/*const questions = ref([
  {
    id: 1,
    question: '問題1',
    wrongCount: 8,
    image: '/images/1.jpg',
    questionType: 'open',
    correctAnswer: 'B',
    answerUrl: `/images/answers/1.jpg`,
    answerText: '',
    userAnswer: '',
    isCorrect: null,
    checked: false,
  },
  {
    id: 2,
    question: '問題2',
    wrongCount: 0,
    image: '/images/2.jpg',
    questionType: 'multiple123',
    correctAnswer: '是',
    answerUrl: `/images/answers/2.jpg`,
    answerText: '',
    userAnswer: '',
    isCorrect: null,
    checked: false,
  },
  {
    id: 3,
    question: '問題3',
    wrongCount: 3,
    image: '/images/3.jpg',
    questionType: 'open',
    correctAnswer: '選項2',
    answerUrl: `/images/answers/3.jpg`,
    answerText: '',
    userAnswer: '',
    isCorrect: null,
    checked: false,
  },
  {
    id: 4,
    question: '問題4',
    wrongCount: 5,
    image: '/images/4.jpg',
    questionType: 'open',
    correctAnswer: '丙',
    answerUrl: `/images/answers/4.jpg`,
    answerText: '',
    userAnswer: '',
    isCorrect: null,
    checked: false,
  },
])
*/

const handleSelection = () => {
  selectedQuestions.value = []
  handleSelectedQuestion()
}




const handleSelectedQuestion = async () => {
  console.log('🚀 handleSelectedQueston開始載入題目')

  selectedQuestions.value = []
  questionCount.value = await fetchQuestionCount(bookId.value)
  console.log('🚀 題目數量：', questionCount.value)

  if (selectedOption.value === 'option1') {
    // 自選題目：載入所有題目供使用者勾選
    questions.value = await fetchQuestionsByBookPractice(bookId.value)
    console.log('🚀 自選題目：', questions.value)
  } else if (selectedOption.value === 'option2') {
    // 隨機出題：從後端取得隨機題目
    questions.value = await fetchRandomQuestionsPractice(bookId.value, questionCount.value)
    selectedQuestions.value = questions.value
    console.log('🚀 隨機出題：', questions.value)
  } else if (selectedOption.value === 'option3') {
    // 錯最多的題目：取得所有題目並排序
    questions.value = await fetchMostWrongQuestionsPractice(bookId.value, questionCount.value)
    selectedQuestions.value = questions.value
    console.log('🚀 錯最多的題目：', questions.value)
  }

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


onMounted(async () => {
  console.log('📘 book from props:/SelectQuestions', props.book)
  console.log('👤 userId from props:/SelectQuestons', props.userId)
  console.log('📦 bookId from props:/SelectQuestions', props.book.QuestionBook_ID)

})

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
