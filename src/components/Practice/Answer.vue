<template>
  <div class="answer-container">
    <div v-if="questionType === '選擇題'" class="d-flex flex-column gap-3">
      <div class="d-flex flex-row gap-3">
        <label for="answerInput" class="form-label">答案</label>
        <input
          id="answerInput"
          type="text"
          class="form-control"
          v-model="userAnswer"
          :disabled="locked"
          ref="answerInputRef"
        />
      </div>
      <button
        class="btn btn-outline-success rounded-pill col-auto"
        @click="lockAndSubmit"
        :disabled="!userAnswer || locked"
      >
        <i class="bi bi-check2"></i> 對答案
      </button>

      <p v-if="answered" class="mt-3 fw-bold" :class="isCorrect ? 'text-success' : 'text-danger'">
        {{
          isCorrect
            ? '✅ 恭喜你答對了！'
            : `❌ 答錯了，正確答案是：「${props.question.correctAnswer}」`
        }}
      </p>
    </div>

    <!-- 可擴充申論題 -->
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  question: Object,
  questionType: String,
})

const emit = defineEmits(['answered']) // 告知父層

const userAnswer = ref('')
const isCorrect = ref(null)
const answered = ref(false)
const locked = ref(false) // 🔐 判斷是否鎖定輸入
const answerInputRef = ref(null)

watch(
  () => props.question,
  () => {
    userAnswer.value = ''
    isCorrect.value = null
    answered.value = false
    locked.value = false

    nextTick(() => {
      answerInputRef.value?.focus()
    })
  }
)

// 🔒 使用者主動點「對答案」才會鎖定
function lockAndSubmit() {
  locked.value = true
  submitAnswer()
}

// 🧠 父層或內部都可以呼叫
function submitAnswer() {
  answered.value = true
  const normalizedInput = normalize(userAnswer.value)
  const normalizedAnswer = normalize(props.question.correctAnswer)
  isCorrect.value = normalizedInput === normalizedAnswer

  emit('answered', {
    isCorrect: isCorrect.value,
    userAnswer: userAnswer.value,
    locked: locked.value,
  })
}

function normalize(text) {
  return (
    text
      ?.trim()
      .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .toLowerCase() || ''
  )
}

// 👇 提供給父層呼叫（未鎖定情況下）
defineExpose({
  submitAnswer, // 提供給「下一題」時判分用
})
</script>

<style scoped>
.answer-container {
  padding: 1rem;
  background-color: #fdfdfd;
  border-radius: 10px;
  border: 1px solid #ddd;
}
</style>
