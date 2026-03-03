import { world2d } from '@world2d'

let stopGatewayCommandListen: (() => void) | null = null
let stopSnapshotSubscribe: (() => void) | null = null

export function initWorld2DElectronGatewayBridge() {
  const api = window.worldtestElectron
  if (!api) return

  api.notifyRendererReady?.()
  api.sendRuntimeSnapshot?.({
    timestamp: Date.now(),
    reason: 'bridge-init',
    commMode: api.getCommMode?.() || 'dual',
    hostState: {},
    sceneState: {},
    viewState: {},
    externalState: {},
    debugInfo: null
  })

  const off = api.onGatewayCommand?.((command: unknown) => {
    try {
      world2d.enqueueGatewayCommand(command as any)
    } catch (error) {
      console.error('[World2DGatewayBridge] Failed to enqueue gateway command', error)
    }
  })

  stopGatewayCommandListen = typeof off === 'function' ? off : null

  try {
    stopSnapshotSubscribe = world2d.subscribeRuntimeSnapshot((snapshot) => {
      api.sendRuntimeSnapshot?.(snapshot)
    }, true)
  } catch (error) {
    api.sendRuntimeSnapshot?.({
      timestamp: Date.now(),
      reason: 'bridge-subscribe-error',
      commMode: api.getCommMode?.() || 'dual',
      hostState: {},
      sceneState: {},
      viewState: {},
      externalState: {},
      debugInfo: { error: String(error) }
    })
  }

  window.addEventListener('beforeunload', disposeWorld2DElectronGatewayBridge, { once: true })
}

export function disposeWorld2DElectronGatewayBridge() {
  if (stopGatewayCommandListen) {
    stopGatewayCommandListen()
    stopGatewayCommandListen = null
  }
  if (stopSnapshotSubscribe) {
    stopSnapshotSubscribe()
    stopSnapshotSubscribe = null
  }
}
