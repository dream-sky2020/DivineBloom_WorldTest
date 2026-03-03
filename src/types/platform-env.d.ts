declare const __TARGET__: 'web' | 'ios' | 'android' | 'steam' | undefined

interface ImportMetaEnv {
  readonly VITE_WORLD2D_COMM_MODE?: 'dual' | 'remote-only' | 'local-only';
}
