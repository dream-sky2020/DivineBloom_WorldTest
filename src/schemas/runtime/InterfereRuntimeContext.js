import { z } from 'zod';
import { ID } from '../common.js';
import { CharacterSchema } from '../resources/character.js';

/**
 * InterfereRuntimeContext (界面/交互上下文)
 * 
 * 职责：连接战斗逻辑层与 UI 表现层，处理副作用（日志、音效、动画）。
 */

// 简单的函数校验器，防止 Zod 链式调用在某些环境下报错
const func = () => z.any().refine(v => typeof v === 'function', { message: "必须是一个函数" });

export const InterfereRuntimeContextSchema = z.object({
    // --- 消息与反馈 ---
    log: func().default(() => () => {}),
    
    // --- 视觉表现 ---
    playAnimation: func().default(() => () => {}),
    playSound: func().default(() => () => {}),
    
    // --- UI 更新通知 ---
    onUnitUpdate: func().default(() => () => {}),
    onUnitDeath: func().default(() => () => {}),
    onDamagePop: func().default(() => () => {}),
    
    // --- 回调挂钩 ---
    performSwitch: func().default(() => () => {}),
    checkItem: func().default(() => () => true),
    consumeItem: func().default(() => () => {}),
    
    // --- 状态控制 ---
    setSpeed: func().default(() => () => {}),
    pause: func().default(() => () => {}),
    resume: func().default(() => () => {})
});

/**
 * 创建交互运行时上下文的默认对象
 */
export const createInterfereRuntimeContext = (data = {}) => {
    return InterfereRuntimeContextSchema.parse(data);
};

export default createInterfereRuntimeContext;
