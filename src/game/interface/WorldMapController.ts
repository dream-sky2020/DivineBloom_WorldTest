import { ref, type Ref } from 'vue';
import { world2d } from '@world2d'; // ✅ 使用统一接口
import { useGameStore } from '@/stores/game';

export interface DebugInfo {
    x: number;
    y: number;
    mouseX: number;
    mouseY: number;
    lastInput: string;
    chasingCount: number;
}

export class WorldMapController {
    public gameStore: any;
    public worldStore: any;
    public dialogueStore: any;
    public debugInfo: Ref<DebugInfo>;
    private uiTickTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly uiTickMs = 80; // ~12.5Hz

    constructor() {
        this.gameStore = useGameStore();
        this.worldStore = this.gameStore.world2d;
        this.dialogueStore = this.gameStore.dialogue;

        this.debugInfo = ref<DebugInfo>({
            x: 0,
            y: 0,
            mouseX: 0,
            mouseY: 0,
            lastInput: '',
            chasingCount: 0
        });
    }

    /**
     * UI 同步循环
     */
    syncUI = () => {
        // ✅ 使用统一的 API 获取调试信息
        const debugInfo = world2d.getDebugInfo();

        const sceneInfo = world2d.getCurrentSceneInfo();
        const systemState = world2d.getSystemState();
        if (!sceneInfo || !systemState.isInitialized) {
            this.uiTickTimer = setTimeout(this.syncUI, this.uiTickMs);
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

        this.uiTickTimer = setTimeout(this.syncUI, this.uiTickMs);
    };

    async start() {
        // ✅ 使用统一的 API 启动世界地图
        await world2d.startWorldMap();
        this.syncUI();
    }

    stop() {
        if (this.uiTickTimer) {
            clearTimeout(this.uiTickTimer);
            this.uiTickTimer = null;
        }
        // 离开时保存状态
        if (world2d.getCurrentSceneInfo()) {
            this.worldStore.saveState();
        }
    }

    handleOverlayClick() {
        this.dialogueStore.advance();
    }
}
