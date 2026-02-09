import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const triggerSignalSchema = z.object({
    queue: z.array(z.object({
        signal: z.string(),
        payload: z.any().optional(),
        source: z.any().optional(),
        target: z.any().optional()
    })).default([])
});

export type TriggerSignalData = z.infer<typeof triggerSignalSchema>;

export const TriggerSignal: IComponentDefinition<typeof triggerSignalSchema, TriggerSignalData> = {
    name: 'TriggerSignal',
    schema: triggerSignalSchema,
    create(config: Partial<TriggerSignalData> = {}) {
        return triggerSignalSchema.parse(config);
    },
    serialize(component) {
        // 信号队列为运行时数据，不持久化
        return { queue: [] };
    },
    deserialize(data) {
        return this.create(data);
    }
};

export const TriggerSignalSchema = triggerSignalSchema;
