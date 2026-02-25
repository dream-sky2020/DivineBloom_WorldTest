import { world } from '@world2d/runtime/WorldEcsRuntime';
import { createLogger } from '@/utils/logger';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

const logger = createLogger('LifeTimeSystem');

/**
 * LifeTime System
 * 负责管理实体的生命周期，自动删除生命周期结束的实体
 */
export const LifeTimeSystem: ISystem & { requestRemoval(entity: IEntity): void } = {
    name: 'lifetime',

    update(dt: number) {
        const lifeTimeEntities = world.with('lifeTime');
        const pending: IEntity[] = [];
        for (const entity of lifeTimeEntities) {
            const e = entity as IEntity;
            const lifeTime = e.lifeTime;

            // 防御性检查
            if (!lifeTime) continue;

            // 1. 倒计时
            lifeTime.currentTime -= dt;

            // 2. 检查是否需要删除
            if (lifeTime.currentTime <= 0 && lifeTime.autoRemove) {
                pending.push(e);
            }
        }

        for (const entity of pending) {
            this.requestRemoval(entity);
        }
    },

    /**
     * 请求删除实体
     */
    requestRemoval(entity: IEntity) {
        const removeTree = (current: IEntity, visited: WeakSet<object> = new WeakSet()) => {
            if (!current || visited.has(current)) return;
            visited.add(current);

            const children = current.children?.entities;
            if (Array.isArray(children)) {
                for (const child of [...children]) {
                    removeTree(child as IEntity, visited);
                }
                current.children.entities = [];
            }

            const parent = current.parent?.entity;
            if (parent?.children?.entities && Array.isArray(parent.children.entities)) {
                parent.children.entities = parent.children.entities.filter((child: any) => child !== current);
            }

            if (world.entities.includes(current)) {
                world.remove(current);
            }
        };

        if (!world.entities.includes(entity)) {
            return;
        }
        removeTree(entity);

        logger.debug(`Requested removal for entity: ${entity.name || entity.type || 'N/A'}`, {
            type: entity.type,
            remainingTime: entity.lifeTime?.currentTime
        });
    }
};
