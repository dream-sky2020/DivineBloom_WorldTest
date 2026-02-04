import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

// --- Scene Transition Request ---
const sceneTransitionSchema = z.object({
    mapId: z.string(),
    entryId: z.string(),
    transitionType: z.string().default('fade')
});

export type SceneTransitionData = z.infer<typeof sceneTransitionSchema>;

export const SceneTransition: IComponentDefinition<typeof sceneTransitionSchema, SceneTransitionData> = {
    name: 'SceneTransition',
    schema: sceneTransitionSchema,
    create(data: SceneTransitionData) {
        // data must have mapId and entryId
        return sceneTransitionSchema.parse(data);
    },
    serialize(component) {
        // Requests are transient, usually not serialized, but can be if saving mid-transition
        return { ...component };
    },
    deserialize(data) {
        return this.create(data);
    }
};

export const SceneTransitionSchema = sceneTransitionSchema;
