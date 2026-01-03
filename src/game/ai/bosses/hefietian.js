export const hefietianAI = (context) => {
    const { read, act } = context;

    // Check for dead players (enemies of the boss)
    const deadPlayers = read.getDeadPlayers();

    // 1. Priority: If anyone is dead, use "Trapping God's Enemy in Living Hell" (205)
    if (deadPlayers && deadPlayers.length > 0) {
        // Target the first dead player found
        const target = deadPlayers[0];
        return act()
            .skill(205) // Revives enemy with curse
            .targetSingle(target)
            .build();
    }

    const count = read.actionCount;

    if (count % 2 === 0) {
        // Even: AOE Fire (1006)
        return act()
            .skill(1006)
            .targetAll()
            .build();
    } else {
        // Odd: Single Fire (1005)
        const target = read.getRandomTarget();
        return act()
            .skill(1005)
            .targetSingle(target)
            .build();
    }
};
