import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const motionSteerProfileSchema = z.object({
  enabled: z.boolean().default(true),
  profileId: z.string().default('default'),

  // 速度调制（用于不同实体共享 Motion 但呈现不同“脊髓反射”强度）
  speedScale: z.number().default(1),
  distanceSpeedScale: z.number().default(1),

  weights: z.object({
    seek: z.number().default(1),
    arrive: z.number().default(1),
    separation: z.number().default(0),
    avoidObstacle: z.number().default(0),
    portalAttract: z.number().default(0)
  }).default({
    seek: 1,
    arrive: 1,
    separation: 0,
    avoidObstacle: 0,
    portalAttract: 0
  }),

  portal: z.object({
    enabled: z.boolean().default(false),
    minBenefitDistance: z.number().default(100),
    maxPortalApproachDistance: z.number().default(800),
    preferPortalWhenNoTarget: z.boolean().default(false)
  }).default({
    enabled: false,
    minBenefitDistance: 100,
    maxPortalApproachDistance: 800,
    preferPortalWhenNoTarget: false
  })
});

export type MotionSteerProfileData = z.infer<typeof motionSteerProfileSchema>;

export const MotionSteerProfile: IComponentDefinition<typeof motionSteerProfileSchema, MotionSteerProfileData> = {
  name: 'MotionSteerProfile',
  schema: motionSteerProfileSchema,
  create(data: Partial<MotionSteerProfileData> = {}) {
    return motionSteerProfileSchema.parse(data);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'motionSteerProfile.enabled', label: '启用策略', type: 'checkbox', group: '运动策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.profileId', label: '策略 ID', type: 'text', group: '运动策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.speedScale', label: '速度倍率', type: 'number', props: { step: 0.1 }, group: '运动策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.distanceSpeedScale', label: '距离增速倍率', type: 'number', props: { step: 0.1 }, group: '运动策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.seek', label: 'Seek 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.arrive', label: 'Arrive 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.portalAttract', label: '传送门吸引权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.enabled', label: '启用传送门捷径', type: 'checkbox', group: '传送门策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.minBenefitDistance', label: '最小收益距离', type: 'number', props: { step: 10 }, group: '传送门策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.maxPortalApproachDistance', label: '最大接近距离', type: 'number', props: { step: 10 }, group: '传送门策略 (MotionSteerProfile)' }
  ]
};

export const MotionSteerProfileSchema = motionSteerProfileSchema;
export const MOTION_STEER_PROFILE_INSPECTOR_FIELDS = MotionSteerProfile.inspectorFields;
