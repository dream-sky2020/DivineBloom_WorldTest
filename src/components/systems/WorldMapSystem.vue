<template>
  <div class="root">
    <canvas ref="cv" class="cv"></canvas>

    <div class="ui">
      <div>Position: x={{ Math.round(player.x) }}, y={{ Math.round(player.y) }}</div>
      <div>Last Input: {{ lastInput || 'None' }}</div>
      <div>Move: WASD / Arrow Keys (Shift = faster)</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const cv = ref(null)
const lastInput = ref('')

const player = reactive({ x: 200, y: 160, r: 12 })

let ctx = null
let raf = 0
let lastT = 0
let w = 0, h = 0
const keys = new Set()

function resize() {
  const canvas = cv.value
  if (!canvas) return
  const dpr = Math.max(1, window.devicePixelRatio || 1)

  w = canvas.clientWidth
  h = canvas.clientHeight

  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function onKeyDown(e) {
  keys.add(e.code)
  lastInput.value = e.code
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
    e.preventDefault()
  }
}
function onKeyUp(e) {
  keys.delete(e.code)
}

function update(dt) {
  const fast = keys.has('ShiftLeft') || keys.has('ShiftRight')
  const speed = (fast ? 320 : 200) // px/s

  let dx = 0, dy = 0
  if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1
  if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2)
    dx *= inv
    dy *= inv
  }

  player.x += dx * speed * dt
  player.y += dy * speed * dt

  // clamp inside canvas
  player.x = Math.max(player.r, Math.min(w - player.r, player.x))
  player.y = Math.max(player.r, Math.min(h - player.r, player.y))
}

function drawScene() {
  // background
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#dbeafe' // sky-ish
  ctx.fillRect(0, 0, w, h)

  // ground band
  ctx.fillStyle = '#bbf7d0'
  ctx.fillRect(0, h * 0.35, w, h * 0.65)

  // a few simple obstacles (visual only)
  ctx.fillStyle = 'rgba(0,0,0,0.10)'
  ctx.fillRect(80, h * 0.55, 140, 18)
  ctx.fillRect(260, h * 0.70, 200, 18)

  // player shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(player.x, player.y + player.r * 0.7, player.r * 1.0, player.r * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()

  // player body
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2)
  ctx.fill()

  // player outline
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.stroke()
}

function loop(t) {
  const now = t * 0.001
  const dt = Math.min(0.05, now - (lastT || now))
  lastT = now

  update(dt)
  drawScene()
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  const canvas = cv.value
  ctx = canvas.getContext('2d', { alpha: false })

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  window.addEventListener('keydown', onKeyDown, { passive: false })
  window.addEventListener('keyup', onKeyUp)

  raf = requestAnimationFrame(loop)

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    ro.disconnect()
  })
})
</script>

<style scoped>
.root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cv {
  width: 100%;
  height: 100%;
  display: block;
  background: #dbeafe;
}

.ui {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.90);
  border: 1px solid rgba(0,0,0,0.10);
  border-radius: 8px;
  font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: #000; /* required: black text */
  pointer-events: none;
}
</style>
