const { app, BrowserWindow, ipcMain } = require('electron')
const https = require('node:https')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const { URL } = require('node:url')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const { WebSocketServer, WebSocket } = require('ws')

const commMode = normalizeCommMode(process.env.WORLD2D_COMM_MODE)
const gatewayHost = '127.0.0.1'
const preferredGatewayPort = Number.parseInt(process.env.WORLD2D_GATEWAY_PORT || '18443', 10)
const gatewayToken = process.env.WORLD2D_GATEWAY_TOKEN || crypto.randomBytes(24).toString('hex')
const gatewayConfigFile = process.env.WORLD2D_GATEWAY_CONFIG_FILE || path.join(os.tmpdir(), 'world2d-gateway-config.json')
const commandStatsWindowSize = Math.max(1, Number.parseInt(process.env.WORLD2D_COMMAND_STATS_WINDOW || '50', 10))

function createGatewaySnapshot(reason, debugInfo = null) {
  return decorateSnapshot({
    timestamp: Date.now(),
    reason,
    commMode,
    hostState: { isInitialized: false, isPaused: false },
    sceneState: {},
    viewState: {},
    externalState: {},
    debugInfo
  })
}

const gatewayState = {
  rendererReady: false,
  latestSnapshot: null,
  recentCommandTypes: [],
  lastCommandAt: null
}
gatewayState.latestSnapshot = createGatewaySnapshot('gateway-boot')

let gatewayServer = null
let wsServer = null
let mainWindowRef = null
let selectedGatewayPort = preferredGatewayPort

function summarizeToken(token) {
  if (!token) return { present: false, preview: 'empty', length: 0 }
  const plain = String(token)
  const preview = plain.length <= 10
    ? `${plain.slice(0, 2)}***${plain.slice(-2)}`
    : `${plain.slice(0, 6)}...${plain.slice(-4)}`
  return {
    present: true,
    preview,
    length: plain.length
  }
}

function buildGatewaySummary() {
  return {
    host: gatewayHost,
    port: selectedGatewayPort,
    token: summarizeToken(gatewayToken),
    rendererReady: gatewayState.rendererReady
  }
}

function buildCommandStats() {
  const typeCount = {}
  for (const type of gatewayState.recentCommandTypes) {
    typeCount[type] = (typeCount[type] || 0) + 1
  }
  return {
    windowSize: commandStatsWindowSize,
    observed: gatewayState.recentCommandTypes.length,
    recentTypes: [...gatewayState.recentCommandTypes],
    typeCount,
    lastCommandAt: gatewayState.lastCommandAt
  }
}

function recordCommandStats(commands) {
  for (const command of commands) {
    const commandType = command?.type && typeof command.type === 'string' ? command.type : 'UNKNOWN'
    gatewayState.recentCommandTypes.push(commandType)
  }
  if (gatewayState.recentCommandTypes.length > commandStatsWindowSize) {
    gatewayState.recentCommandTypes.splice(0, gatewayState.recentCommandTypes.length - commandStatsWindowSize)
  }
  gatewayState.lastCommandAt = Date.now()
}

function decorateSnapshot(snapshot) {
  return {
    ...snapshot,
    timestamp: snapshot?.timestamp || Date.now(),
    reason: snapshot?.reason || 'runtime-snapshot',
    commMode: snapshot?.commMode || commMode,
    gatewaySummary: buildGatewaySummary(),
    commandStats: buildCommandStats()
  }
}

function normalizeCommMode(mode) {
  if (mode === 'remote-only' || mode === 'local-only' || mode === 'dual') {
    return mode
  }
  return 'dual'
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-World2D-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  })
  res.end(JSON.stringify(payload))
}

function isAuthed(reqUrl, headers) {
  const headerToken = headers['x-world2d-token']
  if (headerToken && headerToken === gatewayToken) return true

  try {
    const parsedUrl = new URL(reqUrl || '/', `https://${gatewayHost}:${selectedGatewayPort}`)
    const token = parsedUrl.searchParams.get('token')
    return token === gatewayToken
  } catch {
    return false
  }
}

function broadcastSnapshot(snapshot) {
  if (!wsServer) return
  const payload = JSON.stringify({
    type: 'runtime-snapshot',
    data: snapshot
  })
  for (const client of wsServer.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}

function buildGatewayStatePayload() {
  return {
    commMode,
    rendererReady: gatewayState.rendererReady,
    snapshot: gatewayState.latestSnapshot
  }
}

function handleGatewayRequest(req, res) {
  if (req.method === 'OPTIONS') {
    writeJson(res, 200, { ok: true })
    return
  }

  if (!isAuthed(req.url, req.headers)) {
    writeJson(res, 401, { ok: false, message: 'Unauthorized' })
    return
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/world2d/state')) {
    writeJson(res, 200, { ok: true, data: buildGatewayStatePayload() })
    return
  }

  if (req.method === 'POST' && req.url?.startsWith('/api/world2d/commands')) {
    if (commMode === 'local-only') {
      writeJson(res, 403, { ok: false, message: 'Gateway command is disabled in local-only mode' })
      return
    }
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk.toString()
      if (raw.length > 1024 * 1024) {
        req.destroy(new Error('payload too large'))
      }
    })
    req.on('end', () => {
      if (!gatewayState.rendererReady || !mainWindowRef || mainWindowRef.isDestroyed()) {
        writeJson(res, 503, { ok: false, message: 'Renderer is not ready' })
        return
      }

      try {
        const body = raw ? JSON.parse(raw) : {}
        const commands = Array.isArray(body.commands) ? body.commands : (body.command ? [body.command] : [])
        if (!commands.length) {
          writeJson(res, 400, { ok: false, message: 'commands is required' })
          return
        }
        for (const command of commands) {
          mainWindowRef.webContents.send('world2d:gateway-command', command)
        }
        recordCommandStats(commands)
        gatewayState.latestSnapshot = createGatewaySnapshot('gateway-commands-accepted', {
          accepted: commands.length
        })
        broadcastSnapshot(gatewayState.latestSnapshot)
        writeJson(res, 200, { ok: true, accepted: commands.length })
      } catch (error) {
        writeJson(res, 400, { ok: false, message: `Invalid JSON: ${error.message}` })
      }
    })
    return
  }

  writeJson(res, 404, { ok: false, message: 'Not Found' })
}

