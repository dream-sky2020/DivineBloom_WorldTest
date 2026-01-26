import { z } from 'zod'
import { world } from '@world2d/world'
import { Sprite } from '@world2d/entities/components/Sprite'
import { Inspector, EDITOR_INSPECTOR_FIELDS, SPRITE_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector'
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
    { path: 'rect.width', label: '宽度', type: 'number', group: '几何尺寸' },
    { path: 'rect.height', label: '高度', type: 'number', group: '几何尺寸' },
    ...SPRITE_INSPECTOR_FIELDS,
    ...EDITOR_INSPECTOR_FIELDS
];

// --- Entity Definition ---

export const BackgroundEntity = {
    createGround(width, height, color) {
        const result = BackgroundGroundSchema.safeParse({ width, height, color });
        if (!result.success) {
            logger.error('Ground validation failed', result.error);
            return null;
        }

        const d = result.data;

        const entity = {
            type: 'background_ground',
            name: 'Ground',
            position: { x: 0, y: 0 },
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

    serialize(entity) {
        return null
    }
}
