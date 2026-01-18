import { AssetManager } from './resources/AssetManager'
import { ResourcePipeline } from './resources/ResourcePipeline'
import { ResourceDeclaration } from './resources/ResourceDeclaration'
import { Renderer2D, makeSprite } from './Renderer2D'
import { InputManager } from './InputManager'

// Re-export for backward compatibility
export { Renderer2D, makeSprite, InputManager }

/**
 * 游戏引擎核心类
 */
export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d', { alpha: false })

        // 初始化子系统
        this.assets = new AssetManager()
        this.input = new InputManager(this.canvas)
        this.renderer = new Renderer2D(this.ctx, this.assets)

        // 🎯 新增：现代化资源管理系统
        this.resources = {
            pipeline: new ResourcePipeline(this.assets),
            declarations: ResourceDeclaration
        }

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

        if (this.input) {
            this.input.canvas = canvas
        }

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
