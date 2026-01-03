export class BattleReader {
    constructor({ actor, party, turnCount }) {
        this._actor = actor;
        this._party = party; // Expecting partySlots array
        this._turnCount = turnCount;
    }

    // --- Actor Info ---
    get me() { return this._actor; }

    get hpRatio() {
        if (!this._actor.maxHp) return 0;
        return this._actor.currentHp / this._actor.maxHp;
    }

    get actionCount() {
        return this._actor.actionCount || 0;
    }

    hasStatus(statusId) {
        if (!this._actor.statusEffects) return false;
        return this._actor.statusEffects.some(s => s.id === statusId);
    }

    // --- Target Info ---

    // Get all alive front-row players
    getAlivePlayers() {
        if (!this._party) return [];
        return this._party
            .filter(slot => slot.front && slot.front.currentHp > 0)
            .map(slot => slot.front);
    }

    // Get all dead players (front and back row)
    getDeadPlayers() {
        if (!this._party) return [];
        const dead = [];
        this._party.forEach(slot => {
            if (slot.front && slot.front.currentHp <= 0) dead.push(slot.front);
            if (slot.back && slot.back.currentHp <= 0) dead.push(slot.back);
        });
        return dead;
    }

    // Get random alive target
    getRandomTarget() {
        const targets = this.getAlivePlayers();
        if (targets.length === 0) return null;
        return targets[Math.floor(Math.random() * targets.length)];
    }

    // Get lowest HP target (absolute value)
    getLowestHpTarget() {
        const targets = this.getAlivePlayers();
        if (targets.length === 0) return null;
        return targets.reduce((prev, curr) => prev.currentHp < curr.currentHp ? prev : curr);
    }

    // Get lowest HP target (ratio)
    getLowestHpRatioTarget() {
        const targets = this.getAlivePlayers();
        if (targets.length === 0) return null;
        const getRatio = (unit) => unit.currentHp / unit.maxHp;
        return targets.reduce((prev, curr) => getRatio(prev) < getRatio(curr) ? prev : curr);
    }
}

