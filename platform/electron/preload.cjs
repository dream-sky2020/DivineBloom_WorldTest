const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('worldtestElectron', {
  getCommMode: () => ipcRenderer.sendSync('world2d:get-comm-mode'),
  getGatewayConfig: () => ipcRenderer.sendSync('world2d:get-gateway-config'),
  notifyRendererReady: () => ipcRenderer.send('world2d:renderer-ready'),
  sendRuntimeSnapshot: (snapshot) => ipcRenderer.send('world2d:runtime-snapshot', snapshot),
  onGatewayCommand: (listener) => {
    if (typeof listener !== 'function') {
      return () => {}
    }
    const wrapped = (_event, payload) => listener(payload)
    ipcRenderer.on('world2d:gateway-command', wrapped)
    return () => ipcRenderer.removeListener('world2d:gateway-command', wrapped)
  }
})
