<template>
  <EditorPanel 
    :title="editorManager.getPanelTitle('entity-creator')" 
    :icon="editorManager.getPanelIcon('entity-creator')" 
    :is-enabled="editorManager.isPanelEnabled('entity-creator')"
  >
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
    <template #footer>
      <div class="creator-hint">
        <div class="hint-item">
          <span class="hint-icon">💡</span>
          <span class="hint-text">点击模板即可在场景中心创建实体</span>
        </div>
        <div class="hint-item">
          <span class="hint-icon">🎯</span>
          <span class="hint-text">创建后可在画布中拖动位置</span>
        </div>
      </div>
    </template>
  </EditorPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { entitySpawner, editorManager } from '@/game/editor'
import EditorPanel from '../components/EditorPanel.vue'

const categories = entitySpawner.categories
const activeCategory = entitySpawner.activeCategory
const filteredTemplates = entitySpawner.filteredTemplates

/**
 * 创建实体
 */
const createEntity = (template: any) => {
  try {
    entitySpawner.createEntity(template)
  } catch (error: any) {
    alert(`创建实体失败: ${error.message}`)
  }
}
</script>

<style scoped src="@styles/editor/EntityCreator.css"></style>
