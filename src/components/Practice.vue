<template>
  <div class="practice-container vw-100">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="practice-header">
        <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
          <i class="bi bi-caret-left"></i>
          <span class="ms-2">返回</span>
        </button>
        <div class="fw-bold text-primary fs-4 text-start">{{ currentSubject }} - 錯題練習</div>
      </div>

      <div class="d-flex gap-3 align-items-center">
        <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
        <span><i class="bi bi-clock"></i> {{ timer }}</span>
      </div>
    </div>
    <div v-if="questions && questions.length">
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

      <div class="question-box mb-4">
        <img
          :src="currentImage"
          class="img-fluid rounded shadow-sm"
          style="width: 100%; max-height: 60vh; object-fit: contain"
          alt="題目圖片"
        />
      </div>

      <Answer
        ref="answerRef"
        :question="props.questions[currentIndex]"
        :questionType="props.questions[currentIndex]?.questionType"
        @answered="handleAnswer"
      />

      <div class="d-flex justify-content-center gap-3 mt-5">
        <button
          class="btn btn-outline-secondary rounded-pill"
          @click="prevQuestion"
          :disabled="currentIndex === 0"
        >
          <i class="bi bi-caret-left-fill"></i> 上一題
        </button>

        <button
          class="btn btn-outline-primary rounded-pill"
          @click="nextQuestion"
          :disabled="currentIndex === questions.length - 1"
        >
          下一題 <i class="bi bi-caret-right-fill"></i>
        </button>
      </div>
    </div>
    <div v-else class="text-center mt-5 text-muted">尚未選擇題目，請回到上一頁選擇後開始練習</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Answer from './Practice/Answer.vue'

const props = defineProps({
  currentSubject: String,
  questions: Array,
})

const emit = defineEmits(['change-page', 'goBack'])

const currentIndex = ref(0)
const answerRef = ref(null)
const answeredResults = ref([])

const currentImage = computed(() => props.questions[currentIndex.value]?.image || '')

const progressWidth = computed(() => {
  return ((currentIndex.value + 1) / props.questions.length) * 100
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
  if (props.questions && props.questions.length > 0) {
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

function nextQuestion() {
  // 手動比對答案，但不鎖定輸入（Answer.vue expose submitAnswer）
  if (answerRef.value) {
    answerRef.value.submitAnswer()
  }
  // 之後的跳題邏輯會在 handleAnswer 中處理
}

function handleAnswer({ isCorrect, userAnswer, locked }) {
  // 儲存目前題目的作答結果
  answeredResults.value[currentIndex.value] = {
    isCorrect,
    userAnswer,
    locked,
  }

  // 若是按下一題而非對答案，這裡才會進行跳題（保證在答案已更新後）
  if (!locked && currentIndex.value < props.questions.length - 1) {
    setTimeout(() => {
      currentIndex.value++
    }, 300) // 延遲以確保答案已紀錄
  }
}
</script>

<style scoped>
.practice-header {
  position: fixed;
  top: 20px;
  left: 20px;
  width: auto;
  z-index: 1050; /* 確保不被其他元素遮住 */
}

.practice-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.question-box {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.fw-bold.text-primary.fs-4 {
  flex-grow: 1; /* 讓標題填充左側空間 */
  text-align: start; /* 確保標題靠左 */
}
</style>
