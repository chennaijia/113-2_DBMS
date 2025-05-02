<template>
  <div class="modal">
    <div class="modal-content">
      <h2>新增卡片</h2>

      <label>問題文字:</label>
      <input v-model="question" />

      <label>問題圖片:</label>
      <div v-if="questionImage">
        <img :src="questionImage" alt="問題圖片" class="preview-image" />
        <button @click="removeImage('question')">移除圖片</button>
      </div>
      <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'question')" />

      <label>答案文字:</label>
      <input v-model="answer" />

      <label>答案圖片:</label>
      <div v-if="answerImage">
        <img :src="answerImage" alt="答案圖片" class="preview-image" />
        <button @click="removeImage('answer')">移除圖片</button>
      </div>
      <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'answer')" />

      <div class="button-group">
        <button @click="submitCard">送出</button>
        <button @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  emits: ['add-card', 'close'],
  setup(_, { emit }) {
    const question = ref('')
    const answer = ref('')
    const questionImage = ref(null)
    const answerImage = ref(null)

    function handleFileChange(event, type) {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        alert('圖片太大，請選擇小於 2MB 的檔案')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'question') questionImage.value = e.target.result
        if (type === 'answer') answerImage.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    function removeImage(type) {
      if (type === 'question') questionImage.value = null
      if (type === 'answer') answerImage.value = null
    }

    function submitCard() {
      if ((!question.value.trim() && !questionImage.value) &&
          (!answer.value.trim() && !answerImage.value)) {
        alert('請至少提供題目或答案的文字或圖片')
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

      // Reset
      question.value = ''
      answer.value = ''
      questionImage.value = null
      answerImage.value = null
    }

    return {
      question,
      answer,
      questionImage,
      answerImage,
      handleFileChange,
      removeImage,
      submitCard,

    }
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
</style>
