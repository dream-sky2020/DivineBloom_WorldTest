import { z } from 'zod';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { IEntityDefinition } from '../interface/IEntity';
import { 
    Sprite, SPRITE_INSPECTOR_FIELDS, 
    Inspector, EDITOR_INSPECTOR_FIELDS, 
    Transform, TRANSFORM_INSPECTOR_FIELDS
} from '@components';
import { SpriteMode } from '../enums/SpriteMode';
import { createLogger } from '@/utils/logger';

const logger = createLogger('BackgroundEntity');

// --- Schema Definitions ---

export const BackgroundGroundSchema = z.object({
    width: z.number().default(2000),
    height: z.number().default(2000),
    color: z.string().default('#000000'),
    assetId: z.string().optional(), // 如果提供，则使用平铺图片
    tileScale: z.number().default(1)
});

export type BackgroundGroundData = z.infer<typeof BackgroundGroundSchema>;

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', group: '基本属性' },
    ...(TRANSFORM_INSPECTOR_FIELDS || []),
    // Include Sprite fields
    ...(SPRITE_INSPECTOR_FIELDS || []),
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

// --- Entity Definition ---

export const BackgroundEntity: IEntityDefinition<typeof BackgroundGroundSchema> = {
    type: 'background_ground',
    name: '地面',
    order: 50,
    creationIndex: 0,
    schema: BackgroundGroundSchema,
    /**
     * 创建地面实体
     * @param {Partial<z.infer<typeof BackgroundGroundSchema>>} data 
     */
    create(data: Partial<BackgroundGroundData> = {}) {
        const result = BackgroundGroundSchema.safeParse(data);
        if (!result.success) {
            logger.error('Ground validation failed', result.error);
            return null;
        }

        const d = result.data;

        const mode = d.assetId ? SpriteMode.REPEAT : SpriteMode.RECT;
        const spriteId = d.assetId || 'rect';

        const entity = {
            type: 'background_ground',
            name: d.assetId ? `Background (${d.assetId})` : 'Ground',
            transform: Transform.create(0, 0),
            sprite: Sprite.create(spriteId, { 
                mode, 
                tint: d.color,
                tileScale: d.tileScale,
                width: d.width,
                height: d.height
            }),
            zIndex: -100,
            inspector: null as any
        };

        entity.inspector = Inspector.create({
            tagName: 'Background',
            tagColor: '#64748b',
            fields: INSPECTOR_FIELDS,
            allowDelete: false,
            hitPriority: 10,
            editorBox: { w: 40, h: 40, anchorX: 0, anchorY: 0 }
        });

        return world.add(entity);
    },

    // Deprecated: Use EntitySerializer
    serialize(entity: any) {
        return {
            type: 'background_ground',
            width: entity.sprite?.width,
            height: entity.sprite?.height,
            color: entity.sprite?.tint,
            assetId: entity.sprite?.mode === SpriteMode.REPEAT ? entity.sprite.id : undefined,
            tileScale: entity.sprite?.tileScale
        };
    },

    deserialize(data: any) {
        return this.create(data);
    }
}
