/**
 * 输入管理
 */
export class InputManager {
    constructor(canvas = null) {
        this.canvas = canvas
        this.keys = new Set()
        this.mouse = {
            x: 0,
            y: 0,
            screenX: 0,
            screenY: 0,
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
        this.mouse.screenX = e.clientX
        this.mouse.screenY = e.clientY
    }

    onMouseDown(e) {
        // Only trigger justPressed if clicking on the canvas or its descendants
        const isCanvasClick = this.canvas && (e.target === this.canvas || this.canvas.contains(e.target));
        if (!isCanvasClick) return;

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
