class ActionBuilder {
    constructor() {
        this._action = {
            type: 'wait',
            effects: []
        };
    }

    // --- Action Types ---

    // Standard Attack
    attack(target) {
        this._action.type = 'attack';
        this._action.targetId = target ? (target.uuid || target.id) : null;
        return this;
    }

    // Use a pre-defined skill from ID
    skill(skillId) {
        this._action.type = 'skill';
        this._action.skillId = skillId;
        return this;
    }

    // Start building a custom skill (for Bosses)
    customSkill(logKey) {
        this._action.type = 'custom_skill';
        this._action.logKey = logKey;
        this._action.effects = []; // reset effects
        return this;
    }

    // --- Custom Skill Config ---

    // Generic effect adder (Future-proof)
    effect(type, config = {}) {
        this._action.effects.push({
            type,
            ...config
        });
        return this;
    }

    targetSingle(unit) {
        this._action.targetType = 'single';
        this._action.targetId = unit ? (unit.uuid || unit.id) : null;
        return this;
    }

    // Just set target ID, don't override type (let Skill DB decide)
    targetUnit(unit) {
        this._action.targetId = unit ? (unit.uuid || unit.id) : null;
        return this;
    }

    targetAll() {
        this._action.targetType = 'all';
        return this;
    }

    // Add damage effect
    damage(value, scaling = 'atk') {
        this._action.effects.push({
            type: 'damage',
            value,
            scaling
        });
        return this;
    }

    // Add status effect
    applyStatus(statusId, duration = 3, chance = 1.0) {
        this._action.effects.push({
            type: 'applyStatus',
            status: statusId,
            duration,
            chance
        });
        return this;
    }

    // Add heal effect
    heal(value, scaling = 'atk') {
        this._action.effects.push({
            type: 'heal',
            value,
            scaling
        });
        return this;
    }

    // --- Finalize ---

    build() {
        return this._action;
    }
}

export const createAction = () => new ActionBuilder();

