import { world } from '@world2d/world'
import { editorManager } from '@/game/editor/core/EditorCore'
import { toRaw } from 'vue'

/**
 * Editor Interaction System
 * 负责编辑模式下的鼠标交互：点击选中、拖拽移动、右键菜单
 */
export const EditorInteractionSystem = {
  // 注意：这个 selectedEntity 仅作为内部记录，外部应以 editorManager.selectedEntity 为准
  selectedEntity: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  onEntityRightClick: null, // 右键点击实体的回调
  onEmptyRightClick: null, // 右键点击空白地面的回调

  update(dt, engine, gameManager) {
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
        const rawHit = toRaw(hit);
        this.selectedEntity = rawHit;
        editorManager.selectedEntity = rawHit; // Sync with reactive state
        this.isDragging = true;
        this.dragOffset.x = rawHit.position.x - worldX;
        this.dragOffset.y = rawHit.position.y - worldY;
        console.log('[Editor] Selected:', rawHit.name || rawHit.id || rawHit.uuid || 'unnamed');
      } else {
        this.selectedEntity = null;
        editorManager.selectedEntity = null; // Sync with reactive state
      }
    }

    // 2. 处理拖拽逻辑 (MouseMove while Down)
    // 始终从 editorManager 获取最新目标
    const target = toRaw(editorManager.selectedEntity);
    
    if (this.isDragging && target && target.position) {
      if (mouse.isDown) {
        // 更新位置 (通过响应式代理更新，Vue 就能感知到)
        target.position.x = worldX + this.dragOffset.x;
        target.position.y = worldY + this.dragOffset.y;

        // 也可以实现对齐网格 (Grid Snapping)
        if (input.keys.has('ControlLeft') || input.keys.has('ControlRight')) {
          const gridSize = 32; // 默认网格大小
          target.position.x = Math.round(target.position.x / gridSize) * gridSize;
          target.position.y = Math.round(target.position.y / gridSize) * gridSize;
        }
      } else {
        this.isDragging = false;
      }
    } else if (this.isDragging && target && !target.position) {
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
        const rawHit = toRaw(hit);
        // 右键点击到了实体
        this.selectedEntity = rawHit;
        editorManager.selectedEntity = rawHit;

        // 触发实体右键菜单回调
        if (this.onEntityRightClick) {
          this.onEntityRightClick(rawHit, { worldX, worldY, screenX: mouse.screenX, screenY: mouse.screenY });
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
   * 严格遵循 Inspector 定义，实现编辑器与渲染组件 (Sprite) 的解耦
   */
  getEntityBounds(entity) {
    if (!entity.position) return null;

    const inspector = entity.inspector;
    
    // 默认参数 (如果没有任何定义)
    let w = 32, h = 32, ax = 0.5, ay = 1.0, ox = 0, oy = 0, scale = 1.0;

    // 1. 核心来源：Inspector 定义的 editorBox
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
    // 2. 备选来源：针对无视觉资源但有探测区域的实体（如保底逻辑）
    else if (entity.detectArea) {
      if (entity.detectArea.size) {
        w = entity.detectArea.size.w;
        h = entity.detectArea.size.h;
        ax = 0.5; ay = 0.5;
        ox = entity.detectArea.offset?.x ?? 0;
        oy = entity.detectArea.offset?.y ?? 0;
      } else if (entity.detectArea.radius) {
        w = entity.detectArea.radius * 2;
        h = entity.detectArea.radius * 2;
        ax = 0.5; ay = 0.5;
        ox = entity.detectArea.offset?.x ?? 0;
        oy = entity.detectArea.offset?.y ?? 0;
      }
    }

    // 应用缩放 (仅使用来自 Inspector 的定义)
    const finalW = w * scale;
    const finalH = h * scale;

    const left = entity.position.x + ox - finalW * ax;
    const top = entity.position.y + oy - finalH * ay;

    return { left, top, w: finalW, h: finalH, ax, ay, ox, oy };
  },

  /**
   * 查找坐标下的实体
   */
  findEntityAt(x, y) {
    const entities = world.with('position');
    let bestHit = null;
    let maxPriority = -Infinity;

    for (const entity of entities) {
      const bounds = this.getEntityBounds(entity);
      if (!bounds) continue;

      const { left, top, w, h } = bounds;

      if (x >= left && x <= left + w && y >= top && y <= top + h) {
        // 优先级判断：hitPriority > priority > zIndex
        const priority = entity.inspector?.hitPriority ??
          (entity.inspector?.priority ? entity.inspector.priority * 10 : 0) ??
          entity.zIndex ?? 0;

        if (priority >= maxPriority) {
          maxPriority = priority;
          bestHit = entity;
        }
      }
    }

    return bestHit;
  }
};
