<template>
  <div>
    <select @change="onFilterChange" v-model="filterOption">
      <option value="">全部</option>
      <option value="starred">加星號</option>
      <option value="noAnswer">錯誤超過五次</option>
    </select>
    <button @click="toggleShowAnswers">
      {{ showAnswers ? '隱藏答案' : '顯示答案' }}
    </button>
  </div>
  <div>
    <!-- 題目列表 -->
    <div v-for="(card, index) in filteredCards" :key="card.id">
      <QuestionCard
        :index="index + 1"
        :card="card"
        :editMode="editMode"
        :showAnswers="showAnswers"
        @toggle-star="toggleStar(card.id)"
        @edit="openEditCardModal(card)"
        @delete-card="deleteCard(card.id)"
      />
    </div>
    <!-- 下方按鈕列 -->
    <div class="button-row">
      <button @click="toggleEditMode">
        {{ editMode ? '離開編輯模式' : '進入編輯模式' }}
      </button>
      <button @click="openAddCardModal">➕ 新增錯題</button>
    </div>

    <!-- Modal區域 -->
    <AddCardModal
      v-if="showAddModal"
      @add-card="addCard"
      @close="closeModals"
    />

    <EditCardModal v-if="showEditModal" :card="selectedCard" @close="closeModals" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import QuestionCard from './QuestionCard.vue'
import AddCardModal from './AddCardModal.vue'
import EditCardModal from './EditCardModal.vue'

// 題目資料
const cards = ref([
  { id: 1, question: '問題1', answer: '答案1', starred: false, rightCount: 0, wrongCount: 8, note: '' },
  { id: 2, question: '問題2', answer: '答案2', starred: false, rightCount: 0, wrongCount: 0, note: '' },
]);

// 控制編輯模式
const editMode = ref(false);
function toggleEditMode() {
  editMode.value = !editMode.value;
}

// 控制新增、編輯 Modal
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedCard = ref(null);
const showAnswers = ref(true)
const filterOption = ref('')

// ⭐ 新增：根據篩選條件過濾卡片
const filteredCards = computed(() => {
  if (filterOption.value === 'starred') {
    return cards.value.filter(c => c.starred)
  } else if (filterOption.value === 'noAnswer') {
    return cards.value.filter(c => c.wrongCount > 5)
  } else {
    return cards.value
  }
})

// ⭐ 新增：篩選選單變動
function onFilterChange(event) {
  filterOption.value = event.target.value
}

// 開啟新增題目 Modal
function openAddCardModal() {
  showAddModal.value = true;
}

// 開啟編輯題目 Modal
function openEditCardModal(card) {
  selectedCard.value = card;
  showEditModal.value = true;
}

// 關閉 Modal
function closeModals() {
  showAddModal.value = false;
  showEditModal.value = false;
}

// 收藏題目
function toggleStar(cardId) {
  const card = cards.value.find(c => c.id === cardId);
  if (card) {
    card.starred = !card.starred;
  }
}

// 切換顯示答案
function toggleShowAnswers() {
  showAnswers.value = !showAnswers.value
}

// ⭐ 新增：新增卡片
function addCard(newCard) {
  cards.value.push(newCard)
}

export default {
  name: 'ViewQuestions',
  components: {
    QuestionCard,
    AddCardModal,
    EditCardModal
  },
  props: {
    currentSubject: {
      type: String,
      required: true,
    },
  },
  computed: {
    displaySubject() {
      return this.currentSubject || '未選擇科目';
    },
  },
}

</script>

<style scoped>
.button-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
