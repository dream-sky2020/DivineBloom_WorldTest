import { triggerQueue, world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

/**
 * 波次信号系统
 * 按固定间隔向 triggerQueue 广播信号，供 onSignal 规则消费。
 */
export const WaveEmitterSystem: ISystem = {
    name: 'wave-emitter',

    update(dt: number) {
        const entities = world.with('waveEmitter');
        for (const entity of entities) {
            const e = entity as IEntity;
            const emitter = e.waveEmitter;
            if (!emitter?.active) continue;

            if (emitter.emitOnStart && !emitter.emittedOnStart) {
                triggerQueue.push({
                    signal: emitter.signal,
                    payload: emitter.payload,
                    source: e
                });
                emitter.emittedOnStart = true;
            }

            emitter.elapsed += dt;
            if (emitter.interval <= 0) {
                triggerQueue.push({
                    signal: emitter.signal,
                    payload: emitter.payload,
                    source: e
                });
                emitter.elapsed = 0;
                continue;
            }

            while (emitter.elapsed >= emitter.interval) {
                emitter.elapsed -= emitter.interval;
                triggerQueue.push({
                    signal: emitter.signal,
                    payload: emitter.payload,
                    source: e
                });
            }
        }
    }
};
