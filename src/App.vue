<template>
  <div class="vh-100 d-flex flex-column">
    <Sidebar class="flex-shrink-0" :subjects="subjects" @change-page="handleChangePage" />

    <div class="ms-5 flex-grow-1">
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
          v-if="startPractice"
          :currentSubject="currentSubject"
          @change-page="handleChangePage"
          :goBack="goBack"
        />
        <SelectQuestions v-else @start="start" @start-practice="setQuestion" />
      </div>
      <div v-else-if="currentPage === 'test'">
        <BackendTest />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import HomePage from './components/HomePage.vue'
import ViewBooks from './components/ViewBooks.vue'
import ViewQuestions from './components/ViewQuestions.vue'
import Practice from './components/Practice.vue'
import SelectQuestions from './components/SelectQuestions.vue'
import BackendTest from './components/BackendTest.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    HomePage,
    ViewBooks,
    ViewQuestions,
    Practice,
    SelectQuestions,
    BackendTest,
  },
  data() {
    return {
      subjects: ['高三國文', '高二數學'],
      currentPage: 'home',
      currentSubject: '',
      startPractice: false,
      selectedQuestions: [],
    }
  },
  methods: {
    handleChangePage(page, subject = '') {
      this.currentPage = page
      this.currentSubject = subject
    },
    setQuestion(selectedQuestion) {
      this.startPractice = true
      this.selectedQuestions = selectedQuestion
    },
    goBack() {
      this.startPractice = false
    },
  },
}
</script>

<style scoped></style>
