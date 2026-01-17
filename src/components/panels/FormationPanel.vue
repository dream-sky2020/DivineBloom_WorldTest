<template>
  <div class="formation-panel" @click.self="clearSelection">
    <div class="formation-header">
        <p class="formation-instruction" v-t="'formation.instruction'"></p>
    </div>

    <div class="formation-grid-container">
        
        <div class="formation-row front-row">
            <FormationPartySlot 
                v-for="i in 4" 
                :key="'front-' + (i-1)"
                :index="i-1"
                :character="slots[i-1]"
                :isSelected="selectedIndex === (i-1)"
                :isTarget="targetIndex === (i-1)"
                @select="onSlotSelect"
                @drop="onSlotDrop"
                @hover-enter="onSlotHoverEnter"
                @hover-leave="onSlotHoverLeave"
            />
        </div>

        <div class="formation-row back-row">
             <FormationPartySlot 
                v-for="i in 4" 
                :key="'back-' + (i-1+4)"
                :index="i-1+4"
                :character="slots[i-1+4]"
                :isSelected="selectedIndex === (i-1+4)"
                :isTarget="targetIndex === (i-1+4)"
                @select="onSlotSelect"
                @drop="onSlotDrop"
                @hover-enter="onSlotHoverEnter"
                @hover-leave="onSlotHoverLeave"
            />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FormationPartySlot from '@/components/ui/FormationPartySlot.vue';
import { usePartyStore } from '@/stores/party';

const partyStore = usePartyStore();

// 内部使用的扁平槽位 (0-3 前排, 4-7 后排)
const slots = ref(new Array(8).fill(null));
const selectedIndex = ref(-1);
const targetIndex = ref(-1);

// 将 Store 中的 formation 映射到本地扁平 slots
const syncFromStore = () => {
    partyStore.initParty();
    const newSlots = new Array(8).fill(null);
    
    partyStore.formation.forEach((pos, i) => {
        if (pos.front) {
            newSlots[i] = partyStore.getCharacterState(pos.front);
        }
        if (pos.back) {
            newSlots[i + 4] = partyStore.getCharacterState(pos.back);
        }
    });
    slots.value = newSlots;
};

// 将本地扁平 slots 同步回 Store
const syncToStore = () => {
    const newFormation = [];
    for (let i = 0; i < 4; i++) {
        newFormation.push({
            front: slots.value[i] ? slots.value[i].id : null,
            back: slots.value[i + 4] ? slots.value[i + 4].id : null
        });
    }
    partyStore.formation = newFormation;
};

onMounted(() => {
    syncFromStore();
});

// 监听 Store 变化（例如战斗中切换了前后排，回到菜单时需要同步）
watch(() => partyStore.formation, () => {
    syncFromStore();
}, { deep: true });

const onSlotSelect = (index) => {
    if (selectedIndex.value === -1) {
        if (slots.value[index]) {
            selectedIndex.value = index;
        }
    } else if (selectedIndex.value === index) {
        selectedIndex.value = -1;
        targetIndex.value = -1;
    } else {
        performMove(selectedIndex.value, index);
        selectedIndex.value = -1;
        targetIndex.value = -1;
    }
};

const onSlotDrop = ({ from, to }) => {
    performMove(from, to);
    selectedIndex.value = -1;
    targetIndex.value = -1;
};

const onSlotHoverEnter = (index) => {
    if (selectedIndex.value !== -1 && selectedIndex.value !== index) {
        let actualTargetIndex = index;
        if (index >= 4) {
            const col = index - 4;
            const frontIdx = col;
            if (!slots.value[frontIdx] || selectedIndex.value === frontIdx) {
                actualTargetIndex = frontIdx;
            }
        }
        targetIndex.value = actualTargetIndex;
    }
};

const onSlotHoverLeave = (index) => {
    targetIndex.value = -1;
};

const clearSelection = () => {
    selectedIndex.value = -1;
    targetIndex.value = -1;
};

const performMove = (fromIndex, toIndex) => {
    const temp = slots.value[fromIndex];
    slots.value[fromIndex] = slots.value[toIndex];
    slots.value[toIndex] = temp;
    
    enforceFormationRules();
    syncToStore();
};

const enforceFormationRules = () => {
    for (let col = 0; col < 4; col++) {
        const frontIdx = col;
        const backIdx = col + 4;
        
        if (!slots.value[frontIdx] && slots.value[backIdx]) {
            slots.value[frontIdx] = slots.value[backIdx];
            slots.value[backIdx] = null;
        }
    }
};
</script>

<style scoped src="@styles/components/panels/FormationPanel.css"></style>
