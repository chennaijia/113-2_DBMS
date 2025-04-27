<template>
  <div>
    <!-- 側邊欄小圖示（點擊展開 Offcanvas） -->
    <div class="side-bar">
      <iconify-icon
        icon="material-symbols:menu-rounded"
        width="50"
        height="50"
        class="toggle-icon"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasSidebar"
        aria-controls="offcanvasSidebar"
      />
      <div class="login-label">
        <h4>登入</h4>
      </div>
    </div>

    <!-- Offcanvas 側邊欄 -->
    <div
      class="offcanvas offcanvas-start sidebar-canvas"
      tabindex="-1"
      id="offcanvasSidebar"
      aria-labelledby="offcanvasSidebarLabel"
    >
      <div class="offcanvas-header">
        <iconify-icon
          icon="material-symbols:menu-rounded"
          width="50"
          height="50"
          class="close-icon"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasSidebar"
          aria-controls="offcanvasSidebar"
        />
      </div>

      <div class="offcanvas-body">
        <!-- 主頁按鈕 -->
        <div class="nav-item home-item" @click="goHome">
          <h2>主頁</h2>
        </div>

        <!-- 動態產生的科目選單（Accordion） -->
        <div class="accordion accordion-flush" id="sidebarAccordion">
          <div class="accordion-item" v-for="(subject, idx) in list" :key="idx">
            <h2 class="accordion-header" :id="`heading${idx}`">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="`#collapse${idx}`"
                aria-expanded="false"
                :aria-controls="`collapse${idx}`"
              >
                {{ subject }}
              </button>
            </h2>
            <div
              :id="`collapse${idx}`"
              class="accordion-collapse collapse"
              :aria-labelledby="`heading${idx}`"
              data-bs-parent="#sidebarAccordion"
            >
              <div class="accordion-body">
                <a href="pages/Book.html" target="contentFrame" class="side-bar-text">錯題瀏覽</a>
                <a href="pages/RandomPractice.html" target="contentFrame" class="side-bar-text"
                  >隨機出題</a
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 登入按鈕 -->
        <div class="login-footer" @click="onLogin">
          <h2>登入</h2>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  props: {
    list: {
      type: Array,
      default: () => [''],
    },
  },
  methods: {
    goHome() {
      this.$emit('navigate', 'home')
    },
    onLogin() {
      this.$emit('login')
    },
  },
}
</script>

<style scoped>
/* 側邊欄小圖示（固定在左側） */
.side-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100px;
  height: 100%;
  background-color: #d8e9f5;
  padding: 16px;
}

/* 小圖示樣式 */
.toggle-icon {
  color: #7eaee4;
  padding: 10px;
  cursor: pointer;
}

/* 小圖示旁邊的登入文字 */
.login-label {
  position: absolute;
  bottom: 30px;
  color: #7eaee4;
  padding: 10px;
}

/* Offcanvas 整體背景 */
.sidebar-canvas {
  background-color: #d8e9f5;
  padding-top: 16px;
}

/* 關閉按鈕 */
.close-icon {
  color: #7eaee4;
  position: absolute;
  right: 20px;
  cursor: pointer;
}

/* 主頁按鈕區 */
.nav-item {
  margin: 25px;
  cursor: pointer;
}

.home-item h2 {
  color: #7eaee4;
}

/* Accordion 按鈕（科目名稱按鈕） */
.accordion-button {
  background-color: #d8e9f5;
  font-size: 25px;
}

/* 收合時的按鈕文字顏色 */
.accordion-button.collapsed {
  color: #7eaee4;
}

/* 展開時的按鈕文字顏色 */
.accordion-button:not(.collapsed) {
  color: #ffffff;
  text-shadow: 2px 2px 2px #7eaee4;
}

/* 收合內部連結 */
.accordion-body {
  background-color: #d8e9f5;
}

/* 側邊欄內的連結文字 */
.side-bar-text {
  display: block;
  margin-bottom: 8px;
  color: #7eaee4;
  text-decoration: none;
  font-size: 20px;
  cursor: pointer;
}

/* Offcanvas 最底部登入按鈕 */
.login-footer {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  color: #7eaee4;
}

.login-footer h2 {
  margin: 0;
}
</style>
