export const shahryarAI = (context) => {
    const { read, act } = context;
    const count = read.actionCount;

    if (count % 2 === 0) {
        // Even: AOE Slash (1004)
        return act()
            .skill('skill_boss_full_moon_slash')
            .targetAll()
            .build();
    } else {
        // Odd: Single Slash (1003)
        const target = read.getRandomTarget();
        return act()
            .skill('skill_boss_precision_stab')
            .targetSingle(target)
            .build();
    }
};
