import { defineStore } from 'pinia';
import { ref, markRaw } from 'vue';
import { OP_CODES } from '@/game/dialogue/utils';

export const useDialogueStore = defineStore('dialogue', () => {
    // 状态
    const isActive = ref(false);
    const speaker = ref('');
    const currentText = ref('');
    const currentOptions = ref([]); // [{label, value}]
    const isWaitingForInput = ref(false);

    // Iterator 实例 (不需要响应式)
    let iterator = null;

    /**
     * 启动对话
     * @param {GeneratorFunction} scriptFactory - 对话脚本生成器函数
     */
    const startDialogue = (scriptFactory) => {
        if (!scriptFactory) return;

        // 初始化生成器
        iterator = scriptFactory();
        isActive.value = true;

        // 开始第一步
        next();
    };

    /**
     * 执行下一步
     * @param {any} inputVal - 上一步 yield 的返回值（通常是选项的值）
     */
    const next = (inputVal) => {
        if (!iterator) return;

        const { value, done } = iterator.next(inputVal);

        if (done) {
            endDialogue();
            return;
        }

        handleOp(value);
    };

    /**
     * 处理指令
     */
    const handleOp = (op) => {
        if (!op) {
            // 如果 yield 了 undefined，继续下一步
            next();
            return;
        }

        switch (op.type) {
            case OP_CODES.SAY:
                speaker.value = op.speaker;
                currentText.value = op.textKey;
                currentOptions.value = [];
                isWaitingForInput.value = true; // 等待点击继续
                break;

            case OP_CODES.CHOICE:
                // 如果有标题，可以显示标题（这里暂复用 currentText）
                if (op.titleKey) {
                    currentText.value = op.titleKey;
                }
                currentOptions.value = op.choices;
                isWaitingForInput.value = true; // 等待选择
                break;

            case OP_CODES.EVENT:
                // 执行事件
                if (op.action && typeof op.action === 'function') {
                    op.action();
                }
                // 事件通常是瞬间的，执行完自动下一步
                next();
                break;

            case OP_CODES.WAIT:
                // 暂时简单的 setTimeout，实际项目可能需要依赖 GameEngine 的时间
                setTimeout(() => {
                    next();
                }, (op.duration || 1) * 1000);
                break;

            default:
                console.warn('Unknown dialogue op:', op);
                next();
                break;
        }
    };

    /**
     * 玩家点击“继续”
     */
    const advance = () => {
        // 如果不在等待输入，忽略点击
        if (!isWaitingForInput.value) return;

        // 如果当前是选项模式，点击背景可能无效，必须选选项
        if (currentOptions.value.length > 0) return;

        // 标记不再等待输入，防止重复点击
        isWaitingForInput.value = false;

        // 传递 null 给 next
        next(null);
    };

    /**
     * 玩家选择选项
     */
    const selectOption = (val) => {
        // 如果不在等待输入，忽略
        if (!isWaitingForInput.value) return;
        
        // 标记不再等待输入
        isWaitingForInput.value = false;

        // 传递选项值给 next，这个值会成为脚本里 yield 表达式的返回值
        // const choice = yield choose(...) -> choice 就会变成 val
        next(val);
    };

    const endDialogue = () => {
        isActive.value = false;
        isWaitingForInput.value = false;
        speaker.value = '';
        currentText.value = '';
        currentOptions.value = [];
        iterator = null;
    };

    return {
        isActive,
        isWaitingForInput,
        speaker,
        currentText,
        currentOptions,
        startDialogue,
        advance,
        selectOption,
        endDialogue
    };
});

