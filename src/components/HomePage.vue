<template>
  <div  class="main-container">
    <div class="flip-card-container">
    <div class="flip-card" :class="{ 'is-flipped': isFlipped }">
      <!-- 卡片正面 -->
      <div class="flip-card-front">
        <div class="card-content">
          <h2 class="card-title">題目</h2>
          
          <!-- 題目顯示區 (文字或圖片) -->
          <div class="question-area">
            <div v-if="currentQuestion.type === 'text'" class="text-question">
              {{ currentQuestion.content }}
            </div>
            <div v-else-if="currentQuestion.type === 'image'" class="image-question">
              <img :src="currentQuestion.content" alt="題目圖片" class="question-image" />
            </div>
          </div>
          
          <!-- 答案輸入區 -->
          <div class="answer-input-area">
            <input 
              v-model="userAnswer" 
              class="answer-input" 
              placeholder="請輸入您的答案..."
              :readonly="isAnswerSubmitted"
              :class="{ 'input-disabled': isAnswerSubmitted }"
            />
          </div>
          
          <!-- 按鈕區 -->
          <div class="button-container">
            <button class="submit-button" @click="submitAnswer">提交答案</button>
          </div>
        </div>
      </div>
      
      <!-- 卡片背面 -->
      <div class="flip-card-back">
        <div class="card-content">
          <!-- 上方結果區域 -->
          <div class="result-area">
            <div v-if="currentQuestion.type === 'text'" class="feedback-icon">
              <div v-if="isAnswerCorrect === true">
                <Icon icon="mdi:check-circle" class="correct-icon" />
              </div>
              <div v-else-if="isAnswerCorrect === false">
                <Icon icon="mdi:close-circle" class="incorrect-icon" />
              </div>
            </div>
            <div v-else-if="currentQuestion.type === 'image'" class="manual-check">
              <img :src="currentQuestion.answer" alt="答案圖片" class="answer-image" />
              <div class="manual-check-buttons">
                <button @click="markAsCorrect" class="correct-button">
                  <Icon icon="mdi:check-circle" />
                  正確
                </button>
                <button @click="markAsIncorrect" class="incorrect-button">
                  <Icon icon="mdi:close-circle" />
                  錯誤
                </button>
              </div>
              <div v-if="manualFeedback !== null" class="feedback-icon">
                <Icon 
                  :icon="manualFeedback ? 'mdi:check-circle' : 'mdi:close-circle'" 
                  :class="manualFeedback ? 'correct-icon' : 'incorrect-icon'" 
                />
              </div>
            </div>
          </div>
          
          <!-- 下方答案與筆記區域 -->
          <div class="bottom-area">
            <!-- 左下答案顯示 -->
            <div class="answer-area">
              <h3>正確答案：</h3>
              <div v-if="currentQuestion.type === 'text'" class="text-answer">
                {{ currentQuestion.answer }}
              </div>
              <div v-else-if="currentQuestion.type === 'image'" class="image-answer">
                <span class="image-answer-text">請查看上方圖片</span>
              </div>
            </div>
            
            <!-- 右下筆記區域 -->
            <div class="notes-area" @click="toggleNotes">
              <h3>筆記</h3>

              <div v-if="showNotes" class="notes-content">
                <div v-if="currentQuestion.notesType === 'text'" class="text-note">
                  {{ currentQuestion.notes || '尚無筆記' }}
                </div>
                <div v-else-if="currentQuestion.notesType === 'image'" class="image-note">
                  <img :src="currentQuestion.notes" alt="筆記圖片" class="note-image" />
                </div>
              </div>
              <div v-else class="notes-hidden">
                <span>（點擊查看筆記）</span>
              </div>
            </div>
          </div>
          
          <!-- 返回按鈕 -->
          <div class="button-container">
            <button class="return-button" @click="resetCard">回到題目</button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="container mt-5">
    <div class="calendar-header">
      <h2 class="text-center mb-4 fw-bold calendar-title">每日打卡系統</h2>
    </div>
    
    <div class="d-flex justify-content-between align-items-center mb-3 month-navigator">
      <button class="btn btn-month" @click="prevMonth">
        <i class="bi bi-chevron-left"></i> 
      </button>
      <h4 class="month-title">{{ currentYear }} 年 {{ currentMonth + 1 }} 月</h4>
      <button class="btn btn-month" @click="nextMonth">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    
    <div class="calendar-container shadow rounded">
      <table class="table table-bordered text-center align-middle calendar-table">
        <thead>
          <tr>
            <th v-for="(day, index) in weekDays" :key="index" class="week-day">
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in calendar" :key="weekIndex">
            <td 
              v-for="(day, dayIndex) in week" 
              :key="dayIndex" 
              :class="cellClass(day)"
              @click="handleCheckIn(day)"
              style="cursor: pointer; position: relative;">
              <div v-if="day" class="day-content">
                <span class="day-number">{{ day }}</span>
                <div v-if="isCheckedIn(day)" class="check-mark">
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-center stats-container">
      <div class="streak-info p-3 rounded">
        <h5 class="mb-0">本月已打卡：<span class="streak-count">{{ currentMonthCheckInCount }} 天</span></h5>
      </div>

      <!-- 今日打卡按鈕 -->
      <button 
        @click="checkInToday" 
        class="btn btn-checkin mt-3"
        :disabled="isTodayCheckedIn">
        {{ isTodayCheckedIn ? '今日已打卡' : '今日打卡' }}
      </button>
    </div>
    
    <!-- 打卡成功提示 -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div 
        class="toast align-items-center text-white bg-success border-0" 
        ref="toastEl" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        <div class="d-flex" style="background-color: #3d7dcf">
          <div class="toast-body">
            <i class="bi bi-check-circle me-2"></i> 打卡成功！繼續保持！
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { Icon } from '@iconify/vue';
import * as bootstrap from 'bootstrap';
import { ref } from 'vue'

