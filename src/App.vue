<template>
  <div class="layout-container">
    <Sidebar :subjects="subjects" @change-page="handleChangePage" />
    <div class="main-content flex-grow-1">
      <div v-if="currentPage === 'home'">
        <HomePage />
      </div>

      <div v-else-if="currentPage === 'book'">
        <ViewBooks :subjects="subjects" @change-page="handleChangePage" />
      </div>

      <div v-else-if="currentPage === 'question'">
        <ViewQuestions :currentSubject="currentSubject" :book="currentBook" @change-page="handlePageChange" @goBack="goBack" />
      </div>

      <div v-else-if="currentPage === 'practice'">
        <Practice
          v-if="startPractice && isFinished === false"
          :currentSubject="currentSubject"
          @change-page="handleChangePage"
          :questions="selectedQuestions"
          @goBack="goBack"
          @finish-practice="handleFinishPractice"
        />
        <PracticeResult
          v-else-if="startPractice && isFinished"
          :currentSubject="currentSubject"
          :questions="practiceResult.questions"
          :timeSpent="practiceResult.timeSpent"
          :total="practiceResult.questions.length"
          :correct="practiceResult.questions.filter((q) => q.isCorrect).length"
          :book="currentBook"
          :accuracy="
            Math.round(
              (practiceResult.questions.filter((q) => q.isCorrect).length /
                practiceResult.questions.length) *
                100
            )
          "
          @rePractice="rePractice"
          @goBack="goBack"
          @change-page="handleChangePage"
        />
        <SelectQuestions
          v-else
          :currentSubject="currentSubject"
          :currentBookID="currentBookID"
          :userId="userId"
          @start-practice="setQuestion"
          @change-page="handleChangePage"
        />
      </div>
      <div v-else-if="currentPage === 'test'">
        <BackendTest />
      </div>
      <div v-else-if="currentPage === 'testquestion'">
        <BackendTestQuestion />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, nextTick } from 'vue'

import Sidebar from './components/Sidebar.vue'
import HomePage from './components/HomePage.vue'
import ViewBooks from './components/ViewBooks.vue'
import ViewQuestions from './components/ViewQuestions.vue'
import Practice from './components/Practice.vue'
import PracticeResult from './components/Practice/PracticeResult.vue'
import SelectQuestions from './components/SelectQuestions.vue'
import BackendTest from './components/BackendTest.vue'
import BackendTestQuestion from './components/BackendTestQuestion.vue'

const subjects = ref(['高三國文', '高二數學'])
const currentPage = ref('home')
const questions = ref([])
const currentSubject = ref('')
const currentBook = ref(null)
const currentBookID = ref(null)
const startPractice = ref(false)
const selectedQuestions = ref([])
const isFinished = ref(false)

const isLoggedIn = ref(false)
const userName = ref('')

const userId = ref(1) // ✅ 不要是空字串

if (localStorage.getItem('userName')) {
  isLoggedIn.value = true
  userName.value = localStorage.getItem('userName')
}

// Login function
function handleLogin(newUserName) {
  isLoggedIn.value = true
  userName.value = newUserName
  localStorage.setItem('userName', newUserName)
  // Dispatch an event to refresh book data
  window.dispatchEvent(new Event('refresh-books'))
}

// Logout function
function handleLogout() {
  isLoggedIn.value = false
  userName.value = ''
  localStorage.removeItem('userName')
  localStorage.removeItem('token')
  // Dispatch an event to clear book data
  window.dispatchEvent(new Event('refresh-books'))
}

// Provide login state and functions to child components
provide('loginState', {
  isLoggedIn,
  userName,
  login: handleLogin,
  logout: handleLogout,
})

const practiceResult = ref({
  questions: [],
  timeSpent: '00:00',
})

// ✅ 接收 Sidebar 傳來的頁面與 book 資訊
function handleChangePage(page, payload = '') {
  currentPage.value = page

  // 如果 payload 是物件（代表是 book），記錄它
  if (typeof payload === 'object') {
    currentBook.value = payload
    currentBookID.value = payload.QuestionBook_ID
    currentSubject.value = payload.BName

    startPractice.value = false
    isFinished.value = false
    practiceResult.value = {
      questions: [],
      timeSpent: '00:00',
    }
    console.log('App.vue: 收到 change-page 事件，頁面:', page, '選中的書本:', currentBook.value)
  }
}

function setQuestion(questions) {
  console.log('App.vue: 收到 setQuestion 事件，選中的題目:', questions)
  selectedQuestions.value = questions
  startPractice.value = true
}

/*
function setQuestion(selected) {
  console.log('App.vue: 收到 setQuestion 事件，選中的題目:', selected)
  selectedQuestions.value = selected
  startPractice.value = true
}
  */

function goBack() {
  if (currentPage.value === 'practice') {
    startPractice.value = false
    isFinished.value = false
    practiceResult.value = {
      questions: [],
      timeSpent: '00:00',
    }
  } else if (currentPage.value === 'question') {
    // 錯題瀏覽的返回（可回首頁或回書本）
    currentPage.value = 'book' // ✅ 改這裡，看你想返回哪一頁
  }
}

function rePractice() {
  isFinished.value = false
}

function goViewQuestion() {
  currentPage.value = 'question'
}

function handleFinishPractice(result) {
  isFinished.value = true
  practiceResult.value = result
}

function handlePageChange(page, subject) {
  console.log('🧭 切換到頁面：', page, subject)
  currentPage.value = page
  currentSubject.value = subject
}

</script>

<style>
.layout-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  box-sizing: border-box;
  overflow-x: hidden;
}

.main-content {
  height: 100%;
  overflow-y: auto;
  flex-grow: 1;
  min-width: 0;
  overflow-x: hidden;
}
</style>
