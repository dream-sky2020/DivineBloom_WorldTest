import { computed, ref, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { storeToRefs } from 'pinia';
import { skillsDb } from '@schema/skills';

export class BattleController {
    constructor() {
        this.gameStore = useGameStore();
        this.battleStore = this.gameStore.battle;
        this.settingsStore = this.gameStore.settings;

        const { 
            battleState, 
            waitingForInput, 
            activeCharacter, 
            partySlotsDisplay,
            pendingAction,
            validTargetIds
        } = storeToRefs(this.battleStore);

        this.battleState = battleState;
        this.waitingForInput = waitingForInput;
        this.activeCharacter = activeCharacter;
        this.partySlotsDisplay = partySlotsDisplay;
        this.pendingAction = pendingAction;
        this.validTargetIds = validTargetIds;

        this.partyViewMode = ref('default');
        this.compactPartyMode = ref(true);
        this.showSkillMenu = ref(false);
        this.showItemMenu = ref(false);

        // 绑定方法以确保在作为事件处理器传递时 this 指向正确
        this.selectSkill = this.selectSkill.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.handleTargetClick = this.handleTargetClick.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.isSlotActive = this.isSlotActive.bind(this);
        this.startLoop = this.startLoop.bind(this);
        this.stopLoop = this.stopLoop.bind(this);

        this.animationFrameId = null;
        this.lastTime = 0;

        // 定义响应式计算属性
        this.isSelectingTarget = computed(() => !!this.pendingAction.value);
        this.menuActiveCharacter = computed(() => this.waitingForInput.value ? this.activeCharacter.value : null);
        this.canSwitch = computed(() => {
            if (!this.activeCharacter.value) return false;
            const slot = this.partySlotsDisplay.value.find(s => s.front && s.front.uuid === this.activeCharacter.value.uuid);
            return slot && slot.back && slot.back.hp > 0;
        });
        this.characterSkills = computed(() => {
            const char = this.activeCharacter.value;
            if (!char) return [];
            
            const skillIds = (char.equippedActiveSkills && char.equippedActiveSkills.length > 0) 
                ? char.equippedActiveSkills 
                : (char.skills || []);

            return skillIds.map(id => {
                const skill = skillsDb[id];
                if (!skill) return null;
                const mpCost = parseInt(skill.cost) || 0;
                const isUsable = this.battleStore.checkSkillUsability(id);
                return { ...skill, mpCost, isUsable };
            }).filter(Boolean);
        });
    }

    /**
     * 检查槽位是否处于激活回合
     */
    isSlotActive(slot) {
        if (!this.activeCharacter.value) return false;
        return slot.front && slot.front.uuid === this.activeCharacter.value.uuid;
    }

    /**
     * ATB 循环
     */
    gameLoop = (timestamp) => {
        if (!this.lastTime) this.lastTime = timestamp;
        const gameSpeed = this.settingsStore.battleSpeed;
        const dt = ((timestamp - this.lastTime) / 1000) * gameSpeed;
        this.lastTime = timestamp;

        this.battleStore.updateATB(dt);
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    startLoop() {
        if (this.battleState.value !== 'active') {
            this.battleStore.initBattle();
        }
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    stopLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    selectSkill(skill) {
        if (!this.battleStore.checkSkillUsability(skill.id)) return;
        
        const needsSelection = ['ally', 'deadAlly', 'enemy'].includes(skill.targetType);
        if (needsSelection) {
            this.battleStore.setPendingAction({ 
                type: 'skill', 
                targetType: skill.targetType, 
                data: { skillId: skill.id } 
            });
        } else {
            this.battleStore.playerAction('skill', skill.id);
        }
        this.showSkillMenu.value = false;
    }

    selectItem(item) {
        const targetType = item.targetType || 'ally';
        const needsSelection = ['ally', 'deadAlly', 'enemy'].includes(targetType);

        if (needsSelection) {
            this.battleStore.setPendingAction({ 
                type: 'item', 
                targetType: targetType, 
                data: { itemId: item.id } 
            });
        } else {
            this.battleStore.playerAction('item', { itemId: item.id, targetId: null });
        }
        this.showItemMenu.value = false;
    }

    handleTargetClick(unit) {
        if (!unit || !this.validTargetIds.value.includes(unit.uuid)) return;

        const action = this.pendingAction.value;
        if (!action) return;

        if (action.type === 'attack') {
            this.battleStore.playerAction('attack', { targetId: unit.uuid });
        } else if (action.type === 'skill') {
            this.battleStore.playerAction('skill', { skillId: action.data.skillId, targetId: unit.uuid });
        } else if (action.type === 'item') {
            this.battleStore.playerAction('item', { itemId: action.data.itemId, targetId: unit.uuid });
        }
        
        this.battleStore.setPendingAction(null);
    }

    handleAction(actionType) {
        if (actionType === 'attack') {
            this.battleStore.setPendingAction({ 
                type: 'attack', 
                targetType: 'enemy', 
                data: {} 
            });
        } else {
            this.battleStore.playerAction(actionType);
        }
    }
}
