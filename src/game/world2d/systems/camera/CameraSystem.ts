import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

interface CameraContext {
    viewportWidth: number;
    viewportHeight: number;
    mapBounds?: { width: number; height: number } | null;
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
export const CameraSystem: ISystem = {
    name: 'camera',

    /**
     * @param dt 
     * @param _callbacks 
     * @param context 
     */
    update(dt: number, _callbacks?: any, context?: CameraContext) {
        // 兼容旧调用：部分调用方把 context 当成第二参数传入
        const cameraContext = (context || _callbacks) as CameraContext | undefined;
        if (!cameraContext) return;
        
        // 兜底视口尺寸，防止因为 engine 尚未初始化或 resize 导致的 0 尺寸
        const viewportWidth = cameraContext.viewportWidth || 1920;
        const viewportHeight = cameraContext.viewportHeight || 1080;
        const { mapBounds = null } = cameraContext;

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
