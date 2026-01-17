<template>
  <div class="entity-properties">
    <template v-if="localEntityState">
      <div class="inspector-body">
        <!-- 基础属性 -->
        <section class="prop-section">
          <h4>基础属性</h4>
          <div class="prop-group">
            <label>名称</label>
            <input v-model="localEntityState.name" type="text" />
          </div>
          <div class="prop-group inline">
            <div class="field">
              <label>X</label>
              <input v-model.number="localEntityState.position.x" type="number" />
            </div>
            <div class="field">
              <label>Y</label>
              <input v-model.number="localEntityState.position.y" type="number" />
            </div>
          </div>
        </section>

        <!-- NPC 配置 -->
        <section v-if="localEntityState.npc" class="prop-section">
          <h4>NPC配置</h4>
          <div class="prop-group">
            <label>对话 ID</label>
            <input v-model="localEntityState.actionDialogue.dialogueId" type="text" @change="syncLegacyInteraction" />
          </div>
          <div class="prop-group">
            <label>对话范围</label>
            <input v-model.number="localEntityState.detectArea.radius" type="number" @change="syncLegacyInteraction" />
          </div>
        </section>

        <!-- 传送门配置 -->
        <section v-if="localEntityState.type === 'portal'" class="prop-section">
          <h4>传送门配置</h4>
          <div class="prop-group">
            <label>目标地图</label>
            <input v-model="localEntityState.actionTeleport.mapId" type="text" />
          </div>
          <div class="prop-group">
            <label>目标入口</label>
            <input v-model="localEntityState.actionTeleport.entryId" type="text" />
          </div>
          <div class="prop-group inline">
            <div class="field">
              <label>宽度</label>
              <input v-model.number="localEntityState.detectArea.size.w" type="number" />
            </div>
            <div class="field">
              <label>高度</label>
              <input v-model.number="localEntityState.detectArea.size.h" type="number" />
            </div>
          </div>
        </section>

        <!-- 视觉/缩放 -->
        <section v-if="localEntityState.visual" class="prop-section">
          <h4>视觉</h4>
          <div class="prop-group">
            <label>资源 ID</label>
            <input v-model="localEntityState.visual.id" type="text" />
          </div>
          <div class="prop-group">
            <label>缩放</label>
            <input v-model.number="localEntityState.visual.scale" type="number" step="0.1" />
          </div>
        </section>
      </div>
    </template>
    <div v-else class="empty-state">
      <p>请选择一个实体进行编辑</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gameManager } from '@/game/GameManager'

// 属性编辑同步
const localEntityState = ref(null)

// 刷新频率控制
let rafId = 0
const syncEntityData = () => {
  const currentSelected = gameManager.editor.selectedEntity
  if (currentSelected) {
    localEntityState.value = currentSelected
  } else {
    localEntityState.value = null
  }
  rafId = requestAnimationFrame(syncEntityData)
}

onMounted(() => {
  syncEntityData()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})

// 同步旧系统的辅助函数
const syncLegacyInteraction = () => {
  if (localEntityState.value && localEntityState.value.interaction) {
    if (localEntityState.value.actionDialogue) {
      localEntityState.value.interaction.id = localEntityState.value.actionDialogue.dialogueId
    }
    if (localEntityState.value.detectArea && localEntityState.value.detectArea.radius) {
      localEntityState.value.interaction.range = localEntityState.value.detectArea.radius
    }
  }
}
</script>

<style scoped>
.entity-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inspector-body {
  padding: 16px;
  overflow-y: auto;
}

.prop-section {
  margin-bottom: 20px;
}

.prop-section h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.05em;
}

.prop-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prop-group.inline {
  flex-direction: row;
  gap: 12px;
}

.prop-group.inline .field {
  flex: 1;
}

label {
  font-size: 11px;
  color: #64748b;
}

input {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 6px 8px;
  color: #f1f5f9;
  font-size: 13px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}
</style>
