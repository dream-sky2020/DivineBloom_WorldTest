import { schemasManager } from './SchemasManager.js';

/**
 * 地图加载器映射
 * 兼容旧版，现在由 SchemasManager 统一管理
 */
export const maps = schemasManager.mapLoaders;

/**
 * 获取地图数据
 * @param {string} mapId 
 */
export const getMapData = (mapId) => schemasManager.getMapData(mapId);
