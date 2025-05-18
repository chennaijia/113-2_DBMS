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
        <ViewQuestions :currentSubject="currentSubject" />
      </div>

      <div v-else-if="currentPage === 'practice'">
        <Practice
          v-if="startPractice && isFinished === false"
          :currentSubject="currentSubject"
          @change-page="handleChangePage"
          :questions="selectedQuestions.value"
          @goBack="goBack"
          @finish-practice="handleFinishPractice"
        />
        <PracticeResult
          v-else-if="startPractice && isFinished"
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
          @restart="restartPractice"
          @back="goBack"
        />
        <SelectQuestions
          v-else
          @start="start"
          @start-practice="setQuestion"
          @change-page="handleChangePage"
          :currentSubject="currentSubject"
        />
      </div>
      <div v-else-if="currentPage === 'test'">
        <BackendTest />
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

const subjects = ref(['高三國文', '高二數學'])
const currentPage = ref('home')
const currentSubject = ref('')
const startPractice = ref(false)
const selectedQuestions = ref([])
const isFinished = ref(false)

const practiceResult = ref({
  questions: [],
  timeSpent: '00:00',
})

function handleChangePage(page, subject = '') {
  currentPage.value = page
  currentSubject.value = subject
}

function setQuestion(selected) {
  startPractice.value = true
  selectedQuestions.value = selected
}

function goBack() {
  startPractice.value = false
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
  overflow-x: hidden;
}
</style>
