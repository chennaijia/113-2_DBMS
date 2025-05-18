<template>
 <!-- 上方按鈕列 -->
 <div class="toolbar">
   <select @change="onFilterChange" v-model="filterOption" class="filter-select">
     <option value="">全部</option>
     <option value="starred">加星號</option>
     <option value="noAnswer">錯誤超過五次</option>
     <option value="truefalse">是非題</option>
     <option value="multiple123">選擇題(數字選項)</option>
     <option value="multipleABC">選擇題(字母選項)</option>
     <option value="open">問答題</option>
   </select>


   <button class="btn primary" @click="toggleShowAnswers">
     {{ showAnswers ? '🙈 隱藏答案' : '👀 顯示答案' }}
   </button>
 </div>


 <!-- 題目列表 -->
 <div class="question-container">
   <div v-for="(card, index) in filteredCards" :key="card.id">
     <QuestionCard :index="index + 1" :card="card" :editMode="editMode" :showAnswers="showAnswers"
       @toggle-star="toggleStar(card.id)" @edit="openEditCardModal(card)" @delete-card="deleteThisCard" />
   </div>


   <!-- 下方按鈕列 -->
   <div class="button-row">
     <button class="btn secondary" @click="toggleEditMode">
       {{ editMode ? '❌ 離開編輯模式' : '✏️ 進入編輯模式' }}
     </button>
     <button class="btn success" @click="openAddCardModal">➕ 新增錯題</button>
   </div>
 </div>


 <!-- Modal區域 -->
 <AddCardModal v-if="showAddModal" :bookId="currentBookId" @add-card="addCard" @close="closeModals" />
 <!--AddCardModal v-if="showAddModal" @add-card="addCard" @close="closeModals" /-->
 <EditCardModal v-if="showEditModal" :card="selectedCard" @close="closeModals" />
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
     {
       id: Date.now(), // 第一張卡
       questionType: 'open',
       question: '功能介紹',
       answer: '功能介紹', // 預設多選題答案需要排序
       questionImage: new URL('@/assets/images/5.png', import.meta.url).href,
       answerImage: new URL('@/assets/images/6.png', import.meta.url).href,
       note: '兄弟，這個錯題還是刪了吧。我朋友有點破防了，我是沒差啦，這種題目我看多了，不會輕易破防的。但我有一個朋友，他看到這些錯題的時候，可能真的有點汗流浹背了，現在有點不太舒服，想睡覺。',
       starred: false,
       wrongCount: 8,
       rightCount: 0,
     },
     {
       id: Date.now() + 1, // 第二張卡（確保不重複）
       questionType: 'open',
       question: '題型介紹',
       answer: '題型介紹',
       questionImage: new URL('@/assets/images/7.png', import.meta.url).href,
       answerImage: new URL('@/assets/images/8.png', import.meta.url).href,
       note: '當然不是我啦，我一向都撐得住，都是用旁觀者的角度在看錯題，也不至於破防。只是想幫我朋友反映一下，他真的不會寫。所以還是建議這區要不要記一些筆記，或者…先收起來。當然啦，錯題筆記區要不要用還是看你，我是沒什麼感覺的，真的。',
       starred: false,
       wrongCount: 0,
       rightCount: 0,
     }
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
     } else if (['truefalse', 'multiple123', 'multipleABC', 'open'].includes(filterOption.value)) {
       return cards.value.filter(c => c.questionType === filterOption.value)
     } else {
       return cards.value
     }
   })
   function toggleEditMode() {
     if (editMode.value) {
       // 準備離開編輯模式，要驗證每張卡片
       const invalidCard = cards.value.find((card) => {
         const noQuestionImage = !card.questionImage
         const noAnswer =
           card.answer === null ||
           card.answer === undefined ||
           (Array.isArray(card.answer) && card.answer.length === 0) ||
           (!Array.isArray(card.answer) && card.answer === '')
         return noQuestionImage || noAnswer
       })


       if (invalidCard) {
         alert('請確保每張卡片都有「題目圖片」且「答案」不為空')
         return
       }
     }


     // 通過檢查，才切換模式
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



