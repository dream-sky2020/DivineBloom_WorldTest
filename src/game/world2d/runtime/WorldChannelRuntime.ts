export interface ExternalState {
    [key: string]: any;
}

export interface ViewState {
    [key: string]: any;
}

export interface HostState {
    system?: string;
    isPaused?: boolean;
    isInitialized?: boolean;
    [key: string]: any;
}

export interface SceneState {
    mapId?: string;
    entryId?: string;
    editMode?: boolean;
    isTransitioning?: boolean;
    mapData?: any;
    mapBounds?: { width: number; height: number } | null;
    [key: string]: any;
}

export interface FrameContextState {
    dt?: number;
    timestamp?: number;
    engine?: any;
    input?: any;
    renderer?: any;
    viewport?: { width: number; height: number };
    gameManager?: any;
    sceneManager?: any;
    worldStore?: any;
    mapData?: any;
    mapBounds?: { width: number; height: number } | null;
    [key: string]: any;
}

export interface RuntimeServices {
    gameManager?: any;
    sceneManager?: any;
    worldStore?: any;
    editorManager?: any;
    [serviceName: string]: any;
}

export interface World2DCommand {
    type: string;
    payload?: any;
    meta?: {
        source?: string;
        commandId?: string;
        timestamp?: number;
        [key: string]: any;
    };
    [key: string]: any;
}

type StateSourceGetter = () => Partial<ExternalState> | null | undefined

export class WorldChannelRuntime {
    private readonly stateSources = new Map<string, StateSourceGetter>()
    private externalState: ExternalState = {}
    private viewState: ViewState = {}
    private hostState: HostState = {}
    private sceneState: SceneState = {}
    private frameContext: FrameContextState = {}
    private services: RuntimeServices = {}
    private readonly commandQueue: World2DCommand[] = []

    registerStateSource(sourceId: string, getter: StateSourceGetter) {
        if (!sourceId || typeof getter !== 'function') return
        this.stateSources.set(sourceId, getter)
    }

    unregisterStateSource(sourceId: string) {
        this.stateSources.delete(sourceId)
    }

    setExternalState(patch: Partial<ExternalState>) {
        if (!patch || typeof patch !== 'object') return
        this.externalState = { ...this.externalState, ...patch }
    }

    getExternalState() {
        const merged: ExternalState = { ...this.externalState }
        for (const [, getter] of this.stateSources) {
            const partial = getter?.()
            if (partial && typeof partial === 'object') {
                Object.assign(merged, partial)
            }
        }
        return merged
    }

    enqueueCommand(cmd: World2DCommand) {
        if (!cmd || !cmd.type) return
        this.commandQueue.push({
            ...cmd,
            meta: {
                timestamp: Date.now(),
                ...(cmd.meta || {})
            }
        })
    }

    drainCommands(maxPerFrame: number = Number.POSITIVE_INFINITY) {
        if (!this.commandQueue.length) return []
        const count = Math.min(this.commandQueue.length, Math.max(0, maxPerFrame))
        return this.commandQueue.splice(0, count)
    }

    getViewState() {
        return { ...this.viewState }
    }

    setViewState(patch: Partial<ViewState>) {
        if (!patch || typeof patch !== 'object') return
        this.viewState = { ...this.viewState, ...patch }
    }

    setHostState(patch: Partial<HostState>) {
        if (!patch || typeof patch !== 'object') return
        this.hostState = { ...this.hostState, ...patch }
    }

    getHostState() {
        return { ...this.hostState }
    }

    setSceneState(patch: Partial<SceneState>) {
        if (!patch || typeof patch !== 'object') return
        this.sceneState = { ...this.sceneState, ...patch }
    }

    getSceneState() {
        return { ...this.sceneState }
    }

    setFrameContext(patch: Partial<FrameContextState>) {
        if (!patch || typeof patch !== 'object') return
        this.frameContext = { ...this.frameContext, ...patch }
    }

    getFrameContext() {
        return { ...this.frameContext }
    }

    setService<K extends keyof RuntimeServices>(name: K, value: RuntimeServices[K]) {
        if (!name) return
        this.services[name] = value
    }

    getService<K extends keyof RuntimeServices>(name: K) {
        return this.services[name]
    }

    getServices() {
        return { ...this.services }
    }

    clearHostRuntimeState() {
        this.hostState = {}
        this.sceneState = {}
        this.frameContext = {}
    }
}

export const worldChannelRuntime = new WorldChannelRuntime()
