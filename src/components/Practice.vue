<template>
  <div class="practice-container d-flex flex-column ms-5">
    <div v-if="isReady">
      <!-- 標題列 -->
      <div class="d-flex flex-row justify-content-between align-items-center mb-3 w-100">
        <div class="d-flex flex-row gap-3">
          <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
            <i class="bi bi-caret-left"></i><span class="ms-2">返回</span>
          </button>
          <div class="fw-bold text-primary fs-4 text-start">{{ currentSubject }} - 錯題練習</div>
        </div>

        <div class="d-flex gap-3 align-items-center">
          <span>{{ currentIndex + 1 }} / {{ currentLength }}</span>
          <span><i class="bi bi-clock"></i> {{ timer }}</span>
        </div>
      </div>

      <!-- 主要內容 -->
      <div class="practice-content">
        <!-- 進度條 -->
        <div class="progress mb-4">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: progressWidth + '%' }"
            :aria-valuenow="progressWidth"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>

        <!-- 題目圖片 -->
        <div class="question-box mb-1">
          <img
            :src="currentImage"
            class="img-fluid rounded shadow-sm"
            style="width: 100%; max-height: 60vh; object-fit: contain"
            alt="題目圖片"
          />
        </div>

        <div class="text-s">題目類型 {{ currentType }}</div>

        <!-- 作答輸入 -->
        <div class="mb-4 d-flex flex-column align-items-start">
          <label for="userInput" class="form-label text-m">答案：</label>
          <input
            id="userInput"
            v-model="answerModel"
            class="form-control"
            :disabled="currentQuestion?.checked"
          />
        </div>

        <!-- —— 判題結果（非開放題） —— -->
        <div v-if="currentQuestion?.checked && currentQuestion?.QType !== 'open'" class="mt-2">
          <span :class="currentQuestion.isCorrect ? 'text-success' : 'text-danger'">
            {{
              currentQuestion.isCorrect
                ? '答對了！'
                : '答錯了！正確答案是：' + currentQuestion.Answer
            }}
          </span>
          <img
            :src="currentImage"
            alt="答案圖片"
            class="img-fluid rounded shadow-sm"
            style="width: 100%; max-height: 60vh; object-fit: contain"
          />
        </div>

        <!-- —— 判題結果（開放題） —— -->
        <div v-else-if="currentQuestion?.checked && currentQuestion?.QType === 'open'" class="mt-3">
          <div class="question-box mb-1">
            <img
              :src="currentQuestion?.Answer_pic"
              alt="答案圖片"
              class="img-fluid rounded shadow-sm mb-3"
              style="width: 100%; max-height: 60vh; object-fit: contain"
            />
          </div>

          <div v-if="currentQuestion?.isCorrect !== null">
            <div class="text-m text-center">
              {{ currentQuestion.isCorrect ? '恭喜答對！' : '再接再厲 加油！' }}
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
          <button
            class="btn btn-outline-secondary rounded-pill"
            @click="prevQuestion"
            :disabled="currentIndex === 0"
          >
            <i class="bi bi-caret-left-fill"></i> 上一題
          </button>

          <button
            class="btn btn-outline-warning rounded-pill"
            :disabled="currentQuestion?.checked"
            @click="checkAnswer"
          >
            <i class="bi bi-bug"></i> 對答案
          </button>

          <button
            class="btn btn-outline-primary rounded-pill"
            @click="nextQuestion"
            v-if="currentIndex < currentLength - 1"
          >
            下一題 <i class="bi bi-caret-right-fill"></i>
          </button>

          <button class="btn btn-outline-primary rounded-pill" @click="finishPractice" v-else>
            結束作答 <i class="bi bi-arrow-right-square"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-else class="text-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">正在載入題目，請稍候...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  currentSubject: String,
  questions: { type: Array, required: true },
})
const emit = defineEmits(['change-page', 'goBack', 'finish-practice'])

const isReady = ref(false)
const localQuestions = ref([])
const currentIndex = ref(0)

const currentLength = computed(() => localQuestions.value.length)

const currentQuestion = computed(() => localQuestions.value?.[currentIndex.value] ?? null)

const currentImage = computed(() => currentQuestion.value?.Content_pic || '')

const currentType = computed(() => {
  switch (currentQuestion.value?.QType) {
    case 'open':
      return '開放題'
    case 'multiple123':
      return '選擇題(123)'
    case 'multipleABC':
      return '選擇題(ABC)'
    case 'truefalse':
      return '是非題'
    case 'fill':
      return '填空題'
    default:
      return ''
  }
})

const progressWidth = computed(() =>
  currentLength.value === 0 ? 0 : ((currentIndex.value + 1) / currentLength.value) * 100
)

const answerModel = computed({
  get: () => currentQuestion.value?.userAnswer ?? '',
  set: (val) => {
    if (currentQuestion.value) currentQuestion.value.userAnswer = val
  },
})

const timer = ref('00:00')
const elapsedSeconds = ref(0)
let timerInterval = null
function startStopwatch() {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    const m = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
    const s = String(elapsedSeconds.value % 60).padStart(2, '0')
    timer.value = `${m}:${s}`
  }, 1000)
}

watch(
  () => props.questions,
  (list) => {
    if (Array.isArray(list) && list.length) {
      localQuestions.value = list.map((q) => ({
        ...q,
        userAnswer: '',
        isCorrect: null,
        checked: false,
      }))
      currentIndex.value = 0
      elapsedSeconds.value = 0
      startStopwatch()
      isReady.value = true
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => clearInterval(timerInterval))

function goBack() {
  emit('goBack')
}
function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--
}
function nextQuestion() {
  if (currentIndex.value < currentLength.value - 1) currentIndex.value++
}

function normalizeAnswer(ans, qType = '') {
  if (!ans) return ''

  let cleaned = ans
    .toString()
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\u3000]/g, '')
    .replace(/[，,、;；．.]/g, '')

  if (qType === 'multipleABC' || qType === 'multiple123') {
    cleaned = cleaned.split('').sort().join('')
  }
  return cleaned
}

function checkAnswer() {
  if (!currentQuestion.value || currentQuestion.value.checked) return

  const q = currentQuestion.value
  q.checked = true

  if (q.QType !== 'open') {
    const correctRaw = q.Answer ?? q.answer ?? q.correctAnswer ?? ''
    const correct = normalizeAnswer(correctRaw, q.QType)
    const user = normalizeAnswer(q.userAnswer, q.QType)
    if (q.userAnswer === '') {
      q.isCorrect = false
      return
    }
    q.isCorrect = user !== '' && user === correct
  } else {
    q.isCorrect = null
  }
}

function manualJudge(result) {
  if (currentQuestion.value) currentQuestion.value.isCorrect = result
}

function finishPractice() {
  emit('finish-practice', { questions: localQuestions.value, timeSpent: timer.value })
  clearInterval(timerInterval)
  isReady.value = false
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
