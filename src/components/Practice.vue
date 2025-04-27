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

<script>
export default {
  name: 'Practice',
  props: {
    currentSubject: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentQuestionSrc: '/images/img.html',
      timer: '10:00',
    }
  },
  computed: {
    displaySubject() {
      return this.currentSubject || '未選擇科目'
    },
  },
  methods: {
    goBack() {
      const btn = document.querySelector('.return-btn')
      if (btn) {
        btn.classList.add('clicked')
        setTimeout(() => {
          this.$emit('change-page', 'book', this.currentSubject)
        }, 300)
      }
    },
    adjustIframeHeight() {
      const iframe = this.$refs.questionFrame
      if (iframe && iframe.contentWindow && iframe.contentDocument) {
        const img = iframe.contentDocument.querySelector('img')
        if (img) {
          iframe.style.height = img.clientHeight + 'px'
        }
      }
    },
  },
}
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
