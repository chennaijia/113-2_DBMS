<template>
  <div class="card">
    <div v-if="!editMode">
      <!-- 顯示模式 -->
      <div class="card-header">
        <span>{{ index }}.</span>
        <button class="star" @click="$emit('toggle-star')">
          {{ card.starred ? '★' : '☆' }}
        </button>
        <span class="stats">❌: {{ card.wrongCount }} 次 ✔️: {{ card.rightCount }} 次</span>
      </div>

      <div class="card-content">
        <div class="box">
          <div>{{ card.question }}</div>
          <img v-if="card.questionImage" :src="card.questionImage" class="preview-image" />
        </div>
        <div class="box" :class="{ hidden: !showAnswers }">
          <div>{{ card.answer }}</div>
          <img v-if="card.answerImage" :src="card.answerImage" class="preview-image" />
          <div v-if="!showAnswers" class="overlay"></div>
        </div>
      </div>

      <div class="note" contenteditable>{{ card.note }}</div>
    </div>

    <div v-else>
      <!-- 編輯模式 -->
      <input v-model="card.question" placeholder="編輯題目" class="edit-input" />
      <button @click="uploadImage('question')">上傳題目圖片</button>
      <div v-if="card.questionImage">
        <img :src="card.questionImage" class="preview-image" />
        <button @click="removeImage('question')">刪除圖片</button>
      </div>

      <input v-model="card.answer" placeholder="編輯答案" class="edit-input" />
      <button @click="uploadImage('answer')">上傳答案圖片</button>
      <div v-if="card.answerImage">
        <img :src="card.answerImage" class="preview-image" />
        <button @click="removeImage('answer')">刪除圖片</button>
      </div>

      <div class="note" contenteditable>{{ card.note }}</div>
      <button class="delete-card-button" @click="deleteThisCard">刪除整張卡片</button>
      <!-- 隱藏的 input[type=file] -->
      <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    index: Number,
    card: Object,
    showAnswers: Boolean,
    editMode: Boolean
  },
  emits: ['delete-card'],
  setup(props, { emit }) {
    const uploadingType = ref(null)
    const fileInput = ref(null)

    function deleteThisCard() {
      if (confirm('確定要刪除這張卡片嗎？')) {
        emit('delete-card', props.card.id)
      }
    }

    function uploadImage(type) {
      uploadingType.value = type
      fileInput.value.click()
    }

    function handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        alert('圖片太大，請選擇小於 2MB 的檔案')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (uploadingType.value === 'question') props.card.questionImage = e.target.result
        if (uploadingType.value === 'answer') props.card.answerImage = e.target.result
      }
      reader.readAsDataURL(file)
    }

    function removeImage(type) {
      if (type === 'question') props.card.questionImage = null
      if (type === 'answer') props.card.answerImage = null
    }

    return {
      uploadingType,
      fileInput,
      deleteThisCard,
      uploadImage,
      handleFileChange,
      removeImage
    }
  }
}
</script>


<style scoped>
.card { background-color: #ffffff; border-radius: 12px; margin-bottom: 20px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 10px; }
.star { background: none; font-size: 20px; border: none; cursor: pointer; color: gold; }
.card-content { display: flex; gap: 20px; position: relative; }
.box { flex: 1; background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; position: relative; }
.preview-image { margin-top: 10px; max-width: 100%; height: auto; border-radius: 8px; }
.hidden .overlay { display: block; }
.answer-box .overlay { display: none; }
.overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgb(176, 190, 197); z-index: 10; border-radius: 8px; }
.image-block { margin-bottom: 15px; }
.delete-button { margin-top: 5px; background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.note { margin-top: 10px; background-color: #fff8e1; padding: 10px; border-left: 4px solid #ffca28; font-size: 14px; border-radius: 4px; }
.delete-card-button { margin-top: 10px; background-color: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
.edit-input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; border-radius: 6px; border: 1px solid #ccc; }
</style>
