import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Editor Interaction System
 * 负责编辑模式下的鼠标交互：点击选中、拖拽移动、右键菜单
 */
export const EditorInteractionSystem = {
  selectedEntity: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  onEntityRightClick: null, // 右键点击实体的回调
  onEmptyRightClick: null, // 右键点击空白地面的回调

  update(dt, engine, gameManager) {
    if (!gameManager) return;
    const { input, renderer } = engine;
    const { mouse } = input;
    const { camera } = renderer;

    // 世界坐标 (World Coordinates)
    const worldX = mouse.x + camera.x;
    const worldY = mouse.y + camera.y;

    // 1. 处理选中逻辑 (MouseDown)
    if (mouse.justPressed) {
      const hit = this.findEntityAt(worldX, worldY);

      if (hit) {
        this.selectedEntity = hit;
        gameManager.editor.selectedEntity = hit; // Sync with reactive state
        this.isDragging = true;
        this.dragOffset.x = hit.position.x - worldX;
        this.dragOffset.y = hit.position.y - worldY;
        console.log('[Editor] Selected:', hit.name || hit.id || hit.uuid || 'unnamed');
      } else {
        this.selectedEntity = null;
        gameManager.editor.selectedEntity = null; // Sync with reactive state
      }
    }

    // 2. 处理拖拽逻辑 (MouseMove while Down)
    const target = gameManager.editor.selectedEntity;
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
        // 右键点击到了实体
        this.selectedEntity = hit;
        gameManager.editor.selectedEntity = hit;

        // 触发实体右键菜单回调
        if (this.onEntityRightClick) {
          this.onEntityRightClick(hit, { worldX, worldY, screenX: mouse.screenX, screenY: mouse.screenY });
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
  getEntityBounds(entity) {
    if (!entity.position) return null;

    const inspector = entity.inspector;
    let w = 32, h = 32, ax = 0.5, ay = 1.0, ox = 0, oy = 0;

    // 1. 优先使用 Inspector 定义的 editorBox
    if (inspector && inspector.editorBox) {
      const box = inspector.editorBox;
      w = box.w ?? w;
      h = box.h ?? h;
      ax = box.anchorX ?? ax;
      ay = box.anchorY ?? ay;
      ox = box.offsetX ?? 0;
      oy = box.offsetY ?? 0;
    }
    // 2. 其次使用 Visuals 定义
    else if (entity.visual) {
      const def = Visuals[entity.visual.id];
      if (def) {
        w = (def.layout?.width) || 32;
        h = (def.layout?.height) || 32;
        ax = def.anchor?.x ?? 0.5;
        ay = def.anchor?.y ?? 1.0;
      }
    }
    // 3. 最后考虑 detectArea (针对传送门等无视觉实体)
    else if (entity.detectArea && entity.detectArea.size) {
      w = entity.detectArea.size.w;
      h = entity.detectArea.size.h;
      if (entity.detectArea.offset) {
        ox = entity.detectArea.offset.x;
        oy = entity.detectArea.offset.y;
        ax = 0.5; ay = 0.5; // detectArea 通常是中心对齐
      } else {
        ax = 0; ay = 0;
      }
    }

    const left = entity.position.x + ox - w * ax;
    const top = entity.position.y + oy - h * ay;

    return { left, top, w, h, ax, ay, ox, oy };
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
