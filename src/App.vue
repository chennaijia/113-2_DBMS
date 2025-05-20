<template>
  <div class="layout-container">
    <Sidebar :subjects="subjects" @change-page="handleChangePage" />
    <div class="main-content flex-grow-1">
      <div v-if="currentPage === 'home'">
        <HomePage />
      </div>

      <div v-else-if="currentPage === 'book'">
        <ViewBooks />
      </div>

      <div v-else-if="currentPage === 'question'">
        <ViewQuestions :currentSubject="currentSubject" :book="currentBook" />
      </div>

      <div v-else-if="currentPage === 'practice'">
        <Practice
          v-if="startPractice && isFinished === false"
          :currentSubject="currentSubject"
          @change-page="handleChangePage"
          :questions="selectedQuestions.value"
          :mode="selectedMode"
          :count="questionCount"
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
          :accuracy="
            Math.round(
              (practiceResult.questions.filter((q) => q.isCorrect).length /
                practiceResult.questions.length) *
                100
            )
          "
          @restart="goBack"
          @change-page="handleChangePage"
        />
        <SelectQuestions
          v-else
          :currentSubject="currentSubject"
          @start="start"
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
import { ref } from 'vue'

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
const currentSubject = ref('')
const currentBook = ref(null)
const startPractice = ref(false)
const selectedQuestions = ref([])
const isFinished = ref(false)

const selectedMode = ref('')
const questionCount = ref(1)


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
    currentSubject.value = payload.BName // 如果你想用名稱當 subject
  } else {
    currentSubject.value = payload
  }
}

/*
function handleChangePage(page, subject = '') {
  currentPage.value = page
  currentSubject.value = subject
}
*/

/*
function setQuestion(selected) {
  startPractice.value = true
  selectedQuestions.value = selected
}
*/

function setQuestion({ mode, questions, count }) {
  selectedMode.value = mode
  selectedQuestions.value = questions
  questionCount.value = count
  startPractice.value = true
}



function goBack() {
  startPractice.value = false
  isFinished.value = false
  practiceResult.value = {
    questions: [],
    timeSpent: '00:00',
  }
}

function handleFinishPractice(result) {
  isFinished.value = true
  practiceResult.value = result
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
