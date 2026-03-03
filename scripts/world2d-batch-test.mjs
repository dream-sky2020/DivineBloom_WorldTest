import https from 'node:https'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import WebSocket from 'ws'

const args = process.argv.slice(2)
const readArg = (name, fallback) => {
  const key = `--${name}=`
  const hit = args.find((item) => item.startsWith(key))
  if (!hit) return fallback
  return hit.slice(key.length)
}

const readElectronGatewayConfig = () => {
  const configPath =
    readArg('config', process.env.WORLD2D_GATEWAY_CONFIG_FILE || path.join(os.tmpdir(), 'world2d-gateway-config.json'))
  try {
    if (!fs.existsSync(configPath)) return null
    const raw = fs.readFileSync(configPath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const host = typeof parsed.host === 'string' ? parsed.host : undefined
    const port = Number.isInteger(parsed.port) ? parsed.port : Number.parseInt(String(parsed.port || ''), 10)
    const token = typeof parsed.token === 'string' ? parsed.token : undefined
    if (!host || !Number.isFinite(port) || port <= 0) return null
    return { host, port, token, configPath }
  } catch {
    return null
  }
}

const electronConfig = readElectronGatewayConfig()
const host = readArg('host', electronConfig?.host || '127.0.0.1')
const port = Number.parseInt(
  readArg('port', String(electronConfig?.port || process.env.WORLD2D_GATEWAY_PORT || '18443')),
  10
)
const token = readArg('token', electronConfig?.token || process.env.WORLD2D_GATEWAY_TOKEN || '')
const count = Number.parseInt(readArg('count', '100'), 10)
const burst = Number.parseInt(readArg('burst', '20'), 10)
const intervalMs = Number.parseInt(readArg('interval', '100'), 10)

if (!token) {
  console.error('Missing token. Pass --token=... or WORLD2D_GATEWAY_TOKEN')
  process.exit(1)
}

if (electronConfig) {
  console.log(`[gateway-config] loaded from ${electronConfig.configPath} -> ${electronConfig.host}:${electronConfig.port}`)
}

const agent = new https.Agent({ rejectUnauthorized: false })

const requestJson = (method, pathname, body) => new Promise((resolve, reject) => {
  const payload = body ? JSON.stringify(body) : ''
  const req = https.request({
    host,
    port,
    path: pathname,
    method,
    agent,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'X-World2D-Token': token
    }
  }, (res) => {
    let raw = ''
    res.on('data', (chunk) => { raw += chunk.toString() })
    res.on('end', () => {
      try {
        resolve({
          statusCode: res.statusCode || 0,
          data: raw ? JSON.parse(raw) : {}
        })
      } catch (error) {
        reject(error)
      }
    })
  })
  req.on('error', reject)
  if (payload) req.write(payload)
  req.end()
})

const wsUrl = `wss://${host}:${port}/ws/world2d?token=${encodeURIComponent(token)}`
const ws = new WebSocket(wsUrl, { rejectUnauthorized: false })
let snapshotCount = 0

ws.on('message', (raw) => {
  try {
    const event = JSON.parse(raw.toString())
    if (event?.type === 'runtime-snapshot') {
      snapshotCount += 1
    }
  } catch {
    // ignore malformed messages
  }
})

await new Promise((resolve, reject) => {
  ws.once('open', resolve)
  ws.once('error', reject)
})

const state = await requestJson('GET', '/api/world2d/state', null)
console.log('[gateway-state]', state.statusCode, state.data?.ok ? 'ok' : 'fail')

const commands = []
for (let i = 0; i < count; i++) {
  commands.push({
    type: i % 2 === 0 ? 'UI_OPEN_MENU' : 'UI_OPEN_SHOP',
    payload: { from: 'batch-test', index: i },
    meta: { source: 'world2d-batch-test' }
  })
}

let sent = 0
while (sent < commands.length) {
  const chunk = commands.slice(sent, sent + burst)
  const res = await requestJson('POST', '/api/world2d/commands', { commands: chunk })
  if (!res.data?.ok) {
    console.error('[send-failed]', res.statusCode, res.data)
    process.exit(2)
  }
  sent += chunk.length
  await sleep(intervalMs)
}

await sleep(1500)
console.log('[result]', JSON.stringify({ sent, snapshotCount }))
ws.close()
