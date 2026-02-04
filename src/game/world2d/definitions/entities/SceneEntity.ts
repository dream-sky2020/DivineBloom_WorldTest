import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import { SceneConfig, Inspector, EDITOR_INSPECTOR_FIELDS } from '@components';

const INSPECTOR_FIELDS = [
    { path: 'sceneConfig.id', label: '场景 ID', type: 'text', props: { readonly: true }, group: '基础信息' },
    { path: 'sceneConfig.name', label: '场景名称', type: 'text', group: '基础信息' },
    { path: 'sceneConfig.width', label: '地图宽度', type: 'number', props: { step: 100, min: 100 }, group: '地图尺寸' },
    { path: 'sceneConfig.height', label: '地图高度', type: 'number', props: { step: 100, min: 100 }, group: '地图尺寸' },
    { path: 'sceneConfig.groundColor', label: '地面颜色', type: 'color', group: '视觉配置' },
    { path: 'sceneConfig.gravity.x', label: '重力 X', type: 'number', props: { step: 0.1 }, group: '物理配置' },
    { path: 'sceneConfig.gravity.y', label: '重力 Y', type: 'number', props: { step: 0.1 }, group: '物理配置' },
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const SceneEntity: IEntityDefinition<z.ZodRecord<z.ZodString, z.ZodAny>> = {
    type: 'scene_config',
    name: '场景配置',
    order: 2,
    creationIndex: 0,
    schema: z.record(z.string(), z.any()),
    create(data: any = {}) {
        const existing = world.with('sceneConfig').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'scene_config',
            name: `Scene: ${data.name || data.id || 'Unknown'}`,
            sceneConfig: SceneConfig.create(data),
            persist: false,
            inspector: null as any
        };

        entity.inspector = Inspector.create({
            tagName: 'Config',
            tagColor: '#10b981',
            fields: INSPECTOR_FIELDS,
            allowDelete: false,
            priority: 900,
            hitPriority: 900
        });

        return world.add(entity);
    },

    serialize(entity: any) {
        return {
            ...entity.sceneConfig
        };
    },

    deserialize(data: any) {
        return this.create(data);
    }
};
