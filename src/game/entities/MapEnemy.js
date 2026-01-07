import { makeSprite } from '@/game/GameEngine'
import { world } from '@/game/ecs/world'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

// --- Color Cache Helper ---
const colorCache = new Map()

function getRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 }
  if (colorCache.has(hex)) return colorCache.get(hex)
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  const val = result 
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
  
  colorCache.set(hex, val)
  return val
}

// --- Vision Cache Helper ---
const visionCache = new Map()

function getCachedVision(type, r, angle, prox, color, isAlert) {
  // Round params to avoid cache explosion on tiny float diffs
  const rInt = Math.ceil(r)
  const angleKey = angle.toFixed(2)
  const proxInt = Math.ceil(prox)
  const key = `${type}_${rInt}_${angleKey}_${proxInt}_${color}_${isAlert ? 1 : 0}`
  
  if (visionCache.has(key)) return visionCache.get(key)
  
  // Create off-screen canvas
  const canvas = document.createElement('canvas')
  const pad = 4 // padding for stroke/anti-aliasing
  const size = rInt * 2 + pad * 2
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  const cx = size / 2
  const cy = size / 2
  
  const rgb = getRgb(color)
  const alpha = isAlert ? 0.15 : 0.05
  const fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`
  // Only stroke if alert
  const strokeStyle = isAlert ? `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)` : undefined
  
  ctx.fillStyle = fillStyle
  if (strokeStyle) {
    ctx.lineWidth = 2
    ctx.strokeStyle = strokeStyle
  }
  
  ctx.beginPath()
  // Draw shapes pointing RIGHT (0 radians) to align with standard rotation
  if (type === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
  } else if (type === 'cone' || type === 'hybrid') {
    const half = angle / 2
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, -half, half)
    ctx.lineTo(cx, cy)
    
    if (type === 'hybrid') {
      // Draw proximity circle
      ctx.moveTo(cx + prox, cy)
      ctx.arc(cx, cy, prox, 0, Math.PI * 2)
    }
  }
  
  ctx.fill()
  if (strokeStyle) ctx.stroke()
  
  visionCache.set(key, canvas)
  return canvas
}

// --- Main Class ---

export class MapEnemy {
  /**
   * @param {GameEngine} engine 
   * @param {number} x 
   * @param {number} y 
   * @param {Array<object>} battleGroup 
   * @param {object} [options]
   */
  constructor(engine, x, y, battleGroup, options = {}) {
    this.engine = engine
    
    // Config
    this.aiType = options.aiType || 'wander'
    this.visionRadius = options.visionRadius || 120
    this.visionType = options.visionType || 'circle'
    this.visionAngle = (options.visionAngle || 90) * (Math.PI / 180)
    this.visionProximity = options.visionProximity || 40
    this.speed = options.speed || 80
    this.minYRatio = options.minYRatio || 0.35
    this.suspicionTime = options.suspicionTime || 0
    this.uuid = options.uuid || Math.random().toString(36).substr(2, 9)
    this.isStunned = options.isStunned || false
    const stunnedTimer = options.stunnedTimer || 3.0

    // Create ECS Entity
    this.entity = world.add({
      position: { x, y },
      velocity: { x: 0, y: 0 },
      enemy: true,
      // Initialize bounds with engine dimensions to prevent clamping to (0,0) on first frame
      bounds: { 
        minX: 0, 
        maxX: engine.width || 9999, 
        minY: 0, 
        maxY: engine.height || 9999 
      },
      render: {
          // Custom draw callback for hybrid migration
          onDraw: (renderer, entity) => this.draw(renderer)
      },
      // AI Components
      aiConfig: {
        type: this.aiType,
        visionRadius: this.visionRadius,
        visionType: this.visionType,
        visionAngle: this.visionAngle,
        visionProximity: this.visionProximity,
        speed: this.speed,
        suspicionTime: this.suspicionTime,
        minYRatio: this.minYRatio
      },
      aiState: {
        state: this.isStunned ? 'stunned' : 'wander',
        timer: this.isStunned ? stunnedTimer : 0,
        suspicion: 0,
        moveDir: { x: 0, y: 0 },
        facing: { x: 1, y: 0 },
        colorHex: '#eab308',
        alertAnim: 0,
        starAngle: 0,
        justEntered: true
      }
    })

    // Link pos to ECS component
    this.pos = this.entity.position

    this.battleGroup = battleGroup || []

    this.scale = 2
  }

  stun(duration = 3.0) {
    if (this.entity) {
      this.entity.aiState.state = 'stunned'
      this.entity.aiState.timer = duration
      this.entity.aiState.justEntered = true
    }
  }

  destroy() {
    if (this.entity) {
      world.remove(this.entity)
      this.entity = null
    }
  }

  toData() {
    // Read from ECS components
    const { aiState, aiConfig } = this.entity
    return {
      x: this.pos.x,
      y: this.pos.y,
      battleGroup: this.battleGroup,
      options: {
        uuid: this.uuid,
        isStunned: aiState.state === 'stunned',
        stunnedTimer: aiState.state === 'stunned' ? aiState.timer : 0,
        aiType: aiConfig.type,
        visionRadius: aiConfig.visionRadius,
        visionType: aiConfig.visionType,
        // Convert radians back to degrees
        visionAngle: Math.round(aiConfig.visionAngle * (180 / Math.PI)),
        visionProximity: aiConfig.visionProximity,
        speed: aiConfig.speed,
        minYRatio: aiConfig.minYRatio,
        suspicionTime: aiConfig.suspicionTime
      }
    }
  }

  /**
   * @param {GameEngine} engine 
   * @param {object} data - Data from toData()
   * @param {object} [context] - Runtime context (e.g. { player })
   */
  static fromData(engine, data, context = {}) {
    return new MapEnemy(engine, data.x, data.y, data.battleGroup, {
      ...data.options,
      ...context
    })
  }
  
  // NOTE: getDistToPlayer and canSeePlayer logic moved to EnemyAISystem.
  // We keep update() only to sync bounds (dynamic resizing).
  // The state machine logic is gone.

  update(dt) {
    this._updateBounds()
  }

  _updateBounds() {
    if (this.entity && this.entity.bounds) {
        const { width, height } = this.engine
        const minY = height * this.entity.aiConfig.minYRatio // Use config from component
        this.entity.bounds.minX = 0
        this.entity.bounds.maxX = width
        this.entity.bounds.minY = minY
        this.entity.bounds.maxY = height
    }
  }

  draw(renderer) {
    const ctx = renderer.ctx
    const { aiState, aiConfig } = this.entity
    
    // Optimization: Draw Vision Cone less frequently or simplify
    // We can skip drawing vision for wanderers if they are far, or simplify to circle
    if (aiState.state !== 'stunned' && aiConfig.type !== 'wander') {
      // Cull vision drawing if completely off-screen (already handled by RenderSystem partially, but vision is large)
      // RenderSystem culls based on position point, but vision extends radius.
      // We should rely on RenderSystem's culling margin (150px) which covers most vision radii.
      this._drawVision(ctx, aiState, aiConfig)
    }

    // 2. Draw Sprite/Body
    // Optimization: Avoid regex and string concatenation per frame per entity
    // We already have cached RGB, but string building `rgba(...)` is still somewhat expensive in tight loops.
    // Ideally we should cache the full style string in aiState when color changes, but let's stick to this for now.
    
    const img = this.engine.textures.get('sheet')
    if (img) {
      // Use pre-built semi-transparent color string if possible or just use a fixed shadow color
      // Shadow
      // renderer.drawCircle(this.pos.x, this.pos.y, 12, `rgba(0,0,0,0.2)`) 
      
      const spr = makeSprite({
        imageId: 'sheet',
        sx: 0, sy: 0, sw: 32, sh: 32,
        ax: 0.5, ay: 1.0
      })

      renderer.drawSprite(img, spr, this.pos, this.scale)
    } else {
      // Fallback
      renderer.drawCircle(this.pos.x, this.pos.y - 16, 14, aiState.colorHex)
    }

    // 3. State Specific Visuals
    if (aiState.suspicion > 0) {
       this._drawSuspicion(renderer, aiState, aiConfig)
    }
    
    if (aiState.state === 'chase') {
       this._drawAlert(renderer, aiState)
    }
    
    if (aiState.state === 'stunned') {
       this._drawStunned(renderer, aiState)
    }
  }

  _drawVision(ctx, aiState, aiConfig) {
    const { facing } = aiState
    const { visionRadius, visionType, visionProximity, visionAngle } = aiConfig
    
    // Optimization: Early return if context is missing or radius is tiny
    if (!ctx || visionRadius <= 1) return

    const isAlert = (aiState.state === 'chase')

    // Get cached off-screen canvas
    const img = getCachedVision(
      visionType,
      visionRadius,
      visionAngle,
      visionProximity,
      aiState.colorHex,
      isAlert
    )

    if (!img) return

    const currentAngle = Math.atan2(facing.y, facing.x)

    ctx.save()
    // Translate to enemy position
    ctx.translate(this.pos.x, this.pos.y)
    // Rotate to facing direction
    ctx.rotate(currentAngle)
    
    // Draw the cached image centered
    // The image was created with size = radius*2 + padding
    // And the shape is centered in that image.
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    
    ctx.restore()
  }

  _drawSuspicion(renderer, aiState, aiConfig) {
      const ctx = renderer.ctx
      const cx = this.pos.x
      const cy = this.pos.y - 35

      // Draw "?"
      ctx.save()
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = '#eab308' // Yellow
      ctx.textAlign = 'center'
      ctx.fillText('?', cx, cy)

      // Draw Bar if has time
      if (aiConfig.suspicionTime > 0) {
        const barW = 20
        const barH = 4

        ctx.fillStyle = '#1f2937'
        ctx.fillRect(cx - barW / 2, cy + 5, barW, barH)

        ctx.fillStyle = '#eab308'
        ctx.fillRect(cx - barW / 2 + 1, cy + 6, (barW - 2) * aiState.suspicion, barH - 2)
      }
      ctx.restore()
  }

  _drawAlert(renderer, aiState) {
    if (aiState.alertAnim > 0) {
      const ctx = renderer.ctx
      ctx.save()
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#ef4444'
      ctx.textAlign = 'center'
      // Bounce effect
      const yOffset = Math.sin(aiState.alertAnim * 20) * 5
      ctx.fillText('!', this.pos.x, this.pos.y - 35 - yOffset)
      ctx.restore()
    }
  }

  _drawStunned(renderer, aiState) {
    const ctx = renderer.ctx
    const cx = this.pos.x
    const cy = this.pos.y - 25 

    ctx.save()
    ctx.fillStyle = '#fbbf24' // Gold
    for (let i = 0; i < 3; i++) {
      const angle = aiState.starAngle + (i * (Math.PI * 2 / 3))
      const sx = cx + Math.cos(angle) * 12
      const sy = cy + Math.sin(angle) * 4
      
      ctx.beginPath()
      ctx.moveTo(sx, sy - 3)
      ctx.lineTo(sx + 3, sy)
      ctx.lineTo(sx, sy + 3)
      ctx.lineTo(sx - 3, sy)
      ctx.fill()
    }

    const barW = 24
    const barH = 4
    const pct = Math.max(0, aiState.timer / 3.0) 

    ctx.fillStyle = '#1f2937'
    ctx.fillRect(cx - barW / 2, cy - 15, barW, barH)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - barW / 2 + 1, cy - 14, (barW - 2) * pct, barH - 2)

    ctx.restore()
  }
}
