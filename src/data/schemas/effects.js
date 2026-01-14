import { z } from 'zod';
import { ID } from './common.js';

// ============================================
// 🎯 Effect System - 完整枚举定义
// ============================================

// --- Effect Types (效果类型) ---
export const EffectType = {
    // Damage & Healing
    DAMAGE: 'damage',
    HEAL: 'heal',
    HEAL_ALL: 'heal_all',
    RECOVER_MP: 'recoverMp',
    RECOVER_MP_ALT: 'recover_mp', // Alternative naming

    // Status Application
    APPLY_STATUS: 'applyStatus',
    CURE_STATUS: 'cureStatus',

    // Buffs & Debuffs
    BUFF: 'buff',
    STAT_BOOST: 'stat_boost',
    STAT_MOD: 'statMod',

    // Control & Immunity
    STUN: 'stun',
    IMMUNITY: 'immunity',

    // Special Actions
    REVIVE: 'revive',
    REVIVE_ENEMY: 'revive_enemy',
    FULL_RESTORE: 'fullRestore',

    // Custom/Special
    PLAGUE_RAIN: 'plague_rain',
};

// --- Trigger Types (触发器类型) ---
export const TriggerType = {
    // Battle Events
    BATTLE_START: 'battle_start',
    BATTLE_END: 'battle_end',

    // Turn Events
    TURN_START: 'turnStart',
    TURN_END: 'turnEnd',

    // Action Events
    CHECK_ACTION: 'checkAction',
    BEFORE_ACTION: 'beforeAction',
    AFTER_ACTION: 'afterAction',

    // Damage Events
    ON_DAMAGE_TAKEN: 'on_damage_taken',
    ON_DAMAGE_DEALT: 'on_damage_dealt',

    // Special Events
    ON_CC_SKIP: 'on_cc_skip',
    ON_DEATH: 'on_death',
    ON_REVIVE: 'on_revive',

    // Passive (Always Active)
    PASSIVE: 'passive',
};

// --- Scaling Types (缩放类型) ---
export const ScalingType = {
    ATK: 'atk',
    MAG: 'mag',
    DEF: 'def',
    STR: 'str',
    SPD: 'spd',
    MAX_HP: 'maxHp',
    CURRENT_HP: 'currentHp',
    MAX_MP: 'maxMp',
    CURRENT_MP: 'currentMp',
    DAMAGE_DEALT: 'damage_dealt',
    MISSING_HP: 'missing_hp',
};

// --- Target Types (目标类型) ---
export const TargetType = {
    SELF: 'self',
    ENEMY: 'enemy',
    ALLY: 'ally',
    ALL_ENEMIES: 'allEnemies',
    ALL_ALLIES: 'allAllies',
    RANDOM_ENEMY: 'randomEnemy',
    RANDOM_ALLY: 'randomAlly',
};

// --- Stat Types (属性类型) ---
export const StatType = {
    HP: 'hp',
    MP: 'mp',
    ATK: 'atk',
    DEF: 'def',
    MAG: 'mag',
    SPD: 'spd',
    STR: 'str',
};

// --- Element Types (元素类型) ---
export const ElementType = {
    PHYSICAL: 'elements.physical',
    FIRE: 'elements.fire',
    WATER: 'elements.water',
    ICE: 'elements.ice',
    WIND: 'elements.wind',
    EARTH: 'elements.earth',
    LIGHTNING: 'elements.lightning',
    LIGHT: 'elements.light',
    DARK: 'elements.dark',
    NONE: 'elements.none',
};

// --- Status Application Mode (状态施加模式) ---
export const StatusApplicationMode = {
    ADD_STACK: 'add_stack',
    REFRESH: 'refresh',
    REPLACE: 'replace',
};

// ============================================
// 📋 Zod Schema 定义
// ============================================

// 获取所有枚举值
const effectTypeValues = Object.values(EffectType);
const triggerTypeValues = Object.values(TriggerType);
const scalingTypeValues = Object.values(ScalingType);
const targetTypeValues = Object.values(TargetType);
const statTypeValues = Object.values(StatType);
const elementTypeValues = Object.values(ElementType);
const statusApplicationModeValues = Object.values(StatusApplicationMode);

/**
 * 完整的 Effect Schema（用于技能和状态效果）
 */
