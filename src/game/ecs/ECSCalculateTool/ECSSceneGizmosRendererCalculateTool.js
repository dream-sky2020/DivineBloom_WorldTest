// 渲染辅助工具库
// 负责具体的 Canvas 绘图逻辑（视野、UI、特效），与 ECS 逻辑解耦

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

/**
 * 获取缓存的视野 Canvas
 */
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

// --- Public Draw Functions ---

/**
 * 绘制敌人视野
 * @param {CanvasRenderingContext2D} ctx 
 * @param {object} pos {x, y}
 * @param {object} aiConfig {visionRadius, visionType, ...}
 * @param {object} aiState {state, facing, colorHex}
 */
export function drawVision(ctx, pos, aiConfig, aiState) {
    const { facing } = aiState
    const { visionRadius, visionType, visionProximity, visionAngle } = aiConfig

    // Optimization: Early return if radius is tiny
    if (visionRadius <= 1) return

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
    ctx.translate(pos.x, pos.y)
    // Rotate to facing direction
    ctx.rotate(currentAngle)

    // Draw the cached image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    ctx.restore()
}

/**
 * 绘制疑惑/警戒 UI
 */
export function drawSuspicion(ctx, pos, aiState, aiConfig) {
    const cx = pos.x
    const cy = pos.y - 35

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

/**
 * 绘制惊叹号
 */
export function drawAlert(ctx, pos, aiState) {
    if (aiState.alertAnim > 0) {
        ctx.save()
        ctx.font = 'bold 24px Arial'
        ctx.fillStyle = '#ef4444'
        ctx.textAlign = 'center'
        // Bounce effect
        const yOffset = Math.sin(aiState.alertAnim * 20) * 5
        ctx.fillText('!', pos.x, pos.y - 35 - yOffset)
        ctx.restore()
    }
}

/**
 * 绘制眩晕星星和读条
 */
export function drawStunned(ctx, pos, aiState) {
    const cx = pos.x
    const cy = pos.y - 25

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
