// src/game/battle/timeSystem.js
import { statusDb } from '@/data/status';

const ATB_SPEED_MULTIPLIER = 2.0; 
const MAX_ATB = 100;

/**
 * 计算单位在当前帧增加的 ATB 值
 * @param {Object} unit 单位对象
 * @param {Number} dt 时间增量 (秒)
 * @returns {Number} 增加的 ATB 数值
 */
export const calculateAtbTick = (unit, dt) => {
    let spd = unit.spd || 10;

    // 应用状态对速度的修正
    if (unit.statusEffects) {
        unit.statusEffects.forEach(s => {
            const statusDef = statusDb[s.id];
            if (statusDef && statusDef.effects) {
                statusDef.effects.forEach(eff => {
                    if (eff.trigger === 'passive' && eff.type === 'statMod' && eff.stat === 'spd') {
                        spd *= eff.value;
                    }
                });
            }
        });
    }

    return spd * dt * ATB_SPEED_MULTIPLIER;
};

/**
 * 检查单位是否准备好行动
 * @param {Object} unit 
 * @param {Boolean} isBackRow 
 * @returns {Boolean}
 */
export const isUnitReady = (unit, isBackRow) => {
    if (isBackRow) return false; // 后排不行动
    return unit.atb >= MAX_ATB;
};

