import { createLogger } from '@/utils/logger'

const logger = createLogger('ResourceDeclaration')

/**
 * 资源声明系统 (Refactored)
 * 采用通用扫描策略，不再依赖硬编码的 Visuals
 */
export class ResourceDeclaration {
    
    /**
     * 递归扫描对象中的资源引用
     * @param {object} obj 任意数据对象
     * @param {Set} collected set容器
     */
    static _scanObjectForAssets(obj: any, collected: Set<string>) {
        if (!obj || typeof obj !== 'object') return;

        // 策略 1: 显式的 assetId 字段
        if (obj.assetId && typeof obj.assetId === 'string') {
            collected.add(obj.assetId);
        }

        // 策略 2: 显式的 spriteId 字段
        if (obj.spriteId && typeof obj.spriteId === 'string') {
            collected.add(obj.spriteId);
        }
        
        // 策略 3: Sprite 组件 id
        if (obj.Sprite && obj.Sprite.id) {
            collected.add(obj.Sprite.id);
        }

        // 策略 4: 直接 id (兼容某些旧数据结构)
        if (obj.id && typeof obj.id === 'string' && (obj.type === 'sprite' || obj.mode)) {
            collected.add(obj.id);
        }

        // 递归遍历数组和对象
        if (Array.isArray(obj)) {
            obj.forEach(item => this._scanObjectForAssets(item, collected));
        } else {
            Object.values(obj).forEach(val => this._scanObjectForAssets(val, collected));
        }
    }

    /**
     * 从场景数据中提取所有资源依赖
     * @param {object} mapData 标准 SceneBundle 数据
     * @returns {Set<string>} 资源文件 ID 集合
     */
    static getMapAssetIds(mapData: any): Set<string> {
        const assetIds = new Set<string>();
        
        if (!mapData) return assetIds;

        // 1. 扫描实体数据
        if (mapData.entities) {
            this._scanObjectForAssets(mapData.entities, assetIds);
        }

        // 2. 总是包含核心资源
        const coreAssets = this.getCoreAssets();
        coreAssets.forEach(id => assetIds.add(id));

        return assetIds;
    }

    static getCoreAssets(): string[] {
        // 默认预加载的核心资源
        return ['enemy_slime', 'hero_sheet']; 
    }

    /**
     * 保持接口兼容
     */
    static getWorldAssetIds(world: any): Set<string> {
        return new Set();
    }
}
