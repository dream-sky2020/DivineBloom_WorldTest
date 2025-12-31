import { Player } from '@/game/entities/Player'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

export class MainScene {
  /**
   * @param {GameEngine} engine 
   */
  constructor(engine) {
    this.engine = engine
    this.player = new Player(engine)
    
    // 可以有一个实体列表
    this.entities = [this.player]
    
    this.isLoaded = false
  }

  async load() {
    // 统一加载资源
    const sheetUrl = this._buildTinySpriteSheetDataURL()
    await this.engine.textures.load('sheet', sheetUrl)
    
    this.isLoaded = true
  }

  /**
   * @param {number} dt 
   */
  update(dt) {
    if (!this.isLoaded) return

    // 更新所有实体
    this.entities.forEach(ent => {
      if (ent.update) ent.update(dt)
    })
    
    // 摄像机跟随玩家 (简单示例)
    // this.engine.renderer.setCamera(this.player.pos.x - 400, 0)
    this.engine.renderer.setCamera(0, 0)
  }

  /**
   * @param {Renderer2D} renderer 
   */
  draw(renderer) {
    // 1. 绘制背景/地面
    this._drawEnvironment(renderer)

    if (!this.isLoaded) return

    // 2. 绘制所有实体
    // 简单的 Y-sort (根据 Y 轴排序，实现遮挡关系)
    this.entities.sort((a, b) => a.pos.y - b.pos.y)
    
    this.entities.forEach(ent => {
      if (ent.draw) ent.draw(renderer)
    })
  }

  /**
   * @param {Renderer2D} renderer 
   */
  _drawEnvironment(renderer) {
    const { width, height } = this.engine
    
    // 草地背景
    renderer.drawRect(0, height * 0.35, width, height * 0.65, '#bbf7d0')
    
    // 一些装饰块 (模拟之前的 drawGround)
    // 注意：Renderer2D 需要有 drawRect 方法 (我们在 GameEngine 重构时添加了)
    renderer.drawRect(80, height * 0.55, 140, 18, 'rgba(0,0,0,0.10)')
    renderer.drawRect(260, height * 0.70, 200, 18, 'rgba(0,0,0,0.10)')
  }

  // 辅助：生成资源 URL
  _buildTinySpriteSheetDataURL() {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <rect width="32" height="32" fill="none"/>
      <ellipse cx="16" cy="26" rx="9" ry="4" fill="rgba(0,0,0,0.25)"/>
      <circle cx="16" cy="10" r="6" fill="#0f172a"/>
      <rect x="11" y="16" width="10" height="10" rx="2" fill="#ef4444"/>
      <rect x="9" y="20" width="4" height="7" rx="1" fill="#ef4444"/>
      <rect x="19" y="20" width="4" height="7" rx="1" fill="#ef4444"/>
    </svg>`
    const encoded = encodeURIComponent(svg)
    return `data:image/svg+xml;charset=utf-8,${encoded}`
  }
}

