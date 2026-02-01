import { Capabilities } from '../core/EditorCapabilities';

/**
 * 面板标题定义
 */
export const PANEL_TITLES = {
    'scene-explorer': '场景浏览器',
    'entity-properties': '属性编辑',
    'scene-manager': '场景管理',
    'entity-creator': '创建实体'
};

/**
 * 面板图标定义
 */
export const PANEL_ICONS = {
    'scene-explorer': '🔍',
    'entity-properties': '📝',
    'scene-manager': '🗺️',
    'entity-creator': '➕'
};

/**
 * 面板准入能力要求
 */
export const PANEL_REQUIREMENTS = {
    'scene-manager': [Capabilities.ECS_EDITING],
    'entity-creator': [Capabilities.ECS_EDITING],
    'scene-explorer': [Capabilities.ECS_EDITING, Capabilities.SCENE_TREE],
    'entity-properties': [Capabilities.ECS_EDITING, Capabilities.ENTITY_INSPECTION]
};
