import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const waveEmitterSchema = z.object({
    active: z.boolean().default(true),
    interval: z.number().min(0).default(3),
    signal: z.string().default('horde_spawn_tick'),
    payload: z.any().optional(),
    elapsed: z.number().min(0).default(0),
    emitOnStart: z.boolean().default(false),
    emittedOnStart: z.boolean().default(false)
});

export type WaveEmitterData = z.infer<typeof waveEmitterSchema>;

export const WaveEmitter: IComponentDefinition<typeof waveEmitterSchema, WaveEmitterData> = {
    name: 'WaveEmitter',
    schema: waveEmitterSchema,
    create(data: Partial<WaveEmitterData> = {}) {
        return waveEmitterSchema.parse(data);
    },
    serialize(component) {
        return {
            active: component.active,
            interval: component.interval,
            signal: component.signal,
            payload: component.payload,
            elapsed: 0,
            emitOnStart: component.emitOnStart,
            emittedOnStart: false
        };
    },
    deserialize(data) {
        return this.create(data);
    }
};

export const WaveEmitterSchema = waveEmitterSchema;
