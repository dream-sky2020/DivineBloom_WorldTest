import { makeSprite } from '@/game/GameEngine'

/**
 * @typedef {import('@/game/GameEngine').GameEngine} GameEngine
 * @typedef {import('@/game/GameEngine').Renderer2D} Renderer2D
 */

// --- States ---

class EnemyState {
  constructor(enemy) {
    this.enemy = enemy
  }
  enter() { }
  exit() { }
  update(dt) { }
  draw(renderer) { }
}

class WanderState extends EnemyState {
  enter() {
    this.enemy.colorHex = '#eab308' // Yellow
    // 重置怀疑值
    this.enemy.suspicion = 0
  }

  update(dt) {
    // 1. Check Vision (Only if NOT pure wanderer)
    if (this.enemy.aiType !== 'wander') {
      const dist = this.enemy.getDistToPlayer()
      if (this.enemy.canSeePlayer(dist)) {
        // 视线内，增加怀疑值
        // 增加速度：如果有suspicionTime，则按比例增加，否则直接满
        // 距离越近，增长越快 (可选优化)
        const fillRate = this.enemy.suspicionTime > 0 ? (1.0 / this.enemy.suspicionTime) : Infinity
  
        this.enemy.suspicion += fillRate * dt
  
        // 视觉反馈：变色或进度条由外部 draw 处理
  
        if (this.enemy.suspicion >= 1.0) {
          // 怀疑值满，切换状态
          this.enemy.suspicion = 1.0 // Clamp
          if (this.enemy.aiType === 'chase') {
            this.enemy.changeState('chase')
            return
          } else if (this.enemy.aiType === 'flee') {
            this.enemy.changeState('flee')
            return
          }
        }
      } else {
        // 玩家离开视线，缓慢减少怀疑值
        if (this.enemy.suspicion > 0) {
          this.enemy.suspicion -= dt * 0.5 // 2秒清空
          if (this.enemy.suspicion < 0) this.enemy.suspicion = 0
        }
      }
    }
    
    // 2. Wander Logic
    // 如果正在产生怀疑（suspicion > 0），是否应该停止移动？
    // 通常敌人疑惑时会停下来观察。
    if (this.enemy.suspicion > 0) {
      this.enemy.moveDir.x = 0
      this.enemy.moveDir.y = 0
      // 面向玩家 (Optional: 让敌人转向玩家观察)
      if (this.enemy.player) {
        const dx = this.enemy.player.pos.x - this.enemy.pos.x
        const dy = this.enemy.player.pos.y - this.enemy.pos.y
        const angle = Math.atan2(dy, dx)
        this.enemy.facing.x = Math.cos(angle)
        this.enemy.facing.y = Math.sin(angle)
      }
      return // Skip normal wander movement
    }

    this.enemy.moveTimer -= dt
    if (this.enemy.moveTimer <= 0) {
      this.enemy.moveTimer = 2 + Math.random() * 2
      const angle = Math.random() * Math.PI * 2
      this.enemy.moveDir.x = Math.cos(angle)
      this.enemy.moveDir.y = Math.sin(angle)

      if (Math.random() < 0.3) {
        this.enemy.moveDir.x = 0
        this.enemy.moveDir.y = 0
      }
    }
  }

  draw(renderer) {
    // 绘制问号或怀疑进度
    if (this.enemy.suspicion > 0) {
      const ctx = renderer.ctx
      const cx = this.enemy.pos.x
      const cy = this.enemy.pos.y - 35

      // Draw "?"
      ctx.save()
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = '#eab308' // Yellow
      ctx.textAlign = 'center'
      ctx.fillText('?', cx, cy)

      // Draw Bar if has time
      if (this.enemy.suspicionTime > 0) {
        const barW = 20
        const barH = 4

        ctx.fillStyle = '#1f2937'
        ctx.fillRect(cx - barW / 2, cy + 5, barW, barH)

        ctx.fillStyle = '#eab308'
        ctx.fillRect(cx - barW / 2 + 1, cy + 6, (barW - 2) * this.enemy.suspicion, barH - 2)
      }
      ctx.restore()
    }
  }
}

class ChaseState extends EnemyState {
  enter() {
    this.enemy.colorHex = '#ef4444' // Red
    this.alertAnim = 0.5 // Show "!" for 0.5s
  }

  update(dt) {
    if (this.alertAnim > 0) this.alertAnim -= dt

    const dist = this.enemy.getDistToPlayer()

    // Give up if too far (vision radius * 1.5)
    if (dist > this.enemy.visionRadius * 1.5) {
      this.enemy.changeState('wander')
      return
    }

    if (!this.enemy.player) return

    // Move towards player
    const dx = this.enemy.player.pos.x - this.enemy.pos.x
    const dy = this.enemy.player.pos.y - this.enemy.pos.y
    const angle = Math.atan2(dy, dx)

    this.enemy.moveDir.x = Math.cos(angle)
    this.enemy.moveDir.y = Math.sin(angle)
  }

