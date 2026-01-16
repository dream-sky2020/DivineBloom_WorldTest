import { AssetManager } from './managers/AssetManager'

/**
 * 精灵定义（支持裁切 + 锚点）
 * @deprecated 推荐使用 Visuals 系统
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
     * @param {AssetManager} assetManager
     */
    constructor(ctx, assetManager) {
        this.ctx = ctx
        this.assetManager = assetManager
        this.camera = { x: 0, y: 0 }
        this.clearColor = '#dbeafe'
        this.width = 0
        this.height = 0
    }

    setCamera(x, y) {
        this.camera.x = x
        this.camera.y = y
    }

    begin(w, h) {
        this.width = w
        this.height = h
        const ctx = this.ctx
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = this.clearColor
        ctx.fillRect(0, 0, w, h)
    }

    /**
     * 绘制精灵
     * @param {HTMLImageElement|string} imgOrId 
     * @param {object} spr Sprite 定义
     * @param {object} pos {x, y}
     * @param {number} scale 
     */
    drawSprite(imgOrId, spr, pos, scale = 1) {
        const ctx = this.ctx
        let img = imgOrId

        // 如果传入的是字符串ID，尝试从资源管理器获取
        if (typeof imgOrId === 'string') {
            img = this.assetManager.getTexture(imgOrId)
        }

        if (!img) return

        const x = pos.x - this.camera.x
        const y = pos.y - this.camera.y

        // Use full image size if sprite width/height is 0 or undefined
        const sw = spr.sw || img.width
        const sh = spr.sh || img.height

        // Destination width/height (affected by scale)
        const dw = sw * scale
        const dh = sh * scale

        const dx = x - dw * spr.ax
        const dy = y - dh * spr.ay

        // 简单阴影
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
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            justPressed: false,
            justReleased: false
        }
        this.lastInput = ''
        this._boundDown = this.onKeyDown.bind(this)
        this._boundUp = this.onKeyUp.bind(this)
        this._boundMouseMove = this.onMouseMove.bind(this)
        this._boundMouseDown = this.onMouseDown.bind(this)
        this._boundMouseUp = this.onMouseUp.bind(this)
    }

    enable() {
        window.addEventListener('keydown', this._boundDown, { passive: false })
        window.addEventListener('keyup', this._boundUp)
        window.addEventListener('mousemove', this._boundMouseMove)
        window.addEventListener('mousedown', this._boundMouseDown)
        window.addEventListener('mouseup', this._boundMouseUp)
    }

    disable() {
        window.removeEventListener('keydown', this._boundDown)
        window.removeEventListener('keyup', this._boundUp)
        window.removeEventListener('mousemove', this._boundMouseMove)
        window.removeEventListener('mousedown', this._boundMouseDown)
        window.removeEventListener('mouseup', this._boundMouseUp)
        this.keys.clear()
    }

    onMouseMove(e) {
        // We need to calculate position relative to the canvas
        // This will be handled in the update loop or by the caller providing the canvas rect
        this.mouse.screenX = e.clientX
        this.mouse.screenY = e.clientY
    }

    onMouseDown(e) {
        if (e.button === 0) { // Left click
            this.mouse.isDown = true
            this.mouse.justPressed = true
        }
    }

    onMouseUp(e) {
        if (e.button === 0) {
            this.mouse.isDown = false
            this.mouse.justReleased = true
        }
    }

    /**
     * Called at the end of the frame to clear justPressed/justReleased flags
     */
    clearJustActions() {
        this.mouse.justPressed = false
        this.mouse.justReleased = false
    }

    onKeyDown(e) {
        this.keys.add(e.code)
        this.lastInput = e.code
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
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

        // 初始化子系统
        this.assets = new AssetManager()
        this.input = new InputManager()
        this.renderer = new Renderer2D(this.ctx, this.assets)

        // 状态
        this.isRunning = false
        this.rafId = 0
        this.lastTime = 0
        this.width = 0
        this.height = 0

        // 回调
        this.onUpdate = (dt) => { }
        this.onDraw = (renderer) => { }

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
        // 更新 renderer 的引用（虽然通常不需要，但如果 renderer 缓存了尺寸的话）
    }

    setCanvas(canvas) {
        if (this.canvas === canvas) return

        // 1. Cleanup old observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
        }

        // 2. Set new canvas and context
        this.canvas = canvas
        this.ctx = canvas.getContext('2d', { alpha: false })

        // 3. Update renderer context
        if (this.renderer) {
            this.renderer.ctx = this.ctx
        }

        // 4. Setup new observer
        this.resizeObserver = new ResizeObserver(() => this.resize())
        this.resizeObserver.observe(canvas)

        // 5. Initial resize for new canvas
        this.resize()
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

        // Update Mouse Position relative to Canvas
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            // Screen to Canvas (logic pixels)
            this.input.mouse.x = (this.input.mouse.screenX - rect.left) * (this.width / rect.width);
            this.input.mouse.y = (this.input.mouse.screenY - rect.top) * (this.height / rect.height);
        }

        // Update
        this.onUpdate(dt)

        // Draw
        this.renderer.begin(this.width, this.height)
        this.onDraw(this.renderer)

        // Clear input flags
        this.input.clearJustActions()

        this.rafId = requestAnimationFrame(() => this.loop())
    }
}

