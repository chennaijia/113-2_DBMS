<template>
  <div class="question-container">
    <div v-if="selectedOption === 'option0'">
      <p class="text-m">請在上方選擇練習方式</p>
    </div>

    <div v-else-if="selectedOption === 'option1'">
      <p>目前模式：{{ selectedOption }}</p>
      <p>題目總數：{{ props.questions.length }}</p>

      <div class="text-end mb-3">
        <button class="btn btn-sm btn-outline-primary" @click="toggleSelectAll">
          <i :class="isAllSelected ? 'bi bi-x' : 'bi bi-check-all'"></i>
          <span class="ms-1">
            {{ isAllSelected ? '取消全選' : '全選題目' }}（{{ selectedQuestionIds.length }}/{{ props.questions.length }}）
          </span>
        </button>
      </div>

      <div v-for="(question, index) in props.questions" :key="question.Question_ID"
        class="d-flex align-items-start mb-3 p-3 border rounded bg-light gap-3">
        <input type="checkbox" class="form-check-input mt-1" :value="question.Question_ID"
          v-model="selectedQuestionIds" />
        <div class="text-center">
          <span class="text-s fw-bold">{{ index + 1 }}.</span>
        </div>

        <div class="d-flex flex-column w-100">

          <img v-if="question.Content_pic" :src="question.Content_pic" class="img-fluid rounded"
            style="width: 100%; height: auto; object-fit: contain" alt="題目圖片" />
          <div class="mt-2">
            <span class="text-red-s text-start">錯誤次數：{{ question.errCount }} 次</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="mt-3">
        <button class="btn btn-outline-primary me-2" @click="decreaseCount" :disabled="localCount <= 1">-</button>
        <input type="number" class="form-control d-inline-block text-center" style="width: 60px"
          v-model.number="localCount" min="1" :max="questions.length" />
        <button class="btn btn-outline-primary ms-2" @click="increaseCount"
          :disabled="localCount >= props.questions.length">+</button>
        <span class="ms-2">/ {{ props.questions.length }} 題</span>
      </div>
    </div>

    <div v-if="selectedOption !== 'option0'" class="fixed-bottom-end mt-4">
      <button class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill"
        @click="confirmSelection">
        <i class="bi bi-check"></i>
        <span class="ms-2">開始練習</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  selectedOption: String,
  questions: Array,
  questionCount: Number,
  currentSubject: String,
  userId: {
    type: Number,
    required: true,
  }
})

const emit = defineEmits('update-selected')

const selectedQuestionIds = ref([])
const localCount = ref(props.questionCount)

watch(() => props.questionCount, (newCount) => {
  localCount.value = newCount

})

watch(() => props.questions, (newVal) => {
  if (newVal.length > 0 && localCount.value > newVal.length) {
    localCount.value = newVal.length
  }
})


// ✅ 當題目變動時自動調整最大值
watch(() => props.questions, (val) => {
  console.log('傳進來的題目', val)
  if (val.length > 0 && localCount.value > val.length) {
    localCount.value = val.length
  }
})

const isAllSelected = computed(() => {
  return selectedQuestionIds.value.length === props.questions.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestionIds.value = []
  } else {
    selectedQuestionIds.value = props.questions.map((q) => q.Question_ID)
  }
}

const increaseCount = () => {
  if (localCount.value < props.questions.length) localCount.value++
}
const decreaseCount = () => {
  if (localCount.value > 1) localCount.value--
}

const filteredQuestions = computed(() => {
  if (props.selectedOption === 'option2') {
    return [...props.questions].sort(() => 0.5 - Math.random()).slice(0, localCount.value)
  } else if (props.selectedOption === 'option3') {
    return [...props.questions].sort((a, b) => b.errCount - a.errCount).slice(0, localCount.value)
  }
  return props.questions
})

function confirmSelection() {
  const selected =
    props.selectedOption === 'option1'
      ? props.questions.filter((q) => selectedQuestionIds.value.includes(q.Question_ID))
      : filteredQuestions.value

  emit('update-selected', selected)
}
</script>


<style scoped>
.question-container {
  width: 80vw;
  max-width: 1000px;
  margin: auto;
  padding: 1rem;
}

.text-m {
  color: #408ee7;
  font-size: 20px;
}

.text-s {
  color: #578bc7;
  font-size: 15px;
}

.text-red-s {
  color: #cc5050;
  font-size: 15px;
}

.fixed-bottom-end {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  text-align: center;
  width: 100%;
}
</style>
