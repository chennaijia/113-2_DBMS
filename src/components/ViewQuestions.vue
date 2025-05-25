<template>
  <!-- 上方按鈕列 -->
  <div class="toolbar d-flex justify-content-between align-items-center">
    <!-- 返回鍵區 -->
    <div class="d-flex align-items-center gap-3">
      <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
        <i class="bi bi-caret-left"></i>
        <span class="ms-2">返回</span>
      </button>
      <div class="fw-bold text-primary fs-4">{{ currentSubject }} - 錯題瀏覽</div>
    </div>


    <!-- 其他內容 -->
    <div class="toolbar-content d-flex flex-wrap align-items-center gap-3">
      <select @change="onFilterChange" v-model="filterOption"
        class="form-select rounded-pill border-primary text-primary" style="width: auto">
        <option value="">全部</option>
        <option value="starred">加星號</option>
        <option value="noAnswer">錯誤超過五次</option>
        <option value="truefalse">是非題</option>
        <option value="multiple123">選擇題(數字選項)</option>
        <option value="multipleABC">選擇題(字母選項)</option>
        <option value="open">問答題</option>
      </select>


      <button class="btn btn-outline-primary rounded-pill" @click="toggleEditMode">
        {{ editMode ? '❌ 離開編輯模式' : '✏️ 進入編輯模式' }}
      </button>


      <button class="btn btn-outline-primary rounded-pill" @click="openAddCardModal">
        ➕ 新增錯題
      </button>


      <button class="btn btn-outline-primary rounded-pill" @click="toggleShowAnswers">
        {{ showAnswers ? '🙈 隱藏答案' : '👀 顯示答案' }}
      </button>

      <button v-if="book.Question_Count > 0" class="btn btn-outline-primary rounded-pill" @click="goToPractice">
        <i class="bi bi-crosshair"></i>
        <span>⮑去練習</span>
      </button>
    </div>
  </div>


  <!-- 題目列表 -->
  <div class="question-container">
    <div v-for="(card, index) in filteredCards" :key="card.id">
      <QuestionCard :index="index + 1" :card="card" :editMode="editMode" :showAnswers="showAnswers"
        @toggle-star="toggleStar(card.id)" @edit="openEditCardModal(card)" @delete-card="deleteThisCard"
        @update-note="saveNoteDebounced" />
    </div>


    <!-- 下方按鈕列 -->
  </div>


  <!-- Modal區域 -->
  <AddCardModal :bookId="book.QuestionBook_ID" v-if="showAddModal" @close="showAddModal = false" @add-card="addCard" />
</template>


<script>
import { ref, computed, onMounted, watch } from 'vue'
import QuestionCard from './QuestionCard.vue'
import AddCardModal from './AddCardModal.vue'
import { fetchQuestionsByBook } from '../api/questions'
import { deleteQuestionById } from '../api/questions'
import { updateStarStatus } from '../api/questions'
import { debounce } from 'lodash-es'
import { updateNote } from '../api/questions'
import { updateQuestionById } from '../api/questions'


