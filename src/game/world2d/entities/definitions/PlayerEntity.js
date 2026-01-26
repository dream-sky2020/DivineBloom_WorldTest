import { z } from 'zod'
import { world } from '@world2d/world'
import { PlayerConfig } from '@schema/assets'
import { Sprite } from '@world2d/entities/components/Sprite'
import { Animation } from '@world2d/entities/components/Animation'
import { Physics } from '@world2d/entities/components/Physics'
import { Detectable } from '@world2d/entities/components/Triggers'
import { Inspector, EDITOR_INSPECTOR_FIELDS, SPRITE_INSPECTOR_FIELDS } from '@world2d/entities/components/Inspector'

// --- Schema Definition ---

export const PlayerEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Player'),
  scale: z.number().optional().default(0.7)
});

// --- Entity Definition ---

const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  { path: 'position.x', label: '坐标 X', type: 'number', group: '基本属性' },
  { path: 'position.y', label: '坐标 Y', type: 'number', group: '基本属性' },
  { path: 'speed', label: '基础速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  { path: 'fastSpeed', label: '奔跑速度', type: 'number', props: { min: 0, step: 10 }, group: '角色属性' },
  ...SPRITE_INSPECTOR_FIELDS,
  ...EDITOR_INSPECTOR_FIELDS
];

export const PlayerEntity = {
  create(data) {
    const result = PlayerEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[PlayerEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, scale } = result.data;

    const entity = {
      type: 'player',
      name: name,
      position: { x, y },
      velocity: Physics.Velocity(),
      detectable: Detectable(['player', 'teleportable']),
      input: true,
      player: true,
      speed: PlayerConfig.speed || 200,
      fastSpeed: PlayerConfig.fastSpeed || 320,
      collider: Physics.Circle(12),
      bounds: Physics.Bounds(),
      sprite: Sprite.create('hero', { scale }),
      animation: Animation.create('idle'),
    };

    entity.inspector = Inspector.create({
      fields: INSPECTOR_FIELDS,
      hitPriority: 100,
      editorBox: { w: 32, h: 48, scale: 1 }
    });

    return world.add(entity);
  },

  serialize(entity) {
    return {
      type: 'player',
      x: entity.position.x,
      y: entity.position.y,
      name: entity.name,
      scale: entity.sprite?.scale || 0.7
    }
  }
}
