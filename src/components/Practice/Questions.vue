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
              props.questions.length
            }}）
          </span>
        </button>
      </div>

      <div v-for="(question, index) in props.questions" :key="question.id"
        class="d-flex align-items-start mb-3 p-3 border rounded bg-light gap-3">
        <input type="checkbox" class="form-check-input mt-1" :value="question.id" v-model="selectedQuestionIds" />
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
        <button class="btn btn-outline-primary me-2" @click="decreaseCount" :disabled="localCount <= 1">
          -
        </button>
        <input type="number" class="form-control d-inline-block text-center" style="width: 60px"
          v-model.number="localCount" min="1" :max="totalQuestionCount" />
        <button class="btn btn-outline-primary ms-2" @click="increaseCount"
          :disabled="localCount >= totalQuestionCount">
          +
        </button>
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
import { ref, computed, watch, onMounted } from 'vue'
import { fetchQuestionCount } from '@/api/questions'

// ✅ 接收父層傳進來的 props
const props = defineProps({
  selectedOption: String,
  questions: Array,
})

// ✅ 向父層回傳選取結果
const emit = defineEmits(['update-selected'])

// ✅ 本地狀態變數
const selectedQuestionIds = ref([])
const localCount = ref(1) // ✅ 一開始就設為最小值
//const totalQuestionCount = ref(0) // 後端取得的總題數
const totalQuestionCount = computed(() => props.questions.length)


/**
 * ✅ 監聽 props 變化
 */


onMounted(() => {
  totalQuestionCount.value = props.questions.length
  console.log('💕 問題數量/questions.vue:', totalQuestionCount.value)
})

// 如果外層變更題數，更新 localCount
watch(
  () => props.questionCount,
  (newCount) => {
    localCount.value = newCount
  }
)

// 如果傳入的題目陣列長度變短，強制 localCount 不超過它
watch(
  () => props.questions,
  (val) => {
    if (val.length > 0 && localCount.value > val.length) {
      localCount.value = val.length
    }
  }
)

/**
 * ✅ 功能計算與控制
 */

// 判斷是否全選
const isAllSelected = computed(() => {
  return selectedQuestionIds.value.length === props.questions.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestionIds.value = []
  } else {
    selectedQuestionIds.value = props.questions.map((q) => q.id)
  }
}

/*
// 點擊全選／取消全選
const toggleSelectAll = () => {
  selectedQuestionIds.value = isAllSelected.value
    ? []
    : props.questions.map((q) => q.id)
}
*/

// 加減按鈕行為（依據 totalQuestionCount 限制）
const increaseCount = () => {
  if (localCount.value < totalQuestionCount.value) {
    localCount.value++
  }
}

const decreaseCount = () => {
  if (localCount.value > 1) {
    localCount.value--
  }
}

/**
 * ✅ 題目選擇邏輯
 */

// 根據模式過濾題目
const filteredQuestions = computed(() => {
  if (props.selectedOption === 'option2') {
    return [...props.questions].sort(() => 0.5 - Math.random()).slice(0, localCount.value)
  } else if (props.selectedOption === 'option3') {
    return [...props.questions].sort((a, b) => b.errCount - a.errCount).slice(0, localCount.value)
  }
  return props.questions
})

// 點擊「開始練習」
function confirmSelection() {
  const selected =

    //meimeielin: 從 props.questions改value 中選取的題目
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

.fixed-bottom-end {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  text-align: center;
  width: 100%;
}
</style>
