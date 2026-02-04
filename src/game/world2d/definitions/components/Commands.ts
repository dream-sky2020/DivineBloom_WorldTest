import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const commandsSchema = z.object({
    queue: z.array(z.any()).default([])
});

export type CommandsData = z.infer<typeof commandsSchema>;

export const Commands: IComponentDefinition<typeof commandsSchema, CommandsData> = {
    name: 'Commands',
    schema: commandsSchema,
    create(data: any[] | Partial<CommandsData> = []) {
        const input = Array.isArray(data) ? { queue: data } : data;
        return commandsSchema.parse(input);
    },
    serialize(component) {
        // Commands 队列通常是运行时的，不持久化
        return { queue: [] };
    },
    deserialize(data) {
        return this.create(data);
    }
};

export const CommandsSchema = commandsSchema;
