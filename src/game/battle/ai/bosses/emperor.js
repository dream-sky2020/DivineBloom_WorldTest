export const emperorAI = (context) => {
    const { read, act } = context;
    const count = read.actionCount;

    if (count % 2 !== 0) {
        // Odd: Single Lightning (1001)
        const target = read.getRandomTarget();
        return act()
            .skill('skill_boss_thunder_strike')
            .targetSingle(target)
            .build();
    } else {
        // Even: AOE Blizzard (1002)
        return act()
            .skill('skill_boss_blizzard')
            .targetAll()
            .build();
    }
};
