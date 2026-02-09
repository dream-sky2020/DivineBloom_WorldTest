import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const followSchema = z.object({
    target: z.string().default(''),
    speed: z.number().default(0),
    offset: z.object({
        x: z.number().default(0),
        y: z.number().default(0)
    }).default({ x: 0, y: 0 }),
    range: z.object({
        x: z.number().default(0),
        y: z.number().default(0)
    }).default({ x: 0, y: 0 }),
    linearAccelFactor: z.number().default(0),
    orbitAngle: z.number().default(0),
    orbitSpeed: z.number().default(0)
});

export type FollowData = z.infer<typeof followSchema>;

export const Follow: IComponentDefinition<typeof followSchema, FollowData> = {
    name: 'Follow',
    schema: followSchema,
    create(data: Partial<FollowData> = {}) {
        return followSchema.parse(data);
    },
    serialize(component) {
        return { ...component };
    },
    deserialize(data) {
        return this.create(data);
    },
    inspectorFields: [
        { path: 'follow.target', label: '跟随目标', type: 'string', tip: '目标实体 ID 或标签', group: '跟随 (Follow)' },
        { path: 'follow.speed', label: '基础速度', type: 'number', props: { step: 10 }, group: '跟随 (Follow)' },
        { path: 'follow.offset.x', label: '偏移 X', type: 'number', props: { step: 10 }, group: '跟随 (Follow)' },
        { path: 'follow.offset.y', label: '偏移 Y', type: 'number', props: { step: 10 }, group: '跟随 (Follow)' },
        { path: 'follow.range.x', label: '范围 X', type: 'number', props: { step: 10 }, tip: '超过范围才跟随，0 表示始终移动到目标+偏移', group: '跟随 (Follow)' },
        { path: 'follow.range.y', label: '范围 Y', type: 'number', props: { step: 10 }, tip: '超过范围才跟随，0 表示始终移动到目标+偏移', group: '跟随 (Follow)' },
        { path: 'follow.linearAccelFactor', label: '线性加速系数', type: 'number', props: { step: 0.1 }, tip: '距离越远，速度越大', group: '跟随 (Follow)' },
        { path: 'follow.orbitAngle', label: '旋转角度', type: 'number', props: { step: 0.1 }, tip: '偏移旋转角度（弧度）', group: '跟随 (Follow)' },
        { path: 'follow.orbitSpeed', label: '旋转速度', type: 'number', props: { step: 0.1 }, tip: '每秒角速度（弧度/秒）', group: '跟随 (Follow)' }
    ]
};

export const FollowSchema = followSchema;
export const FOLLOW_INSPECTOR_FIELDS = Follow.inspectorFields;