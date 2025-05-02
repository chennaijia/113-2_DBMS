<template>
    <div class="modal-dialog-centered-custom">
      <div class="modal fade show d-block bg-light bg-opacity-75" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content shadow rounded-4 border-0">
            <!-- Header -->
            <div class="modal-header bg-lightblue rounded-top-4">
              <h5 class="modal-title fw-bold">新的錯題本</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
  
            <div class="modal-body">
              <!-- 名稱 -->
              <div class="mb-3 d-flex align-items-center">
                <label class="me-3 fw-semibold" style="width: 50px;">名稱</label>
                <input
                  type="text"
                  v-model="title"
                  class="form-control rounded-pill shadow-sm"
                  placeholder="點擊以輸入名稱"
                />
              </div>
  
              <!-- Icon 選擇 -->
              <div class="mb-3 d-flex align-items-center">
                <label class="me-3 fw-semibold" style="width: 50px;">icon</label>
                <div class="d-flex align-items-center bg-white shadow rounded-4 px-3 py-2" style="width: 200px;">
                  <button class="btn btn-link text-dark" @click="prevIcon">
                    <Icon icon="mdi:chevron-left" width="24" height="24" />
                  </button>
                  <Icon :icon="icons[currentIcon]" width="32" height="32" style="color: #f4b258;" />
                  <button class="btn btn-link text-dark" @click="nextIcon">
                    <Icon icon="mdi:chevron-right" width="24" height="24" />
                  </button>
                </div>
              </div>
            </div>
  
            <!-- Footer -->
            <div class="modal-footer justify-content-center">
              <button class="btn btn-primary px-4 rounded-3" @click="confirm">確認</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Icon } from '@iconify/vue';
  
  export default {
    components: { Icon },
    data() {
      return {
        title: '',
        icons: [
          'mdi:book-open-page-variant',
          'mdi:book-education-outline',
          'mdi:notebook-outline',
          'mdi:book-multiple-outline'
        ],
        currentIcon: 0,
      };
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
      prevIcon() {
        this.currentIcon = (this.currentIcon - 1 + this.icons.length) % this.icons.length;
      },
      nextIcon() {
        this.currentIcon = (this.currentIcon + 1) % this.icons.length;
      },
      confirm() {
        this.$emit('confirm', {
          title: this.title || '未命名',
          icon: this.icons[this.currentIcon],
          mistakeCount: 0,
          date: new Date().toISOString().split('T')[0],
        });
      },
    },
  };
  </script>
  