export default {
  name: 'HomePage',
  components: { Icon },
  data() {
    const today = new Date();
    return {
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      checkInDays: [], // 格式 'YYYY-MM-DD'
      toast: null,



      isFlipped: false,
      userAnswer: '',
      isAnswerCorrect: null,
      manualFeedback: null,
      showNotes: false,
      isAnswerSubmitted: false,
      currentQuestionIndex: 0,
      questions: [
        // 範例題目 (可以從API獲取或由父組件傳入)
        {
          id: 1,
          type: 'text', 
          content: "25. 下列各組「」內的詞，意義前後相同的是：\n(A)刑仁講讓，示民有「常」／自後余多在外，不「常」居\n(B)人煙「猶」是，而蕭條矣／同居一府，「猶」同室之兄弟至親也\n(C)由此觀之，客何「負」於秦哉／師略授小技，此來為不「負」也\n(D)當獎「率」三軍，北定中原／竟「率」意而鴉塗，莫自知其鳩拙云爾\n(E)新沐者必彈「冠」，新浴者必振衣／巾箱妝奩「冠」鏡首飾之盛，非人間之物",
          answer: 'CE',
          notesType: 'text', 
          notes: '啊啊不要再錯了！'
        },
        {
          id: 2,
          type: 'image',
          content: '/images/a.png',
          answer: '/images/a_sol.png',
          notesType: 'text', 
          notes: '精神狀態良好～～(o_o)'
        },
        {
          id: 3,
          type: 'text',
          content: '1+1=?',
          answer: '/images/answer1.jpg',
          notesType: 'images', 
          notes: '/images/note1.jpg'
        }
      ],

    };
  },
  computed: {
    calendar() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const weeks = [];
      let week = new Array(firstDay.getDay()).fill(null);
      for (let day = 1; day <= lastDay.getDate(); day++) {
        week.push(day);
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
      }
      return weeks;
    },
    currentMonthCheckInCount() {
      const prefix = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
      return this.checkInDays.filter(date => date.startsWith(prefix)).length;
    },
    todayDateStr() {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },
    isTodayCheckedIn() {
      return this.checkInDays.includes(this.todayDateStr);
    },



    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    }

  },
  methods: {
    cellClass(day) {
      if (!day) return 'bg-light empty-cell';
      const dateStr = this.formatDate(day);
      return {
        'today': this.isToday(day),
        'checked-in': this.isCheckedIn(day) && !this.isToday(day),
        'clickable': !this.isCheckedIn(day),
        'calendar-cell': true
      };
    },
    isToday(day) {
      if (!day) return false;
      const today = new Date();
      return (
        day === today.getDate() &&
        this.currentMonth === today.getMonth() &&
        this.currentYear === today.getFullYear()
      );
    },
    isCheckedIn(day) {
      if (!day) return false;
      return this.checkInDays.includes(this.formatDate(day));
    },
    handleCheckIn(day) {
      if (!day) return;
      const dateStr = this.formatDate(day);
      
      // 檢查是否未來日期或已打卡
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate != today) {
        // 未來日期不能打卡
        return;
      }
      
      if (!this.checkInDays.includes(dateStr)) {
        // 模擬 API POST 請求
        this.performCheckIn(dateStr);
      }
    },
    checkInToday() {
      if (!this.isTodayCheckedIn) {
        this.performCheckIn(this.todayDateStr);
      }
    },
    performCheckIn(dateStr) {
      // 模擬 API 請求
      fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr })
      })
        .then(res => res.json())
        .then(() => {
          this.checkInDays.push(dateStr);
          this.showToast();
        })
        .catch(err => console.error('打卡失敗:', err));
        
      // 模擬成功（實際使用時可移除這行）
      this.checkInDays.push(dateStr);
      this.showToast();
    },
    formatDate(day) {
      return `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },
    fetchCheckIns() {
      // 模擬 API GET 請求
      const monthStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
      fetch(`/api/checkins?month=${monthStr}`)
        .then(res => res.json())
        .then(data => {
          this.checkInDays = data;
        })
        .catch(err => console.error('獲取打卡紀錄失敗:', err));
        
      // 模擬數據（實際使用時可移除）
      const dummyData = [];
      const today = new Date();
      // 隨機生成本月已打卡的日期
      if (this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear()) {
        for (let i = 1; i < today.getDate(); i++) {
          if (Math.random() > 0.3) { // 70% 機率已打卡
            dummyData.push(this.formatDate(i));
          }
        }
      }
      this.checkInDays = dummyData;
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.fetchCheckIns();
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.fetchCheckIns();
    },
    showToast() {
      if (this.toast) {
        this.toast.show();
      }
    },



    submitAnswer() {
      if (this.currentQuestion.type === 'text') {
        // 文字題目自動判斷正誤
        this.isAnswerCorrect = this.userAnswer.trim().toLowerCase() === this.currentQuestion.answer.toLowerCase();
      }
      this.isFlipped = true;
      this.isAnswerSubmitted = true; // 標記答案已提交
    },
    
    markAsCorrect() {
      this.manualFeedback = true;
    },
    
    markAsIncorrect() {
      this.manualFeedback = false;
    },
    
    toggleNotes() {
      this.showNotes = !this.showNotes;
    },
    
    resetCard() {
      // 只重置卡片狀態，保持當前題目和用戶答案不變
      this.isFlipped = false;
      this.isAnswerCorrect = null;
      this.manualFeedback = null;
      this.showNotes = false;
    },
    
    // 每日選擇新題目的方法
    selectDailyQuestion() {
      // 使用日期作為種子來確保同一天內顯示相同題目
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
      // 簡單的偽隨機數生成器（使用日期字串作為種子）
      const generateSeededRandom = (seed) => {
        const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return ((seedNum * 9301 + 49297) % 233280) / 233280;
      };
      
      // 根據今天的日期選擇題目
      const randomValue = generateSeededRandom(dateString);
      this.currentQuestionIndex = Math.floor(randomValue * this.questions.length);
      
      console.log(`今天的題目索引: ${this.currentQuestionIndex}, 日期: ${dateString}`);
    },
    
    // 在實際使用中可新增從API獲取題目的方法
    fetchQuestions() {
      // 這裡可實作API呼叫獲取所有可能的題目
      // this.questions = 從API獲取的數據
      
      // 獲取題目後，選擇今日題目
      this.selectDailyQuestion();
    },

  },
  mounted() {
    this.fetchCheckIns();
    this.toast = new bootstrap.Toast(this.$refs.toastEl);



    // 加載所有可能的題目
    // this.fetchQuestions(); // 如果從API獲取題目，則使用此行
    
    // 在本地數據的情況下直接選擇今日題目
    this.selectDailyQuestion();
  
  }
};
</script>

<style scoped>
.main-container {
  display: grid;
  grid-template-columns: 1fr 0.5fr; /* 創建兩個等寬的列 */
  width: 100%;
  height: 100%; 
}


.calendar-title {
  color: #5d9cec;
  font-size: 2rem;
}

.month-navigator {
  background-color: #f0f7ff;
  padding: 12px 15px;
  border-radius: 10px;
}

.month-title {
  color: #5d9cec;
  margin: 0;
  font-weight: 600;
}

.btn-month {
  border: 2px solid #c6e0ff;
  color: #5d9cec;
  background-color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
}

.btn-month:hover {
  background-color: #e6f2ff;
  color: #3d7dcf;
}

.calendar-container {
  border-radius: 15px;
  overflow: hidden;
  background-color: white;
  border: 1px solid #e6f2ff;
}

.calendar-table {
  margin-bottom: 0;
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
}

.week-day {
  background-color: #c6e0ff;
  color: #3d7dcf;
  font-weight: 600;
  padding: 12px;
  border: 1px solid #aac9f2 !important;
}

.calendar-cell {
  padding: 5px;
  transition: all 0.2s;
  border: 1px solid #aac9f2 !important;
  vertical-align: middle;
  height: 60px;
  width: 14.28%;
}

.empty-cell {
  background-color: #f8fbff !important;
  border: 1px solid #aac9f2 !important;
}

.today {
  background-color: #5d9cec !important;
  color: white !important;
  font-weight: bold;
  box-shadow: 0 3px 5px rgba(93, 156, 236, 0.3);
}

.checked-in {
  background-color: #a0d0ff;
  color: #3d7dcf ;
}

.clickable:hover:not(.today):not(.checked-in) {
  background-color: #e6f2ff;
  transform: scale(0.98);
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.check-mark {
  margin-top: 3px;
  background-color: #5d9cec;
  color: white;
  
}

.stats-container {
  margin-top: 20px;
}

.streak-info {
  background-color: #f0f7ff;
  display: inline-block;
  border-radius: 10px;
}

.streak-count {
  color: #5d9cec;
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-checkin {
  background-color: #5d9cec;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 10px 30px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-checkin:hover:not(:disabled) {
  background-color: #3d7dcf;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(93, 156, 236, 0.3);
}

.btn-checkin:disabled {
  background-color: #a0d0ff;
  cursor: not-allowed;
}

/* 動畫效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.today:not(.checked-in) {
  animation: pulse 2s infinite ease-in-out;
}

.stats-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .stats-container {
    flex-direction: row;
    gap: 1.5rem;
  }

  .btn-checkin {
    margin-top: 0 !important;
  }
}



.flip-card-container {
  width: 100%;
  width: 550px;
  height: 550px;
  perspective: 1000px;
  margin: 0 auto;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.is-flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 淺藍色主題 */
.flip-card-front {
  background-color: #e6f3ff;
  color: #1a5276;
}

.flip-card-back {
  background-color: #f0f8ff;
  color: #1a5276;
  transform: rotateY(180deg);
}

.card-content {
  padding: 25px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin-top: 0;
  color: #2980b9;
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

/* 問題區域 */
.question-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  margin-bottom: 15px;
  min-height: auto; /* 移除 min-height，讓內容決定高度 */
  overflow: hidden; /* 確保縮放內容不超出邊界 */
}

.text-question {
  font-size: 1.3rem;
  text-align: center;
  transform: scale(1);
  transition: transform 0.3s ease-in-out;
}

.question-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 答案輸入區 */
.answer-input-area {
  margin-bottom: 15px;
}

.answer-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #a9cce3;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.3s;
}

.answer-input:focus {
  outline: none;
  border-color: #3498db;
}

.input-disabled {
  background-color: #f8f8f8;
  color: #666;
  cursor: not-allowed;
}

/* 按鈕樣式 */
.button-container {
  text-align: center;
  margin-top: auto;
  padding-top: 10px;
}

button {
  padding: 10px 25px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.submit-button {
  background-color: #3498db;
  color: white;
}

.return-button {
  background-color: #2980b9;
  color: white;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 結果區域 */
.result-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  min-height: 100px;
}

.feedback-icon {
  font-size: 3rem;
  margin: 10px 0;
}

.correct-icon {
  color: #27ae60;
  font-size: 4rem;
}

.incorrect-icon {
  color: #e74c3c;
  font-size: 4rem;
}

.answer-image {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  margin-bottom: 10px;
}

.manual-check {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.manual-check-buttons {
  display: flex;
  gap: 15px;
  margin: 10px 0;
}

.correct-button {
  background-color: #27ae60;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

.incorrect-button {
  background-color: #e74c3c;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 底部區域 */
.bottom-area {
  display: flex;
  margin-bottom: 15px;
  flex: 0 0 auto; /* 讓底部區域根據內容自動調整高度 */
}

.answer-area {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px;
  margin-right: 10px;
  overflow: auto; /* 如果答案太長可以滾動 */
}

.text-answer {
  /* 根據需要調整縮放 */
  transform: scale(1);
  transform-origin: center left; /* 縮放中心點 */
  transition: transform 0.3s ease-in-out;
}

.notes-area {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  overflow: hidden; /* 確保筆記內容不超出邊界 */
}

.notes-area:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2980b9;
  font-size: 1rem;
}

.notes-hidden {
  color: #95a5a6;
  font-style: italic;
  text-align: center;
}

.notes-content {
  max-height: none; /* 移除 max-height，讓內容自動調整高度 */
  overflow: auto; /* 如果筆記內容太長可以滾動 */
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  height: 100%;
}

.text-note {
  text-align: center;
  transform: scale(1);
  transition: transform 0.3s ease-in-out;
}

.image-note {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.note-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-answer-text {
  font-style: italic;
  color: #7f8c8d;
}
</style>