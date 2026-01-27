import { z } from 'zod'
import { world } from '@world2d/world'
import { 
  Sprite, SPRITE_INSPECTOR_FIELDS,
  Animation,
  Physics,
  Inspector, EDITOR_INSPECTOR_FIELDS 
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
    { path: 'position.x', label: '坐标 X', type: 'number', props: { step: 1 }, group: '基本属性' },
    { path: 'position.y', label: '坐标 Y', type: 'number', props: { step: 1 }, group: '基本属性' },
    { path: 'zIndex', label: '层级', type: 'number', tip: '控制重叠顺序，背景通常在 -50 以下', props: { step: 1 }, group: '深度排序' },
    { path: 'sprite.id', label: '资源 ID', type: 'text', tip: '对应 assets 中的 ID', group: '精灵 (Sprite)' },
    ...SPRITE_INSPECTOR_FIELDS,
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
            collider = Physics.Collider({ ...customCollider, isStatic: customCollider.isStatic ?? true });
        } else if (rect && !spriteId) {
            collider = Physics.Box(rect.width, rect.height, true);
        }

        const entity = {
            type: 'decoration',
            name: name,
            position: { x, y },
            sprite: spriteComponent,
            animation: animationComponent,
            rect: rectComponent,
            zIndex: zIndex,
        };

        if (collider) {
            entity.collider = collider;
        }

        entity.inspector = Inspector.create({
            fields: INSPECTOR_FIELDS,
            hitPriority: 40,
            editorBox: { w: rectComponent?.width || 32, h: rectComponent?.height || 32, scale: 1 }
        });

        return world.add(entity)
    },

    serialize(entity) {
        const sprite = entity.sprite || entity.visual;
        const rect = entity.rect || (sprite?.type === 'rect' ? sprite : undefined);
        
        return {
            type: 'decoration',
            x: entity.position.x,
            y: entity.position.y,
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
                collider: entity.collider ? { ...entity.collider } : undefined
            }
        }
    }
}
