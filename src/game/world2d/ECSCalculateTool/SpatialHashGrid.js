/**
 * 空间哈希网格 (Spatial Hash Grid)
 * 用于加速 2D 空间查询
 * 支持静态/动态分离优化
 */
export class SpatialHashGrid {
  constructor(bounds, cellSize) {
    this.bounds = bounds;
    this.cellSize = cellSize;
    // Map<Key, Set<Entity>>
    this.staticCells = new Map();
    this.dynamicCells = new Map();
    this.queryIds = 0;
  }

  _getKey(x, y) {
    return `${x}:${y}`;
  }

  _getCellIndex(x, y) {
    const xi = Math.floor((x - this.bounds.x) / this.cellSize);
    const yi = Math.floor((y - this.bounds.y) / this.cellSize);
    return { x: xi, y: yi };
  }

  /**
   * 插入实体到网格
   * @param {Object} entity 实体
   * @param {Object} bounds 包围盒 {minX, maxX, minY, maxY}
   * @param {boolean} isStatic 是否为静态物体
   */
  insert(entity, bounds, isStatic = false) {
    const min = this._getCellIndex(bounds.minX, bounds.minY);
    const max = this._getCellIndex(bounds.maxX, bounds.maxY);
    
    const targetMap = isStatic ? this.staticCells : this.dynamicCells;

    for (let y = min.y; y <= max.y; y++) {
      for (let x = min.x; x <= max.x; x++) {
        const key = this._getKey(x, y);
        if (!targetMap.has(key)) {
          targetMap.set(key, new Set());
        }
        targetMap.get(key).add(entity);
      }
    }
  }

  /**
   * 清除所有动态物体 (每帧调用)
   */
  clearDynamic() {
    this.dynamicCells.clear();
  }

  /**
   * 清除所有静态物体 (场景切换时调用)
   */
  clearStatic() {
    this.staticCells.clear();
  }

  /**
   * 获取附近的实体 (包含静态和动态)
   * @param {Object} bounds {minX, maxX, minY, maxY}
   * @returns {Set} 潜在的实体集合
   */
  query(bounds) {
    const results = new Set();
    const min = this._getCellIndex(bounds.minX, bounds.minY);
    const max = this._getCellIndex(bounds.maxX, bounds.maxY);

    for (let y = min.y; y <= max.y; y++) {
      for (let x = min.x; x <= max.x; x++) {
        const key = this._getKey(x, y);
        
        // Check dynamic cells
        if (this.dynamicCells.has(key)) {
          const cell = this.dynamicCells.get(key);
          for (const entity of cell) {
            results.add(entity);
          }
        }
        
        // Check static cells
        if (this.staticCells.has(key)) {
          const cell = this.staticCells.get(key);
          for (const entity of cell) {
            results.add(entity);
          }
        }
      }
    }
    return results;
  }
}
