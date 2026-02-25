import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import { 
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Collider, COLLIDER_INSPECTOR_FIELDS,
  Inspector, EDITOR_INSPECTOR_FIELDS,
  Transform, TRANSFORM_INSPECTOR_FIELDS,
  Shape, ShapeType
} from '@components';

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
        shape: z.object({
            type: z.nativeEnum(ShapeType).optional(),
            radius: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            rotation: z.number().optional(),
            offsetX: z.number().optional(),
            offsetY: z.number().optional(),
            p1: z.object({ x: z.number(), y: z.number() }).optional(),
            p2: z.object({ x: z.number(), y: z.number() }).optional()
        }).optional(),
        collider: z.object({
            isStatic: z.boolean().optional().default(true),
            isTrigger: z.boolean().optional().default(false),
            layer: z.number().optional().default(1),
            mask: z.number().optional().default(0xFFFFFFFF)
        }).optional()
    }).optional().default({} as any)
});

export type DecorationEntityData = z.infer<typeof DecorationEntitySchema>;

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', tip: '该装饰物的显示名称', group: '基本属性' },
    ...(TRANSFORM_INSPECTOR_FIELDS || []),
    { path: 'zIndex', label: '层级', type: 'number', tip: '控制重叠顺序，背景通常在 -50 以下', props: { step: 1 }, group: '深度排序' },
    { path: 'sprite.id', label: '资源 ID', type: 'text', tip: '对应 assets 中的 ID', group: '精灵 (Sprite)' },
    ...(SPRITE_INSPECTOR_FIELDS || []),
    ...(COLLIDER_INSPECTOR_FIELDS || []),
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const DecorationEntity: IEntityDefinition<typeof DecorationEntitySchema> = {
    type: 'decoration',
    name: '装饰物',
    order: 40,
    creationIndex: 0,
    schema: DecorationEntitySchema,
    create(data: DecorationEntityData) {
        const result = DecorationEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[DecorationEntity] Validation failed', result.error);
            return null;
        }

        const { x, y, name, config } = result.data;
        const { spriteId, scale, zIndex, rect, shape: customShape, collider: customCollider } = config;

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

        const resolvedShape = customShape || (rect ? {
            type: ShapeType.AABB,
            width: rect.width,
            height: rect.height
        } : undefined);

        const colliderShape = resolvedShape
            ? Shape.create({
                type: resolvedShape.type,
                width: resolvedShape.width,
                height: resolvedShape.height,
                radius: resolvedShape.radius,
                rotation: resolvedShape.rotation,
                offsetX: resolvedShape.offsetX,
                offsetY: resolvedShape.offsetY,
                p1: resolvedShape.p1,
                p2: resolvedShape.p2
            })
            : undefined;

        const root = world.add({
            type: 'decoration',
            name: name,
            transform: Transform.create(x, y),
            sprite: spriteComponent,
            animation: animationComponent,
            rect: rectComponent,
            zIndex: zIndex,
            shape: colliderShape,
            collider: collider || undefined
        });

        root.inspector = Inspector.create({
            fields: INSPECTOR_FIELDS,
            hitPriority: 40,
            editorBox: { w: 40, h: 40, scale: 1 }
        });

        return root;
    },

    serialize(entity: any) {
        const sprite = entity.sprite || entity.visual;
        const rect = entity.rect || (sprite?.type === 'rect' ? sprite : undefined);
        
        const collider = entity.collider;
        const shape = entity.shape;
        
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
                shape: shape ? {
                    type: shape.type,
                    width: shape.width,
                    height: shape.height,
                    radius: shape.radius,
                    rotation: shape.rotation,
                    offsetX: shape.offsetX,
                    offsetY: shape.offsetY,
                    p1: shape.p1,
                    p2: shape.p2
                } : undefined,
                collider: collider ? { ...collider } : undefined
            }
        }
    },

    deserialize(data: any) {
        return this.create(data);
    }
}
