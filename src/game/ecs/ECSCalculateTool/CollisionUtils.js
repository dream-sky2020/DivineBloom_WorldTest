/**
 * 轻量级 2D 碰撞数学工具库
 * 支持: Circle, AABB, OBB (旋转矩形), Capsule
 * 提供检测与 MTV (最小位移向量) 计算
 */

export const CollisionUtils = {
  /**
   * 圆形 vs 圆形
   */
  checkCircleCircle(c1, c2) {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const distanceSq = dx * dx + dy * dy;
    const radiusSum = c1.radius + c2.radius;

    if (distanceSq >= radiusSum * radiusSum) return null;

    const distance = Math.sqrt(distanceSq);
    const overlap = radiusSum - distance;

    // 如果重叠但圆心重合，给一个默认方向
    const nx = distance > 0 ? dx / distance : 1;
    const ny = distance > 0 ? dy / distance : 0;

    return { x: nx * overlap, y: ny * overlap };
  },

  /**
   * AABB vs AABB
   */
  checkAABBAABB(a, b) {
    const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
    const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);

    if (overlapX <= 0 || overlapY <= 0) return null;

    // 找最小重叠轴，MTV 方向定义为 A -> B
    if (overlapX < overlapY) {
      const dir = (a.centerX < b.centerX) ? 1 : -1;
      return { x: dir * overlapX, y: 0 };
    } else {
      const dir = (a.centerY < b.centerY) ? 1 : -1;
      return { x: 0, y: dir * overlapY };
    }
  },

  /**
   * 分离轴定律 (SAT) 通用实现 - 用于旋转矩形 (OBB)
   * 也可用于任意凸多边形
   */
  checkSAT(verticesA, verticesB) {
    let minOverlap = Infinity;
    let mtvAxis = { x: 0, y: 0 };

    // 获取两个多边形的所有法轴
    const axes = [
      ...this._getAxes(verticesA),
      ...this._getAxes(verticesB)
    ];

    for (const axis of axes) {
      const projA = this._project(verticesA, axis);
      const projB = this._project(verticesB, axis);

      const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);

      if (overlap <= 0) return null; // 发现分离轴，不碰撞

      if (overlap < minOverlap) {
        minOverlap = overlap;
        mtvAxis = axis;
      }
    }

    // 计算中心点，确保 MTV 方向是从 A 指向 B
    const centerA = this._getCenter(verticesA);
    const centerB = this._getCenter(verticesB);
    const dot = (centerB.x - centerA.x) * mtvAxis.x + (centerB.y - centerA.y) * mtvAxis.y;

    if (dot < 0) {
      mtvAxis.x = -mtvAxis.x;
      mtvAxis.y = -mtvAxis.y;
    }

    return { x: mtvAxis.x * minOverlap, y: mtvAxis.y * minOverlap };
  },

  /**
   * 圆形 vs AABB
   */
  checkCircleAABB(circle, aabb) {
    // 1. 找到 AABB 上离圆心最近的点
    const closestX = Math.max(aabb.minX, Math.min(circle.x, aabb.maxX));
    const closestY = Math.max(aabb.minY, Math.min(circle.y, aabb.maxY));

    const dx = closestX - circle.x; // 方向改为 A -> B (circle -> aabb)
    const dy = closestY - circle.y;
    const distanceSq = dx * dx + dy * dy;

    // 如果圆心在 AABB 内部
    if (distanceSq === 0) {
      // 找到最近的边界推出去
      const dl = circle.x - aabb.minX;
      const dr = aabb.maxX - circle.x;
      const dt = circle.y - aabb.minY;
      const db = aabb.maxY - circle.y;
      const min = Math.min(dl, dr, dt, db);

      // MTV 方向 A -> B
      if (min === dl) return { x: (dl + circle.radius), y: 0 };
      if (min === dr) return { x: -(dr + circle.radius), y: 0 };
      if (min === dt) return { x: 0, y: (dt + circle.radius) };
      return { x: 0, y: -(db + circle.radius) };
    }

    if (distanceSq >= circle.radius * circle.radius) return null;

    const distance = Math.sqrt(distanceSq);
    const overlap = circle.radius - distance;
    return {
      x: (dx / distance) * overlap,
      y: (dy / distance) * overlap
    };
  },

  /**
   * 圆形 vs OBB (旋转矩形)
   */
  checkCircleOBB(circle, obbPos, obbWidth, obbHeight, obbRotation) {
    // 1. 将圆心转到 OBB 的本地坐标 (反向旋转)
    const dx = circle.x - obbPos.x;
    const dy = circle.y - obbPos.y;
    const cos = Math.cos(-obbRotation);
    const sin = Math.sin(-obbRotation);

    const localCircle = {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
      radius: circle.radius
    };

    // 2. 在本地空间执行 Circle vs AABB
    const localAABB = {
      minX: -obbWidth / 2, maxX: obbWidth / 2,
      minY: -obbHeight / 2, maxY: obbHeight / 2
    };

    const localMTV = this.checkCircleAABB(localCircle, localAABB);
    if (!localMTV) return null;

    // 3. 将结果转回世界坐标 (正向旋转)
    const worldCos = Math.cos(obbRotation);
    const worldSin = Math.sin(obbRotation);

    return {
      x: localMTV.x * worldCos - localMTV.y * worldSin,
      y: localMTV.x * worldSin + localMTV.y * worldCos
    };
  },

  /**
   * 胶囊体 vs 圆形
   * @param {Object} capsule - 胶囊体 {p1, p2, radius}
   * @param {Object} circle - 圆形 {x, y, radius}
   * @returns {Object|null} MTV (从胶囊指向圆形) 或 null
   */
  checkCapsuleCircle(capsule, circle) {
    // 防御性检查
    if (!capsule || !circle || !capsule.p1 || !capsule.p2) {
      console.warn('[CollisionUtils] Invalid capsule or circle data');
      return null;
    }

    // 找到线段上离圆心最近的点
    const closest = this.getClosestPointOnSegment(circle, capsule.p1, capsule.p2);

    // 将最近点视为一个圆，进行圆圆碰撞检测
    // MTV 方向：从胶囊（closest点）指向圆形
    return this.checkCircleCircle(
      { x: closest.x, y: closest.y, radius: capsule.radius },
      circle
    );
  },

  /**
   * 胶囊体 vs 任何东西 (分发器)
   * @param {Object} entityCapsule - 胶囊体实体
   * @param {Object} entityOther - 另一个实体
   * @returns {Object|null} MTV (从胶囊指向另一个实体) 或 null
   */
  checkCapsuleCollision(entityCapsule, entityOther) {
    const colCap = entityCapsule.collider;
    const colOther = entityOther.collider;

    // 防御性检查
    if (!colCap || !colOther || !colCap.p1 || !colCap.p2) {
      console.warn('[CollisionUtils] Invalid capsule collider data');
      return null;
    }

    const posCap = {
      x: entityCapsule.position.x + (colCap.offsetX || 0),
      y: entityCapsule.position.y + (colCap.offsetY || 0)
    };

    // 🎯 关键修复: 应用整体旋转到胶囊的端点
    // 胶囊的 p1 和 p2 是相对于实体位置的局部坐标
    // 需要先旋转，然后加到世界坐标上
    const rot = colCap.rotation || 0;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    // 计算旋转后的世界坐标
    const p1 = {
      x: posCap.x + (colCap.p1.x * cos - colCap.p1.y * sin),
      y: posCap.y + (colCap.p1.x * sin + colCap.p1.y * cos)
    };
    const p2 = {
      x: posCap.x + (colCap.p2.x * cos - colCap.p2.y * sin),
      y: posCap.y + (colCap.p2.x * sin + colCap.p2.y * cos)
    };

    const capsule = { p1, p2, radius: colCap.radius };

    const posOther = {
      x: entityOther.position.x + (colOther.offsetX || 0),
      y: entityOther.position.y + (colOther.offsetY || 0)
    };

    // 胶囊 vs 圆形
    if (colOther.type === 'circle') {
      return this.checkCapsuleCircle(capsule, { ...posOther, radius: colOther.radius });
    }

    // 🎯 修复 2: 解决“长胶囊体”中间失效问题 - 使用分段采样
    if (colOther.type === 'aabb' || colOther.type === 'obb') {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      // 每 20 像素采样一个点，或者至少采样两端和中间
      const stepCount = Math.max(2, Math.ceil(length / 20));

      for (let i = 0; i <= stepCount; i++) {
        const t = i / stepCount;
        const samplePoint = {
          x: p1.x + dx * t,
          y: p1.y + dy * t
        };

        // 将采样点视为一个圆，与矩形做碰撞
        const mtv = this.checkCollision(
          { position: samplePoint, collider: { type: 'circle', radius: capsule.radius, layer: colCap.layer, mask: colCap.mask } },
          entityOther
        );

        if (mtv) {
          return mtv;
        }
      }
    }

    return null;
  },

  /**
   * 自动调度碰撞检测
   */
  checkCollision(entityA, entityB) {
    if (!entityA || !entityB) return null;

    const colA = entityA.collider;
    const colB = entityB.collider;

    if (!colA || !colB) return null;
    if (!(colA.mask & colB.layer) && !(colB.mask & colA.layer)) return null;

    const posA = { x: entityA.position.x + (colA.offsetX || 0), y: entityA.position.y + (colA.offsetY || 0) };
    const posB = { x: entityB.position.x + (colB.offsetX || 0), y: entityB.position.y + (colB.offsetY || 0) };

    // 处理胶囊体
    if (colA.type === 'capsule') return this.checkCapsuleCollision(entityA, entityB);
    if (colB.type === 'capsule') {
      const mtv = this.checkCapsuleCollision(entityB, entityA);
      return mtv ? { x: -mtv.x, y: -mtv.y } : null;
    }

    // --- 1. Circle vs Circle ---
    if (colA.type === 'circle' && colB.type === 'circle') {
      return this.checkCircleCircle(
        { ...posA, radius: colA.radius },
        { ...posB, radius: colB.radius }
      );
    }

    // --- 2. AABB vs AABB ---
    if (colA.type === 'aabb' && colB.type === 'aabb') {
      const getAABB = (p, c) => ({
        minX: p.x - c.width / 2, maxX: p.x + c.width / 2,
        minY: p.y - c.height / 2, maxY: p.y + c.height / 2,
        centerX: p.x, centerY: p.y
      });
      return this.checkAABBAABB(getAABB(posA, colA), getAABB(posB, colB));
    }

    // --- 3. Circle vs AABB / OBB ---
    if (colA.type === 'circle') {
      if (colB.type === 'aabb') {
        const aabb = {
          minX: posB.x - colB.width / 2, maxX: posB.x + colB.width / 2,
          minY: posB.y - colB.height / 2, maxY: posB.y + colB.height / 2
        };
        return this.checkCircleAABB({ ...posA, radius: colA.radius }, aabb);
      }
      if (colB.type === 'obb') {
        return this.checkCircleOBB({ ...posA, radius: colA.radius }, posB, colB.width, colB.height, colB.rotation);
      }
    }
    // 反向
    if (colB.type === 'circle') {
      const mtv = this.checkCollision(entityB, entityA);
      return mtv ? { x: -mtv.x, y: -mtv.y } : null;
    }

    // --- 4. OBB vs OBB / AABB ---
    if (colA.type === 'obb' || colB.type === 'obb') {
      const vA = colA.type === 'obb' ?
        this.getOBBVertices(posA.x, posA.y, colA.width, colA.height, colA.rotation) :
        this._getAABBVertices(posA.x, posA.y, colA.width, colA.height);

      const vB = colB.type === 'obb' ?
        this.getOBBVertices(posB.x, posB.y, colB.width, colB.height, colB.rotation) :
        this._getAABBVertices(posB.x, posB.y, colB.width, colB.height);

      return this.checkSAT(vA, vB);
    }

    return null;
  },

  /**
   * 找到线段上离点最近的点
   */
  getClosestPointOnSegment(p, p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return p1;

    let t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));

    return {
      x: p1.x + t * dx,
      y: p1.y + t * dy
    };
  },

  // --- 内部辅助函数 ---

  _getAxes(vertices) {
    const axes = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x };
      const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      if (len > 0) axes.push({ x: normal.x / len, y: normal.y / len });
    }
    return axes;
  },

  _project(vertices, axis) {
    let min = Infinity;
    let max = -Infinity;
    for (const p of vertices) {
      const dot = p.x * axis.x + p.y * axis.y;
      min = Math.min(min, dot);
      max = Math.max(max, dot);
    }
    return { min, max };
  },

  _getCenter(vertices) {
    let x = 0, y = 0;
    for (const v of vertices) {
      x += v.x;
      y += v.y;
    }
    return { x: x / vertices.length, y: y / vertices.length };
  },

  _getAABBVertices(x, y, w, h) {
    const hw = w / 2;
    const hh = h / 2;
    return [
      { x: x - hw, y: y - hh },
      { x: x + hw, y: y - hh },
      { x: x + hw, y: y + hh },
      { x: x - hw, y: y + hh }
    ];
  },

  getOBBVertices(x, y, width, height, rotation) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const hw = width / 2;
    const hh = height / 2;

    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh }
    ];

    return corners.map(p => ({
      x: x + (p.x * cos - p.y * sin),
      y: y + (p.x * sin + p.y * cos)
    }));
  },

  /**
   * 强制将实体限制在地图边界内
   * @param {Object} pos 位置组件 {x, y}
   * @param {Object} collider 碰撞体组件
   * @param {Object} mapBounds {width, height}
   * @returns {boolean} 是否发生了位置修正
   */
  resolveMapBounds(pos, collider, mapBounds) {
    if (!mapBounds) return false;

    let moved = false;
    const { width, height } = mapBounds;

    // 根据碰撞体类型计算边界偏移
    let left = 0, right = 0, top = 0, bottom = 0;

    if (collider.type === 'circle') {
      const r = collider.radius;
      const ox = collider.offsetX || 0;
      const oy = collider.offsetY || 0;
      left = pos.x + ox - r;
      right = pos.x + ox + r;
      top = pos.y + oy - r;
      bottom = pos.y + oy + r;

      if (left < 0) { pos.x += -left; moved = true; }
      else if (right > width) { pos.x -= (right - width); moved = true; }

      if (top < 0) { pos.y += -top; moved = true; }
      else if (bottom > height) { pos.y -= (bottom - height); moved = true; }
    } 
    else if (collider.type === 'aabb' || collider.type === 'obb') {
      // 简化处理：使用 AABB 包围盒检查
      const hw = collider.width / 2;
      const hh = collider.height / 2;
      const ox = collider.offsetX || 0;
      const oy = collider.offsetY || 0;
      
      // 如果有旋转，这里其实需要更复杂的 OBB 边界检查，
      // 但对于地图边界，简单的 AABB 投影通常足够
      left = pos.x + ox - hw;
      right = pos.x + ox + hw;
      top = pos.y + oy - hh;
      bottom = pos.y + oy + hh;

      if (left < 0) { pos.x += -left; moved = true; }
      else if (right > width) { pos.x -= (right - width); moved = true; }

      if (top < 0) { pos.y += -top; moved = true; }
      else if (bottom > height) { pos.y -= (bottom - height); moved = true; }
    }

    return moved;
  }
};
