<template>
  <div class="modal">
    <div class="modal-content">
      <h2>編輯錯題</h2>

      <label>問題文字:</label>
      <input v-model="cardToEdit.question" />

      <label>問題圖片:</label>
      <div v-if="cardToEdit.questionImage">
        <img :src="cardToEdit.questionImage" alt="問題圖片" class="preview-image" />
      </div>
      <UploadImageModal @file-change="(url) => handleFileChange(url, 'question')" />

      <label>答案文字:</label>
      <input v-model="cardToEdit.answer" />

      <label>答案圖片:</label>
      <div v-if="cardToEdit.answerImage">
        <img :src="cardToEdit.answerImage" alt="答案圖片" class="preview-image" />
      </div>
      <UploadImageModal @file-change="(url) => handleFileChange(url, 'answer')" />

      <label>筆記:</label>
      <textarea v-model="cardToEdit.note"></textarea>

      <div class="button-group">
        <button @click="updateCard">更新</button>
        <button class="delete-button" @click="deleteCard">刪除</button>
        <button @click="$emit('close')">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UploadImageModal from './UploadImageModal.vue'

const emit = defineEmits(['close', 'update-card', 'delete-card'])
const props = defineProps({
  card: Object
})

const cardToEdit = ref({ ...props.card })

function handleFileChange(url, type) {
  if (type === 'question') {
    cardToEdit.value.questionImage = url
  } else if (type === 'answer') {
    cardToEdit.value.answerImage = url
  }
}

const updateCard = () => {
  emit('update-card', cardToEdit.value)
  emit('close')
}

const deleteCard = () => {
  emit('delete-card', cardToEdit.value.id)
  emit('close')
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 10px;
}

.button-group {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.delete-button {
  background-color: #ff4d4d;
  color: white;
}
</style>
