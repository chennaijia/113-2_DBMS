<template>
  <div class="d-flex align-items-center gap-3 ms-5 mt-5">
    <button class="btn btn-outline-primary rounded-pill return-btn" @click="goBack">
      <i class="bi bi-caret-left"></i>
      <span class="ms-2">返回</span>
    </button>
    <div class="fw-bold text-primary fs-4">{{ currentSubject }} - 錯題練習</div>
  </div>
  <div class="practice-result-container text-center mt-5" style="max-width: 1200px; margin: 0 auto">
    <h2 class="fw-bold text-lg mb-2">恭喜完成練習！<i class="bi bi-award"></i></h2>
    <p class="text-muted mb-4">以下是本次練習的統計結果</p>

    <div class="d-flex justify-content-center gap-4 flex-wrap mb-4">
      <div class="stat-card bg-light border rounded p-3 shadow-sm text-center">
        <div class="fs-6 text-secondary">總題數</div>
        <div class="fs-3 fw-bold text-primary">{{ total }}</div>
      </div>
      <div class="stat-card bg-light border rounded p-3 shadow-sm text-center">
        <div class="fs-6 text-secondary">答對題數</div>
        <div class="fs-3 fw-bold text-success">{{ correct }}</div>
      </div>
      <div class="stat-card bg-light border rounded p-3 shadow-sm text-center">
        <div class="fs-6 text-secondary">正確率</div>
        <div class="fs-3 fw-bold text-warning">{{ accuracy }}%</div>
      </div>
      <div class="stat-card bg-light border rounded p-3 shadow-sm text-center">
        <div class="fs-6 text-secondary">耗時 <i class="bi bi-clock-fill"></i></div>
        <div class="fs-3 fw-bold text-muted">{{ timeSpent }}</div>
      </div>
    </div>

    <hr class="my-4" />

    <div class="w-100 px-4 text-start" style="max-width: 1200px; margin: 0 auto">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-3 fw-bold text-lg">題目作答紀錄 <i class="bi bi-bar-chart-line"></i></h5>
        <button class="btn btn-outline-danger rounded-pill" @click="showOnlyWrong = !showOnlyWrong">
          <i class="bi" :class="showOnlyWrong ? 'bi-eye' : 'bi-eye-slash'"></i>
          <span class="ms-2">
            {{
              showOnlyWrong
                ? `顯示全部題目`
                : `只看錯題（共 ${props.questions.filter((q) => q.isCorrect === false).length} 題）`
            }}
          </span>
        </button>
      </div>
      <ul class="list-group mt-3">
        <li class="list-group-item ..." v-for="(questions, index) in visibleQuestions" :key="questions.id">
          <div class="d-flex justify-content-between align-items-center question-header px-1 py-2 text-dark-dark-m"
            @click="toggle(index)">
            <div>
              <strong>第 {{ questions.id }} 題：</strong>
              <span :class="{
                'text-success': questions.isCorrect === true,
                'text-danger fw-bold': questions.isCorrect === false,
                'text-secondary': questions.QType === 'open' && !questions.checked,
              }" v-html="questions.QType === 'open' && !questions.checked
                ? '<i class=\'bi bi-emoji-neutral\'></i> 待確認'
                : questions.isCorrect
                  ? '<i class=\'bi bi-emoji-smile\'></i> 正確'
                  : '<i class=\'bi bi-emoji-dizzy\'></i> 錯誤'
                ">
              </span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary-subtle text-dark">{{
                typeLabel(questions.QType)
              }}</span>
              <i class="bi" :class="expandedIndex === index ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
            </div>
          </div>

          <transition name="fade">
            <div v-if="expandedIndex === index" class="question-detail mt-3 px-2 pb-2 pt-1 border-top text-dark-s">
              <div class="mb-3">
                <strong><i class="bi bi-image"></i> 題目圖片：</strong><br />
                <img :src="questions.Content_pic" class="img-fluid rounded mt-2 shadow-sm"
                  style="max-height: 650px; object-fit: contain" />
              </div>

              <div class="mb-3">
                <strong><i class="bi bi-pen"></i> 你的答案：</strong><br />
                <div class="badge bg-light text-dark border px-3 py-2 mt-1">
                  {{ questions.userAnswer || '（未作答）' }}
                </div>
              </div>

              <div v-if="questions.QType === 'open'">
                <div v-if="questions.checked && questions.isCorrect !== null">
                  <strong><i class="bi bi-check-circle"></i> 判定結果：</strong>
                  <span :class="questions.isCorrect ? 'text-success' : 'text-danger'">
                    {{ questions.isCorrect ? '你標示為答對' : '你標示為答錯' }}
                  </span>
                </div>

                <div v-else class="d-flex gap-3 align-items-center flex-wrap mt-2">
                  <strong><i class="bi bi-question-circle"></i> 你覺得答對嗎？</strong>
                  <button class="btn btn-outline-success btn-sm" @click="judgeCorrect(questions)">
                    我答對了&gt;:D
                  </button>
                  <button class="btn btn-outline-danger btn-sm" @click="judgeWrong(questions)">
                    我答錯了&gt;:(
                  </button>
                </div>
              </div>

              <div v-if="questions.Answer" class="mb-2">
                <strong><i class="bi bi-fonts"></i> 正確答案文字：</strong><br />
                <span class="badge bg-success-subtle text-dark px-3 py-2 mt-1">
                  {{ questions.Answer }}
                </span>
              </div>
              <div class="mb-2">
                <strong><i class="bi bi-image"></i> 正確答案圖片：</strong><br />
                <img :src="questions.Answer_pic" class="img-fluid rounded mt-2 shadow-sm"
                  style="max-height: 250px; object-fit: contain" />
              </div>
              <textarea v-model="questions.noteText" rows="3" class="w-100" placeholder="輸入筆記..."
                @blur="saveNote(questions)"></textarea>
            </div>
          </transition>
        </li>
      </ul>
    </div>

    <div class="d-flex justify-content-center gap-3 mt-5 flex-wrap">
      <button class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill" @click="restart">
        <i class="bi bi-crosshair"></i>
        <span class="ms-2">再練一次</span>
      </button>
      <button class="btn btn-outline-primary rounded-pill px-4 py-2" @click="goViewQuestion">
        <i class="bi bi-house"></i>
        <span class="ms-2">回錯題瀏覽</span>
      </button>
    </div>
  </div>
</template>

<script setup >
import { ref, onMounted, computed } from 'vue'
import { fetchMostWrongQuestions, fetchRandomQuestionsPractice } from '@/api/questions'
import { updateNote } from '@/api/questions'
import { submitPracticeResult } from '@/api/practice';


const props = defineProps({
  currentSubject: String,
  book: Object,
  total: Number,
  correct: Number,
  accuracy: Number,
  timeSpent: String,
  questions: Array,
})

const emit = defineEmits(['restart', 'goBack', 'change-page'])

const expandedIndex = ref(null)

const showOnlyWrong = ref(false)

const visibleQuestions = computed(() =>
  showOnlyWrong.value ? props.questions.filter((q) => q.isCorrect === false) : props.questions
)

async function saveNote(questions) {
  console.log('Saving note for question:', questions.Question_ID, questions.noteText)
  await updateNote(questions.Question_ID, questions.noteText)
}

//給怡玲
onMounted(() => {
  props.questions.forEach((q) => {
    q.noteText = q.Content || ''

    //練習過的題目練習數加一，後端綁這裡 q.Question_ID
    if (q.QType !== 'open') {
      q.checked = true
      const correctRaw = q.Answer ?? q.answer ?? q.correctAnswer ?? ''
      const correct = normalizeAnswer(correctRaw, q.QType)
      const user = normalizeAnswer(q.userAnswer, q.QType)
      if (q.userAnswer === '') {
        q.isCorrect = false
      } else {
        q.isCorrect = user !== '' && user === correct
      }
      if (q.isCorrect === false) {
        // 非開放題且對過答案+錯誤，後端綁這裡1 q.Question_ID
      }
      return
    } else {
      if (q.checked && q.isCorrect === false) {
        // 開放題且對過答案＋錯誤，後端綁這裡2 q.Question_ID
      }
    }
  })
})

function toggle(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function judgeCorrect(q) {
  q.isCorrect = true
  q.checked = true
}

function judgeWrong(q) {
  q.isCorrect = false
  q.checked = true
  // 開放題且對答案錯誤，後端綁這裡3 q.Question_ID
}

function typeLabel(type) {
  switch (type) {
    case 'open':
      return '開放題'
    case 'multiple123':
      return '選擇題(123)'
    case 'multipleABC':
      return '選擇題(ABC)'
    case 'truefalse':
      return '是非題'
    case 'fill':
      return '填空題'
    default:
      return '其他'
  }
}

function normalizeAnswer(ans, qType = '') {
  if (!ans) return ''

  let cleaned = ans
    .toString()
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\u3000]/g, '')
    .replace(/[，,、;；．.]/g, '')

  if (qType === 'multipleABC' || qType === 'multiple123') {
    cleaned = cleaned.split('').sort().join('')
  }
  return cleaned
}


