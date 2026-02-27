import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

/**
 * 场景时间系统
 * 负责更新全局计时器组件
 */
export const TimeSystem: ISystem = {
    name: 'time',
    executionPolicy: ExecutionPolicy.HardStop,

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
