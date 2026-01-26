import { BattleReader } from './adapter/Reader';
import { createAction } from './adapter/Builder';
import { emperorAI } from './bosses/emperor';
import { shahryarAI } from './bosses/shahryar';
import { hefietianAI } from './bosses/hefietian';
import { yibitianAI } from './bosses/yibitian';

const aiRegistry = {
    'character_emperor_shenwu': emperorAI,
    'character_shahryar': shahryarAI,
    'character_hefietian': hefietianAI,
    'character_yibitian': yibitianAI
};

import { skillsDb } from '@schema/skills';

const defaultAI = (context) => {
    // Universal AI: Use skills in sequence (Loop), single target skills pick random alive target

    // 1. Get available skills
    const skills = context.read.skills;

    // 2. If no skills, attack randomly
    if (!skills || skills.length === 0) {
        const target = context.read.getRandomTarget();
        return context.act()
            .attack(target)
            .build();
    }

    // 3. Determine which skill to use based on action count (Sequence: 0 -> 1 -> ... -> N -> 0)
    const turnIndex = Math.max(0, context.read.actionCount - 1);
    const skillIndex = turnIndex % skills.length;
    const skillId = skills[skillIndex];

    // Check if skill is Passive (400-499 or type === passive)
    const skillData = skillsDb[skillId];
    const isPassive = (skillId >= 400 && skillId < 500) || (skillData && skillData.type === 'skillTypes.passive');

    const target = context.read.getRandomTarget();

    // 4. Fallback or Passive Logic
    // If no target, OR if the chosen skill is Passive, fallback to Normal Attack
    if (!target || isPassive) {
        return context.act().attack(target || null).build();
    }

    return context.act()
        .skill(skillId)
        .targetSingle(target)
        .build();
};

export const getEnemyAction = (enemyId, rawContext) => {
    // 1. Create Adapter
    const reader = new BattleReader(rawContext);

    // 2. Assemble Safe Context
    const safeContext = {
        read: reader,        // For reading state
        act: createAction    // For building actions
    };

    const aiFunc = aiRegistry[enemyId] || defaultAI;
    return aiFunc(safeContext);
};
