import { ref } from 'vue';
import { world2d } from '@world2d'; // ✅ 使用统一接口
import { useGameStore } from '@/stores/game';

export class WorldMapController {
    constructor() {
        this.gameStore = useGameStore();
        this.worldStore = this.gameStore.world2d;
        this.dialogueStore = this.gameStore.dialogue;

        this.debugInfo = ref({ x: 0, y: 0, lastInput: '' });
        this.uiRafId = 0;
    }

    /**
     * UI 同步循环
     */
    syncUI = () => {
        // ✅ 使用统一的 API 获取调试信息
        const debugInfo = world2d.getDebugInfo();
        
        if (!world2d.currentScene.value || !world2d.engine) {
            this.uiRafId = requestAnimationFrame(this.syncUI);
            return;
        }

        // 更新响应式状态
        this.debugInfo.value = {
            x: debugInfo.playerX,
            y: debugInfo.playerY,
            mouseX: debugInfo.mouseWorldX,
            mouseY: debugInfo.mouseWorldY,
            lastInput: debugInfo.lastInput,
            chasingCount: debugInfo.chasingCount
        };
        
        this.uiRafId = requestAnimationFrame(this.syncUI);
    };

    async start() {
        // ✅ 使用统一的 API 启动世界地图
        await world2d.startWorldMap();
        this.syncUI();
    }

    stop() {
        if (this.uiRafId) {
            cancelAnimationFrame(this.uiRafId);
        }
        // 离开时保存状态
        if (world2d.currentScene.value) {
            this.worldStore.saveState(world2d.currentScene.value);
        }
    }

    handleOverlayClick() {
        this.dialogueStore.advance();
    }
}
