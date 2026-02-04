/**
 * 输入管理
 */

export interface MouseState {
    x: number;
    y: number;
    screenX: number;
    screenY: number;
    isDown: boolean;
    justPressed: boolean;
    justReleased: boolean;
    rightJustPressed: boolean;
    rightJustReleased: boolean;
}

export class InputManager {
    canvas: HTMLCanvasElement | null;
    keys: Set<string>;
    mouse: MouseState;
    lastInput: string;

    private _boundDown: (e: KeyboardEvent) => void;
    private _boundUp: (e: KeyboardEvent) => void;
    private _boundMouseMove: (e: MouseEvent) => void;
    private _boundMouseDown: (e: MouseEvent) => void;
    private _boundMouseUp: (e: MouseEvent) => void;

    constructor(canvas: HTMLCanvasElement | null = null) {
        this.canvas = canvas
        this.keys = new Set()
        this.mouse = {
            x: 0,
            y: 0,
            screenX: 0,
            screenY: 0,
            isDown: false,
            justPressed: false,
            justReleased: false,
            rightJustPressed: false,
            rightJustReleased: false
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

    onMouseMove(e: MouseEvent) {
        this.mouse.screenX = e.clientX
        this.mouse.screenY = e.clientY
    }

    onMouseDown(e: MouseEvent) {
        // Only trigger justPressed if clicking on the canvas or its descendants
        const isCanvasClick = this.canvas && (e.target === this.canvas || this.canvas.contains(e.target as Node));
        if (!isCanvasClick) return;

        if (e.button === 0) { // Left click
            this.mouse.isDown = true
            this.mouse.justPressed = true
        } else if (e.button === 2) { // Right click
            this.mouse.rightJustPressed = true
        }
    }

    onMouseUp(e: MouseEvent) {
        if (e.button === 0) { // Left click
            this.mouse.isDown = false
            this.mouse.justReleased = true
        } else if (e.button === 2) { // Right click
            this.mouse.rightJustReleased = true
        }
    }

    /**
     * Called at the end of the frame to clear justPressed/justReleased flags
     */
    clearJustActions() {
        this.mouse.justPressed = false
        this.mouse.justReleased = false
        this.mouse.rightJustPressed = false
        this.mouse.rightJustReleased = false
    }

    onKeyDown(e: KeyboardEvent) {
        this.keys.add(e.code)
        this.lastInput = e.code
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault()
        }
    }

    onKeyUp(e: KeyboardEvent) {
        this.keys.delete(e.code)
    }

    isDown(code: string): boolean {
        return this.keys.has(code)
    }
}
