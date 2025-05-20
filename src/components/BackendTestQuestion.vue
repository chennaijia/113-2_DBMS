PORT=3000
JWT_SECRET=s0m3thingS3cr3t
DB_HOST=localhost
DB_USER=root
DB_PASS=meimeielin
DB_NAME=dbms-112306010
CLOUD_NAME=dlvrb8led
API_KEY=851379669482937
API_SECRET=J8fvwVf1sCwCI9y-B12xOwcHYR0







































<template>


  <div class="toolbar">
    <select @change="onFilterChange" v-model="filterOption" class="filter-select">
      <option value="">全部</option>
      <option value="starred">加星號</option>
      <option value="noAnswer">錯誤超過五次</option>
      <option value="truefalse">是非題</option>
      <option value="multiple123">選擇題(數字選項)</option>
      <option value="multipleABC">選擇題(字母選項)</option>
      <option value="open">問答題</option>
    </select>


    <button class="btn primary" @click="toggleShowAnswers">
      {{ showAnswers ? '🙈 隱藏答案' : '👀 顯示答案' }}
    </button>


    <button @click="testClick">點我測試</button>
  </div>




  <div class="container">




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
        <label v-for="opt in ['A', 'B', 'C', 'D', 'E']" :key="opt">
          <input type="checkbox" :value="opt" v-model="newQuestion.answer" /> {{ opt }}
        </label>
      </div>
      <div v-else-if="newQuestion.type === 'multiple123'">
        <label v-for="opt in ['1', '2', '3', '4', '5']" :key="opt">
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
      <div class="card" v-for="q in questions" :key="q.id">
        <p><strong>題型：</strong>{{ q.type }}</p>
        <img :src="q.questionImage" class="preview" v-if="q.questionImage" />
        <p><strong>答案：</strong> {{ Array.isArray(q.answer) ? q.answer.join(', ') : q.answer }}</p>
        <img :src="q.answerImage" class="preview" v-if="q.answerImage" />
        <button @click="deleteQuestion(q.id)">刪除</button>
      </div>
    </div>


    <!-- 歷史題目列表 -->
    <div v-for="q in questions" :key="q.question_id" class="card">
      <p>題型：{{ q.QType }}</p>
      <img :src="q.Content_pic" class="preview" v-if="q.Content_pic" />
      <p>答案：{{ q.Answer }}</p>
      <img :src="q.Answer_pic" class="preview" v-if="q.Answer_pic" />
    </div>


  </div>
</template>
<script setup>


const testClick = () => {
  console.log('✅ 測試按鈕有反應！');
}




import { reactive, ref } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'



const questions = ref([])

const filterOption = ref('');
const showAnswers = ref(true);


const newQuestion = reactive({
  type: 'truefalse',
  answer: '',
  questionImageFile: null,
  answerImageFile: null,
})


function handleImageUpload(event, type) {
  const file = event.target.files[0]
  if (!file) return


  if (type === 'question') newQuestion.questionImageFile = file
  else newQuestion.answerImageFile = file
}


const addQuestion = async () => {
  console.log('🟢 開始新增題目');
  const token = localStorage.getItem('token'); // ✅ 讀 token


  const formData = new FormData();
  formData.append('qtype', newQuestion.type);
  formData.append('content_pic', newQuestion.questionImageFile);
  formData.append('answer_pic', newQuestion.answerImageFile || '');


  // 處理答案格式
  let answer = '';
  if (newQuestion.type === 'truefalse') {
    answer = newQuestion.answer === '✔' ? 'yes' : 'no';
  } else if (['multipleABC', 'multiple123'].includes(newQuestion.type)) {
    answer = Array.isArray(newQuestion.answer)
      ? newQuestion.answer.sort().join('')
      : '';
  } else {
    answer = newQuestion.answer;
  }
  formData.append('answer', answer);


  try {
    console.log('🚀 發送 axios 請求...');
    const res = await axios.post('http://localhost:3000/api/question/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // ✅ 加這行
      },
    });


    alert('✅ 新增成功！');
    console.log('📥 成功回應：', res.data);
    console.log('📌 後端有抓到的使用者 ID？（後端需回傳）:', res.data.creator_id); // 新增這行


    questions.value.unshift({
      question_id: res.data.id,
      QType: newQuestion.type,
      Content_pic: res.data.contentPicUrl,  // 後端要有這些值
      Answer: answer,
      Answer_pic: res.data.answerPicUrl,
    });


    console.log('📥 成功顯示');


  } catch (err) {
    console.error('❌ 發生錯誤：', err);
    alert('❌ 新增失敗，請查看主控台錯誤');
  }
};




onMounted(async () => {
  const token = localStorage.getItem('token');


  if (!token) {


    alert('⛔請先登入');
    console.warn('⛔ 尚未登入，略過題目讀取');
    return;


  }




  else {


    try {
      console.log('🟢 開始取得題目');
      const res = await axios.get('http://localhost:3000/api/question/questions', {
        headers: {
          Authorization: `Bearer ${token}`, // ⬅️ 傳 JWT token
        },
      });
      console.log('📥 題目資料：', res.data);
      if (res.data.length > 0) {
        console.log('📌 題目第一筆的 creator_id:', res.data[0].Creator_id);
      }
      else {
        alert('⛔沒有題目資料');
      }

      questions.value = res.data; // ✅ 更新畫面上的題目
    } catch (err) {
      console.error('❌ 取得題目失敗:', err);
    }
  }
});




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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
