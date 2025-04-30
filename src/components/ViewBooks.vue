<template>
  <div>
    <!-- 創建錯題本按鈕 -->
    <div  class="guide-highlight-add" style="position: absolute; left:10%; padding: 16px; top: 3%;">
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
      " 
      :disabled="showGuide" 
      @click="createBook">
        <Icon icon="material-symbols:add-rounded" width="40" height="40" style="color: black;" />
        <div>創建新的錯題本</div>
      </button>
    </div>

    <!-- 彈出 AddBook.vue -->
    <AddBook v-if="showAddBook" @close="showAddBook = false" @confirm="handleAddBook" />

    <!-- 錯題本排列 -->
    <div style="position: absolute; left:10%; padding: 50px; top: 15%;">
      <div style="display: grid; grid-template-columns: repeat(4, auto); gap: 70px; justify-items: start;">
        <div
          v-for="(book, index) in books"
          :key="index"
          style="position: relative; display: flex; flex-direction: column; align-items: center; width: 210px;"
          @mouseenter="book.hover = true" @mouseleave="book.hover = false"
        >
          <!-- 編輯模式下顯示垃圾桶圖示 -->
          <button v-if="editMode" @click="deleteBook(index)" style="position: absolute; left: 0; top: 0; border: none; background: transparent; cursor: pointer;">
            <Icon icon="mdi:trash-can" width="24" height="24" style="color: #FF6B6B;" />
          </button>

          <!-- 書本 icon -->
          <Icon :icon="book.icon" width="190px" height="190px" style="color: #FFBF69;" />

          <!-- 複製按鈕 -->
          <button v-if="editMode && book.hover" @click="copyBook(index)" style="position: absolute; right: 5px; top: 5px; border: none; background: transparent; cursor: pointer;">
            <Icon icon="material-symbols:content-copy" width="24" height="24" />
          </button>

          <!-- 書本資訊 -->
          <div class="accordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" style="color:black; background-color: white; border-color: transparent; width: 210px;"
                  type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + index" aria-expanded="true" :aria-controls="'collapse' + index">
                  <template v-if="!book.editing">
                    <h4 v-if="editMode" @click.stop="startEditingTitle(book)">{{ book.title }}</h4>
                    <h4 v-else>{{ book.title }}</h4>
                  </template>
                  <template v-else>
                    <input v-model="book.title" @blur="book.editing = false" @keyup.enter="book.editing = false" />
                  </template>
                </button>
              </h2>
              <div :id="'collapse' + index" class="accordion-collapse collapse show">
                <div class="accordion-body">
                  <div>錯題數：{{ book.mistakeCount }}</div>
                  <div>創建日期：{{ book.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯/刪除按鈕 -->
    <div class="guide-highlight-edit" style="position: absolute; bottom: 70px; right: 3%; transform: translateX(-50%); cursor: pointer;">
      <button v-if="!editMode" style="background-color: #CFE5FF; color: black; padding: 12px 24px; border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); font-size: 30px; display: flex; align-items: center; cursor: pointer;" :disabled="showGuide" @click="toggleEditMode">
        <Icon icon="bx:edit-alt" width="40" height="40" style="color: black;" />
        <div>編輯</div>
      </button>
      <button v-if="editMode" @click="finishEditing" style="background-color: #CFE5FF; color: black; padding: 12px 24px; border: none; border-radius: 8px; font-size: 30px; display: flex; align-items: center; cursor: pointer;">
        <div>完成編輯</div>
      </button>
    </div>
  </div>

  <!-- 導覽遮罩與輪播 -->
  <div v-if="showGuide" class="guide-overlay">
  <div class="carousel slide guide-carousel">
    <div class="carousel-inner">
      <div class="carousel-item active">
        <div class="guide-content">歡迎使用錯題本，以下是功能導覽。</div>
      </div>
      <div class="carousel-item">
        <div class="guide-content">這是側邊欄，顯示所有錯題本。</div>
      </div>
      <div class="carousel-item">
        <div class="guide-content">這是「創建新的錯題本」按鈕。</div>
      </div>
      <div class="carousel-item">
        <div class="guide-content">這是「編輯」按鈕，可切換編輯模式。</div>
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

    <button class="btn btn-light mt-3" @click="endGuide" style="z-index: 10;">我知道了</button>
  </div>
</div>

</template>


<script>
import { Icon } from '@iconify/vue';
import AddBook from './AddBook.vue';

// 引入 Bootstrap CSS & JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import * as bootstrap from 'bootstrap'; // ✅ 用來初始化 Carousel

export default {
  name: 'ViewBooks',
  components: { Icon, AddBook },
  data() {
    return {
      showAddBook: false,
      editMode: false,
      showGuide: true, // 顯示導覽遮罩

      books: [
        { title: "高三英文", mistakeCount: 1, date: "2023/10/01", icon: "raphael:book", selected: false, editing: false, hover: false },
        { title: "高二國文", mistakeCount: 2, date: "2025/04/19", icon: "raphael:book", selected: false, editing: false, hover: false },
      ],
    };
  },
  computed: {
    hasSelectedBooks() {
      return this.books.some(book => book.selected);
    }
  },
  mounted() {
    this.$nextTick(() => {
      const carouselEl = document.querySelector('.guide-carousel');
      if (carouselEl) {
        
        const carousel = new bootstrap.Carousel(carouselEl, {
          interval: false,
          wrap: true,
        });

        carouselEl.addEventListener('slid.bs.carousel', this.handleSlide);
      }
    });
  },
  methods: {
    createBook() {
      this.showAddBook = true;
    },
    handleAddBook(newBook) {
      this.books.push({ ...newBook, selected: false, editing: false, hover: false });
      this.showAddBook = false;
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.books.forEach(book => (book.selected = false));
      }
    },
    finishEditing() {
      this.editMode = false;
      this.books.forEach(book => {
        book.selected = false;
        book.editing = false;
        book.hover = false;
      });
    },
    deleteBook(index) {
      this.books.splice(index, 1);
    },
    copyBook(index) {
      const original = this.books[index];
      const copied = {
        ...original,
        title: original.title + ' 副本',
        selected: false,
        editing: false,
        hover: false,
      };
      this.books.splice(index + 1, 0, copied);
    },
    startEditingTitle(book) {
      book.editing = true;
    },
    handleSlide(event) {
      const index = event.to;
      const addBtn = document.querySelector('.guide-highlight-add');
      const editBtn = document.querySelector('.guide-highlight-edit');
      const sidebar = document.querySelector('.guide-highlight-sidebar');

      // 清除所有陰影
      [addBtn, editBtn, sidebar].forEach(el => el?.classList.remove('highlight-shadow'));

      if (index === 1 && sidebar) sidebar.classList.add('highlight-shadow');
      if (index === 2 && addBtn) addBtn.classList.add('highlight-shadow');
      if (index === 3 && editBtn) editBtn.classList.add('highlight-shadow');
    },
    endGuide() {
      this.showGuide = false;
    },
  },
};
</script>



<style scoped>
  .guide-overlay {
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
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
  z-index: 1051;
}

/* 禁用按鈕點擊 */
button[disabled] {
  pointer-events: none;
  opacity: 0.5;
}
</style>