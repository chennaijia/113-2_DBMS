<template>
  <div class="container mt-5">
    <h2 class="text-center text-primary mb-4 fw-bold">每日打卡系統</h2>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <button class="btn btn-outline-primary" @click="prevMonth">
        <i class="bi bi-chevron-left"></i> 上個月
      </button>
      <h4 class="text-primary">{{ currentYear }} 年 {{ currentMonth + 1 }} 月</h4>
      <button class="btn btn-outline-primary" @click="nextMonth">
        下個月 <i class="bi bi-chevron-right"></i>
      </button>
    </div>
    <div class="table-responsive shadow rounded">
      <table class="table table-bordered text-center align-middle">
        <thead class="table-primary">
          <tr>
            <th v-for="(day, index) in weekDays" :key="index">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, weekIndex) in calendar" :key="weekIndex">
            <td v-for="(day, dayIndex) in week" :key="dayIndex" :class="cellClass(day)" @click="handleCheckIn(day)" style="cursor: pointer;">
              <span v-if="day">{{ day }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-center">
      <h5 class="text-success">本月已打卡：{{ currentMonthCheckInCount }} 天</h5>
    </div>
  </div>
 </template>
 
 
 <script>
 import { Icon } from '@iconify/vue';
 
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
    }
  },
  methods: {
    cellClass(day) {
      if (!day) return 'bg-light';
      const dateStr = this.formatDate(day);
      return {
        'bg-primary text-white fw-bold': this.isToday(day),
        'bg-info text-white': this.isCheckedIn(day),
        'text-muted': false
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
      if (!this.checkInDays.includes(dateStr)) {
        // 模擬 API POST 請求
        fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr })
        })
          .then(res => res.json())
          .then(() => {
            this.checkInDays.push(dateStr);
          })
          .catch(err => console.error('打卡失敗:', err));
      }
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
    }
  },
  mounted() {
    this.fetchCheckIns();
  }
};
 </script>
