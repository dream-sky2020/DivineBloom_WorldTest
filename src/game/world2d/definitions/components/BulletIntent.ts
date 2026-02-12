import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const bulletIntentSchema = z.object({
  // 移动意图：描述本帧/下一阶段想要如何移动
  movementIntent: z.object({
    enabled: z.boolean().default(false),
    direction: z.object({
      x: z.number().default(0),
      y: z.number().default(0)
    }).default({ x: 0, y: 0 }),
    speed: z.number().default(0),
    acceleration: z.number().default(0)
  }).default({
    enabled: false,
    direction: { x: 0, y: 0 },
    speed: 0,
    acceleration: 0
  }),

  // 大小变更意图：例如子弹扩张/收缩
  sizeChangeIntent: z.object({
    enabled: z.boolean().default(false),
    targetRadius: z.number().nullable().default(null),
    deltaRadius: z.number().default(0)
  }).default({
    enabled: false,
    targetRadius: null,
    deltaRadius: 0
  }),

  // 销毁意图：是否需要在后续系统销毁该子弹
  destroyIntent: z.object({
    shouldDestroy: z.boolean().default(false),
    reason: z.string().nullable().default(null)
  }).default({
    shouldDestroy: false,
    reason: null
  }),

  // 创建意图：用于分裂/衍生子弹，记录待创建请求
  createIntent: z.object({
    requests: z.array(z.object({
      direction: z.object({
        x: z.number().default(0),
        y: z.number().default(0)
      }).default({ x: 0, y: 0 }),
      speed: z.number().default(0),
      damageScale: z.number().default(1),
      lifeTimeScale: z.number().default(1),
      radiusScale: z.number().default(1)
    })).default([])
  }).default({
    requests: []
  }),

  // 命中次数消耗意图：命中后由系统消费 damage.remainingHitCount
  penetrationConsumeIntent: z.object({
    enabled: z.boolean().default(false),
    consumeCount: z.number().int().min(0).default(0)
  }).default({
    enabled: false,
    consumeCount: 0
  }),

  // 反弹次数消耗意图：反弹后由系统消费 bounce.remainingBounces
  bounceConsumeIntent: z.object({
    enabled: z.boolean().default(false),
    consumeCount: z.number().int().min(0).default(0)
  }).default({
    enabled: false,
    consumeCount: 0
  })
});

export type BulletIntentData = z.infer<typeof bulletIntentSchema>;

export const BulletIntent: IComponentDefinition<typeof bulletIntentSchema, BulletIntentData> = {
  name: 'BulletIntent',
  schema: bulletIntentSchema,
  create(config: Partial<BulletIntentData> = {}) {
    return bulletIntentSchema.parse(config);
  },
  serialize(component) {
    return {
      ...component,
      // 运行时动作意图重置，防止场景重载重复触发
      destroyIntent: {
        ...component.destroyIntent,
        shouldDestroy: false,
        reason: null
      },
      createIntent: {
        ...component.createIntent,
        requests: []
      },
      penetrationConsumeIntent: {
        ...component.penetrationConsumeIntent,
        enabled: false,
        consumeCount: 0
      },
      bounceConsumeIntent: {
        ...component.bounceConsumeIntent,
        enabled: false,
        consumeCount: 0
      }
    };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'bulletIntent.movementIntent.enabled', label: '启用移动意图', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.movementIntent.direction.x', label: '移动方向 X', type: 'number', props: { step: 0.01 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.movementIntent.direction.y', label: '移动方向 Y', type: 'number', props: { step: 0.01 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.movementIntent.speed', label: '移动速度', type: 'number', props: { step: 10 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.movementIntent.acceleration', label: '移动加速度', type: 'number', props: { step: 10 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.sizeChangeIntent.enabled', label: '启用大小变更意图', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.sizeChangeIntent.targetRadius', label: '目标半径', type: 'number', props: { step: 0.1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.sizeChangeIntent.deltaRadius', label: '半径增量', type: 'number', props: { step: 0.1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.penetrationConsumeIntent.enabled', label: '启用命中消耗意图', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.penetrationConsumeIntent.consumeCount', label: '命中消耗次数', type: 'number', props: { min: 0, step: 1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.bounceConsumeIntent.enabled', label: '启用反弹消耗意图', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.bounceConsumeIntent.consumeCount', label: '反弹消耗次数', type: 'number', props: { min: 0, step: 1 }, group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.destroyIntent.shouldDestroy', label: '请求销毁', type: 'checkbox', group: '子弹意图 (BulletIntent)' },
    { path: 'bulletIntent.createIntent.requests', label: '创建请求', type: 'json', group: '子弹意图 (BulletIntent)' }
  ]
};

export const BulletIntentSchema = bulletIntentSchema;
export const BULLET_INTENT_INSPECTOR_FIELDS = BulletIntent.inspectorFields;
