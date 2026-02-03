import { z } from 'zod'
import { world } from '@world2d/world'
import { Collider, COLLIDER_INSPECTOR_FIELDS, Shape, SHAPE_INSPECTOR_FIELDS, ShapeType, Inspector, EDITOR_INSPECTOR_FIELDS, Transform, TRANSFORM_INSPECTOR_FIELDS, Parent, Children, LocalTransform, Detectable } from '@components'

export const ObstacleEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  name: z.string().optional().default('Obstacle'),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  p1: z.object({ x: z.number(), y: z.number() }).optional(),
  p2: z.object({ x: z.number(), y: z.number() }).optional(),
  rotation: z.number().optional().default(0),
  shape: z.nativeEnum(ShapeType).optional().default(ShapeType.AABB)
});

// Inspector 配置仍然针对主实体
const INSPECTOR_FIELDS = [
  { path: 'name', label: '名称', type: 'text', group: '基本属性' },
  ...TRANSFORM_INSPECTOR_FIELDS,
  // 注意：我们暂时无法通过 Inspector 直接编辑子实体的组件，
  // 除非 Inspector 支持嵌套实体的编辑。
  // 这里先注释掉 Shape/Collider 字段，或者保留用于"主形状"的编辑
  // ...SHAPE_INSPECTOR_FIELDS, 
  // ...COLLIDER_INSPECTOR_FIELDS,
  ...EDITOR_INSPECTOR_FIELDS
];

export const ObstacleEntity = {
  create(data) {
    const result = ObstacleEntitySchema.safeParse(data);
    if (!result.success) {
      console.error('[ObstacleEntity] Validation failed', result.error);
      return null;
    }

    const { x, y, name, width, height, radius, p1, p2, rotation, shape } = result.data;

    // 1. 创建主实体 (Root)
    const rootEntity = world.add({
      type: 'obstacle',
      name: name,
      transform: Transform(x, y),
      // 主实体不需要 Collider/Shape，除非它自己就是一个形状
      // 这里我们把所有几何逻辑放到子实体中，主实体只负责位置和管理
    });

    // 2. 创建子实体 (Body Part)
    // 这是真正承载物理判定的部分
    const childEntity = world.add({
      parent: Parent(rootEntity), // 引用主实体
      transform: Transform(),      // 显式持有 Transform，由 SyncTransformSystem 同步
      localTransform: LocalTransform(0, 0, rotation), // 相对偏移和旋转
      name: `${name}_Body`,
      // 几何形状
      shape: Shape({
        type: shape,
        width: width || (radius ? radius * 2 : 30),
        height: height || (radius ? radius * 2 : 30),
        radius: radius || 15,
        p1,
        p2,
        rotation: 0, // 旋转现在由 localTransform.rotation 处理
        offsetX: 0, 
        offsetY: 0
      }),
      // 物理属性
      collider: Collider.create({
        isStatic: true
      }),
      detectable: Detectable(['obstacle']) // Add detectable to obstacles as well
    });

    // 3. 让主实体追踪子实体 (可选，方便管理)
    rootEntity.children = Children([childEntity]);

    // 添加 Inspector 到主实体，以便编辑器操作
    rootEntity.inspector = Inspector.create({ 
      fields: INSPECTOR_FIELDS,
      hitPriority: 50,
      editorBox: {
          w: width || (radius ? radius * 2 : 32),
          h: height || (radius ? radius * 2 : 32),
          anchorX: 0.5,
          anchorY: 0.5
      }
    });

    return rootEntity;
    },

  serialize(entity) {
    const { transform, name, children } = entity
    
    // 从子实体中获取几何数据
    const body = children?.entities.find(e => e.collider);
    const shape = body?.shape;
    const local = body?.localTransform;

    return {
      type: 'obstacle',
      name: name,
      x: transform.x,
      y: transform.y,
      width: shape?.width,
      height: shape?.height,
      radius: shape?.radius,
      p1: shape?.p1,
      p2: shape?.p2,
      rotation: local?.rotation || 0,
      shape: shape?.type
    };
  },
}
