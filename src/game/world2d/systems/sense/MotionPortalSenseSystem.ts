import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { world } from '@world2d/world';

type PortalSenseBest = {
  pos: { x: number; y: number };
  dest: { x: number; y: number };
  improvement: number;
  routeDistance: number;
};

/**
 * MotionPortalSenseSystem
 * 为 Motion 运行时提供“传送门捷径”感知结果，供 MotionIntentSystem 决策融合。
 */
export const MotionPortalSenseSystem: ISystem = {
  name: 'motion-portal-sense',

  update(_dt: number) {
    const movers = world.with('motion', 'transform');
    const portals = world.with('actionTeleport', 'transform');
    const destinations = world.with('destinationId', 'transform');
    const destinationList = [...destinations] as IEntity[];

    for (const entity of movers) {
      const e = entity as IEntity;
      const motion = (e as any).motion;
      const profile = (e as any).motionSteerProfile;
      if (!motion || !e.transform) continue;

      if (!motion.runtime || typeof motion.runtime !== 'object') {
        motion.runtime = { elapsedTime: 0, pathDirection: 1, initialized: false };
      }

      const portalPolicy = profile?.portal || {};
      const portalEnabled = !!portalPolicy.enabled;
      if (!portalEnabled) {
        motion.runtime.portalSense = { bestPortal: null, checked: false };
        continue;
      }

      const targetPos = motion.runtime?.targetPos;
      const hasTarget = !!motion.runtime?.hasTarget && targetPos;
      if (!hasTarget) {
        motion.runtime.portalSense = { bestPortal: null, checked: true };
        continue;
      }

      const directDx = Number(targetPos.x || 0) - e.transform.x;
      const directDy = Number(targetPos.y || 0) - e.transform.y;
      const directDist = Math.hypot(directDx, directDy);
      if (!(directDist > 0)) {
        motion.runtime.portalSense = { bestPortal: null, checked: true };
        continue;
      }

      const minBenefitDistance = Math.max(0, Number(portalPolicy.minBenefitDistance || 0));
      const maxPortalApproachDistance = Math.max(0, Number(portalPolicy.maxPortalApproachDistance || 0));

      let bestPortal: PortalSenseBest | null = null;
      let bestImprovement = minBenefitDistance;

      for (const portalEntity of portals) {
        const p = portalEntity as IEntity;
        const actionTeleport = (p as any).actionTeleport;
        const pTransform = p.transform;
        if (!actionTeleport || !pTransform) continue;

        const mapId = actionTeleport.mapId;
        const entryId = actionTeleport.entryId;
        const destinationId = actionTeleport.destinationId;
        const targetX = actionTeleport.targetX;
        const targetY = actionTeleport.targetY;

        // Motion 捷径仅考虑同图传送门，跨图跳过
        const isCrossMap = mapId != null && entryId != null;
        if (isCrossMap) continue;

        let destX: number | null = null;
        let destY: number | null = null;
        if (destinationId != null) {
          const destEntity = destinationList.find((d) => (d as any).destinationId === destinationId);
          if (!destEntity?.transform) continue;
          destX = destEntity.transform.x;
          destY = destEntity.transform.y;
        } else if (targetX != null && targetY != null) {
          destX = Number(targetX);
          destY = Number(targetY);
        } else {
          continue;
        }
        if (destX == null || destY == null) continue;

        let portalX = pTransform.x;
        let portalY = pTransform.y;
        if ((p as any).detectArea?.offset) {
          portalX += Number((p as any).detectArea.offset.x || 0);
          portalY += Number((p as any).detectArea.offset.y || 0);
        }

        const distToPortal = Math.hypot(portalX - e.transform.x, portalY - e.transform.y);
        if (maxPortalApproachDistance > 0 && distToPortal > maxPortalApproachDistance) continue;

        const distFromDestToTarget = Math.hypot(destX - Number(targetPos.x || 0), destY - Number(targetPos.y || 0));
        const routeDist = distToPortal + distFromDestToTarget;
        const improvement = directDist - routeDist;

        if (improvement > bestImprovement) {
          bestImprovement = improvement;
          bestPortal = {
            pos: { x: portalX, y: portalY },
            dest: { x: destX, y: destY },
            improvement,
            routeDistance: routeDist
          };
        }
      }

      motion.runtime.portalSense = {
        bestPortal,
        checked: true
      };
    }
  }
};
