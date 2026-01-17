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
import FormationPanel from '@/components/panels/FormationPanel.vue';

const menuItems = [
  { id: 'items', labelKey: 'panels.inventory', component: InventoryPanel },
  { id: 'equip', labelKey: 'panels.equipment', component: EquipmentPanel },
  { id: 'skills', labelKey: 'panels.skills', component: SkillsPanel },
  { id: 'status', labelKey: 'panels.status', component: CharacterPanel },
  { id: 'formation', labelKey: 'panels.formation', component: FormationPanel },
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

<style scoped src="@styles/components/pages/systems/ListMenuSystem.css"></style>

