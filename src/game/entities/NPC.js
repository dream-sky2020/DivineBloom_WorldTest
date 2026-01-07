import { world } from '@/game/ecs/world'

export class NPC {
    constructor(engine, x, y, config = {}) {
        this.engine = engine

        // 如果没有提供 dialogueId，默认使用 'welcome'（或 'default'，取决于你的策略）
        // 这里为了匹配 Log 信息 "No dialogue script found for ID: welcome"，
        // 我们需要确保 config.dialogueId 有效
        this.dialogueId = config.dialogueId || 'welcome'

        // 映射旧的 spriteId 到新的 Visual ID
        const visualId = config.spriteId || 'npc_guide'

        this.entity = world.add({
            position: { x, y },
            npc: true,
            interaction: {
                type: 'dialogue',
                id: this.dialogueId, // 这个 ID 必须在 dialoguesDb 里有
                range: config.range || 60
            },
            body: {
                static: true,
                radius: 15,
                width: 30,
                height: 30
            },
            bounds: { minX: 0, maxX: 9999, minY: 0, maxY: 9999 },

            // --- 新视觉系统 ---
            visual: {
                id: visualId,
                state: 'default',
                frameIndex: 0,
                timer: 0,
                scale: config.scale || 0.8
            }
        })

        this.pos = this.entity.position
    }

    destroy() {
        if (this.entity) {
            world.remove(this.entity)
            this.entity = null
        }
    }
}
