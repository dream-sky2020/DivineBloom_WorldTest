import { reactive, watch, h, defineAsyncComponent, Component } from 'vue';
import { createLogger } from '@/utils/logger';
import { SystemSpecs, Workspaces, DefaultLayout, LayoutConfig } from '../config/WorkspacePresets';
import { PANEL_TITLES, PANEL_ICONS } from '../config/PanelRegistry';
import { PanelLayoutService, MovePanelParams } from './PanelLayoutService';

// 导入面板组件 (使用 defineAsyncComponent 避免循环依赖)
import PanelNotFound from '@/interface/editor/components/PanelNotFound.vue';

const logger = createLogger('EditorCore');

/**
 * 面板组件注册表
 */
const PANEL_COMPONENTS: Record<string, Component> = {
    'scene-explorer': defineAsyncComponent(() => import('@/interface/editor/panels/HierarchyPanel.vue')),
    'entity-properties': defineAsyncComponent(() => import('@/interface/editor/panels/InspectorPanel.vue')),
    'scene-manager': defineAsyncComponent(() => import('@/interface/editor/panels/SceneSwitcherPanel.vue')),
    'entity-creator': defineAsyncComponent(() => import('@/interface/editor/panels/EntityPalettePanel.vue'))
};

export interface EditorState {
    active: boolean;
    editMode: boolean;
    selectedEntity: any;
    layout: LayoutConfig;
    target: any;
    currentSystemId: string | null;
    sidebarMode: 'push' | 'overlay';
}

class EditorCore {
    state: EditorState;

    constructor() {
        const savedLayout = PanelLayoutService.load();

        this.state = reactive({
            active: false,
            editMode: false,
            selectedEntity: null,
            layout: savedLayout || JSON.parse(JSON.stringify(DefaultLayout)),
            target: null,
            currentSystemId: null,
            sidebarMode: 'push' // 'push' or 'overlay'
        });

        watch(() => this.state.layout, (newLayout) => {
            PanelLayoutService.save(newLayout);
        }, { deep: true });
    }

    /**
     * 获取当前系统能力
     */
    get currentCapabilities() {
        if (!this.state.currentSystemId) return [];
        const spec = SystemSpecs[this.state.currentSystemId];
        return spec ? spec.capabilities : [];
    }

    /**
     * 检查是否拥有某项能力
     */
    hasCapability(capability: string) {
        return this.currentCapabilities.includes(capability);
    }

    /**
     * 根据系统 ID 声明式同步面板
     */
    syncWithSystem(systemId: string) {
        this.state.currentSystemId = systemId;
        const spec = SystemSpecs[systemId];

        if (!spec) {
            logger.debug(`No editor spec for system: ${systemId}`);
            return;
        }

        logger.info(`Syncing editor with system: ${systemId}`);
    }

    /**
     * 重置为特定工作区
     */
    resetToWorkspace(workspaceId: string) {
        const workspace = Workspaces[workspaceId];
        if (workspace) {
            this.state.layout = JSON.parse(JSON.stringify(workspace));
            logger.info(`Editor layout reset to workspace: ${workspaceId}`);
        }
    }

    /**
     * 检查特定面板在当前状态下是否可用
     * 注意：始终返回 true，不再根据能力限制面板访问
     */
    isPanelEnabled(panelId: string) {
        // 所有面板始终可用，移除能力限制
        return true;
    }

    /**
     * 核心移动逻辑
     */
    movePanel(params: MovePanelParams) {
        PanelLayoutService.movePanel(this.state.layout, params);
    }

    /**
     * 获取面板标题
     */
    getPanelTitle(id: string) {
        return PANEL_TITLES[id] || id;
    }

    /**
     * 获取面板图标
     */
    getPanelIcon(id: string) {
        return PANEL_ICONS[id] || '📦';
    }

    /**
     * 获取面板组件
     */
    getPanelComponent(id: string) {
        const component = PANEL_COMPONENTS[id];
        if (!component) {
            return {
                render: () => h(PanelNotFound, { panelId: id })
            };
        }
        return component;
    }

    /**
     * 设置编辑目标 (实现 Editable 协议)
     */
    setTarget(target: any) {
        if (this.state.target === target) return;
        if (this.state.target && this.state.editMode) this.state.target.exitEditMode?.();
        this.state.target = target;
        if (target && this.state.editMode) target.enterEditMode?.();
    }

    toggleEditMode() {
        this.state.editMode = !this.state.editMode;
        if (this.state.target) {
            if (this.state.editMode) this.state.target.enterEditMode?.();
            else this.state.target.exitEditMode?.();
        }
    }

    get editMode() { return this.state.editMode; }
    set editMode(val) { if (this.state.editMode !== val) this.toggleEditMode(); }
    get layout() { return this.state.layout; }
    get hasTarget() { return !!this.state.target; }
    get selectedEntity() { return this.state.selectedEntity; }
    set selectedEntity(val) { this.state.selectedEntity = val; }
    get sidebarMode() { return this.state.sidebarMode; }
    set sidebarMode(val) { this.state.sidebarMode = val; }
}

export const editorManager = new EditorCore();
