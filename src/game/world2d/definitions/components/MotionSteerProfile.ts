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
    flee: z.number().default(0),
    arrive: z.number().default(1),
    wander: z.number().default(0),
    separation: z.number().default(0),
    avoidObstacle: z.number().default(0),
    portalAttract: z.number().default(0)
  }).default({
    seek: 1,
    flee: 0,
    arrive: 1,
    wander: 0,
    separation: 0,
    avoidObstacle: 0,
    portalAttract: 0
  }),

  // 游荡参数
  wander: z.object({
    radius: z.number().default(50),
    distance: z.number().default(100),
    jitter: z.number().default(10)
  }).default({
    radius: 50,
    distance: 100,
    jitter: 10
  }),

  // 感知参数（用于分离与避障）
  sensing: z.object({
    separationRadius: z.number().default(50),
    obstacleCheckDistance: z.number().default(100),
    obstacleCheckRadius: z.number().default(30)
  }).default({
    separationRadius: 50,
    obstacleCheckDistance: 100,
    obstacleCheckRadius: 30
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
    { path: 'motionSteerProfile.weights.flee', label: 'Flee 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.arrive', label: 'Arrive 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.wander', label: 'Wander 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.separation', label: 'Separation 权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.avoidObstacle', label: '避障权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.weights.portalAttract', label: '传送门吸引权重', type: 'number', props: { step: 0.1 }, group: 'Steer 权重 (MotionSteerProfile)' },

    { path: 'motionSteerProfile.sensing.separationRadius', label: '分离半径', type: 'number', props: { step: 10 }, group: '感知参数 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.sensing.obstacleCheckDistance', label: '避障检测距离', type: 'number', props: { step: 10 }, group: '感知参数 (MotionSteerProfile)' },

    { path: 'motionSteerProfile.wander.radius', label: '游荡半径', type: 'number', props: { step: 10 }, group: '游荡参数 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.wander.distance', label: '游荡距离', type: 'number', props: { step: 10 }, group: '游荡参数 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.wander.jitter', label: '游荡抖动', type: 'number', props: { step: 1 }, group: '游荡参数 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.enabled', label: '启用传送门捷径', type: 'checkbox', group: '传送门策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.minBenefitDistance', label: '最小收益距离', type: 'number', props: { step: 10 }, group: '传送门策略 (MotionSteerProfile)' },
    { path: 'motionSteerProfile.portal.maxPortalApproachDistance', label: '最大接近距离', type: 'number', props: { step: 10 }, group: '传送门策略 (MotionSteerProfile)' }
  ]
};

export const MotionSteerProfileSchema = motionSteerProfileSchema;
export const MOTION_STEER_PROFILE_INSPECTOR_FIELDS = MotionSteerProfile.inspectorFields;
