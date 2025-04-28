<template>
  <div class="vw-100 vh-100 gap-10 d-flex flex-column align-items-center transition-page">
    <div>
      <div class="backbtn translate-middle">
        <button
          class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill mt-5 return-btn"
          @click="goBack"
        >
          <i class="bi bi-caret-left"></i>
          <span class="ms-2">返回</span>
        </button>
      </div>
      <div class="text" style="position: absolute; top: 1.35rem; left: 14rem; font-weight: bold">
        {{ currentSubject }}-隨機出題
      </div>
      <div class="text" style="position: absolute; top: 1.35rem; right: 17rem">20/20</div>

      <div class="text" style="position: absolute; top: 1.35rem; right: 7rem">
        <i class="bi bi-clock"></i> {{ timer }}
      </div>
    </div>

    <div class="img-position">
      <div class="d-flex flex-column gap-2">
        <iframe
          ref="questionFrame"
          src="/images/img.html"
          class="w-100 py-3 fade-img"
          style="max-width: 1200px; border: 1px solid #ccc; border-radius: 8px"
          @load="adjustIframeHeight"
        ></iframe>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

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

function startStopwatch() {
  timerInterval.value = setInterval(() => {
    elapsedSeconds.value++
    const minutes = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
    const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')
    timer.value = `${minutes}:${seconds}`
  }, 1000)
}

function adjustIframeHeight() {
  const iframe = questionFrame.value
  if (iframe && iframe.contentWindow && iframe.contentDocument) {
    const img = iframe.contentDocument.querySelector('img')
    if (img) {
      if (img.complete) {
        iframe.style.height = img.clientHeight + 'px'
      } else {
        img.onload = () => {
          iframe.style.height = img.clientHeight + 'px'
        }
      }
    }
  }
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
.img-position {
  position: absolute;
  top: 6rem;
  left: 7rem;
}
</style>
