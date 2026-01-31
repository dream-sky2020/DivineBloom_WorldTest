import { reactive } from 'vue';
import { editorManager } from './core/EditorCore';
import { world2d } from '@world2d';

/**
 * 编辑器模块对外统一接口
 */
export const editor = reactive({
    // 数据属性 (只读代理)
    get layout() { return editorManager.layout; },
    get editMode() { return editorManager.editMode; },
    get selectedEntity() { return editorManager.selectedEntity; },
    get sidebarMode() { return editorManager.sidebarMode; },
    set sidebarMode(val) { editorManager.sidebarMode = val; },

    // 核心操作
    toggleEditMode() {
        editorManager.toggleEditMode();
    },

    resetLayout(workspaceId = 'world-editor') {
        editorManager.resetToWorkspace(workspaceId);
    },

    /**
     * 导出场景数据 (原本在 GameUI 中的逻辑)
     */
    exportCurrentScene() {
        const bundle = world2d.exportCurrentScene();
        const mapId = world2d.state.mapId || 'unknown';
        const fileName = `${mapId}_scene_export_${Date.now()}.json`;
        
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('Editor: Scene exported', mapId);
    }
});
