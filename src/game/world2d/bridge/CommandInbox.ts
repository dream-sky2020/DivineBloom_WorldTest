import type { World2DCommand } from '../runtime/WorldChannelRuntime'

export interface ICommandInbox {
    push(cmd: World2DCommand): void;
    drain(maxPerFrame?: number): World2DCommand[];
}

const normalizeCommand = (cmd: World2DCommand): World2DCommand | null => {
    if (!cmd || typeof cmd !== 'object' || !cmd.type) return null

    return {
        ...cmd,
        meta: {
            timestamp: Date.now(),
            ...(cmd.meta || {})
        }
    }
}

export class InMemoryCommandInbox implements ICommandInbox {
    private readonly queue: World2DCommand[] = []

    push(cmd: World2DCommand) {
        const normalized = normalizeCommand(cmd)
        if (!normalized) return
        this.queue.push(normalized)
    }

    drain(maxPerFrame: number = Number.POSITIVE_INFINITY) {
        if (!this.queue.length) return []
        const count = Math.min(this.queue.length, Math.max(0, maxPerFrame))
        return this.queue.splice(0, count)
    }
}
