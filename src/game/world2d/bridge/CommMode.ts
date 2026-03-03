export type World2DCommMode = 'dual' | 'remote-only' | 'local-only'

declare global {
    interface Window {
        worldtestElectron?: {
            getCommMode?: () => string | undefined;
            getGatewayConfig?: () => { host: string; port: number; token: string } | undefined;
            notifyRendererReady?: () => void;
            sendRuntimeSnapshot?: (snapshot: unknown) => void;
            onGatewayCommand?: (listener: (command: unknown) => void) => (() => void) | void;
        };
    }
}

const normalizeMode = (mode: string | undefined): World2DCommMode => {
    if (mode === 'remote-only' || mode === 'local-only' || mode === 'dual') {
        return mode
    }
    return 'dual'
}

export function resolveWorld2DCommMode(): World2DCommMode {
    if (typeof window !== 'undefined') {
        const electronMode = window.worldtestElectron?.getCommMode?.()
        if (electronMode) return normalizeMode(electronMode)
    }

    const viteMode = import.meta.env?.VITE_WORLD2D_COMM_MODE
    return normalizeMode(viteMode)
}
