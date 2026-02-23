import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    Spawn,
    Inspector, EDITOR_INSPECTOR_FIELDS,
    Transform, TRANSFORM_INSPECTOR_FIELDS
} from '@components';

const hordeEnemyOptionsSchema = z.object({
    spriteId: z.string().default('enemy_slime'),
    scale: z.number().optional(),
    strategy: z.enum(['chase', 'steering']).default('chase'),
    baseSpeed: z.number().default(80),
    visionRadius: z.number().default(500),
    maxHealth: z.number().default(50)
});

export const HordeEnemySpawnerEntitySchema = z.object({
    x: z.number(),
    y: z.number(),
    name: z.string().optional().default('Horde Spawner'),
    spawnEnabled: z.boolean().default(true),
    spawnLimit: z.number().min(0).default(50),
    spawnInterval: z.number().min(0).default(3),
    spawnBatchSize: z.number().min(1).default(1),
    spawnGroup: z.string().default('monster'),
    enemyName: z.string().optional(),
    enemyOptions: hordeEnemyOptionsSchema.default({} as any)
});

export type HordeEnemySpawnerEntityData = z.infer<typeof HordeEnemySpawnerEntitySchema>;

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', group: '基础属性' },
    ...(TRANSFORM_INSPECTOR_FIELDS || []),
    { path: 'spawn.enabled', label: '启用产卵', type: 'checkbox', group: '生成器' },
    { path: 'spawn.spawnLimit', label: '产卵上限', type: 'number', props: { min: 0, step: 1 }, group: '生成器' },
    { path: 'spawn.spawnInterval', label: '产卵间隔', type: 'number', props: { min: 0, step: 0.1 }, group: '生成器' },
    { path: 'spawn.spawnBatchSize', label: '每批数量', type: 'number', props: { min: 1, step: 1 }, group: '生成器' },
    { path: 'spawn.spawnGroup', label: '生成分组', type: 'text', group: '生成器' },
    { path: 'spawn.spawnEntityId', label: '产卵实体 ID', type: 'text', group: '生成器' },
    { path: 'spawn.spawnPosition.mode', label: '生成范围模式', type: 'select', props: { options: ['self', 'target', 'offset', 'randomRadius', 'randomRect'] }, group: '生成器' },
    { path: 'spawn.spawnPosition.radius', label: '圆形半径', type: 'number', props: { min: 0, step: 1 }, group: '生成器' },
    { path: 'spawn.spawnPosition.rectWidth', label: '矩形宽度', type: 'number', props: { min: 0, step: 1 }, group: '生成器' },
    { path: 'spawn.spawnPosition.rectHeight', label: '矩形高度', type: 'number', props: { min: 0, step: 1 }, group: '生成器' },
    { path: 'spawn.spawnParams.name', label: '敌人名称', type: 'text', group: '生成器' },
    { path: 'spawn.spawnParams.options.spriteId', label: '敌人 Sprite', type: 'text', group: '生成器' },
    { path: 'spawn.spawnParams.options.baseSpeed', label: '敌人速度', type: 'number', props: { min: 0, step: 10 }, group: '生成器' },
    { path: 'spawn.spawnParams.options.maxHealth', label: '敌人生命', type: 'number', props: { min: 1, step: 1 }, group: '生成器' },
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const HordeEnemySpawnerEntity: IEntityDefinition<typeof HordeEnemySpawnerEntitySchema> = {
    type: 'horde_enemy_spawner',
    name: '怪潮生成器',
    order: 12,
    creationIndex: 0,
    schema: HordeEnemySpawnerEntitySchema,
    create(data: HordeEnemySpawnerEntityData) {
        const normalizedData = {
            ...(data as any),
            spawnGroup: (data as any)?.spawnGroup ?? (data as any)?.countByComponent
        };
        const result = HordeEnemySpawnerEntitySchema.safeParse(normalizedData);
        if (!result.success) {
            console.error('[HordeEnemySpawnerEntity] Validation failed', result.error);
            return null;
        }

        const {
            x,
            y,
            name,
            spawnEnabled,
            spawnLimit,
            spawnInterval,
            spawnBatchSize,
            spawnGroup,
            enemyName,
            enemyOptions
        } = result.data;
        const root = world.add({
            type: 'horde_enemy_spawner',
            name,
            transform: Transform.create(x, y),
            spawn: Spawn.create({
                enabled: spawnEnabled,
                spawnLimit,
                spawnInterval,
                cooldown: 0,
                spawnBatchSize,
                spawnGroup,
                spawnEntityId: 'horde_enemy',
                spawnPosition: {
                    mode: 'self',
                    offsetX: 0,
                    offsetY: 0,
                    radius: 120,
                    rectWidth: 240,
                    rectHeight: 160
                },
                spawnParams: {
                    name: enemyName,
                    options: enemyOptions
                }
            })
        });

        root.inspector = Inspector.create({
            fields: INSPECTOR_FIELDS,
            hitPriority: 70,
            editorBox: { w: 24, h: 24, scale: 1 }
        });

        return root;
    },
    serialize(entity: any) {
        return {
            type: 'horde_enemy_spawner',
            x: entity.transform?.x ?? 0,
            y: entity.transform?.y ?? 0,
            name: entity.name ?? 'Horde Spawner',
            spawnEnabled: entity.spawn?.enabled ?? true,
            spawnLimit: entity.spawn?.spawnLimit ?? 50,
            spawnInterval: entity.spawn?.spawnInterval ?? 3,
            spawnBatchSize: entity.spawn?.spawnBatchSize ?? 1,
            spawnGroup: entity.spawn?.spawnGroup ?? 'monster',
            enemyName: entity.spawn?.spawnParams?.name,
            enemyOptions: entity.spawn?.spawnParams?.options ?? {}
        };
    },
    deserialize(data: any) {
        return this.create(data);
    }
};
