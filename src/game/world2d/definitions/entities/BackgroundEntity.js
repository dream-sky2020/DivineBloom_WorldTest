import { z } from 'zod'
import { world } from '@world2d/world'
import { Sprite, SPRITE_INSPECTOR_FIELDS, Inspector, EDITOR_INSPECTOR_FIELDS, Transform, TRANSFORM_INSPECTOR_FIELDS } from '@components'
import { createLogger } from '@/utils/logger'

const logger = createLogger('BackgroundEntity')

// --- Schema Definitions ---

export const BackgroundGroundSchema = z.object({
    width: z.number().default(2000),
    height: z.number().default(2000),
    color: z.string().default('#000000')
});

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', group: '基本属性' },
    ...TRANSFORM_INSPECTOR_FIELDS,
    { path: 'rect.width', label: '宽度', type: 'number', group: '几何尺寸' },
    { path: 'rect.height', label: '高度', type: 'number', group: '几何尺寸' },
    ...SPRITE_INSPECTOR_FIELDS,
    ...EDITOR_INSPECTOR_FIELDS
];

// --- Entity Definition ---

export const BackgroundEntity = {
    /**
     * 创建地面实体
     * @param {Partial<z.infer<typeof BackgroundGroundSchema>>} data 
     */
    create(data = {}) {
        const result = BackgroundGroundSchema.safeParse(data);
        if (!result.success) {
            logger.error('Ground validation failed', result.error);
            return null;
        }

        const d = result.data;

        const entity = {
            type: 'background_ground',
            name: 'Ground',
            transform: Transform(0, 0),
            sprite: Sprite.create('rect', { tint: d.color }),
            rect: { width: d.width, height: d.height },
            zIndex: -100,
        };

        entity.inspector = Inspector.create({
            tagName: 'Background',
            tagColor: '#64748b',
            fields: INSPECTOR_FIELDS,
            allowDelete: false,
            hitPriority: 10,
            editorBox: { w: d.width, h: d.height, anchorX: 0, anchorY: 0 }
        });

        return world.add(entity);
    },

    /**
     * 旧版兼容方法
     */
    createGround(width, height, color) {
        return this.create({ width, height, color });
    },

    serialize(entity) {
        return {
            type: 'background_ground',
            width: entity.rect?.width,
            height: entity.rect?.height,
            color: entity.sprite?.tint
        };
    }
}