async function finalizePractice() {
  const hasUnchecked = props.questions.some((q) => q.checked !== true);
  if (hasUnchecked) {
    alert('請先對完所有題目再離開喔 🙏');
    return false;
  }

  const wrongQuestionIDs = props.questions
    .filter((q) => q.checked && q.isCorrect === false)
    .map((q) => q.Question_ID);

  const practicedQuestionIDs = props.questions.map((q) => q.Question_ID);
  const wrongQuestionCount = wrongQuestionIDs.length;

  console.log('🛠️ 錯題應更新 errCount:', wrongQuestionIDs);
  console.log('📚 練習過的題目應更新 practiceCount:', practicedQuestionIDs);
  console.log('🚀 正在送出本次練習結果...');

  const questions = props.questions.map((q) => {
    return {
      Rquestion_Id: q.Question_ID,
      user_answer: q.userAnswer,
      is_correct: q.isCorrect === true,
    };
  });

  const practicePayload = {
    total_qCount: props.total,
    err_qCount: wrongQuestionCount,
    accuracy: props.accuracy,
    time_spent: parseInt(props.timeSpent),
    questions,
  };

  try {
    await submitPracticeResult(practicePayload);
    console.log('✅ 練習結果已成功送出');
    return true;
  } catch (err) {
    console.error('❌ 錯誤發生:', err);
    alert('❌ 送出練習結果時發生錯誤，請稍後再試');
    return false;
  }
}

async function goViewQuestion() {
  const proceed = await finalizePractice()
  if (!proceed) return
  emit('change-page', 'question', props.currentSubject)
}

async function restart() {
  const proceed = await finalizePractice()
  if (!proceed) return
  emit('rePractice')
}

async function goBack() {
  const proceed = await finalizePractice()
  if (!proceed) return
  emit('goBack')
}

</script>

<style scoped>
.practice-result-container {
  padding: 2rem;
  margin: 0 auto;
}

.stat-card {
  width: 130px;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.question-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.question-header:hover {
  background-color: #f7f9fb;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.question-detail {
  font-size: 0.95rem;
  color: #333;
}

.text-dark-s {
  color: #325d94;
  font-size: 15px;
}

.text-dark-dark-m {
  color: #325d94;
  font-size: 15px;
}

.text-m {
  color: #408ee7;
  font-size: 20px;
}

.text-lg {
  color: #408ee7;
  font-size: 28px;
}
</style>
