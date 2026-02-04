import { world } from '@world2d/world';
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
        for (const entity of lifeTimeEntities) {
            const e = entity as IEntity;
            const lifeTime = e.lifeTime;

            // 防御性检查
            if (!lifeTime) continue;

            // 1. 倒计时
            lifeTime.currentTime -= dt;

            // 2. 检查是否需要删除
            if (lifeTime.currentTime <= 0 && lifeTime.autoRemove) {
                this.requestRemoval(e);
            }
        }
    },

    /**
     * 请求删除实体
     */
    requestRemoval(entity: IEntity) {
        // 获取全局命令队列
        const globalEntity = world.with('commands').first;

        if (!globalEntity) {
            // 降级方案：直接删除（不推荐，但保证功能可用）
            logger.warn('Global commands queue not found, removing entity directly', {
                type: entity.type,
                name: entity.name
            });
            world.remove(entity);
            return;
        }

        // 发送删除命令到 ExecuteSystem
        globalEntity.commands.queue.push({
            type: 'DELETE_ENTITY',
            payload: { entity }
        });

        logger.debug(`Requested removal for entity: ${entity.name || entity.type || 'N/A'}`, {
            type: entity.type,
            remainingTime: entity.lifeTime.currentTime
        });
    }
};
