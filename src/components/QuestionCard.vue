<template>
  <div class="card">
    <!-- 顯示模式 -->
    <div v-if="!editMode">
      <div class="card-header">
        <span>{{ index }}.</span>
        <span class="type-label">
          【
          {{ card.questionType === 'truefalse'
            ? '是非題'
            : card.questionType === 'multipleABC'
              ? '選擇題（字母選項）'
              : card.questionType === 'multiple123'
                ? '選擇題（數字選項）'
                : card.questionType === 'open'
                  ? '問答題'
                  : '未知題型'
          }}
          】
        </span>

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

      <!-- ✏️ 筆記應該綁定資料 -->
      <textarea v-model="noteText" rows="3" class="note" placeholder="輸入筆記...">
      </textarea>
    </div>

    <!-- 編輯模式 -->
    <div v-else>
      <div class="card-header">
        <span>{{ index }}.</span>
        <span class="type-label">【{{ card.questionType === 'truefalse' ? '是非題' : card.questionType === 'multiple' ?
          '選擇題' : '問答題' }}】</span>
      </div>

      <p>題目圖片:</p>
      <input type="file" @change="(e) => handleFileChange(e, card, 'questionImage')" />
      <img v-if="card.questionImage" :src="card.questionImage" class="preview-image" />


      <!-- 題型處理 -->
      <div v-if="card.questionType === 'truefalse'">
        <label><input type="radio" value="✔" v-model="card.answer" />✔</label>
        <label><input type="radio" value="✘" v-model="card.answer" />✘</label>
      </div>

      <div v-else-if="card.questionType === 'multipleABC'">
        <label v-for="opt in ['A', 'B', 'C', 'D', 'E']" :key="opt">
          <input type="checkbox" :value="opt" v-model="card.answer" />{{ opt }}
        </label>
      </div>
      <div v-else-if="card.questionType === 'multiple123'">
        <label v-for="opt in ['1', '2', '3', '4', '5']" :key="opt">
          <input type="checkbox" :value="opt" v-model="card.answer" />{{ opt }}
        </label>
      </div>

      <div v-else-if="card.questionType === 'open'">
        <label>答案文字:</label>
        <input v-model="card.answer" />
      </div>

      <!-- 圖片上傳 -->
      <p>詳解圖片:</p>
      <input type="file" @change="(e) => handleFileChange(e, card, 'answerImage')" />
      <img v-if="card.answerImage" :src="card.answerImage" class="preview-image" />

      <!-- 編輯模式中也能修改筆記 -->
      <textarea v-model="noteText" rows="3" class="note" placeholder="輸入筆記..."></textarea>
      <span v-if="savingNote">儲存中...</span>

      <button class="delete-button" @click="deleteThisCard">刪了吧破防了💔</button>
    </div>
  </div>
</template>


<script>
import { ref, computed } from 'vue'

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

    const noteText = computed({
      get: () => props.card.note,
      set: (val) => {
        emit('update-note', { id: props.card.id, note: val })
      }
    })


    function deleteThisCard() {
      if (confirm('確定要刪除這張卡片嗎？')) {
        emit('delete-card', props.card.id)
      }
    }

    function uploadImage(type) {
      uploadingType.value = type
      fileInput.value.click()
    }
    function submitCard() {
      if (!questionImage.value) {
        alert('請上傳題目圖片')
        return
      }
      if (answer.value.length === 0) {
        alert('請輸入答案')
        return
      }
    }

    function handleFileChange(event, card, type) {
      const file = event.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        alert('圖片太大，請選擇小於 2MB 的檔案')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (type === 'questionImage') card.questionImage = e.target.result
        if (type === 'answerImage') card.answerImage = e.target.result
      }
      reader.readAsDataURL(file)
    }


    function removeImage(type) {
      if (type === 'question') props.card.questionImage = null
      if (type === 'answer') props.card.answerImage = null
    }

    function onNoteChange() {
      console.log('📝 note changed:', props.card.id, props.card.note)
      emit('update-note', { id: props.card.id, note: props.card.note })
    }


    return {
      uploadingType,
      fileInput,
      deleteThisCard,
      uploadImage,
      handleFileChange,
      removeImage,
      submitCard,
      noteText,
      noteText // ✅ 只保留這個即可，自動觸發事件

    }
  }
}
</script>


<style scoped>
.card {
  width: 100%;
  margin: 20px auto;
  background-color: #f5f9fd;
  /* 淡藍灰背景 */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #cfd8dc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 12px;
  color: #0d47a1;
  /* 深藍字 */
}

.type-label {
  color: #1976d2;
}

.star {
  background: none;
  font-size: 22px;
  border: none;
  cursor: pointer;
  color: #ffca28;
}

.card-content {
  display: flex;
  gap: 20px;
  position: relative;
  flex-wrap: wrap;
}

.box {
  flex: 1;
  background-color: #e3f2fd;
  /* 藍色區塊 */
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  position: relative;
  color: #263238;
}

.preview-image {
  margin-top: 10px;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #b0bec5;
}

.hidden .overlay {
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(195, 203, 206);
  z-index: 10;
  border-radius: 8px;
}

.note {
  width: 100%;
  margin-top: 10px;
  background-color: #f0f4c3;
  padding: 10px;
  border-left: 4px solid #ffca28;
  font-size: 14px;
  border-radius: 4px;
  color: #37474f;
  box-sizing: border-box;
}


.delete-button {
  background-color: #f6d7d4;
  color: rgb(171, 4, 4);
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.delete-button:hover {
  background-color: #d76154;
}

input[type="file"] {
  margin-top: 8px;
  margin-bottom: 8px;
}

label {
  margin-right: 10px;
  color: #37474f;
}

input[type="radio"],
input[type="checkbox"] {
  margin-right: 4px;
}

.edit-input {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #90a4ae;
}
</style>
