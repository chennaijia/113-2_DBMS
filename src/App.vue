<template>
  <div class="d-flex vh-100 w-100">
    <Sidebar :subjects="subjects" @change-page="handleChangePage" />

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
        <SelectQuestions />
        <!-- <Practice :currentSubject="currentSubject" @change-page="handleChangePage" /> -->
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

export default {
  name: 'App',
  components: {
    Sidebar,
    HomePage,
    ViewQuestions,
    ViewBooks,
    Practice,
    SelectQuestions,
  },
  data() {
    return {
      subjects: ['高三國文', '高二數學'],
      currentPage: 'home',
      currentSubject: '',
    }
  },
  methods: {
    handleChangePage(page, subject = '') {
      this.currentPage = page
      this.currentSubject = subject
    },
  },
}
</script>

<style scoped></style>
