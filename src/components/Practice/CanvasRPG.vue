<template>
  <canvas ref="canvasRef" class="rpg-canvas" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  answerResult: Boolean, // true: correct, false: wrong, null: unanswered
  questionIndex: Number,
})

const canvasRef = ref(null)
let ctx, canvas
let heroX = 100
let heroY = 220
let bgX = 0
let frame = 0
let bugAppeared = false
let actionState = 'walk' // 'walk' | 'attack' | 'hit' | 'bypass'

// 載入圖片素材
const heroImg = new Image()
heroImg.src = '/sprites/hero_walk.png'

const bugIdleImg = new Image()
bugIdleImg.src = '/sprites/bug_idle.png'

const bugAttackImg = new Image()
bugAttackImg.src = '/sprites/bug_attack.png' // 若有提供可改

const bgImg = new Image()
bgImg.src = '/sprites/bg_loop.png'

// 畫布初始化與主 loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 背景移動
  bgX -= 2
  if (bgX <= -canvas.width) bgX = 0
  ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height)
  ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height)

  // bug 出現時機
  if (!bugAppeared && frame > 60) {
    bugAppeared = true
  }

  // bug 畫面
  if (bugAppeared) {
    const bugX = heroX + 180
    const bugY = heroY + 8
    const bugImg = actionState === 'hit' ? bugAttackImg : bugIdleImg
    ctx.drawImage(bugImg, bugX, bugY, 48, 48)
  }

  // 精靈動畫切換（假設每格 32x32，共兩格）
  const spriteIndex = Math.floor(frame / 10) % 2
  const sx = spriteIndex * 32
  ctx.drawImage(heroImg, sx, 0, 32, 32, heroX, heroY, 48, 48)

  // 狀態更新
  if (bugAppeared && props.answerResult !== null) {
    if (props.answerResult && actionState !== 'attack') {
      actionState = 'attack'
      setTimeout(() => {
        bugAppeared = false
        actionState = 'walk'
      }, 1000)
    } else if (!props.answerResult && actionState !== 'hit') {
      actionState = 'hit'
      setTimeout(() => {
        actionState = 'bypass'
      }, 800)
      setTimeout(() => {
        bugAppeared = false
        actionState = 'walk'
      }, 1600)
    }
  }

  frame++
  requestAnimationFrame(draw)
}

onMounted(() => {
  canvas = canvasRef.value
  canvas.width = 800
  canvas.height = 300
  ctx = canvas.getContext('2d')

  Promise.all([
    new Promise((res) => (heroImg.onload = res)),
    new Promise((res) => (bugIdleImg.onload = res)),
    new Promise((res) => (bugAttackImg.onload = res)),
    new Promise((res) => (bgImg.onload = res)),
  ]).then(() => {
    draw()
  })
})

// 當切換題目時重設動畫狀態
watch(
  () => props.questionIndex,
  () => {
    heroX = 100
    bgX = 0
    frame = 0
    bugAppeared = false
    actionState = 'walk'
  }
)
</script>

<style scoped>
.rpg-canvas {
  width: 100%;
  height: 300px;
  background-color: black;
  display: block;
  margin-bottom: 1rem;
  border-radius: 10px;
}
</style>
