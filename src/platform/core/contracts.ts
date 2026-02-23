export type PlatformId = 'web' | 'ios' | 'android' | 'steam'

export interface PlatformRuntime {
  getPlatform(): PlatformId
  getSavePath(): string
  openUrl(url: string): void
  vibrate(durationMs?: number): void
}

export interface PlatformAuth {
  loginApple(): Promise<boolean>
  loginGoogle(): Promise<boolean>
  loginSteam(): Promise<boolean>
}

export interface PlatformCloud {
  saveCloud(payload: string): Promise<void>
  loadCloud(): Promise<string | null>
}

export interface PlatformIAP {
  purchase(productId: string): Promise<boolean>
}

export interface PlatformServices {
  runtime: PlatformRuntime
  auth: PlatformAuth
  cloud: PlatformCloud
  iap: PlatformIAP
}
