export const yibitianAI = (context) => {
    const { read, act } = context;

    // Check for dead players (enemies of the boss)
    // Note: getDeadPlayers was added to BattleReader for this purpose
    const deadPlayers = read.getDeadPlayers();

    // 1. Priority: If anyone is dead, use "Trapping God's Enemy in Living Hell" (205)
    if (deadPlayers && deadPlayers.length > 0) {
        // Target the first dead player found
        const target = deadPlayers[0];
        return act()
            .skill('skill_magic_living_hell') // Revives enemy with curse
            .targetUnit(target) // Use targetUnit to avoid overriding 'deadEnemy' type
            .build();
    }

    // 2. Loop: "Equal Plague Rain" (204) and "Emerald Spike Explosion" (103)
    const count = read.actionCount;

    if (count % 2 === 0) {
        // Even turns: Equal Plague Rain (204)
        // Target type in skill is "allUnits"
        return act()
            .skill('skill_magic_equal_plague_rain')
            .targetAll()
            .build();
    } else {
        // Odd turns: Emerald Spike Explosion (103)
        // Target type in skill is "allOtherUnits"
        return act()
            .skill('skill_physical_emerald_spike')
            .targetAll()
            .build();
    }
};

