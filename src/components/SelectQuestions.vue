<template>
  <div class="container-fluid vh-100 d-flex flex-column align-items-center">
    <!-- 下拉選單區塊 -->
    <div
      :class="[
        'dropdown',
        'w-100',
        isSelected
          ? 'fixed-top bg-white shadow-sm p-3'
          : 'd-flex justify-content-center align-items-center flex-grow-1',
      ]"
    >
      <a
        class="btn btn-outline-primary dropdown-toggle"
        href="#"
        role="button"
        id="dropdownMenuLink"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {{ selectedText }}
      </a>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
        <li v-if="!selected">
          <span class="dropdown-item disabled text-muted">請選擇一個模式</span>
          <hr class="dropdown-divider" />
        </li>
        <li v-for="opt in options" :key="opt.value">
          <a href="#" class="dropdown-item" @click.prevent="select(opt)">
            {{ opt.text }}
          </a>
        </li>
      </ul>
    </div>

    <div v-if="selected" class="mt-5 p-4 w-100 text-center">
      <div v-if="selected === 'custom'">
        <h4>這裡是「自己選取錯題」的內容</h4>
      </div>
      <div v-else-if="selected === 'random20'">
        <h4>這裡是「隨機二十題」的內容</h4>
      </div>
      <div v-else-if="selected === 'frequentWrong'">
        <h4>這裡是「錯誤次數較多」的內容</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const selected = ref(null)

const options = [
  { value: 'custom', text: '自己選取錯題' },
  { value: 'random20', text: '隨機二十題' },
  { value: 'frequentWrong', text: '錯誤次數較多' },
]

const selectedText = computed(() => {
  const selectedOption = options.find((opt) => opt.value === selected.value)
  return selectedOption ? selectedOption.text : '請選擇錯題顯示方式'
})

const isSelected = computed(() => selected.value !== null)

function select(option) {
  selected.value = option.value
}
</script>

<style scoped>
.fixed-top {
  z-index: 1050;
}
</style>
