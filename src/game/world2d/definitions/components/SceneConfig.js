import { z } from 'zod';

/**
 * 场景配置组件 Schema
 */
export const SceneConfigSchema = z.object({
    id: z.string(),
    name: z.string().default('Unknown Scene'),
    width: z.number().default(800),
    height: z.number().default(600),
    groundColor: z.string().default('#000000'),
    // 可以扩展更多场景级别的配置，例如重力、环境光、天气等
    gravity: z.object({
        x: z.number().default(0),
        y: z.number().default(0)
    }).optional().default({ x: 0, y: 0 }),
});

/**
 * 场景配置组件工厂
 */
export const SceneConfig = {
    /**
     * @param {z.infer<typeof SceneConfigSchema>} data 
     */
    create(data = {}) {
        const result = SceneConfigSchema.safeParse(data);
        if (!result.success) {
            console.error('[SceneConfig] Validation failed', result.error);
            // 返回一个基于输入数据的部分合法对象或默认对象
            return {
                id: data.id || 'unknown',
                name: data.name || 'Unknown Scene',
                width: data.width || 800,
                height: data.height || 600,
                groundColor: data.groundColor || '#000000',
                gravity: { x: 0, y: 0 }
            };
        }
        return result.data;
    }
};
