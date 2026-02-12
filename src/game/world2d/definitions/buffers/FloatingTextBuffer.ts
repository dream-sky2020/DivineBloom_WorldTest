export const DEFAULT_MAX_FLOATING_TEXTS = 256;

export type FloatingTextType = 'damage' | 'heal' | 'critical' | 'system';

export type FloatingTextItem = {
  id: number;
  active: boolean;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
  scale: number;
  color: string;
  type: FloatingTextType;
  targetId: string | null;
  tick: number;
};

export type FloatingTextSpawnInput = {
  text: string;
  x: number;
  y: number;
  color?: string;
  type?: FloatingTextType;
  life?: number;
  scale?: number;
  vx?: number;
  vy?: number;
  targetId?: string | null;
  tick?: number;
};

export type FloatingTextBufferData = {
  tick: number;
  maxCount: number;
  items: FloatingTextItem[];
  activeCount: number;
  nextId: number;
  droppedCount: number;
};

function createEmptyItem(id: number): FloatingTextItem {
  return {
    id,
    active: false,
    text: '',
    x: 0,
    y: 0,
    vx: 0,
    vy: -32,
    life: 0,
    maxLife: 0,
    alpha: 1,
    scale: 1,
    color: '#ffffff',
    type: 'damage',
    targetId: null,
    tick: 0
  };
}

export function createFloatingTextBuffer(
  maxCount = DEFAULT_MAX_FLOATING_TEXTS,
  tick = 0
): FloatingTextBufferData {
  const safeCount = Math.max(1, Math.floor(maxCount));
  const items: FloatingTextItem[] = [];
  for (let i = 0; i < safeCount; i++) {
    items.push(createEmptyItem(i));
  }
  return {
    tick: Math.max(0, Math.floor(tick)),
    maxCount: safeCount,
    items,
    activeCount: 0,
    nextId: safeCount,
    droppedCount: 0
  };
}

function findFreeSlot(buffer: FloatingTextBufferData): FloatingTextItem | null {
  for (let i = 0; i < buffer.items.length; i++) {
    if (!buffer.items[i].active) return buffer.items[i];
  }
  return null;
}

export function pushFloatingText(
  buffer: FloatingTextBufferData,
  input: FloatingTextSpawnInput
): FloatingTextItem | null {
  if (!input || typeof input.text !== 'string' || input.text.length === 0) return null;
  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) return null;

  const slot = findFreeSlot(buffer);
  if (!slot) {
    buffer.droppedCount += 1;
    return null;
  }

  slot.id = buffer.nextId++;
  slot.active = true;
  slot.text = input.text;
  slot.x = input.x;
  slot.y = input.y;
  slot.vx = Number.isFinite(input.vx) ? (input.vx as number) : 0;
  slot.vy = Number.isFinite(input.vy) ? (input.vy as number) : -32;
  slot.maxLife = Math.max(0.05, Number.isFinite(input.life) ? (input.life as number) : 0.6);
  slot.life = slot.maxLife;
  slot.alpha = 1;
  slot.scale = Math.max(0.1, Number.isFinite(input.scale) ? (input.scale as number) : 1);
  slot.color = typeof input.color === 'string' && input.color.length > 0 ? input.color : '#ffffff';
  slot.type = input.type || 'damage';
  slot.targetId = typeof input.targetId === 'string' ? input.targetId : null;
  slot.tick = typeof input.tick === 'number' ? Math.max(0, Math.floor(input.tick)) : buffer.tick;

  buffer.activeCount += 1;
  return slot;
}

export function updateFloatingTextBuffer(buffer: FloatingTextBufferData, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;

  for (let i = 0; i < buffer.items.length; i++) {
    const item = buffer.items[i];
    if (!item.active) continue;

    item.life -= dt;
    if (item.life <= 0) {
      item.active = false;
      item.text = '';
      item.life = 0;
      item.maxLife = 0;
      item.alpha = 0;
      item.scale = 1;
      item.targetId = null;
      buffer.activeCount = Math.max(0, buffer.activeCount - 1);
      continue;
    }

    item.x += item.vx * dt;
    item.y += item.vy * dt;
    item.alpha = Math.max(0, item.life / item.maxLife);
  }
}

export function getActiveFloatingTexts(buffer: FloatingTextBufferData): FloatingTextItem[] {
  const result: FloatingTextItem[] = [];
  for (let i = 0; i < buffer.items.length; i++) {
    if (buffer.items[i].active) result.push(buffer.items[i]);
  }
  return result;
}

export function clearFloatingTextBuffer(buffer: FloatingTextBufferData, nextTick?: number): void {
  for (let i = 0; i < buffer.items.length; i++) {
    const item = buffer.items[i];
    item.active = false;
    item.text = '';
    item.life = 0;
    item.maxLife = 0;
    item.alpha = 0;
    item.scale = 1;
    item.targetId = null;
  }
  buffer.activeCount = 0;
  buffer.droppedCount = 0;
  if (typeof nextTick === 'number') {
    buffer.tick = Math.max(0, Math.floor(nextTick));
  }
}
