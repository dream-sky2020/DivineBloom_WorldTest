import type { PlatformId, PlatformServices } from './contracts'

const logPrefix = '[Platform]'

export const createNoopServices = (platform: PlatformId): PlatformServices => {
  return {
    runtime: {
      getPlatform: () => platform,
      getSavePath: () => {
        if (platform === 'steam') {
          return 'steam://userdata/worldtest/save.json'
        }

        if (platform === 'ios' || platform === 'android') {
          return 'mobile://documents/worldtest/save.json'
        }

        return 'web://localStorage/worldtest-save'
      },
      openUrl: (url: string) => {
        if (typeof window !== 'undefined') {
          window.open(url, '_blank', 'noopener,noreferrer')
          return
        }

        console.info(`${logPrefix} openUrl skipped`, { platform, url })
      },
      vibrate: (durationMs = 30) => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(durationMs)
          return
        }

        console.info(`${logPrefix} vibrate unsupported`, { platform, durationMs })
      }
    },
    auth: {
      loginApple: async () => {
        console.info(`${logPrefix} loginApple noop`, { platform })
        return false
      },
      loginGoogle: async () => {
        console.info(`${logPrefix} loginGoogle noop`, { platform })
        return false
      },
      loginSteam: async () => {
        console.info(`${logPrefix} loginSteam noop`, { platform })
        return false
      }
    },
    cloud: {
      saveCloud: async (payload: string) => {
        console.info(`${logPrefix} saveCloud noop`, { platform, size: payload.length })
      },
      loadCloud: async () => {
        console.info(`${logPrefix} loadCloud noop`, { platform })
        return null
      }
    },
    iap: {
      purchase: async (productId: string) => {
        console.info(`${logPrefix} purchase noop`, { platform, productId })
        return false
      }
    }
  }
}
