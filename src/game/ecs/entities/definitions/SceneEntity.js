import { world } from '@/game/ecs/world';
import { SceneConfig, SceneConfigSchema } from '@/game/ecs/entities/components/SceneConfig';
import { Inspector } from '@/game/ecs/entities/components/Inspector';

/**
 * 场景配置实体定义
 * 用于在 ECS 中存储和管理当前场景的元数据
 */

const INSPECTOR_FIELDS = [
    { path: 'sceneConfig.id', label: '场景 ID', type: 'text', props: { readonly: true } },
    { path: 'sceneConfig.name', label: '场景名称', type: 'text' },
    { path: 'sceneConfig.width', label: '地图宽度', type: 'number', props: { step: 100, min: 100 } },
    { path: 'sceneConfig.height', label: '地图高度', type: 'number', props: { step: 100, min: 100 } },
    { path: 'sceneConfig.groundColor', label: '地面颜色', type: 'color' },
    { path: 'sceneConfig.gravity.x', label: '重力 X', type: 'number', props: { step: 0.1 } },
    { path: 'sceneConfig.gravity.y', label: '重力 Y', type: 'number', props: { step: 0.1 } }
];

export const SceneEntity = {
    /**
     * 创建场景配置实体
     * @param {object} data 场景原始配置
     */
    create(data = {}) {
        // 确保场景中只有一个配置实体
        const existing = world.with('sceneConfig').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'scene_config',
            name: `Scene: ${data.name || data.id || 'Unknown'}`,
            sceneConfig: SceneConfig.create(data),

            // 添加编辑器支持
            inspector: Inspector.create({
                tagName: 'Config',
                tagColor: '#10b981', // 绿色
                fields: INSPECTOR_FIELDS,
                allowDelete: false, // 场景配置禁止删除
                priority: 900       // 优先级仅次于全局管理器
            }),

            // 标记为场景唯一实体，通常不需要物理组件
            persist: false // 场景切换时会自动被销毁
        };

        return world.add(entity);
    }
};
