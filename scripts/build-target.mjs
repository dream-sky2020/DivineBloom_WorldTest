import { spawnSync } from 'node:child_process'

const allowedTargets = new Set(['web', 'ios', 'android', 'steam'])

const readTargetFromArgv = () => {
  const targetArg = process.argv.find((arg) => arg.startsWith('--target='))
  return targetArg ? targetArg.slice('--target='.length) : undefined
}

const inputTarget = readTargetFromArgv() ?? process.env.TARGET ?? 'web'
const target = allowedTargets.has(inputTarget) ? inputTarget : null

if (!target) {
  console.error(`[build-target] Invalid target "${inputTarget}". Expected one of: web, ios, android, steam.`)
  process.exit(1)
}

const cleanResult = spawnSync('npm', ['run', 'clean:dist'], {
  stdio: 'inherit',
  shell: true
})

if (typeof cleanResult.status !== 'number' || cleanResult.status !== 0) {
  process.exit(cleanResult.status ?? 1)
}

const result = spawnSync('npm', ['run', `build:${target}`], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    TARGET: target
  }
})

if (typeof result.status === 'number') {
  process.exit(result.status)
}

process.exit(1)
