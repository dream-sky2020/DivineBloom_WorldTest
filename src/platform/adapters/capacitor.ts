import type { PlatformId } from '../core/contracts'
import { createNoopServices } from '../core/createNoopServices'

export const createCapacitorServices = (platform: Extract<PlatformId, 'ios' | 'android'>) => {
  return createNoopServices(platform)
}
