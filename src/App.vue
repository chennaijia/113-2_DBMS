<template>
  <Sidebar :subjects="subjects" @change-page="handleChangePage" />

  <div class="content-area w-screen h-screen">
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
      <Practice :currentSubject="currentSubject" @change-page="handleChangePage" />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import HomePage from './components/HomePage.vue'
import ViewBooks from './components/ViewBooks.vue'
import ViewQuestions from './components/ViewQuestions.vue'
import Practice from './components/Practice.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    HomePage,
    ViewQuestions,
    ViewBooks,
    Practice,
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
