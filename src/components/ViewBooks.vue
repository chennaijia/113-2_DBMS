<!-- ViewBooks.vue -->
<template>
  <!-- === (原樣保留 - 你提供的整段 template 內容) === -->
  <!--問題：直接登入還不能跟sidebar同步(要refresh)，要不要把登入資訊放在App.vue中統一控制？-->
  <div>
    <!-- 創建錯題本按鈕 -->
    <div class="guide-highlight-add" style="position: absolute; left:10%; padding: 16px; top: 3%;">
      <button style="
        background-color: #CFE5FF;
        color: black;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        font-size: 30px;
        display: flex;
        align-items: center;
        cursor: pointer;
      " :disabled="showGuide" @click="createBook">
        <Icon icon="material-symbols:add-rounded" width="40" height="40" style="color: black;" />
        <div>創建新的錯題本</div>
      </button>
    </div>

    <!-- 彈出 AddBook.vue -->
    <AddBook v-if="showAddBook" @close="showAddBook = false" @confirm="handleAddBook" />

    <!-- 錯題本排列 -->
    <div style="position: absolute; left:10%; padding: 50px; top: 15%;">
      <div style="display: grid; grid-template-columns: repeat(4, auto); gap: 70px; justify-items: start;">
        <div v-for="(book, index) in books" :key="book.id"
          style="position: relative; display: flex; flex-direction: column; align-items: center; width: 210px;"
          @mouseenter="book.hover = true" @mouseleave="book.hover = false">
          <!-- 編輯模式下顯示垃圾桶圖示 -->
          <button v-if="editMode" @click="deleteBook(index)"
            style="position: absolute; left: 0; top: 0; border: none; background: transparent; cursor: pointer;">
            <Icon icon="mdi:trash-can" width="24" height="24" style="color: #FF6B6B;" />
          </button>

          <!-- 書本 icon -->
          <Icon :icon="book.icon" width="190px" height="190px" style="color: #FFBF69;" />

          <!-- 複製按鈕 -->
          <button v-if="editMode && book.hover" @click="copyBook(index)"
            style="position: absolute; right: 5px; top: 5px; border: none; background: transparent; cursor: pointer;">
            <Icon icon="material-symbols:content-copy" width="24" height="24" />
          </button>

          <!-- 書本資訊 -->
          <div style="width: 210px; border: 1px solid #ddd; border-radius: 8px;">
            <button @click="book.expanded = !book.expanded"
              style="color: black; background-color: white; border: none; width: 100%; text-align: left; padding: 8px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
              <template v-if="!book.editing">
                <h5 v-if="editMode" @click.stop="startEditingTitle(book)">{{ book.title }}</h5>
                <h5 v-else>{{ book.title }}</h5>
              </template>
              <template v-else>
                <input v-model="book.title" @blur="book.editing = false" @keyup.enter="book.editing = false" />
              </template>

              <Icon
                :icon="book.expanded ? 'material-symbols:expand-less-rounded' : 'material-symbols:expand-more-rounded'"
                width="33" height="33" style="color: lightslategray;" />
            </button>

            <div v-show="book.expanded" style="padding: 8px 16px; background-color: #f9f9f9;">
              <div>錯題數：{{ book.mistakeCount }}</div>
              <div>創建日期：{{ book.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯/刪除按鈕 -->
    <div class="guide-highlight-edit"
      style="position: absolute; bottom: 70px; right: 3%; transform: translateX(-50%); cursor: pointer;">
      <button v-if="!editMode"
        style="background-color: #CFE5FF; color: black; padding: 12px 24px; border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); font-size: 30px; display: flex; align-items: center; cursor: pointer;"
        :disabled="showGuide" @click="toggleEditMode">
        <Icon icon="bx:edit-alt" width="40" height="40" style="color: black;" />
        <div>編輯</div>
      </button>
      <button v-if="editMode" @click="finishEditing"
        style="background-color: #CFE5FF; color: black; padding: 12px 24px; border: none; border-radius: 8px; font-size: 30px; display: flex; align-items: center; cursor: pointer;">
        <div>完成編輯</div>
      </button>
    </div>
  </div>

  <!-- 導覽遮罩與輪播 -->
  <div v-if="showGuide" class="guide-overlay">
    <div class="carousel slide guide-carousel">
      <div class="carousel-inner">
        <div class="carousel-item active">
          <div class="guide-content">
            <img src="/fav.PNG" alt="logo" style="width:50px; height:50px; margin-bottom: 10px;" /><br>
            歡迎來到錯題本系統！以下是功能導覽(◍•ᴗ•◍)
          </div>
        </div>
        <div class="carousel-item">
          <div class="guide-content">
            <strong style="color: #7eaee4">側邊欄</strong>
            <div>
              點一下收合<br>
              可瀏覽&編輯錯題/隨機出題<br>
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="guide-content">
            <strong style="color: #7eaee4">建立新的錯題本</strong>
            <div>
              輸入名稱/年級/科目<br>
              來創建新的錯題本
            </div>
          </div>
        </div>
        <div class="carousel-item">
          <div class="guide-content">
            <strong style="color: #7eaee4">編輯</strong>
            <div>
              刪除&修改錯題本資訊<br>
              可複製或重新命名錯題本<br>
            </div>
          </div>
        </div>
      </div>


      <!-- 左右控制箭頭 -->
      <button class="carousel-control-prev" type="button" data-bs-target=".guide-carousel" data-bs-slide="prev">
        <Icon icon="ic:round-chevron-left" width="48" height="48" style="color: #7EAEE4;" />
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target=".guide-carousel" data-bs-slide="next">
        <Icon icon="ic:round-chevron-right" width="48" height="48" style="color: #7EAEE4;" />
        <span class="visually-hidden">Next</span>
      </button>


      <!-- 頁面指示器 -->
      <div class="carousel-indicators">
        <button type="button" data-bs-target=".guide-carousel" data-bs-slide-to="0" class="active"></button>
        <button type="button" data-bs-target=".guide-carousel" data-bs-slide-to="1"></button>
        <button type="button" data-bs-target=".guide-carousel" data-bs-slide-to="2"></button>
        <button type="button" data-bs-target=".guide-carousel" data-bs-slide-to="3"></button>
      </div>


      <!-- 直接登入按鈕（未登入才顯示） -->
      <button v-if="!isLoggedIn" class="btn btn-primary mt-3" @click="openLoginModal"
        style="z-index: 10; background-color:#7EAEE4 ;border:none;">
        直接登入
      </button>
      <Login v-if="showLoginModal" @login="handleLogin" @close="closeLoginModal" style="z-index: 2000;" />
    </div>
  </div>
</template>


<script setup lang="ts">
/* ------------ import ------------ */
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import AddBook from './AddBook.vue';
import Login from './Login.vue';
import {
  fetchQBs, createQB, updateQB, deleteQB, copyQB
} from '@/api/qb';                 // 你前面建立的 API 包裝
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from 'bootstrap';

/* ------------ 型別 ------------ */
interface BookUI {
  id: number;
  title: string;
  icon: string;
  mistakeCount: number;
  date: string;
  selected: boolean;
  editing: boolean;
  hover: boolean;
  expanded: boolean;
}

/* ------------ reactive 狀態 ------------ */
const showAddBook = ref(false);
const editMode = ref(false);
const showGuide = ref(false);
const showLoginModal = ref(false);
const isLoggedIn = ref(!!localStorage.getItem('userName'));
const currentSlideIndex = ref(0);
const books = ref<BookUI[]>([]);

/* ------------ 生命週期 ------------ */
onMounted(async () => {
  if (isLoggedIn.value) await loadBooks();   // 只有 token 已存在才先抓
  showGuide.value = !isLoggedIn.value;

  // 建 carousel 事件（保留你的原 JS）
  const carouselEl = document.querySelector('.guide-carousel');
  if (carouselEl) {
    const carousel = new bootstrap.Carousel(carouselEl, { interval: false, wrap: false });
    carouselEl.addEventListener('slide.bs.carousel', (event: any) => {
      if (currentSlideIndex.value === 0 && event.direction === 'right') event.preventDefault();
      if (currentSlideIndex.value === 3 && event.direction === 'left') event.preventDefault();
      currentSlideIndex.value = event.to;
    });
    carouselEl.addEventListener('slid.bs.carousel', handleSlide);
  }
});

/* ------------ 從後端抓清單 ------------ */
async function loadBooks() {
  const { data } = await fetchQBs();
  books.value = data.map((row: any) => ({
    id: row.QuestionBook_ID,
    title: row.BName,
    icon: row.Icon || 'raphael:book',
    mistakeCount: row.Question_Count ?? 0,
    date: new Date(row.CreateDate ?? row.CreatedDate ?? Date.now())
      .toISOString()
      .slice(0, 10),
    selected: false, editing: false, hover: false, expanded: true,
  })) as BookUI[];
}

/* ------------ 新增 ------------ */
async function handleAddBook(input: { title: string; icon: string }) {
  const { data } = await createQB({ BName: input.title, Icon: input.icon });
  books.value.push({
    id: data.QuestionBook_ID,
    title: input.title,
    icon: input.icon,
    mistakeCount: 0,
    date: new Date().toISOString().slice(0, 10),
    selected: false, editing: false, hover: false, expanded: true,
  });
  showAddBook.value = false;
  // 通知其他元件更新
  window.dispatchEvent(new Event('refresh-books'))

}

/* ------------ 更新 (完成編輯) ------------ */
async function finishEditing() {
  editMode.value = false;

  for (const b of books.value) {
    const changedTitle = (b as any).originalTitle !== undefined && b.title !== (b as any).originalTitle;
    const changedIcon = (b as any).originalIcon !== undefined && b.icon !== (b as any).originalIcon;

    if (changedTitle || changedIcon) {
      try {
        await updateQB(b.id, { BName: b.title, Icon: b.icon });
        // 更新成功後把 baseline 同步
        (b as any).originalTitle = b.title;
        (b as any).originalIcon = b.icon;
        // 通知其他元件更新
        window.dispatchEvent(new Event('refresh-books'))

      } catch (err) {
        console.error('更新失敗', err);
        alert(`題本「${b.title}」更新失敗`);
      }
    }

    // 清理 UI 狀態
    b.editing = false;
    b.hover = false;
    b.selected = false;
  }
}

/* ------------ 刪除 ------------ */
async function deleteBook(idx: number) {
  const target = books.value[idx];
  await deleteQB(target.id);
  books.value.splice(idx, 1);
  // 通知其他元件更新
  window.dispatchEvent(new Event('refresh-books'))

}

/* -------- copyBook（修正版） -------- */
async function copyBook(idx: number) {
  const src = books.value[idx];

  try {
    /* 1️⃣ 先呼叫後端，拿到新 ID */
    const { data } = await copyQB(src.id);  // { QuestionBook_ID: 123 }
    console.log('啊啊啊啊 ID：', data.QuestionBook_ID);

    /* 2️⃣ 只挑純資料欄位，組成新的平面物件 */
    const cloned = {
      id: data.QuestionBook_ID,
      title: src.title + ' 的副本',
      icon: src.icon,
      mistakeCount: src.mistakeCount,
      date: src.date,
      /* view-state */
      selected: false,
      editing: false,
      hover: false,
      expanded: true,
    };

    /* 3️⃣ 插到原書後面 */
    books.value.splice(idx + 1, 0, cloned);
    // 通知其他元件更新
    window.dispatchEvent(new Event('refresh-books'))

  } catch (err) {
    console.error('複製失敗', err);
    alert(`題本「${src.title}」複製失敗`);
  }
}


/* ------------ 純前端 UI 動作 ------------ */
function createBook() { showAddBook.value = true; }

function openLoginModal() { showLoginModal.value = true; }
function closeLoginModal() { showLoginModal.value = false; }
async function handleLogin(userName: string) {
  console.log('登入成功，帳號：', userName);
  isLoggedIn.value = true;
  localStorage.setItem('userName', userName);
  closeLoginModal();
  showGuide.value = false;

  await loadBooks();
}

function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) books.value.forEach(b => (b.selected = false));
}
function startEditingTitle(book: BookUI) {
  if (!('originalTitle' in book)) {
    // 首次編輯才存一份，避免之後一直覆蓋
    (book as any).originalTitle = book.title;
    (book as any).originalIcon = book.icon;
  }
  book.editing = true;
}

function handleSlide(event: any) {
  currentSlideIndex.value = event.to;
  const addBtn = document.querySelector('.guide-highlight-add');
  const editBtn = document.querySelector('.guide-highlight-edit');
  const sidebar = document.querySelector('.guide-highlight-sidebar');
  [addBtn, editBtn, sidebar].forEach(el => el?.classList.remove('highlight-shadow'));
  if (event.to === 1 && sidebar) sidebar.classList.add('highlight-shadow');
  if (event.to === 2 && addBtn) addBtn.classList.add('highlight-shadow');
  if (event.to === 3 && editBtn) editBtn.classList.add('highlight-shadow');
}
function endGuide() { showGuide.value = false; }
</script>

<style scoped>
.guide-overlay {
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-carousel {
  background-color: white;
  padding: 40px;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  text-align: center;
}

.guide-content {
  font-size: 20px;
  padding: 20px;
}

.highlight-shadow {
  box-shadow: 0 0 0 5px #4DA3FF !important;
  border-radius: 8px;
  transition: box-shadow 0.3s;
  z-index: 1060;
  position: relative;
}

/* 禁用按鈕點擊 */
button[disabled] {
  pointer-events: none;
  opacity: 0.5;
}
</style>
