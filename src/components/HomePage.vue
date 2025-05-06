<template>
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
</template>

<script>
import { Icon } from '@iconify/vue';
import * as bootstrap from 'bootstrap';

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
      
      if (selectedDate > today) {
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
    }
  },
  mounted() {
    this.fetchCheckIns();
    this.toast = new bootstrap.Toast(this.$refs.toastEl);
  }
};
</script>

<style scoped>
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
</style>