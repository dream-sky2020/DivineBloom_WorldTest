// 定义指令类型常量
export const OP_CODES = {
    SAY: 'SAY' as const,
    CHOICE: 'CHOICE' as const,
    WAIT: 'WAIT' as const,
    EVENT: 'EVENT' as const
};

export type OpCode = typeof OP_CODES[keyof typeof OP_CODES];

export interface DialogueNode {
    type: OpCode;
    speaker?: string;
    textKey?: string;
    options?: Record<string, any>;
    titleKey?: string;
    choices?: Array<{ label: string, value: any }>;
    action?: () => void;
    duration?: number;
}

/**
 * 显示对话文本
 * @param speaker - 说话者 ID (对应 locales 或 assets)
 * @param textKey - 文本 Key (对应 locales)
 * @param options - 额外参数 (如表情、音效)
 */
export function say(speaker: string, textKey: string, options: Record<string, any> = {}): DialogueNode {
    return {
        type: OP_CODES.SAY,
        speaker,
        textKey,
        options
    };
}

/**
 * 显示选项
 * @param titleKey - 选项标题/提示语
 * @param choices - 选项列表
 */
export function choose(titleKey: string, choices: Array<{ label: string, value: any }>): DialogueNode {
    return {
        type: OP_CODES.CHOICE,
        titleKey,
        choices
    };
}

/**
 * 触发通用事件 (直接执行回调或触发系统事件)
 * @param callback - 要执行的函数
 */
export function exec(callback: () => void): DialogueNode {
    return {
        type: OP_CODES.EVENT,
        action: callback
    };
}

/**
 * 等待一段时间 (秒)
 */
export function wait(seconds: number): DialogueNode {
    return {
        type: OP_CODES.WAIT,
        duration: seconds
    };
}
