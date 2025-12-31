
/**
 * 资源加载/缓存
 */
export class TextureStore {
  constructor() {
    /** @type {Map<string, HTMLImageElement>} */
    this.images = new Map()
    /** @type {Map<string, Promise<HTMLImageElement>>} */
    this.loading = new Map()
  }

  /**
   * @param {string} id
   * @param {string} url
   * @returns {Promise<HTMLImageElement>}
   */
  load(id, url) {
    if (this.images.has(id)) return Promise.resolve(this.images.get(id))
    if (this.loading.has(id)) return this.loading.get(id)

    const p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.images.set(id, img)
        this.loading.delete(id)
        resolve(img)
      }
      img.onerror = (e) => {
        this.loading.delete(id)
        reject(new Error(`Failed to load image: ${id}`))
      }
      img.src = url
    })

    this.loading.set(id, p)
    return p
  }

  /**
   * @param {string} id
   * @returns {HTMLImageElement | null}
   */
  get(id) {
    return this.images.get(id) || null
  }
}

/**
 * 精灵定义（支持裁切 + 锚点）
 */
export function makeSprite({
  imageId,
  sx = 0, sy = 0, sw = 0, sh = 0,
  ax = 0.5, ay = 1.0, // anchor 默认脚底（中下）
}) {
  return { imageId, sx, sy, sw, sh, ax, ay }
}

/**
 * 统一绘制（Canvas2D）
 */
export class Renderer2D {
  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(ctx) {
    this.ctx = ctx
    this.camera = { x: 0, y: 0 }
    this.clearColor = '#dbeafe'
  }

  setCamera(x, y) {
    this.camera.x = x
    this.camera.y = y
  }

  begin(w, h) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = this.clearColor
    ctx.fillRect(0, 0, w, h)
  }

  /**
   * @param {HTMLImageElement} img
   * @param {{sx:number,sy:number,sw:number,sh:number,ax:number,ay:number}} spr
   * @param {{x:number,y:number}} pos world position
   * @param {number} scale
   */
  drawSprite(img, spr, pos, scale = 1) {
    const ctx = this.ctx
    const x = pos.x - this.camera.x
    const y = pos.y - this.camera.y

    const sw = spr.sw || img.width
    const sh = spr.sh || img.height
    const dw = sw * scale
    const dh = sh * scale

    const dx = x - dw * spr.ax
    const dy = y - dh * spr.ay

    // 影子（可选，但很“游戏感”）
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.ellipse(x, y + 6 * scale, 12 * scale, 7 * scale, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.drawImage(img, spr.sx, spr.sy, sw, sh, dx, dy, dw, dh)
  }
  
  // 辅助绘图方法
  drawCircle(x, y, r, color) {
    const ctx = this.ctx
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x - this.camera.x, y - this.camera.y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  drawRect(x, y, w, h, color) {
    const ctx = this.ctx
    ctx.fillStyle = color
    ctx.fillRect(x - this.camera.x, y - this.camera.y, w, h)
  }
}

/**
 * 输入管理
 */
export class InputManager {
  constructor() {
    this.keys = new Set()
    this.lastInput = ''
    this._boundDown = this.onKeyDown.bind(this)
    this._boundUp = this.onKeyUp.bind(this)
  }

  enable() {
    window.addEventListener('keydown', this._boundDown, { passive: false })
    window.addEventListener('keyup', this._boundUp)
  }

  disable() {
    window.removeEventListener('keydown', this._boundDown)
    window.removeEventListener('keyup', this._boundUp)
    this.keys.clear()
  }

  onKeyDown(e) {
    this.keys.add(e.code)
    this.lastInput = e.code
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault()
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.code)
  }

  isDown(code) {
    return this.keys.has(code)
  }
}

/**
 * 游戏引擎核心类
 */
export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })
    this.renderer = new Renderer2D(this.ctx)
    this.textures = new TextureStore()
    this.input = new InputManager()
    
    // 状态
    this.isRunning = false
    this.rafId = 0
    this.lastTime = 0
    this.width = 0
    this.height = 0
    
    // 回调
    this.onUpdate = (dt) => {}
    this.onDraw = (renderer) => {}
    
    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
  }

  resize() {
    const canvas = this.canvas
    if (!canvas) return
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    this.width = canvas.clientWidth
    this.height = canvas.clientHeight
    canvas.width = Math.floor(this.width * dpr)
    canvas.height = Math.floor(this.height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.input.enable()
    this.lastTime = performance.now() / 1000
    this.loop()
  }

  stop() {
    this.isRunning = false
    this.input.disable()
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  destroy() {
    this.stop()
    this.resizeObserver.disconnect()
  }

  loop() {
    if (!this.isRunning) return

    const now = performance.now() / 1000
    const dt = Math.min(0.05, now - this.lastTime)
    this.lastTime = now

    // Update
    this.onUpdate(dt)

    // Draw
    this.renderer.begin(this.width, this.height)
    this.onDraw(this.renderer)

    this.rafId = requestAnimationFrame(() => this.loop())
  }
}

