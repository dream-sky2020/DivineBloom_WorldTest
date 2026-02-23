import { world } from '@world2d/world';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { PortalIntent } from '@components';

const logger = createLogger('PortalIntentSystem');

/**
 * PortalIntentSystem
 * 处理带 portal + portalDetect 的实体（通常是 Portal 的 sensor 子节点）。
 */
export const PortalIntentSystem: ISystem & {
  _emitPortalIntent(portalEntity: IEntity, portal: any, targetEntity: IEntity): boolean;
  _isInteractJustPressed(targetEntity: IEntity): boolean;
} = {
  name: 'portal-intent',

  _isInteractJustPressed(targetEntity: IEntity) {
    const intent = targetEntity?.playerIntent;
    if (!intent) return false;
    const pressed = !!intent.wantsToInteract;
    const prev = !!intent.__portalInteractPrev;
    intent.__portalInteractPrev = pressed;
    return pressed && !prev;
  },

  _emitPortalIntent(portalEntity: IEntity, portal: any, targetEntity: IEntity) {
    if (!portal || !targetEntity) return false;

    const { mapId, entryId, destinationId, targetX, targetY } = portal;
    const isCrossMap = mapId != null && entryId != null;
    const isLocal = destinationId != null || (targetX != null && targetY != null);

    if (isCrossMap) {
      world.addComponent(targetEntity, 'portalIntent', PortalIntent.create({
        type: 'crossMap',
        mapId,
        entryId,
        source: portalEntity
      }));
      return true;
    }

    if (isLocal) {
      world.addComponent(targetEntity, 'portalIntent', PortalIntent.create({
        type: 'local',
        destinationId,
        targetX,
        targetY,
        source: portalEntity
      }));
      return true;
    }

    logger.warn('Portal intent ignored: invalid portal config', portal);
    return false;
  },

  update(dt: number) {
    const portalSensors = world.with('portal', 'portalDetect');
    const handledTargets = new Set<any>();

    for (const sensor of portalSensors) {
      const s = sensor as IEntity;
      const portal = s.portal;
      const detect = s.portalDetect;
      if (!portal || !detect) continue;

      portal.cooldownTimer = Math.max(0, (portal.cooldownTimer || 0) - dt);
      if (portal.cooldownTimer > 0) continue;

      const fullResults = Array.isArray(detect.fullResults) ? detect.fullResults : [];
      if (fullResults.length === 0) continue;

      for (const hit of fullResults) {
        const target = (hit?.entity || hit) as IEntity;
        if (!target || handledTargets.has(target) || (target as any).portalIntent) continue;
        const labels = hit?.detectable?.labels || target?.detectable?.labels || [];
        if (!Array.isArray(labels) || !labels.includes('player')) continue;

        if (!portal.isForced && !this._isInteractJustPressed(target)) {
          continue;
        }

        const emitted = this._emitPortalIntent(s, portal, target);
        if (emitted) {
          handledTargets.add(target);
          portal.cooldownTimer = portal.defaultCooldown || 0;
          break;
        }
      }
    }
  }
};
