<template>
  <div class="modal">
    <div class="modal-content">
      <h2>新增卡片</h2>

      <label>選擇題型:</label>
      <select v-model="questionType">
        <option value="truefalse">是非題</option>
        <option value="multipleABC">選擇題(字母選項)</option>
        <option value="multiple123">選擇題(數字選項)</option>
        <option value="open">問答題</option>
      </select>

      <label>題目圖片:</label>
      <div v-if="questionImage">
        <img :src="questionImage" alt="題目圖片" class="preview-image" />
        <button @click="removeImage('question')">移除圖片</button>
      </div>
      <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'question')" />

      <!-- 答案欄位：依據題型切換 -->
      <template v-if="questionType === 'truefalse'">
        <label>選擇正確答案:</label>
        <label><input type="radio" value="✔" v-model="answer" />✔</label>
        <label><input type="radio" value="✘" v-model="answer" />✘</label>

        <label>詳解圖片:</label>
        <div v-if="answerImage">
          <img :src="answerImage" class="preview-image" />
          <button @click="removeImage('answer')">移除圖片</button>
        </div>
        <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'answer')" />
      </template>

      <template v-else-if="questionType === 'multipleABC'">
        <label>選擇正確答案:</label>
        <div>

    <p>字母選項:</p>
    <label v-for="opt in ['A','B','C','D','E']" :key="opt">
      <input
        type="checkbox"
        :value="opt"
        v-model="answer"
      />
      {{ opt }}
    </label>
    <label>詳解圖片:</label>
        <div v-if="answerImage">
          <img :src="answerImage" class="preview-image" />
          <button @click="removeImage('answer')">移除圖片</button>
        </div>
        <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'answer')" />
  </div>
</template>
 <template v-else-if="questionType === 'multiple123'">
        <label>選擇正確答案:</label>
        <div></div>
  <div>
    <p>數字選項:</p>
    <label v-for="num in ['1','2','3','4','5']" :key="num">
      <input
        type="checkbox"
        :value="num"
        v-model="answer"
      />
      {{ num }}
    </label>
        </div>

        <label>詳解圖片:</label>
        <div v-if="answerImage">
          <img :src="answerImage" class="preview-image" />
          <button @click="removeImage('answer')">移除圖片</button>
        </div>
        <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'answer')" />
      </template>

      <template v-else-if="questionType === 'open'">
        <label>答案文字:</label>
        <input v-model="answer" />

        <label>詳解圖片:</label>
        <div v-if="answerImage">
          <img :src="answerImage" class="preview-image" />
          <button @click="removeImage('answer')">移除圖片</button>
        </div>
        <input type="file" accept="image/*" @change="(e) => handleFileChange(e, 'answer')" />
      </template>

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
    const questionImage = ref(null)
    const answerImage = ref(null)
    const answer = ref([])
    const questionType = ref('truefalse') // 預設題型

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
      if (!questionImage.value) {
        alert('請上傳題目圖片')
        return
      }
      if(answer.value.length === 0){
        alert('請輸入答案')
        return
      }

      const newCard = {
        id: Date.now(),
        questionType: questionType.value,
        question: '', // 改由圖片呈現
        answer: (questionType.value === 'multipleABC' || questionType.value === 'multiple123')
      ? [...answer.value].sort() // 這裡排序
      : answer.value,
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
      answer.value = ''
    }

    return {
      questionImage,
      answerImage,
      answer,
      questionType,
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
