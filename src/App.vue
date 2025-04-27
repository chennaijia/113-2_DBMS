<template>
  <Sidebar :subjects="subjects" :userName="userName" @change-page="handleChangePage" />

  <div class="content-area">
    <div v-if="currentPage === 'home'">
      <h1>主頁</h1>
      <HomePage />
    </div>

    <div v-else-if="currentPage === 'book'">
      <h1>{{ currentSubject }} 的錯題瀏覽</h1>
      <ViewBooks />
    </div>

    <div v-else-if="currentPage === 'practice'">
      <h1>{{ currentSubject }} 的隨機出題</h1>
      <Practice />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import HomePage from './components/HomePage.vue'
import ViewBooks from './components/ViewBooks.vue'
import Practice from './components/Practice.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
  },
  data() {
    return {
      subjects: ['高三國文', '高二數學'],
      userName: '使用者姓名',
      currentPage: 'home',
    }
  },
  methods: {
    handleChangePage(page, subject) {
      this.currentPage = page
      this.currentSubject = subject
    },
  },
}
</script>

<style scoped>
/* 如果主頁需要其他樣式可以寫在這 */
</style>
