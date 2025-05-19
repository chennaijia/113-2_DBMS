<template>
  <div class="main-container">
    <div class="flip-card-container">
      <div class="flip-card" :class="{ 'is-flipped': isFlipped }">
        <!-- 卡片正面 -->
        <div class="flip-card-front">
          <div class="card-content">
            <h2 class="card-title">題目</h2>

            <!-- 題目顯示區 (文字或圖片) -->
            <div class="question-area">
              <div class="image-question">
                <img :src="currentQuestion.content" alt="題目圖片" class="question-image" />
              </div>
            </div>

            <!-- 答案輸入區 -->
            <div class="answer-input-area">
              <input
                v-model="userAnswer"
                class="answer-input"
                placeholder="輸入答案範例：ACDE（多選題答案中間不用有空格）"
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
                <div class="answer-image-container">
                  <div v-if="manualFeedback !== null">
                    <Icon
                      :icon="manualFeedback ? 'mdi:check-circle' : 'mdi:close-circle'"
                      :class="manualFeedback ? 'correct-icon' : 'incorrect-icon'"
                    />
                  </div>
                </div>
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
                  <img :src="currentQuestion.answer" alt="答案圖片" class="answer-area-image" />
                </div>
              </div>

              <!-- 右下筆記區域 -->
              <div class="notes-area" @click="toggleNotes">
                <h3>筆記</h3>

                <div v-if="showNotes">
                  <div class="image-note">
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

    <div class="calendar-container-wrapper">
      <div class="container">
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
  </div>
</template>

<script>
import { Icon } from '@iconify/vue';
import * as bootstrap from 'bootstrap';
import { ref } from 'vue'
import { fetchRandomQuestion } from '../api/questions';


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
          content: '/images/c.png',
          answer: 'AE',
          notes: '/images/c_note.png',
        },
        {
          id: 2,
          type: 'image',
          content: '/images/a.png',
          answer: '/images/a_sol.png',
          notes: '/images/a_note.png'
        },
        {
          id: 3,
          type: 'image',
          content: '/images/b.png',
          answer: '/images/b_note.png',
          notes: '/images/b_note.png'
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
  return this.questions[this.currentQuestionIndex] || {};
}

  },
  methods: {
    submitAnswer() {
  const type = this.currentQuestion.qtype;
  const userAns = this.userAnswer.trim().toUpperCase();
  const correctAns = this.currentQuestion.answer;

  if (type === 'truefalse') {
    this.isAnswerCorrect = userAns === correctAns;
  } else if (type === 'multipleABC' || type === 'multiple123') {
    const sortStr = str => str.split('').sort().join('');
    this.isAnswerCorrect = sortStr(userAns) === sortStr(correctAns);
  } else if (type === 'open') {
    this.isAnswerCorrect = userAns === correctAns.trim();
  } else {
    this.isAnswerCorrect = null; // 無法判斷
  }

  this.isFlipped = true;
  this.isAnswerSubmitted = true;
},
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
  fetch('/api/checkin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ date: dateStr }),
  })
    .then(res => {
      if (!res.ok) throw new Error('打卡失敗');
      return res.json();
    })
    .then(() => {
      this.checkInDays.push(dateStr);
      this.showToast();
    })
    .catch(err => {
      console.error('打卡失敗:', err);
      alert('打卡失敗，請稍後再試');
    });
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
      this.currentQuestionIndex = Math.floor(randomValue * this.questions.length)+2;

      console.log(`今天的題目索引: ${this.currentQuestionIndex}, 日期: ${dateString}`);
    },

    // 在實際使用中可新增從API獲取題目的方法
    async fetchQuestions() {
  try {
    const { data } = await fetchRandomQuestion()
    this.questions = [{
      id: data.Question_ID,
      type: 'image',
      content: data.Content_pic,
      answer: data.Answer_pic || data.Answer,
      notes: data.note || '/images/default_note.png'
    }]
    // this.selectDailyQuestion()
  } catch (err) {
    console.error('❌ 無法載入隨機題目:', err)
  }
},

  },
  mounted() {
    this.fetchCheckIns();
    this.toast = new bootstrap.Toast(this.$refs.toastEl);



    // 加載所有可能的題目
    this.fetchQuestions(); // 如果從API獲取題目，則使用此行

    // 在本地數據的情況下直接選擇今日題目
    // this.selectDailyQuestion();

  }
};
</script>

<style scoped>

.main-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 50px;
  gap: 5%;
  margin-top: 50px;
  align-items: flex-start;
  overflow: auto;
}


/* 日曆樣式 */
.calendar-title {
  color: #5d9cec;
  font-size: 2rem;
  min-width: 345px;
  max-width: 470px;
}

.month-navigator {
  background-color: #f0f7ff;
  padding: 12px 15px;
  border-radius: 10px;
  min-width: 345px;
  max-width: 470px;
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
  overflow: auto;
  background-color: white;
  border: 1px solid #e6f2ff;
  min-width: 345px;
  max-width: 470px;
}

.calendar-container-wrapper {
  flex: 1;
  width: 80%;
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

/* 翻轉卡片 */
.flip-card-container {
  width: 500px;
  height: 550px;
  perspective: 1000px;
  flex-shrink: 0;
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

/* 問題區域 - 修復滾動問題 */
.question-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  margin-bottom: 15px;
  overflow: auto; /* 確保垂直滾動條可用 */
  height: 300px; /* 最大高度限制 */
  position: relative;
  flex-direction: column;

}

.image-question {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-image {
  width: 100%;
  height: auto;
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

/* 結果區域 - 修復批改圖標與筆記區域重疊問題 */
.result-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  min-height: 100px;
  max-height: 180px; /* 減小高度避免擠壓底部空間 */
  overflow: auto;
  position: relative;
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

/* 修復：手動批改後的圖標位置 */
.manual-feedback-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  z-index: 10;
  font-size: 2.5rem; /* 適當調整大小 */
}

.answer-image-container {
  max-width: 100%;
  max-height: 120px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.answer-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.manual-check {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

/* 底部區域 - 修復答案圖片顯示問題 */
.bottom-area {
  display: flex;
  margin-bottom: 15px;
  max-height: 170px;
  min-height: 170px;
  gap: 10px;
}

/* 答案區域 - 修復圖片答案顯示 */
.answer-area {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px;
  overflow: auto; /* 確保可以滾動 */
  display: flex;
  flex-direction: column;
  height:270px;
}

.answer-area h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.text-answer {
  font-size: 1.1rem;
  font-weight: 500;
}

.image-answer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
}

.answer-area-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 筆記區域 */
.notes-area {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px;
  overflow: auto;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height:270px;
}

.notes-area h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.image-note {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.note-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.notes-hidden {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #7f8c8d;
  font-style: italic;
}
</style>
