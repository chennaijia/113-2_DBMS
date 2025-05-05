<template>
  <div class="container d-flex flex-column align-items-center mt-5">
    <!-- 下拉選單 -->
    <div class="dropdown-container text-center">
      <label for="dropdown" class="form-label fw-bold">選擇練習方式：</label>
      <select
        id="dropdown"
        class="form-select custom-dropdown"
        v-model="selectedOption"
        @change="handleSelection"
      >
        <option value="">選擇模式</option>
        <option value="option1">自選題目</option>
        <option value="option2">隨機二十題</option>
        <option value="option3">錯最多的二十題</option>
      </select>
    </div>

    <!-- 目前選擇的模式 -->
    <div v-if="selectedOption" class="content-box border p-4 shadow mt-4">
      <h3 class="text-primary">目前選擇的模式：</h3>
      <p>{{ content[selectedOption] }}</p>
      <button class="btn btn-primary mt-3" @click="handleAction">開始練習</button>
    </div>

    <!-- 題目列表 -->
    <Questions :selectedOption="selectedOption" class="mt-4" />
  </div>
</template>

<script>
import Questions from './Practice/Questions.vue'

export default {
  components: {
    Questions,
  },
  data() {
    return {
      selectedOption: '',
      content: {
        option1: '您可以手動選擇要練習的題目。',
        option2: '系統將隨機選擇二十題供您練習。',
        option3: '系統將根據您的錯誤記錄挑選最需要加強的二十題。',
      },
    }
  },
  methods: {
    handleSelection() {
      console.log('使用者選擇了:', this.selectedOption)
    },
    handleAction() {
      alert(`已選擇「${this.content[this.selectedOption]}」，開始練習！`)
    },
  },
}
</script>

<style scoped>
.dropdown-container {
  width: 300px;
}
.custom-dropdown {
  border: 2px solid #007bff;
  border-radius: 10px;
  padding: 10px;
  font-size: 16px;
  transition: all 0.3s ease-in-out;
}
.custom-dropdown:hover {
  background-color: #f1f8ff;
}
.content-box {
  max-width: 400px;
  background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
}
</style>
