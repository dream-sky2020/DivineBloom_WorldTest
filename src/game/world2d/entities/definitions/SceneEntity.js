import { world } from '@world2d/world';
import { SceneConfig } from '@world2d/entities/components/SceneConfig';
import { Inspector, EDITOR_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector';

const INSPECTOR_FIELDS = [
    { path: 'sceneConfig.id', label: '场景 ID', type: 'text', props: { readonly: true } },
    { path: 'sceneConfig.name', label: '场景名称', type: 'text' },
    { path: 'sceneConfig.width', label: '地图宽度', type: 'number', props: { step: 100, min: 100 } },
    { path: 'sceneConfig.height', label: '地图高度', type: 'number', props: { step: 100, min: 100 } },
    { path: 'sceneConfig.groundColor', label: '地面颜色', type: 'color' },
    { path: 'sceneConfig.gravity.x', label: '重力 X', type: 'number', props: { step: 0.1 } },
    { path: 'sceneConfig.gravity.y', label: '重力 Y', type: 'number', props: { step: 0.1 } },
    ...EDITOR_INSPECTOR_FIELDS
];

export const SceneEntity = {
    create(data = {}) {
        const existing = world.with('sceneConfig').first;
        if (existing) {
            world.remove(existing);
        }

        const entity = {
            type: 'scene_config',
            name: `Scene: ${data.name || data.id || 'Unknown'}`,
            sceneConfig: SceneConfig.create(data),
            persist: false
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
    }
};
