import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { MotionMode } from '../enums/Motion';
import { MotionStatus } from '../enums/MotionStatus';

const pointSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0)
});

const motionSchema = z.object({
  enabled: z.boolean().default(true),
  mode: z.nativeEnum(MotionMode).default(MotionMode.NONE),
  priority: z.number().int().default(0),

  // 通用运动学参数
  maxSpeed: z.number().default(120),
  minSpeed: z.number().default(0),
  acceleration: z.number().default(480),
  deceleration: z.number().default(480),
  stopDistance: z.number().default(2),
  deadZone: z.number().default(0),
  deadZoneAxis: z.object({
    x: z.number().default(0),
    y: z.number().default(0)
  }).default({ x: 0, y: 0 }),
  distanceSpeedFactor: z.number().default(0),
  turnRate: z.number().default(9999),

  // 目标定义：可按实体、标签或固定位置驱动
  target: z.object({
    entityId: z.string().nullable().default(null),
    tag: z.string().nullable().default(null),
    position: pointSchema.nullable().default(null),
    offset: pointSchema.default({ x: 0, y: 0 }),
    predictionTime: z.number().default(0)
  }).default({
    entityId: null,
    tag: null,
    position: null,
    offset: { x: 0, y: 0 },
    predictionTime: 0
  }),

  // 直线移动
  line: z.object({
    direction: pointSchema.default({ x: 1, y: 0 }),
    speed: z.number().default(0),
    worldSpace: z.boolean().default(true)
  }).default({
    direction: { x: 1, y: 0 },
    speed: 0,
    worldSpace: true
  }),

  // Steer/Homing 参数
  steer: z.object({
    enabled: z.boolean().default(false),
    seekWeight: z.number().default(1),
    arriveWeight: z.number().default(1),
    avoidWeight: z.number().default(0),
    separationWeight: z.number().default(0),
    maxForce: z.number().default(600)
  }).default({
    enabled: false,
    seekWeight: 1,
    arriveWeight: 1,
    avoidWeight: 0,
    separationWeight: 0,
    maxForce: 600
  }),

  // 环绕参数
  orbit: z.object({
    radius: z.number().default(0),
    angle: z.number().default(0),
    angularSpeed: z.number().default(0),
    clockwise: z.boolean().default(false),
    keepRadius: z.boolean().default(true)
  }).default({
    radius: 0,
    angle: 0,
    angularSpeed: 0,
    clockwise: false,
    keepRadius: true
  }),

  // 轨迹路径参数
  path: z.object({
    waypoints: z.array(pointSchema).default([]),
    currentIndex: z.number().int().min(0).default(0),
    loop: z.boolean().default(false),
    pingPong: z.boolean().default(false),
    reachDistance: z.number().default(6)
  }).default({
    waypoints: [],
    currentIndex: 0,
    loop: false,
    pingPong: false,
    reachDistance: 6
  }),

  // 波动轨迹参数（可叠加于 line/follow）
  wave: z.object({
    enabled: z.boolean().default(false),
    axis: z.enum(['x', 'y', 'normal']).default('normal'),
    amplitude: z.number().default(0),
    frequency: z.number().default(0),
    phase: z.number().default(0)
  }).default({
    enabled: false,
    axis: 'normal',
    amplitude: 0,
    frequency: 0,
    phase: 0
  }),

  // 运行时状态（运动系统维护）
  runtime: z.object({
    elapsedTime: z.number().default(0),
    pathDirection: z.union([z.literal(1), z.literal(-1)]).default(1),
    initialized: z.boolean().default(false),
    status: z.nativeEnum(MotionStatus).default(MotionStatus.IDLE),
    statusTime: z.number().default(0),
    stuckTimer: z.number().default(0),
    lastPosition: pointSchema.nullable().default(null),
    currentSpeed: z.number().default(0),
    desiredVelocity: pointSchema.default({ x: 0, y: 0 }),
    teleportRequest: z.object({
      x: z.number(),
      y: z.number(),
      keepVelocity: z.boolean().default(false),
      sourcePortalId: z.string().optional()
    }).nullable().default(null),

    // 感知系统写入的临时状态
    hasTarget: z.boolean().default(false),
    targetEntityId: z.string().nullable().default(null),
    targetPos: pointSchema.nullable().default(null),
    portalSense: z.any().optional() // 弱类型引用，避免循环依赖
  }).default({
    elapsedTime: 0,
    pathDirection: 1,
    initialized: false,
    status: MotionStatus.IDLE,
    statusTime: 0,
    stuckTimer: 0,
    lastPosition: null,
    currentSpeed: 0,
    desiredVelocity: { x: 0, y: 0 },
    teleportRequest: null,
    hasTarget: false,
    targetEntityId: null,
    targetPos: null
  })
});

