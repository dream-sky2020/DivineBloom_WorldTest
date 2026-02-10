import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    Actions,
    Inspector, EDITOR_INSPECTOR_FIELDS,
    Transform, TRANSFORM_INSPECTOR_FIELDS,
    Trigger
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
    signal: z.string().default('wave_spawn_1'),
    enemyName: z.string().optional(),
    enemyOptions: hordeEnemyOptionsSchema.default({} as any)
});

export type HordeEnemySpawnerEntityData = z.infer<typeof HordeEnemySpawnerEntitySchema>;

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', group: '基础属性' },
    ...(TRANSFORM_INSPECTOR_FIELDS || []),
    { path: 'trigger.rules.0.signal', label: '监听信号', type: 'text', group: '生成器' },
    { path: 'actionCreateEntity.customData.name', label: '敌人名称', type: 'text', group: '生成器' },
    { path: 'actionCreateEntity.customData.options.spriteId', label: '敌人 Sprite', type: 'text', group: '生成器' },
    { path: 'actionCreateEntity.customData.options.baseSpeed', label: '敌人速度', type: 'number', props: { min: 0, step: 10 }, group: '生成器' },
    { path: 'actionCreateEntity.customData.options.maxHealth', label: '敌人生命', type: 'number', props: { min: 1, step: 1 }, group: '生成器' },
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const HordeEnemySpawnerEntity: IEntityDefinition<typeof HordeEnemySpawnerEntitySchema> = {
    type: 'horde_enemy_spawner',
    name: '怪潮生成器',
    order: 12,
    creationIndex: 0,
    schema: HordeEnemySpawnerEntitySchema,
    create(data: HordeEnemySpawnerEntityData) {
        const result = HordeEnemySpawnerEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[HordeEnemySpawnerEntity] Validation failed', result.error);
            return null;
        }

        const { x, y, name, signal, enemyName, enemyOptions } = result.data;
        const root = world.add({
            type: 'horde_enemy_spawner',
            name,
            transform: Transform.create(x, y),
            trigger: Trigger.create({
                rules: [{ type: 'onSignal', signal }],
                actions: ['CREATE_ENTITY'],
                defaultCooldown: 0
            }),
            actionCreateEntity: Actions.CreateEntity({
                entityType: 'horde_enemy',
                customData: {
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
            signal: entity.trigger?.rules?.[0]?.signal ?? 'wave_spawn_1',
            enemyName: entity.actionCreateEntity?.customData?.name,
            enemyOptions: entity.actionCreateEntity?.customData?.options ?? {}
        };
    },
    deserialize(data: any) {
        return this.create(data);
    }
};
