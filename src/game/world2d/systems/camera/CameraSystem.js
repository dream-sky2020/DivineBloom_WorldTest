import { world } from '@world2d/world'

/**
 * Camera System
 * 负责更新相机位置，使其跟随目标（玩家）并处理边界限制
 */
export const CameraSystem = {
  /**
   * @param {number} dt 
   * @param {object} options
   * @param {number} options.viewportWidth
   * @param {number} options.viewportHeight
   * @param {object} [options.mapBounds] { width, height } 世界像素尺寸
   */
  update(dt, { viewportWidth, viewportHeight, mapBounds = null }) {
    const globalEntity = world.with('camera', 'globalManager').first
    if (!globalEntity) return

    const { camera, editor, inputState } = globalEntity
    
    // --- 编辑模式逻辑 ---
    if (editor && editor.isEditMode) {
        const speed = editor.cameraSpeed || 10;
        const keys = inputState?.lastPressed || {};
        
        let dx = 0;
        let dy = 0;
        
        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;
        
        // 移动相机目标
        camera.targetX += dx * speed;
        camera.targetY += dy * speed;
        
        // 立即应用（平滑可选）
        this._applyLerp(camera, dt);
        return;
    }
    
    // 1. 检查地图尺寸，如果地图小于视口，则固定在中心或 (0,0)
    const isMapLargerThanViewport = mapBounds && (mapBounds.width > viewportWidth || mapBounds.height > viewportHeight)
    
    if (!isMapLargerThanViewport && mapBounds) {
      // 地图比屏幕小，将其居中
      camera.targetX = (mapBounds.width - viewportWidth) / 2
      camera.targetY = (mapBounds.height - viewportHeight) / 2
      
      // 直接应用，不使用死区
      this._applyLerp(camera, dt)
      return
    }

    // 2. 查找跟随目标 (如果有具体引用则使用，否则寻找 player)
    let target = camera.targetEntity
    if (!target) {
      target = world.with('player', 'transform').first
    }

    if (target && target.transform) {
      // 3. 计算死区逻辑
      // 相机中心点
      const camCenterX = camera.x + viewportWidth / 2
      const camCenterY = camera.y + viewportHeight / 2

      const dx = target.transform.x - camCenterX
      const dy = target.transform.y - camCenterY

      const dzW = (camera.deadZone?.width || 0) / 2
      const dzH = (camera.deadZone?.height || 0) / 2

      let desiredX = camera.x
      let desiredY = camera.y

      // 如果超出死区，调整目标位置
      if (Math.abs(dx) > dzW) {
        desiredX = camera.x + (dx > 0 ? dx - dzW : dx + dzW)
      }
      if (Math.abs(dy) > dzH) {
        desiredY = camera.y + (dy > 0 ? dy - dzH : dy + dzH)
      }

      camera.targetX = desiredX
      camera.targetY = desiredY

      // 4. 应用边界限制
      if (camera.useBounds && mapBounds) {
        const maxX = Math.max(0, mapBounds.width - viewportWidth)
        const maxY = Math.max(0, mapBounds.height - viewportHeight)

        camera.targetX = Math.max(0, Math.min(camera.targetX, maxX))
        camera.targetY = Math.max(0, Math.min(camera.targetY, maxY))
      }

      // 5. 平滑跟随 (Lerp)
      this._applyLerp(camera, dt)
    }
  },

  /**
   * 内部方法：应用差值
   */
  _applyLerp(camera, dt) {
    const t = camera.lerp === 1 ? 1 : 1 - Math.pow(1 - camera.lerp, dt * 60)
    camera.x += (camera.targetX - camera.x) * t
    camera.y += (camera.targetY - camera.y) * t
  }
}