  draw(renderer) {
    // Draw "!"
    if (this.alertAnim > 0) {
      const ctx = renderer.ctx
      ctx.save()
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#ef4444'
      ctx.textAlign = 'center'
      // Bounce effect
      const yOffset = Math.sin(this.alertAnim * 20) * 5
      ctx.fillText('!', this.enemy.pos.x, this.enemy.pos.y - 35 - yOffset)
      ctx.restore()
    }
  }
}

class FleeState extends EnemyState {
  enter() {
    this.enemy.colorHex = '#3b82f6' // Blue
  }

  update(dt) {
    const dist = this.enemy.getDistToPlayer()
    if (dist > this.enemy.visionRadius * 1.5) {
      this.enemy.changeState('wander')
      return
    }

    if (!this.enemy.player) return

    const dx = this.enemy.player.pos.x - this.enemy.pos.x
    const dy = this.enemy.player.pos.y - this.enemy.pos.y
    const angle = Math.atan2(dy, dx)

    // Move opposite
    this.enemy.moveDir.x = -Math.cos(angle)
    this.enemy.moveDir.y = -Math.sin(angle)
  }
}

class StunnedState extends EnemyState {
  constructor(enemy, duration = 3.0) {
    super(enemy)
    this.duration = duration
    this.starAngle = 0
  }

  enter() {
    this.enemy.moveDir = { x: 0, y: 0 }
    this.enemy.colorHex = '#9ca3af' // Grayish
  }

  update(dt) {
    this.duration -= dt
    this.starAngle += dt * 4 // Rotate stars

    if (this.duration <= 0) {
      this.enemy.isStunned = false // Sync property
      this.enemy.changeState('wander')
    }
  }

  draw(renderer) {
    const ctx = renderer.ctx
    const cx = this.enemy.pos.x
    const cy = this.enemy.pos.y - 25 // Above head

    // Draw 3 spinning stars
    ctx.save()
    ctx.fillStyle = '#fbbf24' // Gold
    for (let i = 0; i < 3; i++) {
      const angle = this.starAngle + (i * (Math.PI * 2 / 3))
      const sx = cx + Math.cos(angle) * 12
      const sy = cy + Math.sin(angle) * 4 // Flattened ellipse orbit

      // Draw star (simple diamond)
      ctx.beginPath()
      ctx.moveTo(sx, sy - 3)
      ctx.lineTo(sx + 3, sy)
      ctx.lineTo(sx, sy + 3)
      ctx.lineTo(sx - 3, sy)
      ctx.fill()
    }

    // Draw Timer Bar
    const barW = 24
    const barH = 4
    const pct = Math.max(0, this.duration / 3.0) // Assuming max 3s for bar

    ctx.fillStyle = '#1f2937'
    ctx.fillRect(cx - barW / 2, cy - 15, barW, barH)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - barW / 2 + 1, cy - 14, (barW - 2) * pct, barH - 2)

