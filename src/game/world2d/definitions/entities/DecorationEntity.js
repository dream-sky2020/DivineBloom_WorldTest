import { z } from 'zod'
import { world } from '@world2d/world'
import { 
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Parent, Children, LocalTransform, Shape, ShapeType
} from '@components'

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
    { path: 'name', label: '名称', type: 'text', tip: '该装饰物的显示名称', group: '基本属性' },
    ...TRANSFORM_INSPECTOR_FIELDS,
    { path: 'zIndex', label: '层级', type: 'number', tip: '控制重叠顺序，背景通常在 -50 以下', props: { step: 1 }, group: '深度排序' },
    { path: 'sprite.id', label: '资源 ID', type: 'text', tip: '对应 assets 中的 ID', group: '精灵 (Sprite)' },
    ...SPRITE_INSPECTOR_FIELDS,
    ...COLLIDER_INSPECTOR_FIELDS,
    ...EDITOR_INSPECTOR_FIELDS
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

        let spriteComponent;
        let animationComponent;
        let rectComponent;
        let collider = null;

        if (spriteId) {
            spriteComponent = Sprite.create(spriteId, { scale });
            animationComponent = Animation.create('default');
        } else if (rect) {
            spriteComponent = Sprite.create('rect', { tint: rect.color });
            rectComponent = { width: rect.width, height: rect.height, color: rect.color };
        } else {
            spriteComponent = Sprite.create('rect', { tint: 'magenta' });
            rectComponent = { width: 20, height: 20, color: 'magenta' };
        }

        if (customCollider) {
            collider = Collider.create({ ...customCollider, isStatic: customCollider.isStatic ?? true });
        } else if (rect && !spriteId) {
            collider = Collider.box(rect.width, rect.height, true);
        }

        const root = world.add({
            type: 'decoration',
            name: name,
            transform: Transform(x, y),
            sprite: spriteComponent,
            animation: animationComponent,
            rect: rectComponent,
            zIndex: zIndex,
        });

        if (collider) {
            const colliderChild = world.add({
                parent: Parent(root),
                transform: Transform(),
                localTransform: LocalTransform(customCollider?.offsetX || 0, customCollider?.offsetY || 0, customCollider?.rotation || 0),
                name: `${root.name}_Collider`,
                shape: Shape({
                    type: customCollider?.type || (rect ? ShapeType.AABB : ShapeType.CIRCLE),
                    width: customCollider?.width || rect?.width || 0,
                    height: customCollider?.height || rect?.height || 0,
                    radius: customCollider?.radius || 0,
                    rotation: 0, // 已经在 localTransform 中处理
                }),
                collider: collider
            });
            root.children = Children([colliderChild]);
        }

        root.inspector = Inspector.create({
            fields: INSPECTOR_FIELDS,
            hitPriority: 40,
            editorBox: { w: rectComponent?.width || 32, h: rectComponent?.height || 32, scale: 1 }
        });

        return root;
    },

    serialize(entity) {
        const sprite = entity.sprite || entity.visual;
        const rect = entity.rect || (sprite?.type === 'rect' ? sprite : undefined);
        
        // 从子实体中获取碰撞体
        const colliderChild = entity.children?.entities.find(e => e.collider);
        const collider = colliderChild?.collider;
        const shape = colliderChild?.shape;
        
        return {
            type: 'decoration',
            x: entity.transform.x,
            y: entity.transform.y,
            name: entity.name,
            config: {
                spriteId: sprite?.id !== 'rect' ? sprite?.id : undefined,
                scale: sprite?.scale,
                zIndex: entity.zIndex,
                rect: rect ? {
                    width: rect.width,
                    height: rect.height,
                    color: rect.color || sprite?.tint
                } : undefined,
                collider: collider ? { 
                    ...collider,
                    type: shape?.type,
                    width: shape?.width,
                    height: shape?.height,
                    radius: shape?.radius,
                    rotation: colliderChild.localTransform?.rotation,
                    offsetX: colliderChild.localTransform?.x,
                    offsetY: colliderChild.localTransform?.y
                } : undefined
            }
        }
    }
}
