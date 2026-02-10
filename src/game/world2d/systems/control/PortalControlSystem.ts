import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import { SceneTransition } from '@components';

/**
 * PortalControlSystem
 * 将 portalIntent 转换为实体位移或场景切换。
 */
export const PortalControlSystem: ISystem = {
  name: 'portal-control',

  update(dt: number) {
    const entities = world.with('portalIntent');

    for (const entity of entities) {
      const e = entity as IEntity;
      const intent = e.portalIntent;
      if (!intent) continue;

      if (intent.type === 'crossMap') {
        if (intent.mapId != null && intent.entryId != null) {
          world.addComponent(e, 'sceneTransition', SceneTransition.create({
            mapId: intent.mapId,
            entryId: intent.entryId
          }));
        }
        world.removeComponent(e, 'portalIntent');
        continue;
      }

      if (intent.type === 'local') {
        let finalX: number | undefined;
        let finalY: number | undefined;

        if (intent.destinationId != null) {
          const destinations = world.with('destinationId', 'transform');
          const destination = [...destinations].find(d => d.destinationId === intent.destinationId) as any;
          if (destination?.transform) {
            finalX = destination.transform.x;
            finalY = destination.transform.y;
          }
        } else if (intent.targetX != null && intent.targetY != null) {
          finalX = intent.targetX;
          finalY = intent.targetY;
        }

        if (finalX != null && finalY != null && e.transform) {
          e.transform.prevX = finalX;
          e.transform.prevY = finalY;
          e.transform.x = finalX;
          e.transform.y = finalY;
          if (e.velocity) {
            e.velocity.x = 0;
            e.velocity.y = 0;
          }
        }

        world.removeComponent(e, 'portalIntent');
        continue;
      }

      world.removeComponent(e, 'portalIntent');
    }
  }
};