    ctx.restore()
  }
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
    this.pos = { x, y }
    this.battleGroup = battleGroup || []

    // Config
    this.player = options.player || null
    this.aiType = options.aiType || 'wander'
    this.visionRadius = options.visionRadius || 120
    this.visionType = options.visionType || 'circle'
    this.visionAngle = (options.visionAngle || 90) * (Math.PI / 180)
    this.visionProximity = options.visionProximity || 40
    this.speed = options.speed || 80
    this.minYRatio = options.minYRatio || 0.35

    // Suspicion Config
    // 0 = Instant trigger, > 0 = seconds to fill suspicion
    this.suspicionTime = options.suspicionTime || 0

    // Persistence
    this.uuid = options.uuid || Math.random().toString(36).substr(2, 9)

    // State Machine
    this.states = {
      wander: new WanderState(this),
      chase: new ChaseState(this),
      flee: new FleeState(this),
      stunned: new StunnedState(this)
    }

    this.currentState = this.states.wander // Default
    this.colorHex = '#eab308'

    // Runtime Props
    this.suspicion = 0.0 // 0.0 to 1.0

    // Internal Props
    this.moveTimer = 0
    this.moveDir = { x: 0, y: 0 }
    this.facing = { x: 1, y: 0 }
    this.radius = 20

    // Stun Initialization
    this.isStunned = options.isStunned || false
    if (this.isStunned) {
      this.states.stunned.duration = options.stunnedTimer || 3.0
      this.changeState('stunned')
    } else {
      this.changeState('wander')
    }

    this.scale = 2
  }

  changeState(name) {
    if (this.currentState) this.currentState.exit()
    this.currentState = this.states[name]
    if (this.currentState) this.currentState.enter()
  }

  stun(duration = 3.0) {
    this.isStunned = true
    this.states.stunned.duration = duration
    this.changeState('stunned')
  }

  toData() {
    return {
      x: this.pos.x,
      y: this.pos.y,
      battleGroup: this.battleGroup,
      options: {
        uuid: this.uuid,
        isStunned: this.isStunned,
        stunnedTimer: this.states.stunned ? this.states.stunned.duration : 0,
        aiType: this.aiType,
        visionRadius: this.visionRadius,
        visionType: this.visionType,
        // Convert radians back to degrees
        visionAngle: Math.round(this.visionAngle * (180 / Math.PI)),
        visionProximity: this.visionProximity,
        speed: this.speed,
        minYRatio: this.minYRatio,
        suspicionTime: this.suspicionTime
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

  getDistToPlayer() {
    if (!this.player) return Infinity
    const dx = this.player.pos.x - this.pos.x
    const dy = this.player.pos.y - this.pos.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  canSeePlayer(dist) {
    if (!this.player) return false
    // Always see if very close (touching)
    if (dist < 30) return true

    if (dist > this.visionRadius) return false

    if (this.visionType === 'circle') return true

    if (this.visionType === 'hybrid') {
      if (dist <= this.visionProximity) return true
    }

    if (this.visionType === 'cone' || this.visionType === 'hybrid') {
      const dx = this.player.pos.x - this.pos.x
      const dy = this.player.pos.y - this.pos.y
      const nx = dx / (dist || 1)
      const ny = dy / (dist || 1)
      const dot = nx * this.facing.x + ny * this.facing.y
      const threshold = Math.cos(this.visionAngle / 2)
      return dot >= threshold
    }
    return false
  }

  update(dt) {
    // Delegate to State
    if (this.currentState) {
      this.currentState.update(dt)
    }

    // Common Physics
    const lenSq = this.moveDir.x * this.moveDir.x + this.moveDir.y * this.moveDir.y
    if (lenSq > 0.001) {
      const len = Math.sqrt(lenSq)
      this.facing.x = this.moveDir.x / len
      this.facing.y = this.moveDir.y / len
    }

    this.pos.x += this.moveDir.x * this.speed * dt
    this.pos.y += this.moveDir.y * this.speed * dt

    this._clampPosition()
  }

  _clampPosition() {
    const { width, height } = this.engine
    const minY = height * this.minYRatio
    this.pos.x = Math.max(0, Math.min(width, this.pos.x))
    this.pos.y = Math.max(minY, Math.min(height, this.pos.y))
  }

  draw(renderer) {
    const ctx = renderer.ctx

    // 1. Draw Vision Cone (Only if active/chasing)
    // We can let state handle this, or keep it common. 
    // Let's keep common but check state.

    if (this.currentState !== this.states.stunned && this.aiType !== 'wander') {
      this._drawVision(ctx)
    }

    // 2. Draw Sprite/Body
    // Use stored colorHex
    const colorRgba = (a) => {
      // Hex to RGB conversion
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.colorHex);
      return result ?
        `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${a})` :
        `rgba(0,0,0,${a})`;
    }

    const img = this.engine.textures.get('sheet')
    if (img) {
      renderer.drawCircle(this.pos.x, this.pos.y, 12, colorRgba(0.4))
      const spr = makeSprite({
        imageId: 'sheet',
        sx: 0, sy: 0, sw: 32, sh: 32,
        ax: 0.5, ay: 1.0
      })

      // If stunned, flash or tint? 
      // Canvas simple tinting is hard, let's just use the base circle color for now
      renderer.drawSprite(img, spr, this.pos, this.scale)
    } else {
      renderer.drawCircle(this.pos.x, this.pos.y - 16, 14, this.colorHex)
    }

    // 3. State Specific Visuals (Stars, !, etc)
    if (this.currentState) {
      this.currentState.draw(renderer)
    }
  }

  _drawVision(ctx) {
    const currentAngle = Math.atan2(this.facing.y, this.facing.x)

    // Hex to RGB helper for vision style
    const getStyle = (alpha) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.colorHex);
      return result ?
        `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` :
        `rgba(0,0,0,${alpha})`;
    }

    ctx.save()
    // Alert state (Chase) makes vision brighter
    const isAlert = (this.currentState === this.states.chase)

    ctx.fillStyle = getStyle(isAlert ? 0.15 : 0.05)
    ctx.strokeStyle = isAlert ? getStyle(0.5) : 'transparent'

    ctx.beginPath()
    if (this.visionType === 'cone' || this.visionType === 'hybrid') {
      const half = this.visionAngle / 2
      ctx.moveTo(this.pos.x, this.pos.y)
      ctx.arc(this.pos.x, this.pos.y, this.visionRadius, currentAngle - half, currentAngle + half)
      ctx.lineTo(this.pos.x, this.pos.y)

      if (this.visionType === 'hybrid') {
        ctx.moveTo(this.pos.x + this.visionProximity, this.pos.y)
        ctx.arc(this.pos.x, this.pos.y, this.visionProximity, 0, Math.PI * 2)
      }
    } else {
      ctx.arc(this.pos.x, this.pos.y, this.visionRadius, 0, Math.PI * 2)
    }
    ctx.fill()
    if (isAlert) ctx.stroke()
    ctx.restore()
  }
}
