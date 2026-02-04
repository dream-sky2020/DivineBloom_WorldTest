import { Capabilities } from '../core/EditorCapabilities';

export interface PanelGroup {
    id: string;
    activeId: string | null;
    panels: string[];
}

export interface LayoutConfig {
    left: PanelGroup[];
    right: PanelGroup[];
}

export interface SystemSpec {
    capabilities: string[];
    workspace: string;
}

/**
 * 默认布局定义
 */
export const DefaultLayout: LayoutConfig = {
    left: [
        {
            id: 'group-left-default',
            activeId: 'scene-manager',
            panels: ['scene-manager', 'entity-creator', 'scene-explorer']
        }
    ],
    right: [
        {
            id: 'group-right-default',
            activeId: 'entity-properties',
            panels: ['entity-properties']
        }
    ]
};

/**
 * 系统规格配置 (基于能力)
 */
export const SystemSpecs: Record<string, SystemSpec> = {
    'main-menu': {
        capabilities: [Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    },
    'world-map': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    },
    'battle': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'battle-inspector'
    },
    'shop': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    },
    'list-menu': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    },
    'encyclopedia': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    },
    'dev-tools': {
        capabilities: [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION, Capabilities.SCENE_TREE],
        workspace: 'world-editor'
    }
};

/**
 * 工作区预设
 */
export const Workspaces: Record<string, LayoutConfig> = {
    'world-editor': DefaultLayout,
    'battle-inspector': {
        left: [
            {
                id: 'group-left-battle',
                activeId: 'scene-explorer',
                panels: ['scene-manager', 'entity-creator', 'scene-explorer']
            }
        ],
        right: [
            {
                id: 'group-right-battle',
                activeId: 'entity-properties',
                panels: ['entity-properties']
            }
        ]
    },
    'minimal': {
        left: [],
        right: [
            {
                id: 'group-right-menu',
                activeId: 'scene-manager',
                panels: ['scene-manager']
            }
        ]
    }
};
