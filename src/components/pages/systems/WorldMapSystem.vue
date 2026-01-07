<template>
  <div class="root">
    <canvas ref="cv" class="cv"></canvas>

    <!-- UI 层完全与游戏逻辑解耦，只负责展示数据 -->
    <div class="ui" v-if="debugInfo">
      <div><span v-t="'worldMap.position'"></span>: x={{ Math.round(debugInfo.x) }}, y={{ Math.round(debugInfo.y) }}</div>
      <div><span v-t="'worldMap.lastInput'"></span>: {{ debugInfo.lastInput || $t('common.unknown') }}</div>
      
      <!-- Enemy Alert Status -->
      <div v-if="debugInfo.chasingCount > 0" style="color: #ef4444; font-weight: bold;">
        ⚠️ {{ debugInfo.chasingCount }} Enemies Chasing!
      </div>
      
      <div v-t="'worldMap.moveControls'"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { GameEngine } from '@/game/GameEngine'
import { MainScene } from '@/game/scenes/MainScene'
import { useBattleStore } from '@/stores/battle'
import { useWorldStore } from '@/stores/world'
import { getMapData } from '@/data/maps'

const emit = defineEmits(['change-system'])
const battleStore = useBattleStore()
const worldStore = useWorldStore()

const cv = ref(null)

// 使用 shallowRef 保存非响应式的复杂对象
const engine = shallowRef(null)
const scene = shallowRef(null)

// 专门用于 UI 展示的响应式数据
const debugInfo = ref({ x: 0, y: 0, lastInput: '' })

let frameCount = 0
function syncUI() {
  // Throttle: Update UI only every 10 frames (~6 times per second)
  frameCount++
  if (frameCount % 10 !== 0) return

  if (!scene.value || !engine.value) return
  
  const player = scene.value.player
  
  // Count chasing enemies
  // Optimized: Use reduce instead of filter to avoid array allocation
  let chasingCount = 0
  if (scene.value.mapEnemies) {
      const enemies = scene.value.mapEnemies
      for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i]
          // Check aiState instead of direct property if needed, but assuming compatibility
          if (e.entity && e.entity.aiState && e.entity.aiState.state === 'chase') {
              chasingCount++
          }
      }
  }

  // Update Reactive State
  debugInfo.value = {
    x: player.pos.x,
    y: player.pos.y,
    lastInput: engine.value.input.lastInput,
    chasingCount
  }
}

onMounted(async () => {
  if (!cv.value) return
  
  // 1. 初始化引擎
  const gameEngine = new GameEngine(cv.value)
  engine.value = gameEngine

  // Handle Battle Result (Victory/Flee)
  if (battleStore.lastBattleResult) {
    const { result, enemyUuid } = battleStore.lastBattleResult
    worldStore.applyBattleResult(result, enemyUuid)
    battleStore.lastBattleResult = null
  }

  // 2. 初始化场景逻辑封装
  const initScene = async (mapId, entryId = 'default') => {
    // 销毁旧场景（如果有）
    // 目前 MainScene 没有 destroy 方法，GC 会自动回收，但如果有定时器需要清理
    
    // 如果是切换地图，需要先加载数据
    if (mapId !== worldStore.currentMapId) {
      worldStore.loadMap(mapId)
    }

    // 1. Load Map Data Async
    const mapData = await getMapData(mapId)
    if (!mapData) {
      console.error(`Map not found: ${mapId}`)
      return
    }

    const initialState = worldStore.currentMapState

    const mainScene = new MainScene(
      gameEngine, 
      // 战斗回调
      (enemyGroup, enemyUuid) => {
        console.log('Enter Battle!', enemyGroup)
        gameEngine.stop()
        battleStore.initBattle(enemyGroup, enemyUuid)
        emit('change-system', 'battle')
      },
      // 初始状态
      initialState,
      // 地图数据对象 (passing data instead of ID)
      mapData,
      // 入口ID
      entryId,
      // 切换地图回调
      async (targetMapId, targetEntryId) => {
        console.log(`Switching Map: ${targetMapId} @ ${targetEntryId}`)
        
        // 1. 保存当前状态
        worldStore.saveState(scene.value)
        
        // 2. 暂停一下（可选转场动画）
        
        // 3. 重新加载场景
        await initScene(targetMapId, targetEntryId)
      }
    )
    
    scene.value = mainScene
    
    // 加载资源
    await mainScene.load()
    
    // 更新循环绑定（闭包引用了新的 mainScene）
    gameEngine.onUpdate = (dt) => {
      if (scene.value === mainScene) { // 确保只更新当前场景
        mainScene.update(dt)
        syncUI()
      }
    }
    
    gameEngine.onDraw = (renderer) => {
      if (scene.value === mainScene) {
        mainScene.draw(renderer)
      }
    }
  }

  // 初始加载
  // 如果是从战斗返回，不需要指定 entryId (null)，使用保存的位置
  // 如果是首次进入，使用默认
  const startEntryId = worldStore.currentMapState ? null : 'default'
  await initScene(worldStore.currentMapId, startEntryId)

  // 5. 启动
  gameEngine.start()
})

onUnmounted(() => {
  if (scene.value) {
    worldStore.saveState(scene.value)
  }

  if (engine.value) {
    engine.value.destroy()
  }
})
</script>

<style scoped src="@styles/components/pages/systems/WorldMapSystem.css"></style>
