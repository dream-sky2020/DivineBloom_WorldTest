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

    <!-- NEW Dialogue Overlay (Connected to DialogueStore) -->
    <transition name="fade">
      <div v-if="dialogueStore.isActive" class="dialogue-overlay" @click="handleOverlayClick">
        <div class="dialogue-box" @click.stop>
          
          <!-- Speaker Name -->
          <div class="dialogue-header">
            <span class="speaker-name">{{ $t(`roles.${dialogueStore.speaker}`) || dialogueStore.speaker }}</span>
          </div>
          
          <!-- Text Content -->
          <div class="dialogue-content">
            {{ $t(dialogueStore.currentText) }}
          </div>

          <!-- Choices Area -->
          <div v-if="dialogueStore.currentOptions.length > 0" class="choices-container">
            <button 
              v-for="(opt, idx) in dialogueStore.currentOptions" 
              :key="idx"
              class="choice-btn"
              @click="dialogueStore.selectOption(opt.value)"
            >
              {{ $t(opt.label) }}
            </button>
          </div>

          <!-- Continue Hint (Only if no choices) -->
          <div v-else class="dialogue-hint" @click="dialogueStore.advance">
            Click to continue... ▼
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { GameEngine } from '@/game/GameEngine'
import { MainScene } from '@/game/scenes/MainScene'
import { useBattleStore } from '@/stores/battle'
import { useWorldStore } from '@/stores/world'
import { useDialogueStore } from '@/stores/dialogue'
import { getMapData } from '@/data/maps'
import { dialoguesDb } from '@/data/dialogues'

const emit = defineEmits(['change-system'])
const battleStore = useBattleStore()
const worldStore = useWorldStore()
const dialogueStore = useDialogueStore()

const cv = ref(null)

// 使用 shallowRef 保存非响应式的复杂对象
const engine = shallowRef(null)
const scene = shallowRef(null)

// 专门用于 UI 展示的响应式数据
const debugInfo = ref({ x: 0, y: 0, lastInput: '' })

// 切换锁：防止在异步加载期间重复触发切换，导致状态保存错乱
const isSwitchingMap = ref(false)

// 监听对话结束，恢复游戏
watch(() => dialogueStore.isActive, (active) => {
  if (!active && engine.value) {
    // 对话结束，恢复游戏循环
    engine.value.start()
  }
})

const handleOverlayClick = () => {
  dialogueStore.advance()
}

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
        // 如果正在切换中，忽略重复触发
        if (isSwitchingMap.value) return
        isSwitchingMap.value = true

        console.log(`Switching Map: ${targetMapId} @ ${targetEntryId}`)
        
        try {
          // 1. 保存当前状态
          worldStore.saveState(scene.value)
          
          // 2. 暂停一下（可选转场动画）
          
          // 3. 重新加载场景
          await initScene(targetMapId, targetEntryId)
        } finally {
          isSwitchingMap.value = false
        }
      },
      // NPC 交互回调
      (interaction) => {
        if (dialogueStore.isActive) return
        console.log('Interacted with NPC:', interaction)
        
        let scriptId = interaction.id // e.g. 'elder_greeting' or just 'elder'
        
        // 尝试在 DB 中查找脚本
        let scriptFn = dialoguesDb[scriptId]
        
        // 如果找不到，尝试查找常用的 id 映射
        if (!scriptFn) {
            // 尝试查找以 _test 结尾的 ID 对应的正式脚本，或者反之
            // 例如: elder_test -> elderDialogue
            // 这里可以做一个简单的映射或者约定
            // 目前我们的 elder.js 导出的是 elderDialogue，所以 id 应该是 elderDialogue
            // 但是 village.js 里面配置的是 elder_test
            
            // 简单容错：如果 ID 是 elder_test，尝试找 elderDialogue
            if (scriptId === 'elder_test' && dialoguesDb['elderDialogue']) {
                scriptFn = dialoguesDb['elderDialogue'];
                console.log(`Redirected dialogue ID '${scriptId}' to 'elderDialogue'`);
            }
        }
        
        if (!scriptFn) {
           console.warn(`No dialogue script found for ID: ${scriptId}`)
           // 可以在这里显示一个默认的提示文本，而不是直接报错
           dialogueStore.startDialogue(function*() {
               yield { type: 'SAY', speaker: 'System', textKey: `Debug: Dialogue ID '${scriptId}' not found.` };
           });
           return
        }

        // Pause Game
        gameEngine.stop()
        
        // Start Dialogue
        dialogueStore.startDialogue(scriptFn)
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

<style scoped>
/* Reuse the dialogue styles we designed */
.dialogue-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 60px;
  z-index: 100;
  /* background: rgba(0,0,0,0.2);  Maybe simpler in game? */
}

.dialogue-box {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #94a3b8;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  pointer-events: auto; /* Ensure clicks work */
}

.dialogue-header {
  margin-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
  align-self: flex-start;
}

.speaker-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 4px;
}

.dialogue-content {
  font-size: 1.25rem;
  color: #334155;
  line-height: 1.6;
  min-height: 3rem;
  margin-bottom: 20px;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

.choice-btn {
  padding: 12px 20px;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.choice-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
  transform: translateX(5px);
}

.dialogue-hint {
  align-self: flex-end;
  font-size: 0.9rem;
  color: #94a3b8;
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
