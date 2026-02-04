export interface ISystem {
    /**
     * 系统名称 (用于注册和调试)
     */
    readonly name: string;

    /**
     * 系统更新方法
     * @param dt 增量时间 (delta time), 单位秒或毫秒，取决于游戏循环
     * @param callbacks 可选的回调函数集合，或者通用上下文对象 1
     * @param context 可选的上下文数据 (如 mapData)，或者通用上下文对象 2
     */
    update?(dt?: number, callbacks?: any, context?: any): void;

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
