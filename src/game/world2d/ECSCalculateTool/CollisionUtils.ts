/**
 * Lightweight 2D collision math helpers.
 * Supports: Circle, AABB, OBB, Capsule, Point.
 */
import { ShapeType } from '../definitions/enums/Shape';

type Vec2 = { x: number; y: number };
type MTV = Vec2 | null;

type Circle = Vec2 & { radius: number };
type AABB = { minX: number; maxX: number; minY: number; maxY: number; centerX?: number; centerY?: number };
type Vertex = Vec2;

export const CollisionUtils = {
  checkCircleCircle(c1: Circle, c2: Circle): MTV {
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const distanceSq = dx * dx + dy * dy;
    const radiusSum = c1.radius + c2.radius;

    if (distanceSq >= radiusSum * radiusSum) return null;

    const distance = Math.sqrt(distanceSq);
    const overlap = radiusSum - distance;

    const nx = distance > 0 ? dx / distance : 1;
    const ny = distance > 0 ? dy / distance : 0;

    return { x: nx * overlap, y: ny * overlap };
  },

  checkAABBAABB(a: AABB, b: AABB): MTV {
    const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
    const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);

    if (overlapX <= 0 || overlapY <= 0) return null;

    if (overlapX < overlapY) {
      const dir = (a.centerX as number) < (b.centerX as number) ? 1 : -1;
      return { x: dir * overlapX, y: 0 };
    }
    const dir = (a.centerY as number) < (b.centerY as number) ? 1 : -1;
    return { x: 0, y: dir * overlapY };
  },

  checkSAT(verticesA: Vertex[], verticesB: Vertex[]): MTV {
    let minOverlap = Infinity;
    let mtvAxis = { x: 0, y: 0 };

    const axes = [
      ...this._getAxes(verticesA),
      ...this._getAxes(verticesB)
    ];

    for (const axis of axes) {
      const projA = this._project(verticesA, axis);
      const projB = this._project(verticesB, axis);

      const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
      if (overlap <= 0) return null;

      if (overlap < minOverlap) {
        minOverlap = overlap;
        mtvAxis = axis;
      }
    }

    const centerA = this._getCenter(verticesA);
    const centerB = this._getCenter(verticesB);
    const dot = (centerB.x - centerA.x) * mtvAxis.x + (centerB.y - centerA.y) * mtvAxis.y;

    if (dot < 0) {
      mtvAxis.x = -mtvAxis.x;
      mtvAxis.y = -mtvAxis.y;
    }

    return { x: mtvAxis.x * minOverlap, y: mtvAxis.y * minOverlap };
  },

  checkCircleAABB(circle: Circle, aabb: AABB): MTV {
    const closestX = Math.max(aabb.minX, Math.min(circle.x, aabb.maxX));
    const closestY = Math.max(aabb.minY, Math.min(circle.y, aabb.maxY));

    const dx = closestX - circle.x;
    const dy = closestY - circle.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq === 0) {
      const dl = circle.x - aabb.minX;
      const dr = aabb.maxX - circle.x;
      const dt = circle.y - aabb.minY;
      const db = aabb.maxY - circle.y;
      const min = Math.min(dl, dr, dt, db);

      if (min === dl) return { x: dl + circle.radius, y: 0 };
      if (min === dr) return { x: -(dr + circle.radius), y: 0 };
      if (min === dt) return { x: 0, y: dt + circle.radius };
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

  checkCircleOBB(circle: Circle, obbPos: Vec2, obbWidth: number, obbHeight: number, obbRotation: number): MTV {
    const dx = circle.x - obbPos.x;
    const dy = circle.y - obbPos.y;
    const cos = Math.cos(-obbRotation);
    const sin = Math.sin(-obbRotation);

    const localCircle = {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
      radius: circle.radius
    };

    const localAABB = {
      minX: -obbWidth / 2, maxX: obbWidth / 2,
      minY: -obbHeight / 2, maxY: obbHeight / 2
    };

    const localMTV = this.checkCircleAABB(localCircle, localAABB);
    if (!localMTV) return null;

    const worldCos = Math.cos(obbRotation);
    const worldSin = Math.sin(obbRotation);

    return {
      x: localMTV.x * worldCos - localMTV.y * worldSin,
      y: localMTV.x * worldSin + localMTV.y * worldCos
    };
  },

  checkCapsuleCircle(capsule: any, circle: Circle): MTV {
    if (!capsule || !circle || !capsule.p1 || !capsule.p2) {
      console.warn('[CollisionUtils] Invalid capsule or circle data');
      return null;
    }

    const closest = this.getClosestPointOnSegment(circle, capsule.p1, capsule.p2);
    return this.checkCircleCircle(
      { x: closest.x, y: closest.y, radius: capsule.radius },
      circle
    );
  },

  checkCapsuleCollision(entityCapsule: any, entityOther: any): MTV {
    const colCap = entityCapsule.shape;
    const colOther = entityOther.shape;
    const transCap = entityCapsule.transform;
    const transOther = entityOther.transform;

    if (!colCap || !colOther || !colCap.p1 || !colCap.p2) {
      console.warn('[CollisionUtils] Invalid capsule collider data');
      return null;
    }

    const posCap = {
      x: transCap.x + (colCap.offsetX || 0),
      y: transCap.y + (colCap.offsetY || 0)
    };

    const rot = colCap.rotation || 0;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

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
      x: transOther.x + (colOther.offsetX || 0),
      y: transOther.y + (colOther.offsetY || 0)
    };

    if (colOther.type === ShapeType.CIRCLE || colOther.type === ShapeType.POINT) {
      const r = colOther.type === ShapeType.POINT ? 0.1 : colOther.radius;
      return this.checkCapsuleCircle(capsule, { ...posOther, radius: r });
    }

    if (colOther.type === ShapeType.AABB || colOther.type === ShapeType.OBB) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const stepCount = Math.max(2, Math.ceil(length / 20));

      for (let i = 0; i <= stepCount; i++) {
        const t = i / stepCount;
        const samplePoint = { x: p1.x + dx * t, y: p1.y + dy * t };
        const mtv = this.checkCollision(
          {
            transform: samplePoint,
            shape: { type: ShapeType.CIRCLE, radius: capsule.radius },
            collider: { layer: entityCapsule.collider?.layer, mask: entityCapsule.collider?.mask }
          },
          entityOther
        );
        if (mtv) return mtv;
      }
    }

    return null;
  },

  checkSegmentCircle(p1: Vec2, p2: Vec2, circle: Circle): boolean {
    const closest = this.getClosestPointOnSegment(circle, p1, p2);
    const dx = closest.x - circle.x;
    const dy = closest.y - circle.y;
    const distanceSq = dx * dx + dy * dy;
    return distanceSq <= circle.radius * circle.radius;
  },

  checkSegmentAABB(p1: Vec2, p2: Vec2, aabb: AABB): boolean {
    let tmin = 0;
    let tmax = 1;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    if (Math.abs(dx) < 0.000001) {
      if (p1.x < aabb.minX || p1.x > aabb.maxX) return false;
    } else {
      const invDx = 1.0 / dx;
      let t1 = (aabb.minX - p1.x) * invDx;
      let t2 = (aabb.maxX - p1.x) * invDx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }

    if (Math.abs(dy) < 0.000001) {
      if (p1.y < aabb.minY || p1.y > aabb.maxY) return false;
    } else {
      const invDy = 1.0 / dy;
      let t1 = (aabb.minY - p1.y) * invDy;
      let t2 = (aabb.maxY - p1.y) * invDy;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }

    return true;
  },

  checkCollision(objA: any, objB: any): MTV {
    if (!objA || !objB) return null;

    const colA = objA.shape;
    const colB = objB.shape;
    const physA = objA.collider;
    const physB = objB.collider;
    const transA = objA.transform;
    const transB = objB.transform;

    if (!colA || !colB || !transA || !transB) return null;

    if (physA?.mask !== undefined && physB?.layer !== undefined) {
      if (!(physA.mask & physB.layer)) return null;
    }
    if (physB?.mask !== undefined && physA?.layer !== undefined) {
      if (!(physB.mask & physA.layer)) return null;
    }

    const posA = { x: transA.x + (colA.offsetX || 0), y: transA.y + (colA.offsetY || 0) };
    const posB = { x: transB.x + (colB.offsetX || 0), y: transB.y + (colB.offsetY || 0) };

    if (colA.type === ShapeType.CAPSULE) return this.checkCapsuleCollision(objA, objB);
    if (colB.type === ShapeType.CAPSULE) {
      const mtv = this.checkCapsuleCollision(objB, objA);
      return mtv ? { x: -mtv.x, y: -mtv.y } : null;
    }

    if ((colA.type === ShapeType.CIRCLE || colA.type === ShapeType.POINT) &&
        (colB.type === ShapeType.CIRCLE || colB.type === ShapeType.POINT)) {
      const rA = colA.type === ShapeType.POINT ? 0.1 : colA.radius;
      const rB = colB.type === ShapeType.POINT ? 0.1 : colB.radius;
      return this.checkCircleCircle({ ...posA, radius: rA }, { ...posB, radius: rB });
    }

    if (colA.type === ShapeType.AABB && colB.type === ShapeType.AABB) {
      const getAABB = (p: Vec2, c: any) => ({
        minX: p.x - c.width / 2, maxX: p.x + c.width / 2,
        minY: p.y - c.height / 2, maxY: p.y + c.height / 2,
        centerX: p.x, centerY: p.y
      });
      return this.checkAABBAABB(getAABB(posA, colA), getAABB(posB, colB));
    }

    if (colA.type === ShapeType.CIRCLE || colA.type === ShapeType.POINT) {
      const rA = colA.type === ShapeType.POINT ? 0.1 : colA.radius;
      if (colB.type === ShapeType.AABB) {
        const aabb = {
          minX: posB.x - colB.width / 2, maxX: posB.x + colB.width / 2,
          minY: posB.y - colB.height / 2, maxY: posB.y + colB.height / 2
        };
        return this.checkCircleAABB({ ...posA, radius: rA }, aabb);
      }
      if (colB.type === ShapeType.OBB) {
        return this.checkCircleOBB({ ...posA, radius: rA }, posB, colB.width, colB.height, colB.rotation);
      }
    }

    if (colB.type === ShapeType.CIRCLE || colB.type === ShapeType.POINT) {
      const mtv = this.checkCollision(objB, objA);
      return mtv ? { x: -mtv.x, y: -mtv.y } : null;
    }

    if (colA.type === ShapeType.OBB || colB.type === ShapeType.OBB) {
      const vA = colA.type === ShapeType.OBB
        ? this.getOBBVertices(posA.x, posA.y, colA.width, colA.height, colA.rotation)
        : this._getAABBVertices(posA.x, posA.y, colA.width, colA.height);
      const vB = colB.type === ShapeType.OBB
        ? this.getOBBVertices(posB.x, posB.y, colB.width, colB.height, colB.rotation)
        : this._getAABBVertices(posB.x, posB.y, colB.width, colB.height);
      return this.checkSAT(vA, vB);
    }

    return null;
  },

  getClosestPointOnSegment(p: Vec2, p1: Vec2, p2: Vec2): Vec2 {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return p1;

    let t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));

    return { x: p1.x + t * dx, y: p1.y + t * dy };
  },

  _getAxes(vertices: Vertex[]): Vec2[] {
    const axes: Vec2[] = [];
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

  _project(vertices: Vertex[], axis: Vec2) {
    let min = Infinity;
    let max = -Infinity;
    for (const p of vertices) {
      const dot = p.x * axis.x + p.y * axis.y;
      min = Math.min(min, dot);
      max = Math.max(max, dot);
    }
    return { min, max };
  },

  _getCenter(vertices: Vertex[]): Vec2 {
    let x = 0;
    let y = 0;
    for (const v of vertices) {
      x += v.x;
      y += v.y;
    }
    return { x: x / vertices.length, y: y / vertices.length };
  },

  _getAABBVertices(x: number, y: number, w: number, h: number): Vertex[] {
    const hw = w / 2;
    const hh = h / 2;
    return [
      { x: x - hw, y: y - hh },
      { x: x + hw, y: y - hh },
      { x: x + hw, y: y + hh },
      { x: x - hw, y: y + hh }
    ];
  },

  getOBBVertices(x: number, y: number, width: number, height: number, rotation: number): Vertex[] {
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

  resolveMapBounds(pos: Vec2, shape: any, mapBounds: { width: number; height: number } | null | undefined): boolean {
    if (!mapBounds || !shape) return false;

    let moved = false;
    const { width, height } = mapBounds;

    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;

    if (shape.type === ShapeType.CIRCLE || shape.type === ShapeType.POINT) {
      const r = shape.type === ShapeType.POINT ? 0.1 : shape.radius;
      const ox = shape.offsetX || 0;
      const oy = shape.offsetY || 0;
      left = pos.x + ox - r;
      right = pos.x + ox + r;
      top = pos.y + oy - r;
      bottom = pos.y + oy + r;

      if (left < 0) { pos.x += -left; moved = true; }
      else if (right > width) { pos.x -= (right - width); moved = true; }

      if (top < 0) { pos.y += -top; moved = true; }
      else if (bottom > height) { pos.y -= (bottom - height); moved = true; }
    } else if (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB) {
      const hw = shape.width / 2;
      const hh = shape.height / 2;
      const ox = shape.offsetX || 0;
      const oy = shape.offsetY || 0;

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
