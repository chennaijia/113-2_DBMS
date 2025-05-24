<template>
  <div class="practice-container d-flex flex-column ms-5">
    <div class="d-flex flex-row justify-content-between align-items-center mb-3 w-100">
      <div class="d-flex flex-row gap-3">
        <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
          <i class="bi bi-caret-left"></i>
          <span class="ms-2">返回</span>
        </button>
        <div class="fw-bold text-primary fs-4 text-start">{{ currentSubject }} - 錯題練習</div>
      </div>

      <div class="d-flex gap-3 align-items-center">
        <span>{{ currentIndex + 1 }} / {{ props.questions?.length || 0 }}</span>
        <span><i class="bi bi-clock"></i> {{ timer }}</span>
      </div>
    </div>
    <div v-if="props.questions && currentLength.value" class="practice-content">
      <div class="progress mb-4">
        <div class="progress-bar" role="progressbar" :style="{ width: progressWidth + '%' }"
          :aria-valuenow="progressWidth" aria-valuemin="0" aria-valuemax="100"></div>
      </div>

      <div class="question-box mb-1">
        <img :src="currentImage" class="img-fluid rounded shadow-sm"
          style="width: 100%; max-height: 60vh; object-fit: contain" alt="題目圖片" />
      </div>

      <div class="text-s">題目類型 {{ currentType }}</div>

      <div class="mb-4 d-flex flex-column align-items-start">
        <label for="userInput" class="form-label text-m">答案：</label>
        <input id="userInput" v-model="currentQuestion.userAnswer" class="form-control"
          :disabled="currentQuestion.checked" />
      </div>

      <div v-if="
        props.questions[currentIndex]?.checked &&
        props.questions[currentIndex]?.questionType !== 'open'
      " class="mt-2">
        <span :class="props.questions[currentIndex]?.isCorrect ? 'text-success' : 'text-danger'">
          {{
            props.questions[currentIndex]?.isCorrect
              ? '答對了！'
              : '答錯了！正確答案是：' + props.questions[currentIndex]?.correctAnswer
          }}
        </span>
        <!-- maybe 詳解？-->
        <img :src="props.questions[currentIndex]?.answerUrl" alt="答案圖片" class="img-fluid rounded shadow-sm mb-3"
          style="width: 100%; max-height: 60vh; object-fit: contain" />
      </div>

      <div v-if="
        props.questions[currentIndex]?.checked &&
        props.questions[currentIndex]?.questionType === 'open'
      " class="mt-3">
        <img :src="props.questions[currentIndex]?.answerUrl" alt="答案圖片" class="img-fluid rounded shadow-sm mb-3"
          style="width: 100%; max-height: 60vh; object-fit: contain" />
        <div v-if="props.questions[currentIndex]?.isCorrect !== null">
          <div class="text-m text-center">
            {{ props.questions[currentIndex]?.isCorrect ? '恭喜答對！' : '再接再厲 加油！' }}
          </div>
        </div>

        <div v-else class="d-flex flex-column align-items-center gap-1">
          <button class="btn btn-success rounded-pill" @click="manualJudge(true)">
            我答對了&gt;:D
          </button>
          <button class="btn btn-danger rounded-pill" @click="manualJudge(false)">
            我答錯了&gt;:(
          </button>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-3 mt-5">
        <button class="btn btn-outline-secondary rounded-pill" @click="prevQuestion" :disabled="currentIndex === 0">
          <i class="bi bi-caret-left-fill"></i> 上一題
        </button>
        <button class="btn btn-outline-warning rounded-pill" :disabled="props.questions[currentIndex].checked"
          @click="checkAnswer">
          <i class="bi bi-bug"></i> 對答案
        </button>

        <button class="btn btn-outline-primary rounded-pill" @click="nextQuestion"
          v-if="currentIndex < currentLength.value - 1">
          下一題 <i class="bi bi-caret-right-fill"></i>
        </button>
        <button class="btn btn-outline-primary rounded-pill" @click="finishPractice" v-else>
          結束作答 <i class="bi bi-arrow-right-square"></i>
        </button>
      </div>
    </div>
    <div v-else class="text-center mt-5 text-muted">尚未選擇題目，請回到上一頁選擇後開始練習</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Questions from './Practice/Questions.vue'



const props = defineProps({
  currentSubject: String,
  questions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['change-page', 'goBack', 'finish-practice'])
const currentQuestion = computed(() => props.questions[currentIndex.value] || {})
const currentImage = computed(() => props.questions[currentIndex.value]?.image || '')
const currentLength = ref('')
//const currentLength = computed(() => props.questions.length)


const currentIndex = ref(0)

const progressWidth = computed(() => {
  return ((currentIndex.value + 1) / currentLength.value) * 100
})

const currentType = computed(() => {
  switch (currentQuestion.value.questionType) {
    case 'open':
      return '開放題'
      break
    case 'multiple123':
      return '選擇題(123)'
      break
    case 'multipleABC':
      return '選擇題(ABC)'
      break
    case 'truefalse':
      return '是非題'
      break
    case 'fill':
      return '填空題'
      break
    default:
      break
  }
  return questions.value[currentIndex.value]?.questionType || ''
})

const timer = ref('00:00')
const elapsedSeconds = ref(0)
let timerInterval = null

function startStopwatch() {
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    const minutes = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
    const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
    timer.value = `${minutes}:${seconds}`
  }, 1000)
}

onMounted(() => {
  console.log('❤️', props.questions)
  currentLength.value = props.length

  console.log('📦 問題數量:', currentLength.value)
  if (props.questions && currentLength.value > 0) {
    startStopwatch()
    currentIndex.value = 0
  }
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
})

function goBack() {
  emit('goBack')
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function checkAnswer() {
  const q = props.questions[currentIndex.value]

  if (q.questionType !== 'open') {
    q.checked = true
    q.isCorrect = q.userAnswer === q.correctAnswer
  } else {
    q.checked = true
  }
}

function nextQuestion() {
  if (currentIndex.value < currentLength.value - 1) {
    currentIndex.value++
  }
}

function manualJudge(result) {
  const q = props.questions[currentIndex.value]
  q.isCorrect = result
}

function finishPractice() {
  const result = {
    questions: props.questions,
    timeSpent: timer.value,
  }

  emit('finish-practice', result)
  clearInterval(timerInterval)
}
</script>

<style scoped>
.practice-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.practice-content {
  width: 70vw;
}

.question-box {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.fw-bold.text-primary.fs-4 {
  flex-grow: 1;
  text-align: start;
}

.text-m {
  color: #578bc7;
  font-size: 20px;
  font-weight: bold;
}

.text-s {
  color: #578bc7;
  font-size: 15px;
  font-weight: bold;
}
</style>
