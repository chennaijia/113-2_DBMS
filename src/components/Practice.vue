<template>
  <div class="h-100 w-100 gap-10 d-flex flex-column transition-page ms-5">
    <div class="d-flex justify-content-between mt-4">
      <div class="d-flex flex-row gap-3">
        <button
          class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill return-btn"
          @click="goBack"
        >
          <i class="bi bi-caret-left"></i>
          <span class="ms-2">返回</span>
        </button>
        <div class="text" style="font-weight: bold">{{ currentSubject }}-錯題練習</div>
      </div>
      <div class="d-flex flex-rol gap-3">
        <div class="text">20/20</div>
        <div class="text"><i class="bi bi-clock"></i> {{ timer }}</div>
      </div>
    </div>

    <div class="gap-5">
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          style="width: 25%"
          aria-valuenow="25"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <div
        class="d-flex justify-content-center flex-column gap-2"
        style="width: 70vw; max-width: 1200px"
      >
        <img
          :src="currentImage"
          class="w-100 py-3"
          style="border: 1px solid #ccc; border-radius: 8px"
        />
        <Answer :questionType="'選擇題'" />
        <div class="container text-center">
          <div class="row justify-content-evenly btn-group" role="group">
            <button
              type="button"
              class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill mt-5 return-btn"
              @click="checkAnswer"
            >
              <i class="bi bi-check"></i>
              <span class="ms-2">對答案</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill mt-5 return-btn"
              @click="nextQuestion"
            >
              <i class="bi bi-caret-right"></i>
              <span class="ms-2">下一題</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Answer from './Practice/Answer.vue'

const props = defineProps({
  currentSubject: {
    type: String,
    required: true,
  },
})

const currentQuestionSrc = ref('/images/img.html')
const timer = ref('00:00')
const elapsedSeconds = ref(0)
const timerInterval = ref(null)

const questionFrame = ref(null)
const answerFrame = ref(null)

const images = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg']
const currentImage = ref(images[1])

function startStopwatch() {
  timerInterval.value = setInterval(() => {
    elapsedSeconds.value++
    const minutes = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
    const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
    timer.value = `${minutes}:${seconds}`
  }, 1000)
}

function goBack() {
  const btn = document.querySelector('.return-btn')
  if (btn) {
    btn.classList.add('clicked')
    setTimeout(() => {
      emit('change-page', 'book', props.currentSubject)
    }, 300)
  }
}

function checkAnswer() {
  alert('是否確認要對答案？確認後無法再更改答案')
}

const emit = defineEmits(['change-page'])

onMounted(() => {
  startStopwatch()
})

onBeforeUnmount(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.return-btn.clicked {
  transform: scale(0.5);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.fade-img {
  transition: opacity 0.5s ease;
}

.transition-page.fade-out {
  transform: scale(0.95);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.backbtn {
  position: absolute;
  top: 1rem;
  left: 10rem;
}

.text {
  color: #408ee7;
  font-size: 25px;
  cursor: pointer;
}
</style>
