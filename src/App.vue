<template>
  <div class="vh-100 d-flex flex-column">
    <Sidebar class="flex-shrink-0" :subjects="subjects" @change-page="handleChangePage" />

    <component
      :is="currentComponent"
      v-bind="currentComponentProps"
      @change-page="handleChangePage"
      @start-practice="setQuestion"
      @goBack="goBack"
      class="h-100 w-100 flex-grow-1"
    />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import HomePage from './components/HomePage.vue'
import ViewBooks from './components/ViewBooks.vue'
import ViewQuestions from './components/ViewQuestions.vue'
import Practice from './components/Practice.vue'
import SelectQuestions from './components/SelectQuestions.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    HomePage,
    ViewBooks,
    ViewQuestions,
    Practice,
    SelectQuestions,
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
  computed: {
    currentComponent() {
      switch (this.currentPage) {
        case 'home':
          return HomePage
        case 'book':
          return ViewBooks
        case 'question':
          return ViewQuestions
        case 'practice':
          return this.startPractice ? Practice : SelectQuestions
        default:
          return HomePage
      }
    },
    currentComponentProps() {
      switch (this.currentPage) {
        case 'question':
          return { currentSubject: this.currentSubject }
        case 'practice':
          if (this.startPractice) {
            return {
              currentSubject: this.currentSubject,
              questions: this.selectedQuestions,
            }
          }
          return { currentSubject: this.currentSubject }
        default:
          return {}
      }
    },
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
