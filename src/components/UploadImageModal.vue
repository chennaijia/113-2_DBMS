<template>
	<!-- 輸入檔案的地方 -->
	<input
		ref="uploadFile"
		id="uploadFile"
		type="file"
		name="imgUpload"
		@change="changeFile($event)"
	/>

	<!-- 預覽圖片的地方，因為可能會有多檔上傳，因此用 v-for 來讓多張圖片可以一張一張渲染 -->
	<div v-for='file of previews'>
			<img
			:src="file.url"
			:alt="file.name"
			v-if="uploadFile !== null"
		/>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const previews = ref([])
const emit = defineEmits(['file-change'])

function changeFile(e) {
  const uploadFiles = e.target.files
  Array.from(uploadFiles).forEach((file) => {
    const item = {
      name: file.name,
      url: URL.createObjectURL(file)
    }
    previews.value.push(item)
    emit('file-change', item.url)  // 通知父元件
  })
}
</script>
