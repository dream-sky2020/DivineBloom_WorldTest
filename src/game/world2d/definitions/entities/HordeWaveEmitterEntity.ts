import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    Inspector, EDITOR_INSPECTOR_FIELDS,
    Transform, TRANSFORM_INSPECTOR_FIELDS,
    WaveEmitter
} from '@components';

export const HordeWaveEmitterEntitySchema = z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    name: z.string().optional().default('Horde Wave Emitter'),
    signal: z.string().default('wave_spawn_1'),
    interval: z.number().min(0).default(3),
    active: z.boolean().default(true),
    emitOnStart: z.boolean().default(false),
    payload: z.any().optional()
});

export type HordeWaveEmitterEntityData = z.infer<typeof HordeWaveEmitterEntitySchema>;

const INSPECTOR_FIELDS = [
    { path: 'name', label: '名称', type: 'text', group: '基础属性' },
    ...(TRANSFORM_INSPECTOR_FIELDS || []),
    { path: 'waveEmitter.active', label: '启用', type: 'checkbox', group: '波次' },
    { path: 'waveEmitter.signal', label: '发送信号', type: 'text', group: '波次' },
    { path: 'waveEmitter.interval', label: '间隔(秒)', type: 'number', props: { min: 0, step: 0.1 }, group: '波次' },
    { path: 'waveEmitter.emitOnStart', label: '开局发送一次', type: 'checkbox', group: '波次' },
    ...(EDITOR_INSPECTOR_FIELDS || [])
];

export const HordeWaveEmitterEntity: IEntityDefinition<typeof HordeWaveEmitterEntitySchema> = {
    type: 'horde_wave_emitter',
    name: '怪潮波次发信器',
    order: 13,
    creationIndex: 0,
    schema: HordeWaveEmitterEntitySchema,
    create(data: Partial<HordeWaveEmitterEntityData> = {}) {
        const result = HordeWaveEmitterEntitySchema.safeParse(data);
        if (!result.success) {
            console.error('[HordeWaveEmitterEntity] Validation failed', result.error);
            return null;
        }

        const { x, y, name, signal, interval, active, emitOnStart, payload } = result.data;
        const root = world.add({
            type: 'horde_wave_emitter',
            name,
            transform: Transform.create(x, y),
            waveEmitter: WaveEmitter.create({
                active,
                interval,
                signal,
                payload,
                emitOnStart
            })
        });

        root.inspector = Inspector.create({
            fields: INSPECTOR_FIELDS,
            hitPriority: 70,
            editorBox: { w: 20, h: 20, scale: 1 }
        });

        return root;
    },
    serialize(entity: any) {
        return {
            type: 'horde_wave_emitter',
            x: entity.transform?.x ?? 0,
            y: entity.transform?.y ?? 0,
            name: entity.name ?? 'Horde Wave Emitter',
            signal: entity.waveEmitter?.signal ?? 'wave_spawn_1',
            interval: entity.waveEmitter?.interval ?? 3,
            active: entity.waveEmitter?.active ?? true,
            emitOnStart: entity.waveEmitter?.emitOnStart ?? false,
            payload: entity.waveEmitter?.payload
        };
    },
    deserialize(data: any) {
        return this.create(data);
    }
};
