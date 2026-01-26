export class BattleReader {
    constructor({ actor, party, enemies, turnCount }) {
        this._actor = actor;
        this._party = party; // Expecting partySlots array
        this._enemies = enemies || []; // Expecting enemies array
        this._turnCount = turnCount;
    }

    // --- Actor Info ---
    get me() { return this._actor; }
    
    get isPlayer() { return !!this._actor.isPlayer; }

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

    // --- Skills Info ---
    get skills() {
        return this._actor.skills || [];
    }

    // --- Target Info ---

    // Dynamic Team Resolution
    get opponents() {
        const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');

        if (this.isPlayer) {
            // Player's opponents are Enemies
            return this._enemies.filter(e => !isDead(e));
        } else {
            // Enemy's opponents are Party (Front Row primarily)
            if (!this._party) return [];
            return this._party
                .filter(slot => slot.front && !isDead(slot.front))
                .map(slot => slot.front);
        }
    }

    get allies() {
        const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');

        if (this.isPlayer) {
            // Player's allies are Party
            if (!this._party) return [];
            return this._party
                .filter(slot => slot.front && !isDead(slot.front))
                .map(slot => slot.front);
        } else {
            // Enemy's allies are Enemies
            return this._enemies.filter(e => !isDead(e));
        }
    }

    // Legacy Support: getAlivePlayers used by Enemy AI to find targets
    getAlivePlayers() {
        return this.opponents;
    }

    // Get all dead players (front and back row) - or opponents
    getDeadPlayers() {
        const isDead = (u) => u && u.statusEffects && u.statusEffects.some(s => s.id === 'status_dead');

        if (this.isPlayer) {
            return this._enemies.filter(e => isDead(e));
        } else {
            if (!this._party) return [];
            const dead = [];
            this._party.forEach(slot => {
                if (slot.front && isDead(slot.front)) dead.push(slot.front);
                if (slot.back && isDead(slot.back)) dead.push(slot.back);
            });
            return dead;
        }
    }

    // Get random alive target (Opponent)
    getRandomTarget() {
        const targets = this.opponents;
        if (targets.length === 0) return null;
        return targets[Math.floor(Math.random() * targets.length)];
    }

    // Get lowest HP target (absolute value)
    getLowestHpTarget() {
        const targets = this.opponents;
        if (targets.length === 0) return null;
        return targets.reduce((prev, curr) => prev.currentHp < curr.currentHp ? prev : curr);
    }

    // Get lowest HP target (ratio)
    getLowestHpRatioTarget() {
        const targets = this.opponents;
        if (targets.length === 0) return null;
        const getRatio = (unit) => unit.currentHp / unit.maxHp;
        return targets.reduce((prev, curr) => getRatio(prev) < getRatio(curr) ? prev : curr);
    }
}