function listenGatewayServer(port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      gatewayServer.removeListener('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      gatewayServer.removeListener('error', onError)
      resolve()
    }

    gatewayServer.once('error', onError)
    gatewayServer.once('listening', onListening)
    gatewayServer.listen(port, gatewayHost)
  })
}

async function startGatewayServer() {
  const certPair = generateCertificatePair()
  gatewayServer = https.createServer({ key: certPair.key, cert: certPair.cert }, handleGatewayRequest)

  wsServer = new WebSocketServer({ server: gatewayServer, path: '/ws/world2d' })
  wsServer.on('connection', (socket, req) => {
    if (!isAuthed(req.url, req.headers)) {
      socket.close(1008, 'Unauthorized')
      return
    }

    socket.send(JSON.stringify({
      type: 'gateway-ready',
      data: {
        commMode,
        host: gatewayHost,
        port: selectedGatewayPort
      }
    }))

    if (gatewayState.latestSnapshot) {
      socket.send(JSON.stringify({
        type: 'runtime-snapshot',
        data: gatewayState.latestSnapshot
      }))
    }
  })

  try {
    await listenGatewayServer(preferredGatewayPort)
  } catch (error) {
    if (error && error.code === 'EADDRINUSE') {
      await listenGatewayServer(0)
    } else {
      throw error
    }
  }

  const address = gatewayServer.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to resolve gateway listening address')
  }
  selectedGatewayPort = address.port

  console.log(`[World2DGateway] https://${gatewayHost}:${selectedGatewayPort}`)
  if (selectedGatewayPort !== preferredGatewayPort) {
    console.log(`[World2DGateway] preferred port ${preferredGatewayPort} is in use, switched to ${selectedGatewayPort}`)
  }
  console.log(`[World2DGateway] token=${gatewayToken}`)
  console.log(`[World2DGateway] commMode=${commMode}`)
  persistGatewayConfig()
  console.log(`[World2DGateway] configFile=${gatewayConfigFile}`)
}

function generateCertificatePair() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'world2d-gateway-'))
  const keyPath = path.join(tempDir, 'server.key')
  const certPath = path.join(tempDir, 'server.crt')
  const args = [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-sha256',
    '-days',
    '365',
    '-nodes',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-subj',
    '/CN=localhost',
    '-addext',
    'subjectAltName=DNS:localhost,IP:127.0.0.1'
  ]

  const result = spawnSync('openssl', args, { stdio: 'ignore' })
  if (result.status !== 0) {
    throw new Error('Failed to generate HTTPS certificate with openssl')
  }

  const key = fs.readFileSync(keyPath, 'utf8')
  const cert = fs.readFileSync(certPath, 'utf8')
  fs.rmSync(tempDir, { recursive: true, force: true })
  return { key, cert }
}

function persistGatewayConfig() {
  const payload = {
    host: gatewayHost,
    port: selectedGatewayPort,
    token: gatewayToken,
    commMode,
    pid: process.pid,
    updatedAt: new Date().toISOString()
  }
  fs.writeFileSync(gatewayConfigFile, JSON.stringify(payload, null, 2), 'utf8')
}

function stopGatewayServer() {
  if (wsServer) {
    wsServer.close()
    wsServer = null
  }
  if (gatewayServer) {
    gatewayServer.close()
    gatewayServer = null
  }
  try {
    fs.unlinkSync(gatewayConfigFile)
  } catch {
    // ignore config cleanup errors
  }
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  const entry = path.join(__dirname, '..', '..', 'dist', 'steam', 'index.html')
  mainWindow.loadFile(entry)
  mainWindowRef = mainWindow
  mainWindow.webContents.once('did-finish-load', () => {
    gatewayState.rendererReady = true
    mainWindow.webContents.executeJavaScript('Boolean(window.worldtestElectron)')
      .then((hasApi) => {
        console.log(`[World2DGateway] preloadApi=${hasApi}`)
      })
      .catch(() => {})
  })
  mainWindow.webContents.on('console-message', (_event, level, message) => {
    if (level <= 2) {
      console.log(`[RendererConsole] ${message}`)
    }
  })

  mainWindow.on('closed', () => {
    if (mainWindowRef === mainWindow) {
      mainWindowRef = null
      gatewayState.rendererReady = false
    }
  })
}

ipcMain.on('world2d:renderer-ready', () => {
  gatewayState.rendererReady = true
  if (!gatewayState.latestSnapshot) {
    gatewayState.latestSnapshot = createGatewaySnapshot('renderer-ready')
  }
})

ipcMain.on('world2d:runtime-snapshot', (_event, snapshot) => {
  if (!snapshot || typeof snapshot !== 'object') return
  gatewayState.latestSnapshot = decorateSnapshot(snapshot)
  broadcastSnapshot(gatewayState.latestSnapshot)
})

ipcMain.on('world2d:get-comm-mode', (event) => {
  event.returnValue = commMode
})

ipcMain.on('world2d:get-gateway-config', (event) => {
  event.returnValue = {
    host: gatewayHost,
    port: selectedGatewayPort,
    token: gatewayToken
  }
})

app.whenReady().then(async () => {
  await startGatewayServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopGatewayServer()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
