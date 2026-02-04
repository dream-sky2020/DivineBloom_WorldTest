import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';
import { ShapeType } from '../enums/Shape';

const shapeSchema = z.object({
  type: z.nativeEnum(ShapeType).default(ShapeType.CIRCLE),
  radius: z.number().default(0),
  width: z.number().default(0),
  height: z.number().default(0),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  rotation: z.number().default(0),
  p1: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: -10 }),
  p2: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 10 }),
  debugColor: z.string().optional()
});

export type ShapeData = z.infer<typeof shapeSchema>;

export const Shape: IComponentDefinition<typeof shapeSchema, ShapeData> = {
  name: 'Shape',
  schema: shapeSchema,
  create(config: Partial<ShapeData> = {}) {
    return shapeSchema.parse(config);
  },
  serialize(component) {
    return { ...component };
  },
  deserialize(data) {
    return this.create(data);
  },
  inspectorFields: [
    { path: 'shape.type', label: '形状类型', type: 'enum', options: ShapeType, group: '几何形状 (Shape)' },
    { path: 'shape.radius', label: '半径', type: 'number', props: { min: 0 }, tip: '[Circle, Capsule]', group: '几何形状 (Shape)' },
    { path: 'shape.width', label: '宽度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB]', group: '几何形状 (Shape)' },
    { path: 'shape.height', label: '高度', type: 'number', props: { min: 0 }, tip: '[AABB, OBB]', group: '几何形状 (Shape)' },
    { path: 'shape.offsetX', label: '偏移 X', type: 'number', group: '几何形状 (Shape)' },
    { path: 'shape.offsetY', label: '偏移 Y', type: 'number', group: '几何形状 (Shape)' },
    { path: 'shape.rotation', label: '旋转', type: 'number', props: { step: 0.1 }, tip: '[OBB, Capsule] 弧度', group: '几何形状 (Shape)' },
    { path: 'shape.debugColor', label: '调试颜色', type: 'color', group: '几何形状 (Shape)' }
  ]
};

export const ShapeSchema = shapeSchema;
export const SHAPE_INSPECTOR_FIELDS = Shape.inspectorFields;
