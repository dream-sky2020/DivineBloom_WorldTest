// src/stores/game.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { usePartyStore } from './party';
import { useQuestStore } from './quest';
import { useWorld2dStore } from './world2d';
import { useDialogueStore } from './dialogue';
import { useSettingsStore } from './settings';
import { useAudioStore } from './audio';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GameStore');

export const useGameStore = defineStore('game', () => {
    // 引用所有子 Store
    const party = usePartyStore();
    const quest = useQuestStore();
    const world2d = useWorld2dStore();
    const dialogue = useDialogueStore();
    const settings = useSettingsStore();
    const audio = useAudioStore();

    // 全局游戏状态
    const isGameRunning = ref(false);
    const playTime = ref(0); // 游戏时长（秒）
    const saveSlotId = ref(1);

    // 计时器引用
    let timerInterval = null;

    // --- 核心生命周期 ---

    /**
     * 开始新游戏
     * 重置所有状态到初始值
     */
    const newGame = () => {
        resetAllStores();

        // 初始化必要的起始数据
        party.initParty();

        // 标记游戏开始
        isGameRunning.value = true;
        playTime.value = 0;
        startGameTimer();

        // 可以在这里设置初始地图或触发开场剧情
        // world.loadMap('start_village');
    };

    /**
     * 保存游戏
     * 收集所有 Gameplay Store 的数据
     */
    const saveGame = (slotId = 1) => {
        const saveData = {
            meta: {
                version: '1.0.0',
                timestamp: Date.now(),
                playTime: playTime.value,
                slotId
            },
            data: {
                inventory: party.inventoryState,
                party: party.serialize(),
                quest: quest.serialize(),
                world: world2d.serialize(),
                // Battle 和 Dialogue 状态通常不保存，除非需要中断恢复
            }
        };

        // 实际写入存储 (这里用 localStorage 模拟)
        const key = `save_slot_${slotId}`;
        localStorage.setItem(key, JSON.stringify(saveData));
        logger.info(`Game saved to ${key}`);

        return saveData;
    };

    /**
     * 读取游戏
     * @param {number} slotId 存档槽位
     */
    const loadGame = (slotId = 1) => {
        const key = `save_slot_${slotId}`;
        const json = localStorage.getItem(key);

        if (!json) {
            logger.warn(`No save data found in slot ${slotId}`);
            return false;
        }

        try {
            const saveData = JSON.parse(json);

            // 1. 先重置防止污染
            resetAllStores();

            // 2. 恢复元数据
            playTime.value = saveData.meta.playTime || 0;
            saveSlotId.value = slotId;

            // 3. 恢复各模块数据
            if (saveData.data.party) party.loadState(saveData.data.party);
            if (saveData.data.inventory) party.loadState({ inventory: saveData.data.inventory });
            if (saveData.data.quest) quest.loadState(saveData.data.quest);
            if (saveData.data.world) world2d.loadState(saveData.data.world);

            isGameRunning.value = true;
            startGameTimer();
            logger.info(`Game loaded from slot ${slotId}`);
            return true;
        } catch (e) {
            logger.error('Failed to load game:', e);
            return false;
        }
    };

    /**
     * 重置所有子 Store 到初始状态
     */
    const resetAllStores = () => {
        stopGameTimer();
        isGameRunning.value = false;

        party.reset();
        quest.reset();
        world2d.reset();
        dialogue.reset();
        // settings 不重置，属于系统层级
    };

    // --- 辅助功能 ---

    const startGameTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (isGameRunning.value) {
                playTime.value++;
            }
        }, 1000);
    };

    const stopGameTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    return {
        // State
        isGameRunning,
        playTime,
        saveSlotId,

        // Child Stores (如果希望通过 gameStore 访问)
        party,
        quest,
        world2d,
        dialogue,
        settings,
        audio,

        // Actions
        newGame,
        saveGame,
        loadGame,
        resetAllStores
    };
});
