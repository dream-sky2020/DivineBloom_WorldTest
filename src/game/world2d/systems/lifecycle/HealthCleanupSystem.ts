import { world } from '@world2d/runtime/WorldEcsRuntime';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

const logger = createLogger('HealthCleanupSystem');

export const HealthCleanupSystem: ISystem & {
    removeEntityTree(entity: IEntity, visited?: WeakSet<object>): void;
} = {
    name: 'health-cleanup',
    executionPolicy: ExecutionPolicy.RunningOnly,

    update(_dt: number) {
        const healthEntities = world.with('health');
        const pending = new Set<IEntity>();

        for (const entity of healthEntities) {
            const e = entity as IEntity;
            const health = e.health;
            if (!health) continue;
            if (!health.autoDestroyOnDepleted) continue;
            if (health.currentHealth > 0) continue;

            // 如果血量组件挂在子节点，销毁其逻辑根实体
            const root = (e.parent?.entity || e) as IEntity;
            pending.add(root);
        }

        for (const target of pending) {
            this.removeEntityTree(target);
            logger.debug(`Removed depleted entity tree: ${target.name || target.type || 'N/A'}`);
        }
    },

    removeEntityTree(entity: IEntity, visited: WeakSet<object> = new WeakSet()) {
        if (!entity || visited.has(entity)) return;
        visited.add(entity);

        const children = entity.children?.entities;
        if (Array.isArray(children)) {
            for (const child of [...children]) {
                this.removeEntityTree(child as IEntity, visited);
            }
            entity.children.entities = [];
        }

        const parent = entity.parent?.entity;
        if (parent?.children?.entities && Array.isArray(parent.children.entities)) {
            parent.children.entities = parent.children.entities.filter((child: any) => child !== entity);
        }

        if (world.entities.includes(entity)) {
            world.remove(entity);
        }
    }
};

