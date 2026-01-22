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
     * @param {Object} [config.editorBox] 手动指定编辑器交互框 { w, h, anchorX, anchorY, offsetX, offsetY }
     * 
     * field 结构:
     * {
     *   path: string,    // 对应实体的属性路径，如 'position.x'
     *   label: string,   // 中文显示名称
     *   type: string,    // UI 类型: 'text', 'number', 'checkbox', 'select', 'asset'
     *   tip: string,     // 悬浮注释/帮助文本
     *   options: Array,  // 如果是 select 类型，提供的选项
     *   props: Object    // 传给 input 的额外属性，如 { min: 0, max: 100, step: 1 }
     * }
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
            editorBox
        };
    }
};
