import { makeSprite } from '@/game/GameEngine'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

export class Player {
  /**
   * @param {GameEngine} engine 
   */
  constructor(engine) {
    this.engine = engine
    
    // 状态数据
    this.pos = { x: 200, y: 260 }
    this.spriteId = 'hero_idle'
    this.scale = 2
    this.speed = 200
    this.fastSpeed = 320

    // 初始化资源
    this._initResources()
  }

  toData() {
    return {
      x: this.pos.x,
      y: this.pos.y
    }
  }

  restore(data) {
    if (!data) return
    this.pos.x = data.x
    this.pos.y = data.y
  }

  async _initResources() {
    // 这里可以是具体的资源加载逻辑，或者在 Scene 层统一加载
    // 为了独立性，Player 可以定义自己需要的 Sprite
    // 注意：实际项目中，资源通常由 AssetManager 统一预加载，这里简化处理
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    const keys = this.engine.input
    const isFast = keys.isDown('ShiftLeft') || keys.isDown('ShiftRight')
    const currentSpeed = isFast ? this.fastSpeed : this.speed

    let dx = 0
    let dy = 0

    if (keys.isDown('KeyW') || keys.isDown('ArrowUp')) dy -= 1
    if (keys.isDown('KeyS') || keys.isDown('ArrowDown')) dy += 1
    if (keys.isDown('KeyA') || keys.isDown('ArrowLeft')) dx -= 1
    if (keys.isDown('KeyD') || keys.isDown('ArrowRight')) dx += 1

    // 归一化，防止斜向移动过快
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2)
      dx *= inv
      dy *= inv
    }

    // 应用移动
    this.pos.x += dx * currentSpeed * dt
    this.pos.y += dy * currentSpeed * dt

    // 边界限制 (调用 Engine 里的宽高信息)
    this._clampPosition()
  }

  _clampPosition() {
    const { width, height } = this.engine
    // 假设 0.35 是地面起始线 (来自原来的 drawGround)
    const minY = height * 0.35
    
    this.pos.x = Math.max(0, Math.min(width, this.pos.x))
    this.pos.y = Math.max(minY, Math.min(height, this.pos.y))
  }

  /**
   * @param {Renderer2D} renderer 
   */
  draw(renderer) {
    // 获取 sprite 定义
    // 注意：这里假设 sprites 已经在外部或 Scene 中注册，或者我们可以传进来
    // 为了简单，我们暂时在这里硬编码或假设 Scene 会处理 SpriteRegistry
    // 但更好的方式是 Player 自己知道怎么画自己
    
    // 获取图像
    // 假设 'sheet' 已经加载
    const img = this.engine.textures.get('sheet')
    
    if (img) {
      // 临时定义 sprite，或者从统一配置读取
      const spr = makeSprite({ 
        imageId: 'sheet', 
        sx: 0, sy: 0, sw: 32, sh: 32, 
        ax: 0.5, ay: 1.0 
      })
      
      renderer.drawSprite(img, spr, this.pos, this.scale)
    } else {
      // Fallback
      renderer.drawCircle(this.pos.x, this.pos.y - 16, 14, '#ef4444')
    }
  }
}

