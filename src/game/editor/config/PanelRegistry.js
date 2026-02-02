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
 * 注意：这个配置已废弃，不再用于限制面板访问
 * 所有编辑器面板现在都可以无条件访问
 */
export const PANEL_REQUIREMENTS = {
    // 已废弃 - 保留仅为兼容性
};