export type MotionData = z.infer<typeof motionSchema>;

export const Motion: IComponentDefinition<typeof motionSchema, MotionData> = {
  name: 'Motion',
  schema: motionSchema,
  create(data: Partial<MotionData> = {}) {
    return motionSchema.parse(data);
  },
  serialize(component) {
    return {
      ...component,
      runtime: {
        elapsedTime: 0,
        pathDirection: 1,
        initialized: false,
        status: MotionStatus.IDLE,
        statusTime: 0,
        stuckTimer: 0,
        lastPosition: null,
        currentSpeed: 0,
        desiredVelocity: { x: 0, y: 0 },
        teleportRequest: null,
        hasTarget: false,
        targetEntityId: null,
        targetPos: null
      }
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'motion.enabled', label: '启用运动', type: 'checkbox', group: '运动控制 (Motion)' },
    { path: 'motion.mode', label: '运动模式', type: 'select', props: { options: Object.values(MotionMode) }, group: '运动控制 (Motion)' },
    { path: 'motion.maxSpeed', label: '最大速度', type: 'number', props: { step: 10 }, group: '运动控制 (Motion)' },
    { path: 'motion.acceleration', label: '加速度', type: 'number', props: { step: 10 }, group: '运动控制 (Motion)' },
    { path: 'motion.deceleration', label: '减速度', type: 'number', props: { step: 10 }, group: '运动控制 (Motion)' },
    { path: 'motion.stopDistance', label: '停止半径', type: 'number', props: { step: 1 }, group: '运动控制 (Motion)' },
    { path: 'motion.deadZoneAxis.x', label: '轴向死区 X', type: 'number', props: { step: 1 }, group: '运动控制 (Motion)' },
    { path: 'motion.deadZoneAxis.y', label: '轴向死区 Y', type: 'number', props: { step: 1 }, group: '运动控制 (Motion)' },
    { path: 'motion.distanceSpeedFactor', label: '距离增速系数', type: 'number', props: { step: 0.1 }, group: '运动控制 (Motion)' },
    { path: 'motion.target.entityId', label: '目标实体', type: 'text', group: '运动目标 (Motion)' },
    { path: 'motion.target.tag', label: '目标标签', type: 'text', group: '运动目标 (Motion)' },
    { path: 'motion.target.position', label: '目标坐标', type: 'json', group: '运动目标 (Motion)' },
    { path: 'motion.target.offset.x', label: '目标偏移 X', type: 'number', props: { step: 1 }, group: '运动目标 (Motion)' },
    { path: 'motion.target.offset.y', label: '目标偏移 Y', type: 'number', props: { step: 1 }, group: '运动目标 (Motion)' },
    { path: 'motion.line.direction.x', label: '直线方向 X', type: 'number', props: { step: 0.01 }, group: '直线运动 (Motion)' },
    { path: 'motion.line.direction.y', label: '直线方向 Y', type: 'number', props: { step: 0.01 }, group: '直线运动 (Motion)' },
    { path: 'motion.line.speed', label: '直线速度', type: 'number', props: { step: 10 }, group: '直线运动 (Motion)' },
    { path: 'motion.orbit.radius', label: '环绕半径', type: 'number', props: { step: 1 }, group: '环绕运动 (Motion)' },
    { path: 'motion.orbit.angularSpeed', label: '环绕角速度', type: 'number', props: { step: 0.1 }, group: '环绕运动 (Motion)' },
    { path: 'motion.path.waypoints', label: '路径点', type: 'json', group: '路径运动 (Motion)' },
    { path: 'motion.path.loop', label: '路径循环', type: 'checkbox', group: '路径运动 (Motion)' },
    { path: 'motion.path.pingPong', label: '路径往返', type: 'checkbox', group: '路径运动 (Motion)' },
    { path: 'motion.wave.enabled', label: '启用波动', type: 'checkbox', group: '波动运动 (Motion)' },
    { path: 'motion.wave.amplitude', label: '波动振幅', type: 'number', props: { step: 1 }, group: '波动运动 (Motion)' },
    { path: 'motion.wave.frequency', label: '波动频率', type: 'number', props: { step: 0.1 }, group: '波动运动 (Motion)' },
    { path: 'motion.runtime.status', label: '当前状态', type: 'text', props: { readonly: true }, group: '运行时 (Debug)' },
    { path: 'motion.runtime.currentSpeed', label: '当前速度', type: 'number', props: { readonly: true, step: 0.1 }, group: '运行时 (Debug)' }
  ]
};

export const MotionSchema = motionSchema;
export const MOTION_INSPECTOR_FIELDS = Motion.inspectorFields;
