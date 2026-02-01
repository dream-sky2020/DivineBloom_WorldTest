import { reactive, watch, markRaw, h, defineAsyncComponent } from 'vue';
import { createLogger } from '@/utils/logger';
import { Capabilities } from './EditorCapabilities';
import { SystemSpecs, Workspaces, DefaultLayout } from '../config/WorkspacePresets';
import { PANEL_TITLES, PANEL_ICONS, PANEL_REQUIREMENTS } from '../config/PanelRegistry';
import { PanelLayoutService } from './PanelLayoutService';

// 导入面板组件 (使用 defineAsyncComponent 避免循环依赖)
import PanelNotFound from '@/interface/editor/components/PanelNotFound.vue';

const logger = createLogger('EditorCore');

/**
 * 面板组件注册表
 */
const PANEL_COMPONENTS = {
    'scene-explorer': defineAsyncComponent(() => import('@/interface/editor/panels/HierarchyPanel.vue')),
    'entity-properties': defineAsyncComponent(() => import('@/interface/editor/panels/InspectorPanel.vue')),
    'scene-manager': defineAsyncComponent(() => import('@/interface/editor/panels/SceneSwitcherPanel.vue')),
    'entity-creator': defineAsyncComponent(() => import('@/interface/editor/panels/EntityPalettePanel.vue'))
};

class EditorCore {
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
        const spec = SystemSpecs[this.state.currentSystemId];
        return spec ? spec.capabilities : [];
    }

    /**
     * 检查是否拥有某项能力
     */
    hasCapability(capability) {
        return this.currentCapabilities.includes(capability);
    }

    /**
     * 根据系统 ID 声明式同步面板
     */
    syncWithSystem(systemId) {
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
    resetToWorkspace(workspaceId) {
        const workspace = Workspaces[workspaceId];
        if (workspace) {
            this.state.layout = JSON.parse(JSON.stringify(workspace));
            logger.info(`Editor layout reset to workspace: ${workspaceId}`);
        }
    }

    /**
     * 检查特定面板在当前状态下是否可用
     */
    isPanelEnabled(panelId) {
        const capabilities = this.currentCapabilities;
        const requirements = PANEL_REQUIREMENTS[panelId];

        if (!requirements) return true;

        return requirements.some(cap => capabilities.includes(cap));
    }

    /**
     * 核心移动逻辑
     */
    movePanel(params) {
        PanelLayoutService.movePanel(this.state.layout, params);
    }

    /**
     * 获取面板标题
     */
    getPanelTitle(id) {
        return PANEL_TITLES[id] || id;
    }

    /**
     * 获取面板图标
     */
    getPanelIcon(id) {
        return PANEL_ICONS[id] || '📦';
    }

    /**
     * 获取面板组件
     */
    getPanelComponent(id) {
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
    setTarget(target) {
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
export { Capabilities };
