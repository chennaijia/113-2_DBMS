<template>
  <!-- 上方按鈕列 -->

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
        @delete-card="deleteThisCard"
      />
    </div>
    <!-- 下方按鈕列 -->
    <div class="button-row">
      <button @click="toggleEditMode">
        {{ editMode ? '離開編輯模式' : '進入編輯模式' }}
      </button>
      <button @click="openAddCardModal">➕ 新增錯題</button>
    </div>
    <div>

  <AddCardModal
    v-if="showAddModal"
    @add-card="handleAddCard"
    @close="showAddModal = false"
  />
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


export default {
  props: {
    currentSubject: String
  },
  components: { QuestionCard, AddCardModal },
  setup() {
    const cards = ref([
      { id: 1, question: '問題1', answer: '答案1', starred: false, rightCount: 0, wrongCount: 8, note: '筆記區' },
      { id: 2, question: '問題2', answer: '答案2', starred: false, rightCount: 0, wrongCount: 0, note: '筆記區' },
    ])
    const editMode = ref(false)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const selectedCard = ref(null)
    const showAnswers = ref(true)
    const filterOption = ref('')

    const filteredCards = computed(() => {
      if (filterOption.value === 'starred') {
        return cards.value.filter(c => c.starred)
      } else if (filterOption.value === 'noAnswer') {
        return cards.value.filter(c => c.wrongCount > 5)
      } else {
        return cards.value
      }
    })

    function toggleEditMode() {
      editMode.value = !editMode.value
    }

    function onFilterChange(event) {
      filterOption.value = event.target.value
    }

    function openAddCardModal() {
      showAddModal.value = true
    }

    function openEditCardModal(card) {
      selectedCard.value = card
      showEditModal.value = true
    }

    function closeModals() {
      showAddModal.value = false
      showEditModal.value = false
    }

    function toggleStar(cardId) {
      const card = cards.value.find(c => c.id === cardId)
      if (card) card.starred = !card.starred
    }

    function toggleShowAnswers() {
      showAnswers.value = !showAnswers.value
    }

    function addCard(newCard) {
      cards.value.push(newCard)
    }
    function deleteThisCard(id) {
  cards.value = cards.value.filter(card => card.id !== id)
}



    return {
      cards,
      editMode,
      toggleEditMode,
      showAddModal,
      showEditModal,
      selectedCard,
      showAnswers,
      toggleShowAnswers,
      filterOption,
      filteredCards,
      onFilterChange,
      openAddCardModal,
      openEditCardModal,
      closeModals,
      toggleStar,
      addCard,
      deleteThisCard
    }
  }
}
</script>


<style scoped>
.button-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
