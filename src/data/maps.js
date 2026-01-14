// Use dynamic imports for lazy loading
import { MapSchema, createValidator } from './schemas/index.js'

export const maps = {
    village: () => import('./maps/village').then(m => m.village),
    forest: () => import('./maps/forest').then(m => m.forest),
    demo_plains: () => import('./maps/demo_plains').then(m => m.demo_plains)
}

// Validator for single map data
const validateMap = createValidator(MapSchema, 'MapData');

// Helper to get map data
export const getMapData = async (mapId) => {
    const loader = maps[mapId]
    if (!loader) {
        console.warn(`[MapData] Map ID not found: ${mapId}`);
        return null;
    }

    const data = await loader()

    // Validate loaded data on the fly
    // 因为是异步加载，我们无法在启动时验证所有地图，
    // 必须在加载那一刻验证。这样虽然不能启动即报错，
    // 但能保证只要你进这张图，有问题立马拦截。
    return validateMap(data);
}
