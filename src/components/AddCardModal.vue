<template>
  <div class="modal centered">
    <h2>新增卡片</h2>
    <input v-model="question" placeholder="輸入題目" class="input" />
    <button @click="uploadImage('question')">上傳題目圖片</button>
    <div v-if="questionImage" class="preview-wrapper">
      <img :src="questionImage" class="preview-image" />
      <button class="remove-btn" @click="removeImage('question')">刪除圖片</button>
    </div>

    <input v-model="answer" placeholder="輸入答案" class="input" />
    <button @click="uploadImage('answer')">上傳答案圖片</button>
    <div v-if="answerImage" class="preview-wrapper">
      <img :src="answerImage" class="preview-image" />
      <button class="remove-btn" @click="removeImage('answer')">刪除圖片</button>
    </div>

    <div class="buttons">
      <button class="confirm" @click="submitCard">新增</button>
      <button class="cancel" @click="$emit('close')">取消</button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['add-card','close'])

const question = ref('')
const answer = ref('')
const questionImage = ref(null)
const answerImage = ref(null)

const fileInput = ref(null)
const uploadingType = ref(null)

function uploadImage(type) {
  uploadingType.value = type
  fileInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('圖片太大，請選小於 2MB 的圖片')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (uploadingType.value === 'question') questionImage.value = e.target.result
    if (uploadingType.value === 'answer') answerImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage(type) {
  if (type === 'question') questionImage.value = null
  if (type === 'answer') answerImage.value = null
}

function submitCard() {
  // 驗證：題目或題目圖片至少一個有內容，答案或答案圖片至少一個有內容
  if ((!question.value.trim() && !questionImage.value) && (!answer.value.trim() && !answerImage.value)) {
    alert('請至少提供題目的文字或圖片，以及答案的文字或圖片')
    return
  }

  const newCard = {
    id: Date.now(),
    question: question.value.trim(),
    answer: answer.value.trim(),
    questionImage: questionImage.value,
    answerImage: answerImage.value,
    note: '',
    starred: false,
    wrongCount: 0,
    rightCount: 0,
  }
  emit('add-card', newCard)
  emit('close')

  // reset
  question.value = ''
  answer.value = ''
  questionImage.value = null
  answerImage.value = null
}
</script>

<style scoped>
.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 90%; max-width: 400px;
}
.input {
  width: 100%; padding: 8px; margin: 8px 0; border: 1px solid #ccc; border-radius: 6px;
}
.preview-wrapper {
  position: relative; margin: 8px 0;
}
.preview-image {
  max-width: 100%; border-radius: 6px;
}
.remove-btn {
  position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.7); color: white; border: none; border-radius: 4px; cursor: pointer;
}
.buttons { display: flex; justify-content: space-between; margin-top: 16px; }
.confirm { background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.cancel { background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
</style>
