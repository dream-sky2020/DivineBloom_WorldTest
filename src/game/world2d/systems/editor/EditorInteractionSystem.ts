import { world } from '@world2d/runtime/WorldEcsRuntime';
import { editorManager } from '../../../editor/core/EditorCore';
import { toRaw } from 'vue';
import { ShapeType } from '@world2d/definitions/enums/Shape';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { createLogger } from '@/utils/logger';
import type { SystemContextBase } from '@definitions/interface/SystemContext';
import { getFrameContext } from '../../bridge/ExternalBridge';

const logger = createLogger('EditorInteractionSystem');

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

/**
 * Editor Interaction System
 * 负责编辑模式下的鼠标交互：点击选中、拖拽移动、右键菜单
 */
export const EditorInteractionSystem: ISystem<SystemContextBase> & {
    selectedEntity: any;
    isDragging: boolean;
    dragOffset: { x: number, y: number };
    onEntityRightClick: ((entity: any, evt: any) => void) | null;
    onEmptyRightClick: ((evt: any) => void) | null;
    getEntityBounds(entity: any): any;
    findEntityAt(x: number, y: number): IEntity | null;
} = {
    name: 'editor-interaction',
    executionPolicy: ExecutionPolicy.EditorOnly,

    // 注意：这个 selectedEntity 仅作为内部记录，外部应以 editorManager.selectedEntity 为准
    selectedEntity: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    onEntityRightClick: null, // 右键点击实体的回调
    onEmptyRightClick: null, // 右键点击空白地面的回调

    update(dt: number, _ctx?: SystemContextBase) {
        const frameContext = getFrameContext();
        const engine = frameContext.engine;
        if (!engine) {
            throw new Error('[EditorInteractionSystem] Missing required engine in runtime frameContext');
        }

        const { input, renderer } = engine;
        const { mouse } = input;
        const { camera } = renderer;

        // 同步选中的实体（防止从外部 UI 修改了选中状态但系统不知道）
        // 使用 toRaw 确保比较的是原始对象
        const currentSelected = toRaw(editorManager.selectedEntity);
        if (toRaw(this.selectedEntity) !== currentSelected) {
            this.selectedEntity = currentSelected;
        }

        // 世界坐标 (World Coordinates)
        const worldX = mouse.x + camera.x;
        const worldY = mouse.y + camera.y;

        // 1. 处理选中逻辑 (MouseDown)
        if (mouse.justPressed) {
            const hit = this.findEntityAt(worldX, worldY);

            if (hit) {
                const rawHit = toRaw(hit) as IEntity;

                // [Updated] 如果选中的是子实体（如 Body, Sensor），自动转发到父实体
                const target = rawHit.parent?.entity || rawHit;

                this.selectedEntity = target;
                editorManager.selectedEntity = target; // Sync with reactive state
                this.isDragging = true;

                // 计算拖拽偏移 (基于目标实体的位置)
                if (target.transform) {
                    this.dragOffset.x = target.transform.x - worldX;
                    this.dragOffset.y = target.transform.y - worldY;
                }

                logger.debug('[Editor] Selected:', target.name || target.id || 'unnamed', target === rawHit ? '(Direct)' : '(Via Child)');
            } else {
                this.selectedEntity = null;
                editorManager.selectedEntity = null; // Sync with reactive state
            }
        }

        // 2. 处理拖拽逻辑 (MouseMove while Down)
        // 始终从 editorManager 获取最新目标
        const target = toRaw(editorManager.selectedEntity) as IEntity;

        if (this.isDragging && target && target.transform) {
            if (mouse.isDown) {
                // 更新位置 (通过响应式代理更新，Vue 就能感知到)
                    target.transform.prevX = target.transform.x;
                    target.transform.prevY = target.transform.y;
                target.transform.x = worldX + this.dragOffset.x;
                target.transform.y = worldY + this.dragOffset.y;

                // 也可以实现对齐网格 (Grid Snapping)
                if (input.keys.has('ControlLeft') || input.keys.has('ControlRight')) {
                    const gridSize = 32; // 默认网格大小
                    target.transform.x = Math.round(target.transform.x / gridSize) * gridSize;
                    target.transform.y = Math.round(target.transform.y / gridSize) * gridSize;
                }
            } else {
                this.isDragging = false;
            }
        } else if (this.isDragging && target && !target.transform) {
            // 对于没有位置的实体（如全局实体），如果鼠标松开了就停止“拖拽”状态
            if (!mouse.isDown) {
                this.isDragging = false;
            }
        }

        // 3. 处理松开 (MouseUp)
        if (mouse.justReleased) {
            this.isDragging = false;
        }

        // 4. 处理右键点击 (Right Click) - 统一处理所有右键事件
        if (mouse.rightJustPressed) {
            const hit = this.findEntityAt(worldX, worldY);

            if (hit) {
                const rawHit = toRaw(hit) as IEntity;
                // [Updated] 转发到父实体
                const target = rawHit.parent?.entity || rawHit;

                this.selectedEntity = target;
                editorManager.selectedEntity = target;

                // 触发实体右键菜单回调
                if (this.onEntityRightClick) {
                    this.onEntityRightClick(target, { worldX, worldY, screenX: mouse.screenX, screenY: mouse.screenY });
                }
            } else {
                // 右键点击空白地面
                // 触发空白地面右键菜单回调
                if (this.onEmptyRightClick) {
                    this.onEmptyRightClick({ worldX, worldY, screenX: mouse.screenX, screenY: mouse.screenY });
                }
            }
        }
    },

    /**
     * 统一获取实体的编辑边界框
     */
    getEntityBounds(entity: IEntity) {
        // [Updated] 统一使用 transform (子实体的 transform 已由 SyncTransformSystem 同步)
        const transform = entity.transform;
        if (!transform) return null;

        const inspector = entity.inspector;

        // 默认参数 (如果没有任何定义)
        let w = 32, h = 32, ax = 0.5, ay = 1.0, ox = 0, oy = 0, scale = 1.0;

        // 1. 核心来源：Inspector 定义的 editorBox (通常在主实体上)
        if (inspector && inspector.editorBox) {
            const box = inspector.editorBox;
            w = box.w ?? w;
            h = box.h ?? h;
            ax = box.anchorX ?? ax;
            ay = box.anchorY ?? ay;
            ox = box.offsetX ?? ox;
            oy = box.offsetY ?? oy;
            scale = box.scale ?? scale;
        }
        // 2. 备选来源：通过 Shape 组件 (通常在子实体上)
        else if (entity.shape) {
            const shape = entity.shape;

            if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
                const r = shape.radius || (shape.type === ShapeType.POINT ? 0.1 : 0);
                w = r * 2;
                h = r * 2;
                ax = 0.5; ay = 0.5;
                ox = shape.offsetX || 0;
                oy = shape.offsetY || 0;
            } else if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
                w = shape.width || 0;
                h = shape.height || 0;
                ax = 0.5; ay = 0.5;
                ox = shape.offsetX || 0;
                oy = shape.offsetY || 0;
            } else if (shape.type === ShapeType.CAPSULE) {
                // 简单估算胶囊体包围盒
                w = (shape.radius || 0) * 2;
                h = (shape.radius || 0) * 2;
                ax = 0.5; ay = 0.5;
                ox = shape.offsetX || 0;
                oy = shape.offsetY || 0;
            }
        }

        // 应用缩放
        const finalW = w * scale;
        const finalH = h * scale;

        const left = transform.x + ox - finalW * ax;
        const top = transform.y + oy - finalH * ay;

        return { left, top, w: finalW, h: finalH, ax, ay, ox, oy };
    },

    /**
     * 查找坐标下的实体
     */
    findEntityAt(x: number, y: number) {
        const candidates = new Set([
            ...world.with('transform'),
            ...world.with('shape')
        ]);

        let bestHit: IEntity | null = null;
        let maxPriority = -Infinity;

        for (const entity of candidates) {
            const e = entity as IEntity;
            const bounds = this.getEntityBounds(e);
            if (!bounds) continue;

            const { left, top, w, h } = bounds;

            if (x >= left && x <= left + w && y >= top && y <= top + h) {
                // 优先级判断
                // 如果是子实体，尝试获取父实体的优先级，或者默认较低
                const inspector = e.inspector || e.parent?.entity?.inspector;

                const priority = inspector?.hitPriority ??
                    (inspector?.priority ? inspector.priority * 10 : undefined) ??
                    e.zIndex ?? 0;

                if (priority >= maxPriority) {
                    maxPriority = priority;
                    bestHit = e;
                }
            }
        }

        return bestHit;
    }
};
