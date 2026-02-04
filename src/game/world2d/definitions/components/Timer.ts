import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const timerSchema = z.object({
    totalTime: z.number().default(0), // 累计运行时间（秒）
    running: z.boolean().default(true) // 是否正在计时
});

export type TimerData = z.infer<typeof timerSchema>;

export const Timer: IComponentDefinition<typeof timerSchema, TimerData> = {
    name: 'Timer',
    schema: timerSchema,
    create(data: Partial<TimerData> = {}) {
        return timerSchema.parse(data);
    },
    serialize(component) {
        return { ...component };
    },
    deserialize(data) {
        return this.create(data);
    }
};

export const TimerSchema = timerSchema;
