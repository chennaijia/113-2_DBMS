<template>
  <div class="gap-5">
    <div class="answer-container">
      <div v-if="questionType === 'open'" class="d-flex flex-column gap-3">
        <div class="gap-3">
          <label class="form-label text-m">答案</label>
          <input
            id="answerInput"
            type="text"
            class="form-control form-control-lg"
            v-model="userAnswer"
            :disabled="locked"
            ref="answerInputRef"
          />
        </div>
      </div>
      <div v-else class="d-flex flex-column gap-3">
        <div class="gap-3">
          <label class="form-label text-m">答案</label>
          <input
            id="answerInput"
            type="text"
            class="form-control form-control-lg"
            v-model="userAnswer"
            :disabled="locked"
            ref="answerInputRef"
          />
        </div>
      </div>
    </div>

<<<<<<< HEAD
    <div class="text-s">
      <div>題目類型：{{ questionType }}</div>
    </div>
=======

    <!-- 可擴充申論題 -->
  <div>
    <div>題目類型：{{ questionType }}</div>
    <div v-if="questionType === 'open'"></div>
    <div v-else-if="questionType === 'multipleABC'"></div>
    <div v-else-if="questionType === 'multiple123'"></div>
    <div v-else-if="questionType === 'truefalse'"></div>
>>>>>>> b4085f5dbc46d5276376520c9a315f7278017d57
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  question: Object,
  questionType: String,
})

const emit = defineEmits('answered')

const userAnswer = ref('')
const isCorrect = ref(null)
const answered = ref(false)
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

.text-m {
  color: #578bc7;
  font-size: 20px;
}
.text-s {
  color: #578bc7;
  font-size: 15px;
}
</style>
