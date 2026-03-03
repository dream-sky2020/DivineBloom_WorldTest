import type { Ref } from 'vue';
import { world2d } from '@world2d';
import { getSystem } from '@world2d/SystemRegistry';
import { editor, type EditorInteractionController, type MouseInfo } from '@/game/editor';
import type { WorldMapController } from '@/game/interface/WorldMapController';

type BootstrapOptions = {
    gameCanvas: Ref<HTMLCanvasElement | null>;
    currentSystem: Ref<string>;
    dialogueStore: any;
    worldMapCtrl: WorldMapController;
    editorCtrl: EditorInteractionController;
};

type EditorInteractionBridge = {
    onEntityRightClick?: (entity: unknown, info: MouseInfo) => void;
    onEmptyRightClick?: (info: MouseInfo) => void;
};

export function useWorld2DBootstrap(options: BootstrapOptions) {
    const mountWorld2D = async () => {
        world2d.registerStateSource('game-ui', () => ({
            system: options.currentSystem.value,
            isEditMode: editor.editMode,
            dialogueActive: options.dialogueStore.isActive
        }));

        if (options.gameCanvas.value) {
            world2d.init(options.gameCanvas.value);
        }

        await options.worldMapCtrl.start();

        const editorInteraction = getSystem<EditorInteractionBridge>('editor-interaction');
        if (editorInteraction) {
            editorInteraction.onEntityRightClick = (entity: unknown, info: MouseInfo) =>
                options.editorCtrl.handleEntityRightClick(entity, info);
            editorInteraction.onEmptyRightClick = (info: MouseInfo) =>
                options.editorCtrl.handleEmptyRightClick(info);
        }
    };

    const unmountWorld2D = () => {
        world2d.unregisterStateSource('game-ui');
        options.worldMapCtrl.stop();
    };

    return {
        mountWorld2D,
        unmountWorld2D
    };
}
