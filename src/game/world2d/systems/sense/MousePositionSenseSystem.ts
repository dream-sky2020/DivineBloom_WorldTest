import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import type { SystemContextBase } from '@definitions/interface/SystemContext';
import { getFrameContext } from '../../bridge/ExternalBridge';

/**
 * Mouse Position Sense System
 * 负责追踪鼠标在屏幕和世界中的位置
 * 并将位置信息更新到全局管理实体的 mousePosition 组件中
 */
export const MousePositionSenseSystem: ISystem<SystemContextBase> = {
    name: 'mouse-position-sense',

    update(dt: number, _ctx?: SystemContextBase) {
        const frameContext = getFrameContext();
        const input = frameContext.input || frameContext.engine?.input;
        const renderer = frameContext.renderer || frameContext.engine?.renderer;
        if (!input || !renderer) {
            throw new Error('[MousePositionSenseSystem] Missing required input/renderer in runtime frameContext');
        }

        const { mouse } = input;
        const { camera } = renderer;

        if (!mouse || !camera) {
            return;
        }

        // 查找全局管理实体
        const globalEntity = world.with('globalManager', 'mousePosition').first as IEntity;

        if (!globalEntity) {
            return;
        }

        // 计算世界坐标
        const worldX = mouse.x + camera.x;
        const worldY = mouse.y + camera.y;

        // 更新鼠标位置组件
        globalEntity.mousePosition.worldX = worldX;
        globalEntity.mousePosition.worldY = worldY;
        globalEntity.mousePosition.screenX = mouse.x;
        globalEntity.mousePosition.screenY = mouse.y;
    }
};
