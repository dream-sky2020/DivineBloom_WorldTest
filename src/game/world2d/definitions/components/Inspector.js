/**
 * Inspector Component
 * 
 * 专门为编辑器设计的元数据组件。
 * 它存储了实体属性在 UI 上的展示方式、中文名称、提示信息等。
 */
export const Inspector = {
    /**
     * 创建 Inspector 组件
     * @param {Object} config 配置信息
     * @param {string} [config.tagName] UI 显示的标签名称 (如 "Global", "Config")
     * @param {string} [config.tagColor] 标签的背景颜色 (CSS 颜色值)
     * @param {Array} [config.groups] 分组显示 (可选)
     * @param {Array} [config.fields] 字段映射
     * @param {boolean} [config.allowDelete] 是否允许删除
     * @param {number} [config.priority] 场景浏览器排序优先级（越高越靠前，默认 0）
     * @param {number} [config.hitPriority] 编辑器点击优先级 (数字越大越先被选中)
     * @param {Object} [config.editorBox] 手动指定编辑器交互框 { w, h, anchorX, anchorY, offsetX, offsetY, scale }
     */
    create({ tagName = null, tagColor = null, groups = [], fields = [], allowDelete = true, priority = 0, hitPriority = 0, editorBox = null } = {}) {
        return {
            tagName,
            tagColor,
            groups,
            fields,
            allowDelete,
            priority,
            hitPriority,
            // 确保 editorBox 始终是一个对象，方便通过 path 修改属性
            editorBox: {
                w: 32,
                h: 32,
                anchorX: 0.5,
                anchorY: 1.0,
                offsetX: 0,
                offsetY: 0,
                scale: 1.0,
                ...(editorBox || {})
            }
        };
    }
};

/**
 * 统一的编辑器属性字段，可合并到各实体的 INSPECTOR_FIELDS 中
 */
export const EDITOR_INSPECTOR_FIELDS = [
    { path: 'inspector.hitPriority', label: '点击优先级', type: 'number', tip: '数字越大越优先被选中', props: { step: 1 }, group: '编辑器配置' },
    { path: 'inspector.editorBox.w', label: '交互宽', type: 'number', props: { min: 0 }, group: '编辑器配置' },
    { path: 'inspector.editorBox.h', label: '交互高', type: 'number', props: { min: 0 }, group: '编辑器配置' },
    { path: 'inspector.editorBox.scale', label: '交互缩放', type: 'number', props: { step: 0.1, min: 0 }, group: '编辑器配置' },
    { path: 'inspector.editorBox.offsetX', label: '交互偏移 X', type: 'number', group: '编辑器配置' },
    { path: 'inspector.editorBox.offsetY', label: '交互偏移 Y', type: 'number', group: '编辑器配置' }
];
