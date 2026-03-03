import { nextTick, watch, type Ref } from 'vue';
import { world2d } from '@world2d';
import { editor } from '@/game/editor';
import type { CanvasManager } from '@/game/interface/CanvasManager';

type UseCanvasViewportOptions = {
    canvasMgr: CanvasManager;
    immersiveMode: Ref<boolean>;
    currentSystem: Ref<string>;
};

export function useCanvasViewport(options: UseCanvasViewportOptions) {
    const resizeCanvas = () => {
        const canvasRoot = document.getElementById('game-canvas');
        if (!canvasRoot) return;
        if (options.immersiveMode.value) {
            canvasRoot.style.transform = 'none';
            return;
        }
        options.canvasMgr.resize();
    };

    const onResize = () => {
        resizeCanvas();
    };

    const stopWatchSystem = watch(
        () => world2d.state.system,
        (newSystem) => {
            if (newSystem && options.currentSystem.value !== newSystem) {
                options.currentSystem.value = newSystem;
                nextTick(() => resizeCanvas());
            }
        }
    );

    const stopWatchSidebarMode = watch(
        () => editor.sidebarMode,
        () => {
            nextTick(() => resizeCanvas());
        }
    );

    const stopWatchImmersive = watch(
        options.immersiveMode,
        () => {
            nextTick(() => resizeCanvas());
        }
    );

    const mountViewport = () => {
        window.addEventListener('resize', onResize);
        resizeCanvas();
        setTimeout(() => resizeCanvas(), 0);
    };

    const unmountViewport = () => {
        window.removeEventListener('resize', onResize);
        stopWatchSystem();
        stopWatchSidebarMode();
        stopWatchImmersive();
    };

    return {
        resizeCanvas,
        mountViewport,
        unmountViewport
    };
}
