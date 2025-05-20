<template>
  <div class="question-container">
    <div v-if="selectedOption === 'option0'">
      <p class="text-m">請在上方選擇練習方式</p>
    </div>

    <div v-else-if="selectedOption === 'option1'">
      <div class="text-end mb-3">
        <button class="btn btn-sm btn-outline-primary" @click="toggleSelectAll">
          <i :class="isAllSelected ? 'bi bi-x' : 'bi bi-check-all'"></i>
          <span class="ms-1">
            {{ isAllSelected ? '取消全選' : '全選題目' }}（{{ selectedQuestionIds.length }}/{{
              questions.length
            }}）
          </span>
        </button>
      </div>

      <div v-for="(question, index) in questions" :key="question.id"
        class="d-flex align-items-start mb-3 p-3 border rounded bg-light gap-3">
        <input type="checkbox" class="form-check-input mt-1" :value="question.id" v-model="selectedQuestionIds" />
        <div class="text-center">
          <span class="text-s fw-bold">{{ index + 1 }}.</span>
        </div>

        <div class="d-flex flex-column w-100">
          <img :src="question.image" class="img-fluid rounded" style="width: 100%; height: auto; object-fit: contain"
            alt="題目圖片" />
          <div class="mt-2">
            <span class="text-red-s text-start">錯誤次數：{{ question.wrongCount }} 次</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="mt-3">
        <button class="btn btn-outline-primary me-2" @click="decreaseCount" :disabled="localCount <= 1">
          -
        </button>
        <input type="number" class="form-control d-inline-block text-center" style="width: 60px"
          v-model.number="localCount" min="1" :max="questions.length" />
        <button class="btn btn-outline-primary ms-2" @click="increaseCount" :disabled="localCount >= questions.length">
          +
        </button>
        <span class="ms-2">/ {{ questions.length }} 題</span>
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
import { fetchQuestionsByBook } from '@/api/questions.js'

const props = defineProps({
  selectedOption: String,
  questions: Array,
  questionCount: Number,
  currentSubject: String,
})

const questions = computed(() => props.questions)


//const { data } = await fetchQuestionsByBook(props.book.QuestionBook_ID)


const fetchAllQuestions = async () => {
  try {
    const data = await fetchQuestionsByBook(props.book.QuestionBook_ID)
    questions.value = data
  } catch (error) {
    console.error('載入題目失敗', error)
  }
}


const handleSelection = () => {
  selectedQuestions.value = []

  if (selectedOption.value === 'option1') {
    fetchAllQuestions()
  }
}


const emit = defineEmits('update-selected')

const selectedQuestionIds = ref([])
const localCount = ref(props.questionCount)

watch(
  () => props.questionCount,
  (newCount) => {
    localCount.value = newCount
  }
)

const isAllSelected = computed(() => {
  return selectedQuestionIds.value.length === props.questions.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestionIds.value = []
  } else {
    //selectedQuestionIds.value = props.questions.map((q) => q.id)
    selectedQuestionIds.value = questions.value.map((q) => q.id)

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
    return [...props.questions]
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, localCount.value)
  }
  return props.questions
})

function confirmSelection() {
  let selected =
    props.selectedOption === 'option1'
      ? props.questions.filter((q) => selectedQuestionIds.value.includes(q.id))
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

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.fixed-bottom-end {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  text-align: center;
  width: 100%;
}
</style>
