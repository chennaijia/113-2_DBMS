<template>
  <h1>{{ currentSubject }} 的錯題瀏覽</h1>
</template>

<script>
export default {
  name: 'ViewBooks',
  components: {},
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
}
</script>

<style scoped></style>
