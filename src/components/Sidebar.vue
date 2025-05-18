<template>
  <div class="side-bar" @click="openSidebar">
    <Icon icon="material-symbols:menu-rounded" width="50" height="50" class="menu-icon" />
    <div class="login-label">
      <p v-if="isLoggedIn">登出</p>
      <p v-else>登入</p>
    </div>
  </div>

  <div v-if="isSidebarOpen" class="custom-backdrop" @click="backdropClick"></div>

  <div class="offcanvas-custom" :class="{ show: isSidebarOpen }">
    <div class="offcanvas-header mb-5 mt-3">
      <Icon icon="material-symbols:menu-rounded" width="40" height="40" class="close-icon" @click="closeSidebar" />
    </div>

    <div class="offcanvas-body">
      <div class="accordion accordion-flush" id="accordionMain">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="sidebar_accordion accordion-button collapsed" @click="$emit('change-page', 'home')">
              主頁
            </button>
          </h2>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="sidebar_accordion accordion-button collapsed" type="button" data-bs-toggle="collapse"
              data-bs-target="#collapseMistakeBooks" aria-expanded="false" aria-controls="collapseMistakeBooks"
              @click="$emit('change-page', 'book')">
              我的錯題本
            </button>
          </h2>

          <div id="collapseMistakeBooks" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="accordion" id="accordionSubjects">
                <div v-for="(book, index) in books" :key="book.QuestionBook_ID" class="accordion-item">
                  <h2 class="accordion-header" :id="'headingBook' + index">
                    <button class="sidebar_subject_button accordion-button collapsed" type="button"
                      data-bs-toggle="collapse" :data-bs-target="'#collapseBook' + index" aria-expanded="false"
                      :aria-controls="'collapseBook' + index">
                      {{ book.BName }}
                    </button>
                  </h2>
                  <div :id="'collapseBook' + index" class="accordion-collapse collapse"
                    :aria-labelledby="'headingBook' + index" data-bs-parent="#accordionSubjects">
                    <div class="accordion-body link-group">
                      <a href="#" @click.prevent="$emit('change-page', 'question', book)" class="sidebar-link">錯題瀏覽</a>
                      <a href="#" @click.prevent="$emit('change-page', 'practice', book)" class="sidebar-link">錯題練習</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 額外測試用 -->
        <button @click="$emit('change-page', 'test')">後端測試用</button>
        <button @click="$emit('change-page', 'testquestion')">後端測試用題目</button>
      </div>

      <!-- 登入 Footer -->
      <div class="login-footer d-flex justify-content-center" @click="handleLoginClick">
        <div v-if="isLoggedIn">
          <h2>{{ userName }}</h2>
          <h2>登出</h2>
        </div>
        <h2 v-else>登入</h2>
      </div>

      <Login v-if="showLoginModal" @login="handleLogin" @close="closeLoginModal" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import Login from './Login.vue'

const isSidebarOpen = ref(false)
const isLoggedIn = ref(false)
const userName = ref('')
const showLoginModal = ref(false)
const books = ref([])

function openSidebar() {
  isSidebarOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeSidebar() {
  isSidebarOpen.value = false
  document.body.style.overflow = ''
}
function backdropClick() {
  closeSidebar()
}
function openLoginModal() {
  showLoginModal.value = true
}
function closeLoginModal() {
  showLoginModal.value = false
}
function handleLogin(newUserName) {
  isLoggedIn.value = true
  userName.value = newUserName
  localStorage.setItem('userName', newUserName)
  fetchBooks()
  closeLoginModal()
  closeSidebar()
}
function logout() {
  isLoggedIn.value = false
  userName.value = ''
  localStorage.removeItem('userName')
  closeSidebar()
}
function handleLoginClick() {
  if (isLoggedIn.value) {
    logout()
  } else {
    openLoginModal()
  }
}

// ✅ 從後端抓題本
async function fetchBooks() {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('http://localhost:3000/api/books', {
      headers: { Authorization: `Bearer ${token}` }
    })
    books.value = res.data
  } catch (err) {
    console.error('❌ Sidebar 拉題本失敗:', err)
  }
}

// ✅ 載入時處理登入狀態 & 抓題本
onMounted(() => {
  const savedUser = localStorage.getItem('userName')
  if (savedUser) {
    isLoggedIn.value = true
    userName.value = savedUser
    fetchBooks()
  }
})
</script>





<style scoped>
.offcanvas-custom {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100%;
  background-color: #ffffff;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  padding: 24px 16px;
  transition: left 0.4s ease, opacity 0.4s ease;
  opacity: 0;
}

.offcanvas-custom.show {
  left: 0;
  opacity: 1;
}

.custom-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1040;
}

.side-bar {
  width: 80px;
  height: 100vh;
  background-color: #d8e9f5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  /* 這個非常重要！ */
  position: relative;
  /* 不再使用 fixed */
}

.menu-icon {
  color: #7eaee4;
  cursor: pointer;
}

.login-label p {
  color: #7eaee4;
  font-size: 14px;
}

.close-icon {
  color: #7eaee4;
  cursor: pointer;
  position: absolute;
  right: 20px;
}

/* 主頁 / 我的錯題本按鈕 */
.sidebar_accordion {
  font-weight: bold;
  font-size: 18px;
  color: #7eaee4;
  background-color: transparent;
}

.sidebar_accordion.accordion-button:not(.collapsed) {
  color: #ffffff;
  background-color: #7eaee4;
  text-shadow: 1px 1px 2px #5b92c3;
}

/* 科目按鈕 */
.sidebar_subject_button {
  font-size: 16px;
  font-weight: normal;
  color: #5b92c3;
  background-color: transparent;
}

.sidebar_subject_button.accordion-button:not(.collapsed) {
  color: #ffffff;
  background-color: #5b92c3;
}

/* 錯題瀏覽 / 隨機出題 */
.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  padding-left: 20px;
}

.sidebar-link {
  color: #7eaee4;
  text-decoration: none;
  font-size: 16px;
}

.sidebar-link:hover {
  text-decoration: underline;
}

/* 登入 Footer */
.login-footer {
  position: absolute;
  bottom: 30px;
  width: 100%;
  text-align: center;
}

.login-footer h2 {
  color: #7eaee4;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
}
</style>
