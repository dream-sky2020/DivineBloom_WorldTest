import type { SystemContextBase } from './SystemContext';
import { ExecutionPolicy } from '../enums/ExecutionPolicy';

export interface ISystem<TContext = SystemContextBase> {
    /**
     * 系统名称 (用于注册和调试)
     */
    readonly name: string;

    /**
     * 执行策略
     */
    readonly executionPolicy?: ExecutionPolicy;

    /**
     * 系统更新方法
     * @param dt 增量时间 (delta time), 单位秒或毫秒，取决于游戏循环
     * @param ctx 可选的系统上下文对象
     */
    update?(dt?: number, ctx?: TContext): void;

    /**
     * 系统渲染方法 (可选)
     * @param renderer 渲染器实例
     */
    draw?(renderer?: any): void;

    /**
     * 系统初始化方法 (可选)
     * @param data 初始化数据
     */
    init?(data?: any): void;

    /**
     * 系统销毁/清理方法 (可选)
     */
    dispose?(): void;
}
