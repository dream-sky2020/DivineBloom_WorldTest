import { skillsDb } from '@schema/skills';

/**
 * 过滤互斥技能，同一互斥组只保留优先级最高的
 */
export const filterExclusiveSkills = (skillIds) => {
    if (!skillIds || !Array.isArray(skillIds)) return [];

    const exclusiveMap = new Map(); // group -> { id, priority }
    const result = [];

    for (const id of skillIds) {
        const skill = skillsDb[id];
        if (!skill) {
            result.push(id); 
            continue;
        }

        if (skill.exclusiveGroup) {
            const current = exclusiveMap.get(skill.exclusiveGroup);
            const priority = skill.exclusiveGroupPriority || 0;
            if (!current || priority > current.priority) {
                exclusiveMap.set(skill.exclusiveGroup, { id, priority });
            }
        } else {
            result.push(id);
        }
    }

    for (const entry of exclusiveMap.values()) {
        result.push(entry.id);
    }

    return result;
};
