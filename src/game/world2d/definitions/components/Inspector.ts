import { z } from 'zod';
import { IComponentDefinition } from '../interface/IComponent';

const inspectorSchema = z.object({
    tagName: z.string().nullable().default(null),
    tagColor: z.string().nullable().default(null),
    groups: z.array(z.any()).default([]),
    fields: z.array(z.any()).default([]),
    allowDelete: z.boolean().default(true),
    priority: z.number().default(0),
    hitPriority: z.number().default(0),
    editorBox: z.object({
        w: z.number().default(32),
        h: z.number().default(32),
        anchorX: z.number().default(0.5),
        anchorY: z.number().default(1.0),
        offsetX: z.number().default(0),
        offsetY: z.number().default(0),
        scale: z.number().default(1.0)
    }).default({
        w: 32,
        h: 32,
        anchorX: 0.5,
        anchorY: 1.0,
        offsetX: 0,
        offsetY: 0,
        scale: 1.0
    })
});

export type InspectorData = z.infer<typeof inspectorSchema>;

export const Inspector: IComponentDefinition<typeof inspectorSchema, InspectorData> = {
    name: 'Inspector',
    schema: inspectorSchema,
    create(data: Partial<InspectorData> = {}) {
        return inspectorSchema.parse(data);
    },
    serialize(component) {
        // Inspector 配置通常是静态定义的，或者编辑器生成的
        // 如果需要保存编辑器特定的修改，则需要保存
        return { ...component };
    },
    deserialize(data) {
        return this.create(data);
    },
    inspectorFields: [
        { path: 'inspector.hitPriority', label: '点击优先级', type: 'number', tip: '数字越大越优先被选中', props: { step: 1 }, group: '编辑器配置' },
        { path: 'inspector.editorBox.w', label: '交互宽', type: 'number', props: { min: 0 }, group: '编辑器配置' },
        { path: 'inspector.editorBox.h', label: '交互高', type: 'number', props: { min: 0 }, group: '编辑器配置' },
        { path: 'inspector.editorBox.scale', label: '交互缩放', type: 'number', props: { step: 0.1, min: 0 }, group: '编辑器配置' },
        { path: 'inspector.editorBox.offsetX', label: '交互偏移 X', type: 'number', group: '编辑器配置' },
        { path: 'inspector.editorBox.offsetY', label: '交互偏移 Y', type: 'number', group: '编辑器配置' }
    ]
};

export const InspectorSchema = inspectorSchema;
export const EDITOR_INSPECTOR_FIELDS = Inspector.inspectorFields;