const orderABC = ['A', 'B', 'C', 'D', 'E']
const order123 = ['1', '2', '3', '4', '5']
export default {
  props: {
    currentSubject: String,
    book: {
      type: Object,
      required: true,
    },
  },
  components: { QuestionCard, AddCardModal },
  setup(props, { emit }) {
    const cards = ref([])
    const originalCards = ref([])


    const defaultCards = () => [
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
      },
    ]
    const loadCards = async () => {
      try {
        if (!props.book?.QuestionBook_ID) return


        const { data } = await fetchQuestionsByBook(props.book.QuestionBook_ID)


        if (!Array.isArray(data)) {
          console.warn('⚠️ 回傳格式錯誤：', data)
          cards.value = defaultCards()
          return
        }


        if (data.length === 0) {
          console.log('📭 該題本還沒有題目，載入預設介紹卡')
          cards.value = defaultCards()
          return
        }


        cards.value = data.map((q) => ({
          id: q.Question_ID || q.id,
          questionType: q.QType || '', // ✅ 題型轉換
          answer: q.Answer || '', // ✅ 答案內容
          questionImage: q.Content_pic || '', // ✅ 題目圖片
          answerImage: q.Answer_pic || '', // ✅ 解答圖片
          note: q.Content || '', // ✅ 筆記（如有）
          starred: q.isStar === 1, // ✅ 加星欄位轉換
          wrongCount: q.errCount,
          rightCount: q.practiceCount - q.errCount < 0 ? 0 : q.practiceCount - q.errCount,
        }))


        console.log('✅ 題目卡載入完成：', cards.value)
      } catch (err) {
        console.error('❌ 讀題目失敗：', err)
        cards.value = defaultCards()
      }
    }


    onMounted(loadCards)


    // 切換到別本書時自動重新抓+
    watch(
      () => props.book?.QuestionBook_ID,
      () => loadCards()
    )


    const editMode = ref(false)
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const selectedCard = ref(null)
    const showAnswers = ref(true)
    const filterOption = ref('')


    const filteredCards = computed(() => {
      if (filterOption.value === 'starred') {
        return cards.value.filter((c) => c.starred)
      } else if (filterOption.value === 'noAnswer') {
        return cards.value.filter((c) => c.wrongCount > 5)
      } else if (['truefalse', 'multiple123', 'multipleABC', 'open'].includes(filterOption.value)) {
        return cards.value.filter((c) => c.questionType === filterOption.value)
      } else {
        return cards.value
      }
    })


    async function toggleEditMode() {
      if (editMode.value) {
        // ----------- ① 原本的驗證 ---------- //
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


        // ----------- ② 送 PATCH ---------- //
        for (const card of cards.value) {
          const fd = new FormData()
          if (Array.isArray(card.answer)) {


            const sorted = card.questionType.includes('multipleABC')
              ? [...card.answer].sort((a, b) => orderABC.indexOf(a) - orderABC.indexOf(b))
              : [...card.answer].sort((a, b) => order123.indexOf(a) - order123.indexOf(b))
            fd.append('answer', sorted.join(''))
          } else {
            fd.append('answer', card.answer)
          }
          // fd.append('note', card.note ?? '')


          // 圖檔（使用 ← QuestionCard.vue 留下的 File 物件）
          if (card.questionFile) fd.append('content_pic', card.questionFile)
          if (card.answerFile) fd.append('answer_pic', card.answerFile)


          // 若都沒異動不必呼叫
          if ([...fd.keys()].length > 0) {
            try {
              await updateQuestionById(card.id, fd)
            } catch (err) {
              console.error('❌ 更新題目失敗：', err)
              alert('有題目更新失敗，請稍後再試')
            }
          }
        }
      }
      // ③ 切換模式
      editMode.value = !editMode.value
    }


    function goToPractice() {
      console.log('🔄 切換到練習模式')
      emit('change-page', 'practice', props.currentSubject)
    }

    function goBack() {
      emit('goBack')
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


    async function toggleStar(cardId) {
      const card = cards.value.find((c) => c.id === cardId)
      if (!card) return


      try {
        const newStatus = !card.starred
        await updateStarStatus(cardId, newStatus)
        card.starred = newStatus
        console.log(`✅ 星號狀態已更新為 ${newStatus ? '加星' : '取消'}`)
      } catch (err) {
        console.error('❌ 加星失敗:', err)
        alert('更新星號失敗，請稍後再試')
      }
    }


    function toggleShowAnswers() {
      showAnswers.value = !showAnswers.value
    }


    function addCard(newCard) {
      cards.value.push(newCard)
    }


    async function deleteThisCard(id) {
      if (!confirm('確定要刪除這張題目卡嗎？')) return


      try {
        await deleteQuestionById(id)
        cards.value = cards.value.filter((card) => card.id !== id)
        console.log('✅ 題目已從資料庫刪除')
      } catch (err) {
        console.error('❌ 刪除失敗:', err)
        alert('刪除題目失敗，請稍後再試')
      }
    }


    const saveNoteDebounced = debounce(({ id, note }) => {
      console.log('🚀 發送更新筆記請求：', id, note)


      updateNote(id, note)
        .then(() => console.log('✅ 筆記儲存成功'))
        .catch((err) => console.error('❌ 筆記儲存失敗:', err))
    }, 1000)



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
      deleteThisCard,
      saveNoteDebounced,
      goBack,
      originalCards,
      loadCards,
      goToPractice,
    }
  },
}
</script>


<style scoped>
.toolbar {
  position: fixed;
  top: 0;
  left: 80px;
  right: 0;
  width: 95%;
  background-color: #fff;
  z-index: 100;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.toolbar-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}


.question-container {
  padding-top: 30px;
  /* 根據 .toolbar 的高度調整 */
}
</style>
