<template>
  <div class="menu-overlay">
    <div class="menu-container">
        
        <!-- 左侧：导航与队伍状态 -->
        <div class="left-panel">
            
            <!-- 金币/时间 -->
            <div class="info-box">
                <div class="info-row border-bottom">
                    <span class="info-label" v-t="'listMenu.gold'"></span>
                    <span class="info-value gold-text">54,300 G</span>
                </div>
                <div class="info-row">
                    <span class="info-label" v-t="'listMenu.time'"></span>
                    <span class="info-value">12:45:03</span>
                </div>
            </div>

            <!-- 主导航菜单 -->
            <div class="nav-menu">
                <div 
                  v-for="item in menuItems"
                  :key="item.id"
                  class="nav-item"
                  :class="{ active: currentPanel === item.id }"
                  @click="currentPanel = item.id"
                >
                    <span v-t="item.labelKey"></span>
                    <span v-if="currentPanel === item.id" class="arrow">▶</span>
                </div>
            </div>

        </div>

        <!-- 右侧：动态内容区域 -->
        <div class="right-panel">
          <component :is="activeComponent" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import InventoryPanel from '@/components/panels/InventoryPanel.vue';
import CharacterPanel from '@/components/panels/CharacterPanel.vue';
import EquipmentPanel from '@/components/panels/EquipmentPanel.vue';
import SkillsPanel from '@/components/panels/SkillsPanel.vue';
import ThankPanel from '@/components/panels/ThankPanel.vue';
import SystemPanel from '@/components/panels/SystemPanel.vue';
import SaveLoadPanel from '@/components/panels/SaveLoadPanel.vue';

const menuItems = [
  { id: 'items', labelKey: 'panels.inventory', component: InventoryPanel },
  { id: 'equip', labelKey: 'panels.equipment', component: EquipmentPanel },
  { id: 'skills', labelKey: 'panels.skills', component: SkillsPanel },
  { id: 'status', labelKey: 'panels.status', component: CharacterPanel },
  { id: 'thank', labelKey: 'panels.thank', component: ThankPanel },
  { id: 'data', labelKey: 'panels.data', component: SaveLoadPanel },
  { id: 'system', labelKey: 'menu.settings', component: SystemPanel },
];

const currentPanel = ref('items');

const activeComponent = computed(() => {
  const item = menuItems.find(i => i.id === currentPanel.value);
  return item ? item.component : null;
});
</script>

<style scoped>
/* Menu Overlay */
.menu-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  pointer-events: auto;
}

.menu-container {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 1.5rem;
}

/* Left Panel */
.left-panel {
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-box, .nav-menu {
  background-color: rgba(15, 23, 42, 0.9); /* slate-900/90 */
  border: 2px solid #475569; /* slate-600 */
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.info-box {
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.border-bottom {
  border-bottom: 1px solid var(--slate-700);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-label {
  color: var(--slate-400);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.info-value {
  font-family: monospace;
}

.gold-text {
  color: var(--yellow-400);
  font-size: 1.25rem;
}

/* Nav Menu */
.nav-menu {
  flex: 1;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 1rem 1.5rem;
  color: var(--slate-400);
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s;
  font-size: 1.125rem;
}

.nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: linear-gradient(to right, var(--blue-900), transparent);
  border-left-color: var(--blue-400);
  color: var(--blue-100);
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  color: var(--blue-400);
}

/* Right Panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

