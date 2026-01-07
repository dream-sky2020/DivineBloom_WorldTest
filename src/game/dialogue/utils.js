// 定义指令类型常量
export const OP_CODES = {
    SAY: 'SAY',
    CHOICE: 'CHOICE',
    WAIT: 'WAIT',
    EVENT: 'EVENT'
};

/**
 * 显示对话文本
 * @param {string} speaker - 说话者 ID (对应 locales 或 assets)
 * @param {string} textKey - 文本 Key (对应 locales)
 * @param {object} [options] - 额外参数 (如表情、音效)
 */
export function say(speaker, textKey, options = {}) {
    return {
        type: OP_CODES.SAY,
        speaker,
        textKey,
        options
    };
}

/**
 * 显示选项
 * @param {string} titleKey - 选项标题/提示语
 * @param {Array<{label: string, value: any}>} choices - 选项列表
 */
export function choose(titleKey, choices) {
    return {
        type: OP_CODES.CHOICE,
        titleKey,
        choices
    };
}

/**
 * 触发通用事件 (直接执行回调或触发系统事件)
 * @param {Function} callback - 要执行的函数
 */
export function exec(callback) {
    return {
        type: OP_CODES.EVENT,
        action: callback
    };
}

/**
 * 等待一段时间 (秒)
 */
export function wait(seconds) {
    return {
        type: OP_CODES.WAIT,
        duration: seconds
    };
}

