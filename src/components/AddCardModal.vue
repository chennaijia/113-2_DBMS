<template>
  <div class="modal">
    <div class="modal-content">
      <h2>新增錯題</h2>

      <!-- 題型選擇 -->
      <label>選擇題型:</label>
      <select v-model="questionType">
        <option value="truefalse">是非題</option>
        <option value="multipleABC">選擇題 (字母選項)</option>
        <option value="multiple123">選擇題 (數字選項)</option>
        <option value="open">問答題</option>
      </select>

      <!-- 題目圖片 -->
      <label>題目圖片:</label>
      <div>
        <input
          type="file"
          accept="image/*"
          @change="(e) => handleFileChange(e, 'question')"
          ref="questionInput"
          style="display: none"
        />
        <button type="button" @click="triggerInput('question')">
          {{ questionImage ? '更換圖片' : '上傳圖片' }}
        </button>

        <div v-if="questionImage">
          <img :src="questionImage" alt="題目圖片" class="preview-image" />
        </div>
      </div>

      <!-- 題型條件渲染 -->
      <template v-if="questionType === 'truefalse'">
        <label>選擇正確答案:</label>
        <label><input type="radio" value="✔" v-model="answer" />✔</label>
        <label><input type="radio" value="✘" v-model="answer" />✘</label>
      </template>

      <template v-else-if="questionType === 'multipleABC'">
        <label>選擇正確答案 (字母):</label>
        <div class="options">
          <label v-for="opt in ['A','B','C','D','E']" :key="opt">
            <input type="checkbox" :value="opt" v-model="answer" /> {{ opt }}
          </label>
        </div>
      </template>

      <template v-else-if="questionType === 'multiple123'">
        <label>選擇正確答案 (數字):</label>
        <div class="options">
          <label v-for="num in ['1','2','3','4','5']" :key="num">
            <input type="checkbox" :value="num" v-model="answer" /> {{ num }}
          </label>
        </div>
      </template>

      <template v-else-if="questionType === 'open'">
        <label>答案文字:</label>
        <input v-model="answerText" placeholder="請輸入答案" />
      </template>

      <!-- 詳解圖片 -->
      <label>詳解圖片:</label>
      <div>
        <input
          type="file"
          accept="image/*"
          @change="(e) => handleFileChange(e, 'answer')"
          ref="answerInput"
          style="display: none"
        />
        <button type="button" @click="triggerInput('answer')">
          {{ answerImage ? '更換圖片' : '上傳圖片' }}
        </button>

        <div v-if="answerImage">
          <img :src="answerImage" alt="詳解圖片" class="preview-image" />
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="button-group">
        <button @click="submitCard">送出</button>
        <button @click="emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['add-card', 'close'])

const questionType = ref('truefalse')
const questionImage = ref<string | null>(null)
const answerImage = ref<string | null>(null)
const answer = ref([])
const answerText = ref('')

const questionInput = ref<HTMLInputElement | null>(null)
const answerInput = ref<HTMLInputElement | null>(null)

function triggerInput(type: 'question' | 'answer') {
  if (type === 'question') {
    questionInput.value?.click()
  } else {
    answerInput.value?.click()
  }
}

// 根據題型切換初始化答案欄位
watch(questionType, (newType) => {
  if (newType === 'open') {
    answerText.value = ''
  } else {
    answer.value = []
  }
})

function handleFileChange(event: Event, type: 'question' | 'answer') {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'question') {
        questionImage.value = result
      } else {
        answerImage.value = result
      }
    }
    reader.readAsDataURL(file)
  }
}

function submitCard() {
  if (!questionImage.value) {
    alert('請上傳題目圖片')
    return
  }

  const resolvedAnswer =
    questionType.value === 'open' ? answerText.value :
    (questionType.value === 'multipleABC' || questionType.value === 'multiple123')
      ? [...answer.value].sort()
      : answer.value

  if (
    (questionType.value === 'open' && !answerText.value) ||
    (questionType.value !== 'open' && (!resolvedAnswer || resolvedAnswer.length === 0))
  ) {
    alert('請輸入答案')
    return
  }

  const newCard = {
    id: Date.now(),
    questionType: questionType.value,
    question: '',
    answer: resolvedAnswer,
    questionImage: questionImage.value,
    answerImage: answerImage.value,
    note: '',
    starred: false,
    wrongCount: 0,
    rightCount: 0,
  }

  emit('add-card', newCard)
  emit('close')

  // Reset
  questionImage.value = null
  answerImage.value = null
  answer.value = []
  answerText.value = ''
}
</script>


<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(13, 71, 161, 0.3); /* 半透明藍底 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #f5f9fd; /* 卡片同背景 */
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border: 1px solid #cfd8dc;
}

h2 {
  margin-bottom: 20px;
  color: #0d47a1;
}

label {
  display: block;
  margin: 12px 0 6px;
  font-weight: bold;
  color: #37474f;
}

select,
input[type="text"],
input[type="file"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #90a4ae;
  box-sizing: border-box;
  background-color: white;
}

input[type="radio"],
input[type="checkbox"] {
  margin-right: 6px;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #b0bec5;
}

button {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button[type="submit"],
.button-group button:first-child {
  background-color: #1976d2;
  color: white;
}

.button-group button:last-child {
  background-color: #f6d7d4;
  color: rgb(171, 4, 4);
}

.button-group button:last-child:hover {
  background-color: #d76154;
}
.options {
  display: flex;
  gap: 1rem; /* 可自行調整間距 */
  flex-wrap: wrap; /* 如果畫面太窄可以自動換行，若不要換行可刪除這行 */
}
</style>
