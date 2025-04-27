<template>
  <div class="vw-100 vh-100 gap-10">
    <div>
      <div class="backbtn translate-middle">
        <button
          class="btn btn-outline-primary d-flex align-items-center px-3 py-2 rounded-pill mt-5 return-btn"
          @click="goBack"
        >
          <i class="bi bi-arrow-left"></i>
          <span class="ms-2">返回</span>
        </button>
      </div>
      <div class="title">{{ currentSubject }}-隨機出題</div>
    </div>

    <div class="img-position">
      <div class="d-flex flex-column gap-2 mt-20 mx-10">
        <img src="/images/1.jpg" class="img-fluid w-60 border-2 border-primary rounded p-3" />
        <img src="/images/1.jpg" class="img-fluid w-60" />
        <iframe
          :src="currentImage"
          class="w-60"
          style="height: 500px; border: none; border-radius: 8px"
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
  },
}
</script>

<style scoped>
.backbtn {
  position: absolute;
  top: 1rem;
  left: 10rem;
}

.title {
  position: absolute;
  top: 1.35rem;
  left: 14rem;
  color: #408ee7;
  font-weight: bold;
  font-size: 25px;
  cursor: pointer;
}
.img-position {
  position: absolute;
  top: 6rem;
  left: 7rem;
}
</style>