export const EffectSchema = z.object({
    // ===== 必需字段 =====
    type: z.enum(effectTypeValues, {
        errorMap: () => ({
            message: `Effect type must be one of: ${effectTypeValues.join(', ')}`
        })
    }),

    // ===== 核心参数 =====
    value: z.number().optional(),
    percent: z.number().min(0).max(1).optional(), // 百分比值 (0.0 - 1.0)

    // 缩放类型
    scaling: z.enum(scalingTypeValues, {
        errorMap: () => ({
            message: `Scaling must be one of: ${scalingTypeValues.join(', ')}`
        })
    }).optional(),

    // 元素类型
    element: z.enum(elementTypeValues, {
        errorMap: () => ({
            message: `Element must be one of: ${elementTypeValues.join(', ')}`
        })
    }).optional(),

    // ===== 状态相关 =====
    status: ID.optional(), // 状态 ID
    duration: z.number().int().min(0).optional(), // 状态持续回合数
    chance: z.number().min(0).max(1).optional(), // 触发概率 (0.0 - 1.0)
    mode: z.enum(statusApplicationModeValues, {
        errorMap: () => ({
            message: `Mode must be one of: ${statusApplicationModeValues.join(', ')}`
        })
    }).optional(),

    // ===== 目标相关 =====
    target: z.enum(targetTypeValues, {
        errorMap: () => ({
            message: `Target must be one of: ${targetTypeValues.join(', ')}`
        })
    }).optional(),

    // ===== 属性相关 =====
    stat: z.enum(statTypeValues, {
        errorMap: () => ({
            message: `Stat must be one of: ${statTypeValues.join(', ')}`
        })
    }).optional(),

    // ===== 触发器 (用于被动技能和状态) =====
    trigger: z.enum(triggerTypeValues, {
        errorMap: () => ({
            message: `Trigger must be one of: ${triggerTypeValues.join(', ')}`
        })
    }).optional(),

    // ===== 随机化参数 =====
    minOffset: z.number().optional(), // 最小偏移量 (负数，用于伤害浮动)
    maxOffset: z.number().optional(), // 最大偏移量 (正数，用于伤害浮动)

    // ===== 多次触发 =====
    times: z.number().int().min(1).optional(), // 固定触发次数
    minTimes: z.number().int().min(1).optional(), // 最小触发次数
    maxTimes: z.number().int().min(1).optional(), // 最大触发次数

    // ===== 堆叠相关 =====
    maxStack: z.number().int().min(1).optional(), // 最大堆叠层数

    // ===== 其他特殊参数 =====
    ignoreDefense: z.boolean().optional(), // 是否无视防御
    canCrit: z.boolean().optional(), // 是否可以暴击
    critRate: z.number().min(0).max(1).optional(), // 暴击率覆盖
    critDamage: z.number().min(1).optional(), // 暴击倍率覆盖

}).strict(); // 严格模式：不允许未定义的字段

/**
 * 技能 Effect Schema（额外允许一些技能特有的字段）
 */
export const SkillEffectSchema = EffectSchema;

/**
 * 状态 Effect Schema（额外允许一些状态特有的字段）
 */
export const StatusEffectSchema = EffectSchema;

// ============================================
// 🔍 验证辅助函数
// ============================================

/**
 * 验证单个 Effect
 */
export const validateEffect = (effect, context = 'Unknown') => {
    try {
        return EffectSchema.parse(effect);
    } catch (e) {
        console.error(`🚨 Effect Validation Error in [${context}]:`);
        if (e.errors) {
            e.errors.forEach(err => {
                console.error(`  ❌ ${err.path.join('.')}: ${err.message}`);
            });
        }
        throw new Error(`Effect Validation Failed: ${context}`);
    }
};

/**
 * 验证 Effect 数组
 */
export const validateEffects = (effects, context = 'Unknown') => {
    if (!Array.isArray(effects)) {
        throw new Error(`Effects must be an array in ${context}`);
    }
    return effects.map((effect, index) =>
        validateEffect(effect, `${context}[${index}]`)
    );
};

/**
 * 批量验证对象中的 effects 字段
 */
export const validateObjectEffects = (obj, context = 'Unknown') => {
    if (obj.effects && Array.isArray(obj.effects)) {
        obj.effects = validateEffects(obj.effects, context);
    }
    return obj;
};

// ============================================
// 📦 导出所有枚举常量
// ============================================

export const EffectEnums = {
    EffectType,
    TriggerType,
    ScalingType,
    TargetType,
    StatType,
    ElementType,
    StatusApplicationMode,
};
