<template>
  <div class="container">
    <h1>題庫管理系統 📚</h1>

    <!-- 題目新增區塊 -->
    <div class="card add-section">
      <h2>新增題目</h2>
      <label>題型：</label>
      <select v-model="newQuestion.type">
        <option value="truefalse">是非題</option>
        <option value="multipleABC">選擇題(A~E)</option>
        <option value="multiple123">選擇題(1~5)</option>
        <option value="open">問答題</option>
      </select>

      <label>題目圖片：</label>
      <input type="file" @change="e => handleImageUpload(e, 'question')" />

      <label>答案：</label>
      <div v-if="newQuestion.type === 'truefalse'">
        <input type="radio" value="✔" v-model="newQuestion.answer" />✔
        <input type="radio" value="✘" v-model="newQuestion.answer" />✘
      </div>
      <div v-else-if="newQuestion.type === 'multipleABC'">
        <label v-for="opt in ['A','B','C','D','E']" :key="opt">
          <input type="checkbox" :value="opt" v-model="newQuestion.answer" /> {{ opt }}
        </label>
      </div>
      <div v-else-if="newQuestion.type === 'multiple123'">
        <label v-for="opt in ['1','2','3','4','5']" :key="opt">
          <input type="checkbox" :value="opt" v-model="newQuestion.answer" /> {{ opt }}
        </label>
      </div>
      <div v-else>
        <input v-model="newQuestion.answer" placeholder="請輸入答案" />
      </div>

      <label>詳解圖片：</label>
      <input type="file" @change="e => handleImageUpload(e, 'answer')" />

      <button @click="addQuestion">新增卡片</button>
    </div>

    <!-- 題目列表 -->
    <div class="card-list">
      <h2>目前題目列表 ({{ questions.length }} 題)</h2>
      <div
        class="card"
        v-for="q in questions"
        :key="q.id"
      >
        <p><strong>題型：</strong>{{ q.type }}</p>
        <img :src="q.questionImage" class="preview" v-if="q.questionImage" />
        <p><strong>答案：</strong> {{ Array.isArray(q.answer) ? q.answer.join(', ') : q.answer }}</p>
        <img :src="q.answerImage" class="preview" v-if="q.answerImage" />
        <button @click="deleteQuestion(q.id)">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const questions = ref([])

const newQuestion = reactive({
  type: 'truefalse',
  questionImage: null,
  answerImage: null,
  answer: '',
})

function handleImageUpload(event, type) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (type === 'question') newQuestion.questionImage = reader.result
    else newQuestion.answerImage = reader.result
  }
  reader.readAsDataURL(file)
}

function addQuestion() {
  if (!newQuestion.questionImage) {
    alert('請上傳題目圖片 📷')
    return
  }

  const id = Date.now()
  const answer = ['multipleABC', 'multiple123'].includes(newQuestion.type)
    ? [...newQuestion.answer].sort()
    : newQuestion.answer

  questions.value.push({
    id,
    type: newQuestion.type,
    questionImage: newQuestion.questionImage,
    answerImage: newQuestion.answerImage,
    answer,
  })

  // Reset
  newQuestion.questionImage = null
  newQuestion.answerImage = null
  newQuestion.answer = newQuestion.type === 'truefalse' ? '' : (['multipleABC', 'multiple123'].includes(newQuestion.type) ? [] : '')
}

function deleteQuestion(id) {
  questions.value = questions.value.filter(q => q.id !== id)
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}
.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.card-list {
  margin-top: 30px;
}
.add-section input[type="text"],
.add-section select {
  margin-bottom: 10px;
  display: block;
}
.preview {
  max-height: 150px;
  display: block;
  margin: 10px 0;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #36996e;
}
</style>
