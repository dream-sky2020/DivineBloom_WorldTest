import { world } from '@world2d/runtime/WorldEcsRuntime';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';
import type { MapBounds, SystemContextBase } from '@definitions/interface/SystemContext';
import { getFrameContext } from '../../bridge/ExternalBridge';

import { ExecutionPolicy } from '@world2d/definitions/enums/ExecutionPolicy';

interface CameraContext extends SystemContextBase {
    viewportWidth: number;
    viewportHeight: number;
    viewport?: { width: number; height: number };
    mapBounds?: MapBounds | null;
}

/**
 * 内部方法：应用差值
 */
const applyLerp = (camera: any, dt: number) => {
    const t = camera.lerp === 1 ? 1 : 1 - Math.pow(1 - camera.lerp, dt * 60);
    camera.x += (camera.targetX - camera.x) * t;
    camera.y += (camera.targetY - camera.y) * t;
};

/**
 * Camera System
 * 负责更新相机位置，使其跟随目标（玩家）并处理边界限制
 */
export const CameraSystem: ISystem<CameraContext> = {
    name: 'camera',
    executionPolicy: ExecutionPolicy.Always,

    /**
     * @param dt 
     * @param cameraContext
     */
    update(dt: number, _cameraContext?: CameraContext) {
        const frameContext = getFrameContext();
        const resolvedContext = frameContext as CameraContext;

        const viewportWidth = resolvedContext.viewportWidth
            || resolvedContext.viewport?.width
            || resolvedContext.engine?.width;
        const viewportHeight = resolvedContext.viewportHeight
            || resolvedContext.viewport?.height
            || resolvedContext.engine?.height;
        if (!viewportWidth || !viewportHeight) {
            throw new Error('[CameraSystem] Missing required viewport size in runtime frameContext');
        }
        const { mapBounds = null } = resolvedContext;

        const globalEntity = world.with('globalManager').first as IEntity;
        if (!globalEntity || !globalEntity.camera) return;

        const { camera } = globalEntity;

        // 1. 查找跟随目标 (寻找 player)
        const target = world.with('player', 'transform').first as IEntity;

        if (target && target.transform) {
            // 2. 检查地图尺寸，如果地图小于视口，则固定在中心
            const isMapLargerThanViewport = mapBounds && (mapBounds.width > viewportWidth || mapBounds.height > viewportHeight);

            if (!isMapLargerThanViewport && mapBounds) {
                camera.targetX = (mapBounds.width - viewportWidth) / 2;
                camera.targetY = (mapBounds.height - viewportHeight) / 2;
            } else {
                // 3. 计算目标位置 (使玩家处于视口中心)
                let desiredX = target.transform.x - viewportWidth / 2;
                let desiredY = target.transform.y - viewportHeight / 2;

                // 4. 应用边界限制
                if (camera.useBounds && mapBounds) {
                    const maxX = Math.max(0, mapBounds.width - viewportWidth);
                    const maxY = Math.max(0, mapBounds.height - viewportHeight);

                    desiredX = Math.max(0, Math.min(desiredX, maxX));
                    desiredY = Math.max(0, Math.min(desiredY, maxY));
                }

                camera.targetX = desiredX;
                camera.targetY = desiredY;
            }

            // 5. 平滑跟随 (Lerp)
            applyLerp(camera, dt);
        }
    }
};
