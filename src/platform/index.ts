import type { PlatformId, PlatformServices } from './core/contracts'
import { createCapacitorServices } from './adapters/capacitor'
import { createElectronServices } from './adapters/electron'
import { createWebServices } from './adapters/web'

const normalizeTarget = (target: string | undefined): PlatformId => {
  switch (target) {
    case 'ios':
    case 'android':
    case 'steam':
      return target
    default:
      return 'web'
  }
}

export const getPlatformId = (): PlatformId => {
  if (typeof __TARGET__ === 'string') {
    return normalizeTarget(__TARGET__)
  }

  return 'web'
}

export const createPlatformServices = (): PlatformServices => {
  const platform = getPlatformId()

  if (platform === 'ios' || platform === 'android') {
    return createCapacitorServices(platform)
  }

  if (platform === 'steam') {
    return createElectronServices()
  }

  return createWebServices()
}

export const platformServices = createPlatformServices()
