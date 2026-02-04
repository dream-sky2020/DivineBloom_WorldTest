import { z } from 'zod';

/**
 * 组件定义接口
 * 
 * @template TSchema Zod Schema 类型
 * @template TRuntime 运行时组件类型 (默认等于 Schema 推导类型)
 */
export interface IComponentDefinition<TSchema extends z.ZodType, TRuntime = z.infer<TSchema>> {
    /**
     * 组件唯一名称 (用于注册和调试)
     */
    readonly name: string;

    /**
     * Zod 数据校验 Schema
     * 用于运行时校验和类型推导
     */
    readonly schema: TSchema;

    /**
     * 创建/初始化组件实例
     * @param args 初始化参数 (可以是对象、参数列表等，由具体实现决定)
     */
    create(...args: any[]): TRuntime;

    /**
     * 序列化组件为纯数据对象
     * @param component 运行时组件实例
     */
    serialize(component: TRuntime): z.infer<TSchema>;

    /**
     * 从数据恢复组件实例
     * @param data 序列化后的数据
     */
    deserialize(data: any): TRuntime;

    /**
     * 编辑器 Inspector 配置 (可选)
     */
    readonly inspectorFields?: any[];
}
