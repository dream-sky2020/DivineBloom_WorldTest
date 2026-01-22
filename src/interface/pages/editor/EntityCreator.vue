<template>
  <div class="entity-creator">
    <!-- 分类筛选 -->
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.id"
        :class="['category-tab', { active: activeCategory === cat.id }]"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- 实体模板列表 -->
    <div class="templates-container">
      <div class="templates-grid">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          @click="createEntity(template)"
          :title="template.description"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <p>该分类暂无可用模板</p>
      </div>
    </div>

    <!-- 创建提示 -->
    <div class="creator-hint">
      <div class="hint-item">
        <span class="hint-icon">💡</span>
        <span class="hint-text">点击模板即可在场景中心创建实体</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">🎯</span>
        <span class="hint-text">实体创建后可在画布中拖动调整位置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { entityTemplateRegistry } from '@/game/ecs/entities/internal/EntityTemplateRegistry'
import { world } from '@/game/ecs/world'
import { gameManager } from '@/game/ecs/GameManager'
import { createLogger } from '@/utils/logger'

const logger = createLogger('EntityCreator')

// 分类定义
const categories = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'gameplay', name: '游戏玩法', icon: '🎮' },
  { id: 'environment', name: '环境装饰', icon: '🌲' }
]

const activeCategory = ref('all')

// 获取所有模板
const allTemplates = computed(() => entityTemplateRegistry.getAll())

// 根据分类过滤模板
const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') {
    return allTemplates.value
  }
  return allTemplates.value.filter(t => t.category === activeCategory.value)
})

/**
 * 创建实体
 */
const createEntity = (template) => {
  try {
    // 获取场景中心位置作为默认生成位置
    const camera = world.with('camera').first?.camera
    const centerX = camera?.x || 960
    const centerY = camera?.y || 540

    // 通过命令系统创建实体
    const globalEntity = world.with('commands').first
    if (globalEntity) {
      globalEntity.commands.queue.push({
        type: 'CREATE_ENTITY',
        payload: {
          templateId: template.id,
          position: { x: centerX, y: centerY }
        }
      })
      logger.info(`Entity creation requested: ${template.name}`)
    } else {
      // 降级方案：直接创建
      const entity = entityTemplateRegistry.createEntity(template.id, null, { x: centerX, y: centerY })
      if (entity) {
        logger.info(`Entity created directly: ${template.name}`, entity)
        // 自动选中新创建的实体
        gameManager.editor.selectedEntity = entity
      }
    }
  } catch (error) {
    logger.error('Failed to create entity:', error)
    alert(`创建实体失败: ${error.message}`)
  }
}
</script>

<style scoped src="@styles/editor/EntityCreator.css"></style>
