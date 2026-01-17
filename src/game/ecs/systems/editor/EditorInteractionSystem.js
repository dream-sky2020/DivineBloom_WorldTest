import { world } from '@/game/ecs/world'
import { Visuals } from '@/data/visuals'

/**
 * Editor Interaction System
 * 负责编辑模式下的鼠标交互：点击选中、拖拽移动
 */
export const EditorInteractionSystem = {
  selectedEntity: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },

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
        console.log('[Editor] Selected:', hit.id || hit.uuid || 'unnamed');
      } else {
        this.selectedEntity = null;
        gameManager.editor.selectedEntity = null; // Sync with reactive state
      }
    }

    // 2. 处理拖拽逻辑 (MouseMove while Down)
    const target = gameManager.editor.selectedEntity;
    if (this.isDragging && target) {
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
    }

    // 3. 处理松开 (MouseUp)
    if (mouse.justReleased) {
      this.isDragging = false;
    }
  },

  /**
   * 查找坐标下的实体
   */
  findEntityAt(x, y) {
    const entities = world.with('position'); // 只要有位置，就应该是可编辑的
    let bestHit = null;
    let maxZ = -Infinity;

    for (const entity of entities) {
      const { position, visual, detectArea } = entity;

      let w = 16;
      let h = 16;
      let ax = 0.5;
      let ay = 0.5;

      if (visual) {
        const def = Visuals[visual.id];
        if (def) {
          w = (def.layout?.width) || 32;
          h = (def.layout?.height) || 32;
          ax = def.anchor?.x ?? 0.5;
          ay = def.anchor?.y ?? 1.0;
        }
      } else if (detectArea && detectArea.size) {
        // 如果没有视觉但有检测区域（如传送门）
        w = detectArea.size.w;
        h = detectArea.size.h;
        ax = 0; // 传送门默认 x,y 是左上角
        ay = 0;

        // 如果 detectArea 有 offset，需要调整
        if (detectArea.offset) {
          // 我们的 PortalEntity 是把 x,y 作为左上角，然后 offset 是 size/2
          // 实际上 AABB 系统判断时用的是 position.x + offset.x +/- size.w/2
          // 所以中心点在 position.x + offset.x
          const centerX = position.x + detectArea.offset.x;
          const centerY = position.y + detectArea.offset.y;
          const left = centerX - w / 2;
          const right = centerX + w / 2;
          const top = centerY - h / 2;
          const bottom = centerY + h / 2;

          if (x >= left && x <= right && y >= top && y <= bottom) {
            return entity; // 传送门通常不多，直接返回
          }
          continue;
        }
      }

      const left = position.x - w * ax;
      const right = position.x + w * (1 - ax);
      const top = position.y - h * ay;
      const bottom = position.y + h * (1 - ay);

      if (x >= left && x <= right && y >= top && y <= bottom) {
        const z = entity.zIndex || 0;
        if (z >= maxZ) {
          maxZ = z;
          bestHit = entity;
        }
      }
    }

    return bestHit;
  }
};
