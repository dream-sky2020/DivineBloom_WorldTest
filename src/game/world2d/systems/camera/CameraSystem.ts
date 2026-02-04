import { world } from '@world2d/world';
import { ISystem } from '@definitions/interface/ISystem';
import { IEntity } from '@definitions/interface/IEntity';

interface CameraContext {
    viewportWidth: number;
    viewportHeight: number;
    mapBounds?: { width: number; height: number } | null;
}

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
        if (!context) return;
        const { viewportWidth, viewportHeight, mapBounds = null } = context;

        const globalEntity = world.with('camera', 'globalManager').first as IEntity;
        if (!globalEntity) return;

        const { camera } = globalEntity;

        // 1. 检查地图尺寸，如果地图小于视口，则固定在中心或 (0,0)
        const isMapLargerThanViewport = mapBounds && (mapBounds.width > viewportWidth || mapBounds.height > viewportHeight);

        if (!isMapLargerThanViewport && mapBounds) {
            // 地图比屏幕小，将其居中
            camera.targetX = (mapBounds.width - viewportWidth) / 2;
            camera.targetY = (mapBounds.height - viewportHeight) / 2;

            // 直接应用，不使用死区
            this._applyLerp(camera, dt);
            return;
        }

        // 2. 查找跟随目标 (寻找 player)
        const target = world.with('player', 'transform').first as IEntity;

        if (target && target.transform) {
            // 3. 计算死区逻辑
            // 相机中心点
            const camCenterX = camera.x + viewportWidth / 2;
            const camCenterY = camera.y + viewportHeight / 2;

            const dx = target.transform.x - camCenterX;
            const dy = target.transform.y - camCenterY;

            const dzW = (camera.deadZone?.width || 0) / 2;
            const dzH = (camera.deadZone?.height || 0) / 2;

            let desiredX = camera.x;
            let desiredY = camera.y;

            // 如果超出死区，调整目标位置
            if (Math.abs(dx) > dzW) {
                desiredX = camera.x + (dx > 0 ? dx - dzW : dx + dzW);
            }
            if (Math.abs(dy) > dzH) {
                desiredY = camera.y + (dy > 0 ? dy - dzH : dy + dzH);
            }

            camera.targetX = desiredX;
            camera.targetY = desiredY;

            // 4. 应用边界限制
            if (camera.useBounds && mapBounds) {
                const maxX = Math.max(0, mapBounds.width - viewportWidth);
                const maxY = Math.max(0, mapBounds.height - viewportHeight);

                camera.targetX = Math.max(0, Math.min(camera.targetX, maxX));
                camera.targetY = Math.max(0, Math.min(camera.targetY, maxY));
            }

            // 5. 平滑跟随 (Lerp)
            this._applyLerp(camera, dt);
        }
    },

    /**
     * 内部方法：应用差值
     */
    _applyLerp(camera: any, dt: number) {
        const t = camera.lerp === 1 ? 1 : 1 - Math.pow(1 - camera.lerp, dt * 60);
        camera.x += (camera.targetX - camera.x) * t;
        camera.y += (camera.targetY - camera.y) * t;
    }
};
