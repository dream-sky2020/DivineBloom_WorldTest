import { z } from 'zod'
import { world } from '@/game/ecs/world'
import { Visuals } from '@/game/ecs/entities/components/Visuals'
import { Physics } from '@/game/ecs/entities/components/Physics'
import { Inspector } from '@/game/ecs/entities/components/Inspector'

// --- Schema Definition ---

export const DecorationEntitySchema = z.object({
    x: z.number(),
    y: z.number(),
    name: z.string().optional().default('Decoration'),
    config: z.object({
        spriteId: z.string().optional(),
        scale: z.number().optional().default(1),
        zIndex: z.number().optional().default(-50),
        rect: z.object({
            width: z.number(),
            height: z.number(),
            color: z.string()
        }).optional(),
        collider: z.object({
            type: z.string(),
            radius: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            rotation: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
            isStatic: z.boolean().optional().default(true)
        }).optional()
    }).optional().default({})
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', tip: '该装饰物的显示名称' },
    { path: 'position.x', label: '坐标 X', type: 'number', props: { step: 1 } },
    { path: 'position.y', label: '坐标 Y', type: 'number', props: { step: 1 } },
    { path: 'zIndex', label: '层级', type: 'number', tip: '控制重叠顺序，背景通常在 -50 以下', props: { step: 1 } },
    { path: 'visual.id', label: '资源 ID', type: 'text', tip: '对应 assets 中的 ID' },
    { path: 'visual.scale', label: '缩放比例', type: 'number', props: { step: 0.1, min: 0.1 } }
];

export const DecorationEntity = {
    create(data) {
        const result = DecorationEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[DecorationEntity] Validation failed', result.error);
            return null;
        }

        const { x, y, name, config } = result.data;
        const { spriteId, scale, zIndex, rect, collider: customCollider } = config;

        let visualComponent;
        let collider = null;

        if (spriteId) {
            visualComponent = Visuals.Sprite(spriteId, scale);
        } else if (rect) {
            visualComponent = Visuals.Rect(rect.width, rect.height, rect.color);
        } else {
            visualComponent = Visuals.Rect(20, 20, 'magenta');
        }

        // 🎯 碰撞体处理逻辑
        if (customCollider) {
            // 如果有自定义配置，优先使用自定义配置
            collider = Physics.Collider({
                ...customCollider,
                isStatic: customCollider.isStatic ?? true
            });
        } else if (rect && !spriteId) {
            // 如果是纯矩形且没有自定义碰撞体，默认加一个 AABB 碰撞体
            collider = Physics.Box(rect.width, rect.height, true);
        }

        const entityData = {
            type: 'decoration',
            name: name,
            position: { x, y },
            visual: visualComponent,
            zIndex: zIndex,
            // 🎯 添加 Inspector 映射组件
            inspector: Inspector.create({
                fields: INSPECTOR_FIELDS,
                hitPriority: 40
            })
        };

        if (collider) {
            entityData.collider = collider;
        }

        return world.add(entityData)
    },

    serialize(entity) {
        return {
            type: 'decoration',
            x: entity.position.x,
            y: entity.position.y,
            name: entity.name,
            config: {
                spriteId: entity.visual.type === 'sprite' ? entity.visual.id : undefined,
                scale: entity.visual.scale,
                zIndex: entity.zIndex,
                rect: entity.visual.type === 'rect' ? {
                    width: entity.visual.width,
                    height: entity.visual.height,
                    color: entity.visual.color
                } : undefined,
                collider: entity.collider ? { ...entity.collider } : undefined
            }
        }
    }
}
