<template>
  <div class="root">
    <canvas ref="cv" class="cv"></canvas>

    <!-- UI 层完全与游戏逻辑解耦，只负责展示数据 -->
    <div class="ui" v-if="debugInfo">
      <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
      <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>
      <div v-t="'worldMap.moveControls'"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { GameEngine } from '@/game/GameEngine'
import { MainScene } from '@/game/scenes/MainScene'

const cv = ref(null)

// 使用 shallowRef 保存非响应式的复杂对象
const engine = shallowRef(null)
const scene = shallowRef(null)

// 专门用于 UI 展示的响应式数据
const debugInfo = ref({ x: 0, y: 0, lastInput: '' })

function syncUI() {
  if (!scene.value || !engine.value) return
  
  const player = scene.value.player
  
  // 每帧同步一次数据到 UI (Vue 的响应式系统足够快，处理单纯的文本更新没问题)
  debugInfo.value = {
    x: player.pos.x,
    y: player.pos.y,
    lastInput: engine.value.input.lastInput
  }
}

onMounted(async () => {
  if (!cv.value) return
  
  // 1. 初始化引擎
  const gameEngine = new GameEngine(cv.value)
  engine.value = gameEngine

  // 2. 初始化场景
  const mainScene = new MainScene(gameEngine)
  scene.value = mainScene
  
  // 3. 加载资源
  await mainScene.load()

  // 4. 绑定循环
  gameEngine.onUpdate = (dt) => {
    mainScene.update(dt)
    syncUI() // 同步数据给 Vue
  }
  
  gameEngine.onDraw = (renderer) => {
    mainScene.draw(renderer)
  }

  // 5. 启动
  gameEngine.start()
})

onUnmounted(() => {
  if (engine.value) {
    engine.value.destroy()
  }
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
  color: #000;
  pointer-events: none;
}
</style>
