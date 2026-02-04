import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * 场景时间系统
 * 负责更新全局计时器组件
 */
export const TimeSystem: ISystem = {
    name: 'time',

    update(dt: number) {
        const entities = world.with('timer');
        for (const entity of entities) {
            const e = entity as IEntity;
            if (e.timer.running) {
                e.timer.totalTime += dt;
            }
        }
    }
};
