import {
    worldChannelRuntime,
    type ExternalState,
    type FrameContextState,
    type HostState,
    type RuntimeServices,
    type SceneState,
    type ViewState,
    type World2DCommand
} from '../runtime/WorldChannelRuntime'

export type {
    ExternalState,
    FrameContextState,
    HostState,
    RuntimeServices,
    SceneState,
    ViewState,
    World2DCommand
} from '../runtime/WorldChannelRuntime'

type StateSourceGetter = () => Partial<ExternalState> | null | undefined

export function registerStateSource(sourceId: string, getter: StateSourceGetter) {
    worldChannelRuntime.registerStateSource(sourceId, getter)
}

export function unregisterStateSource(sourceId: string) {
    worldChannelRuntime.unregisterStateSource(sourceId)
}

export function setExternalState(patch: Partial<ExternalState>) {
    worldChannelRuntime.setExternalState(patch)
}

export function getExternalState() {
    return worldChannelRuntime.getExternalState()
}

export function enqueueCommand(cmd: World2DCommand) {
    worldChannelRuntime.enqueueCommand(cmd)
}

export function drainCommands(maxPerFrame: number = Number.POSITIVE_INFINITY) {
    return worldChannelRuntime.drainCommands(maxPerFrame)
}

export function getViewState() {
    return worldChannelRuntime.getViewState()
}

export function setViewState(patch: Partial<ViewState>) {
    worldChannelRuntime.setViewState(patch)
}

export function setHostState(patch: Partial<HostState>) {
    worldChannelRuntime.setHostState(patch)
}

export function getHostState() {
    return worldChannelRuntime.getHostState()
}

export function setSceneState(patch: Partial<SceneState>) {
    worldChannelRuntime.setSceneState(patch)
}

export function getSceneState() {
    return worldChannelRuntime.getSceneState()
}

export function setFrameContext(patch: Partial<FrameContextState>) {
    worldChannelRuntime.setFrameContext(patch)
}

export function getFrameContext() {
    return worldChannelRuntime.getFrameContext()
}

export function setRuntimeService<K extends keyof RuntimeServices>(name: K, value: RuntimeServices[K]) {
    worldChannelRuntime.setService(name, value)
}

export function getRuntimeService<K extends keyof RuntimeServices>(name: K) {
    return worldChannelRuntime.getService(name)
}

export function getRuntimeServices() {
    return worldChannelRuntime.getServices()
}

export function clearHostRuntimeState() {
    worldChannelRuntime.clearHostRuntimeState()
}
