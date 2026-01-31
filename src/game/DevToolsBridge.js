// src/game/interface/DevToolsBridge.js
import { WindowBridge } from '@/utils/WindowBridge';

export class DevToolsBridge {
    constructor(callbacks) {
        this.bridge = new WindowBridge('MAIN_WINDOW', (msg) => this.handleCommand(msg));
        this.callbacks = callbacks; // 比如 { toggleEditMode: () => ... }
    }

    syncState(state) {
        this.bridge.send('STATE_UPDATE', state);
    }

    handleCommand({ type, payload }) {
        if (type === 'REQUEST_STATE') {
            this.callbacks.onRequestState?.();
        } else if (type === 'COMMAND') {
            const { type: cmdType, payload: cmdPayload } = payload;
            this.callbacks[cmdType]?.(cmdPayload);
        }
    }

    destroy() {
        this.bridge.close();
    }
}