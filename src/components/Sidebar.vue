<template>
  <div class="side-bar" @click="openSidebar">
    <Icon icon="material-symbols:menu-rounded" width="50" height="50" class="menu-icon" />
    <div class="login-label">
      <p v-if="isLoggedIn">登出</p>
      <p v-else>登入</p>
    </div>
  </div>

  <!-- 黑色半透明背景 -->
  <div v-if="isSidebarOpen" class="custom-backdrop" @click="backdropClick"></div>

  <!-- 側邊欄本體 -->
  <div class="offcanvas-custom" :class="{ show: isSidebarOpen }">
    <div class="offcanvas-header mb-5 mt-3">
      <Icon
        icon="material-symbols:menu-rounded"
        width="40"
        height="40"
        class="close-icon"
        @click="closeSidebar"
      />
    </div>

    <div class="offcanvas-body">
      <div class="accordion accordion-flush" id="accordionMain">
        <!-- 主頁按鈕 -->
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="sidebar_accordion accordion-button collapsed"
              @click="$emit('change-page', 'home')"
            >
              主頁
            </button>
          </h2>
        </div>

        <!-- 我的錯題本按鈕 -->
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="sidebar_accordion accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseMistakeBooks"
              aria-expanded="false"
              aria-controls="collapseMistakeBooks"
              @click.prevent="$emit('change-page', 'book', item)"
            >
              我的錯題本
            </button>
          </h2>

          <!-- 科目列表 -->
          <div id="collapseMistakeBooks" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="accordion" id="accordionSubjects">
                <!-- v-for 每個科目 -->
                <div v-for="(item, index) in subjects" :key="index" class="accordion-item">
                  <h2 class="accordion-header" :id="'headingSubject' + index">
                    <button
                      class="sidebar_subject_button accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      :data-bs-target="'#collapseSubject' + index"
                      aria-expanded="false"
                      :aria-controls="'collapseSubject' + index"
                    >
                      {{ item }}
                    </button>
                  </h2>

                  <!-- 錯題瀏覽/隨機出題 -->
                  <div
                    :id="'collapseSubject' + index"
                    class="accordion-collapse collapse"
                    :aria-labelledby="'headingSubject' + index"
                    data-bs-parent="#accordionSubjects"
                  >
                    <div class="accordion-body link-group">
                      <a
                        href="pages/Book.html"
                        @click.prevent="$emit('change-page', 'question', item)"
                        class="sidebar-link"
                      >
                        錯題瀏覽
                      </a>
                      <a
                        href="pages/RandomPractice.html"
                        @click.prevent="$emit('change-page', 'practice', item)"
                        class="sidebar-link"
                      >
                        隨機出題
                      </a>
                    </div>
                  </div>
                </div>
                <!-- End v-for -->
              </div>
            </div>
          </div>
        </div>
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

<script>
import { Icon } from '@iconify/vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Login from './Login.vue'
export default {
  name: 'Sidebar',
  components: {
    Icon,
    Login,
  },
  props: {
    subjects: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isSidebarOpen: false,
      isLoggedIn: false,
      userName: '',
      showLoginModal: false,
    }
  },
  created() {
    const savedUser = localStorage.getItem('userName')
    if (savedUser) {
      this.isLoggedIn = true
      this.userName = savedUser
    }
  },
  methods: {
    openSidebar() {
      this.isSidebarOpen = true
      document.body.style.overflow = 'hidden'
    },
    closeSidebar() {
      this.isSidebarOpen = false
      document.body.style.overflow = ''
    },
    backdropClick() {
      this.closeSidebar()
    },
    handleLoginClick() {
      if (this.isLoggedIn) {
        this.logout()
      } else {
        this.openLoginModal()
      }
    },
    openLoginModal() {
      this.showLoginModal = true
    },
    closeLoginModal() {
      this.showLoginModal = false
    },
    handleLogin(userName) {
      this.isLoggedIn = true
      this.userName = userName
      localStorage.setItem('userName', userName)
      this.closeLoginModal()
      this.closeSidebar()
    },
    logout() {
      this.isLoggedIn = false
      this.userName = ''
      localStorage.removeItem('userName')
      this.closeSidebar()
    },
  },
}
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
  position: fixed;
  top: 0;
  left: 0;
  width: 80px;
  height: 100%;
  background-color: #d8e9f5;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
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
