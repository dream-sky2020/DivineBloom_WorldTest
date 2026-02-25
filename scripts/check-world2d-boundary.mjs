import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const srcDir = join(root, 'src')

const bannedPatterns = [
  { name: 'forbidden world2d legacy world access', regex: /\bworld2d\.getWorld\s*\(/g },
  { name: 'forbidden world2d callback registration', regex: /\bworld2d\.registerCallbacks\s*\(/g },
  { name: 'forbidden legacy action queue push', regex: /\bactionQueue\.push\s*\(/g },
  { name: 'forbidden legacy event queue emit', regex: /\beventQueue\.emit\s*\(/g },
  { name: 'forbidden global commands queue push', regex: /\.commands\.queue\.push\s*\(/g }
]

function walk(dir, acc = []) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      walk(fullPath, acc)
      continue
    }
    if (/\.(ts|tsx|js|jsx|vue|mjs|cjs)$/.test(entry)) {
      acc.push(fullPath)
    }
  }
  return acc
}

const files = walk(srcDir)
const violations = []

for (const file of files) {
  const content = readFileSync(file, 'utf8')
  for (const pattern of bannedPatterns) {
    if (pattern.regex.test(content)) {
      violations.push(`${relative(root, file)} -> ${pattern.name}`)
    }
    pattern.regex.lastIndex = 0
  }
}

if (violations.length > 0) {
  console.error('[world2d-boundary] Forbidden usage detected:')
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('[world2d-boundary] OK')
