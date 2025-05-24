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
        <label><input type="radio" value="T" v-model="answer" />T</label>
        <label><input type="radio" value="F" v-model="answer" />F</label>
      </template>

      <template v-else-if="questionType === 'multipleABC'">
        <label>選擇正確答案 (字母):</label>
        <div class="options">
          <label v-for="opt in ['A', 'B', 'C', 'D', 'E']" :key="opt">
            <input type="checkbox" :value="opt" v-model="answer" /> {{ opt }}
          </label>
        </div>
      </template>

      <template v-else-if="questionType === 'multiple123'">
        <label>選擇正確答案 (數字):</label>
        <div class="options">
          <label v-for="num in ['1', '2', '3', '4', '5']" :key="num">
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
import axios from 'axios'

const emit = defineEmits(['add-card', 'close'])

const props = defineProps<{
  bookId: number
}>()

const questionType = ref('truefalse')
const questionImage = ref<string | null>(null)
const answerImage = ref<string | null>(null)
const answer = ref([])
const answerText = ref('')

const questionInput = ref<HTMLInputElement | null>(null)
const answerInput = ref<HTMLInputElement | null>(null)

const questionImageFile = ref<File | null>(null)
const answerImageFile = ref<File | null>(null)

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

const handleFileChange = (event: Event, type: 'question' | 'answer') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const imageURL = URL.createObjectURL(file)
  if (type === 'question') {
    questionImage.value = imageURL
    questionImageFile.value = file
  } else if (type === 'answer') {
    answerImage.value = imageURL
    answerImageFile.value = file
  }
}

const submitCard = async () => {
  console.log('🚀 開始送出卡片')

  if (!questionImageFile.value) {
    alert('請上傳題目圖片')
    console.log('⚠️ 未選擇題目圖片，停止送出')
    return
  }

  const resolvedAnswer =
    questionType.value === 'open'
      ? answerText.value
      : questionType.value === 'multipleABC' || questionType.value === 'multiple123'
      ? [...answer.value].sort()
      : answer.value

  if (
    (questionType.value === 'open' && !answerText.value) ||
    (questionType.value !== 'open' && (!resolvedAnswer || resolvedAnswer.length === 0))
  ) {
    alert('請輸入答案')
    console.log('⚠️ 答案未填寫，停止送出')
    return
  }

  const formData = new FormData()
  formData.append('qtype', questionType.value)
  formData.append('content', '') // 可加入題目文字
  formData.append(
    'answer',
    Array.isArray(resolvedAnswer) ? resolvedAnswer.join(',') : resolvedAnswer
  )
  formData.append('level', '1') // 難度
  formData.append('subject', '') // 暫時空，之後可加上科目分類

  formData.append('content_pic', questionImageFile.value)
  if (answerImageFile.value) {
    formData.append('answer_pic', answerImageFile.value)
  }

  // 👈 取得當前本子ID
  //formData.append('questionBookId', 1);
  formData.append('QuestionBook_ID', String(props.bookId))

  console.log('📦 準備送出的表單資料：', {
    qtype: questionType.value,
    answer: resolvedAnswer,
    content_pic: questionImageFile.value,
    answer_pic: answerImageFile.value,
  })

  try {
    const token = localStorage.getItem('token')
    console.log('🔐 使用的 JWT token:', token)

    const res = await axios.post('http://localhost:3000/api/question/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('✅ 後端回傳成功：', res.data)

    emit('add-card', res.data)
    emit('close')

    // Reset
    questionImage.value = null
    answerImage.value = null
    answer.value = []
    answerText.value = ''
    questionImageFile.value = null
    answerImageFile.value = null
    alert('✅ 新增成功！')
    console.log('🔄 資料已重置，流程完成')
  } catch (error: any) {
    console.error('❌ 新增題目失敗:', error)

    const message = error.response?.data?.message || '新增題目失敗，請稍後再試'
    alert(`❌ 錯誤：${message}`)
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(13, 71, 161, 0.3);
  /* 半透明藍底 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #f5f9fd;
  /* 卡片同背景 */
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
input[type='text'],
input[type='file'] {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #90a4ae;
  box-sizing: border-box;
  background-color: white;
}

input[type='radio'],
input[type='checkbox'] {
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

button[type='submit'],
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
  gap: 1rem;
  /* 可自行調整間距 */
  flex-wrap: wrap;
  /* 如果畫面太窄可以自動換行，若不要換行可刪除這行 */
}
</style>
