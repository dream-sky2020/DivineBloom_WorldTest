import { ref } from 'vue';
import { gameManager } from '@/game/ecs/GameManager';
import { useGameStore } from '@/stores/game';
import { world } from '@/game/ecs/world';

export class WorldMapController {
    constructor() {
        this.gameStore = useGameStore();
        this.worldStore = this.gameStore.world;
        this.dialogueStore = this.gameStore.dialogue;

        this.debugInfo = ref({ x: 0, y: 0, lastInput: '' });
        this.uiRafId = 0;
    }

    /**
     * UI 同步循环
     */
    syncUI = () => {
        const scene = gameManager.currentScene.value;
        const engine = gameManager.engine;

        if (!scene || !engine) {
            this.uiRafId = requestAnimationFrame(this.syncUI);
            return;
        }
        
        const player = scene.player;
        if (!player) {
            this.uiRafId = requestAnimationFrame(this.syncUI);
            return;
        }
        
        // 计算追击中的敌人数量
        let chasingCount = 0;
        if (scene.gameEntities) {
            const entities = scene.gameEntities;
            for (let i = 0; i < entities.length; i++) {
                const e = entities[i];
                if (e.entity && e.entity.aiState && e.entity.aiState.state === 'chase') {
                    chasingCount++;
                }
            }
        }

        // 从全局实体获取鼠标位置
        const globalEntity = world.with('globalManager', 'mousePosition').first;
        const mouseX = globalEntity?.mousePosition?.worldX || 0;
        const mouseY = globalEntity?.mousePosition?.worldY || 0;

        // 更新响应式状态
        this.debugInfo.value = {
            x: player.position ? player.position.x : 0,
            y: player.position ? player.position.y : 0,
            mouseX: mouseX,
            mouseY: mouseY,
            lastInput: engine.input.lastInput,
            chasingCount
        };
        
        this.uiRafId = requestAnimationFrame(this.syncUI);
    };

    async start() {
        await gameManager.startWorldMap();
        this.syncUI();
    }

    stop() {
        if (this.uiRafId) {
            cancelAnimationFrame(this.uiRafId);
        }
        // 离开时保存状态
        if (gameManager.currentScene.value) {
            this.worldStore.saveState(gameManager.currentScene.value);
        }
    }

    handleOverlayClick() {
        this.dialogueStore.advance();
    }
}
