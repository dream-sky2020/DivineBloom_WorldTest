/**
 * SteeringTool
 * 提供基于 Context Steering (上下文转向) 的避障和移动逻辑
 */
import { ShapeType } from '../definitions/enums/Shape';

export const SteeringTool = {
  // 预定义 8 个检测方向 (时钟拨盘式)
  DIRECTIONS: [
    { x: 0, y: -1 },  // N
    { x: 0.707, y: -0.707 }, // NE
    { x: 1, y: 0 },   // E
    { x: 0.707, y: 0.707 },  // SE
    { x: 0, y: 1 },   // S
    { x: -0.707, y: 0.707 }, // SW
    { x: -1, y: 0 },  // W
    { x: -0.707, y: -0.707 } // NW
  ],

  /**
   * 计算最优移动方向
   * @param {object} entity 当前 AI 实体
   * @param {object} targetPos 目标位置 {x, y}
   * @param {Array} obstacles 附近的障碍物列表
   * @param {number} dangerRadius 感知危险的半径
   * @returns {object} 归一化的移动向量 {x, y}
   */
  calculateMoveDir(entity, targetPos, obstacles = [], dangerRadius = 80) {
    const currentPos = entity.transform;
    if (!currentPos || !targetPos) return { x: 0, y: 0 };

    // 1. 计算目标距离，如果非常接近则停止 (防止抖动)
    const dx = targetPos.x - currentPos.x;
    const dy = targetPos.y - currentPos.y;
    const distToTarget = Math.sqrt(dx * dx + dy * dy);

    if (distToTarget < 5) {
        return { x: 0, y: 0 };
    }

    const interest = new Array(8).fill(0);
    const danger = new Array(8).fill(0);

    // 2. 计算兴趣值 (Interest Map)
    const targetDir = { x: dx / distToTarget, y: dy / distToTarget };
    
    this.DIRECTIONS.forEach((dir, i) => {
      // 使用点积衡量方向一致性
      const dot = dir.x * targetDir.x + dir.y * targetDir.y;
      interest[i] = Math.max(0, dot);
    });

    // 3. 计算危险值 (Danger Map)
    obstacles.forEach(obs => {
      // [Updated] 优先使用主实体位置，如果不可用(如纯子实体)尝试获取世界坐标
      let obsPos = obs.transform;
      if (!obsPos && obs.parent && obs.parent.entity) {
          obsPos = obs.parent.entity.transform;
      }
      if (!obsPos) return;

      // [Updated] Shape 已经是单一对象，不再需要查找 Map
      const shape = obs.shape;
      
      // 简化处理：将障碍物视为圆形或找到最近点
      let closestX = obsPos.x;
      let closestY = obsPos.y;

      if (shape && (shape.type === ShapeType.AABB || shape.type === ShapeType.OBB)) {
        const halfW = shape.width / 2;
        const halfH = shape.height / 2;
        // 找到矩形上距离当前位置最近的点
        closestX = Math.max(obsPos.x - halfW, Math.min(currentPos.x, obsPos.x + halfW));
        closestY = Math.max(obsPos.y - halfH, Math.min(currentPos.y, obsPos.y + halfH));
      }

      const vX = closestX - currentPos.x;
      const vY = closestY - currentPos.y;
      const distSq = vX * vX + vY * vY;
      const radiusSq = dangerRadius * dangerRadius;

      if (distSq < radiusSq && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const obsDir = { x: vX / dist, y: vY / dist };
        const weight = 1.0 - (dist / dangerRadius); // 越近危险越大

        this.DIRECTIONS.forEach((dir, i) => {
          const dot = dir.x * obsDir.x + dir.y * obsDir.y;
          if (dot > 0.5) { // 如果该方向指向障碍物（夹角小于 60 度）
            danger[i] = Math.max(danger[i], dot * weight);
          }
        });
      }
    });

    // 3. 综合决策 (Elimination & Selection)
    let bestDir = { x: 0, y: 0 };
    let maxScore = -1;

    for (let i = 0; i < 8; i++) {
      // 核心公式：兴趣减去危险
      // 如果危险很高，直接将得分降至极低
      const score = danger[i] >= 0.9 ? -1 : interest[i] * (1 - danger[i]);
      
      if (score > maxScore) {
        maxScore = score;
        bestDir = this.DIRECTIONS[i];
      }
    }

    // 如果所有方向都被封死，或者离目标很近了
    if (maxScore <= 0 && distToTarget > 10) {
        // 尝试寻找一个危险最小的方向逃逸，或者保持原地
        let minDangerIdx = 0;
        let minDanger = 2;
        for(let i=0; i<8; i++) {
            if(danger[i] < minDanger) {
                minDanger = danger[i];
                minDangerIdx = i;
            }
        }
        return this.DIRECTIONS[minDangerIdx];
    }

    return bestDir;
  }
};
