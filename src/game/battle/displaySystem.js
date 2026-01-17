import { 
    getRoleColor,
    getStatusClass, 
    getStatusTooltip, 
    getStatusIcon,
    getATBWidth,
    getATBColorClass,
    getATBContainerClass
} from '@/utils/battleUIUtils';

/**
 * Creates a display-ready object for a battle unit
 * @param {Object} unit The raw unit data
 * @param {Object} context Context for selection and turn state
 * @returns {Object} UI-ready display data
 */
export const getUnitDisplayData = (unit, { activeUnit, validTargetIds = [] } = {}) => {
    if (!unit) return null;

    const isDead = unit.statusEffects?.some(s => s.id === 'status_dead') || false;
    const isDying = unit.statusEffects?.some(s => s.id.startsWith('status_dying')) || false;
    const isActiveTurn = activeUnit && activeUnit.uuid === unit.uuid;
    const isSelectable = validTargetIds.includes(unit.uuid);

    return {
        uuid: unit.uuid,
        name: unit.name, // Localized name handling still in component or here? 
                         // Component is better for i18n reactivity, but we can provide the object.
        role: unit.role,
        roleColor: getRoleColor(unit.role),
        
        // Stats
        hp: unit.currentHp,
        maxHp: unit.maxHp,
        hpPercent: Math.max(0, Math.min(100, (unit.currentHp / unit.maxHp) * 100)),
        
        mp: unit.currentMp,
        maxMp: unit.maxMp,
        mpPercent: Math.max(0, Math.min(100, (unit.currentMp / unit.maxMp) * 100)),
        
        // ATB
        atb: unit.atb,
        atbPercent: getATBWidth(unit.atb),
        atbColorClass: getATBColorClass(unit.atb),
        atbContainerClass: getATBContainerClass(unit.atb),
        atbNoTransition: (unit.atb || 0) < 5 || (unit.atb > 0 && unit.atb % 100 < 5),

        // Energy (BP)
        energy: unit.energy || 0,
        energyPills: Array.from({ length: 6 }, (_, i) => (unit.energy || 0) > i),
        
        // Status & Effects
        isDead,
        isDying,
        isActiveTurn,
        isSelectable,
        isBoss: unit.isBoss || false,
        statusEffects: (unit.statusEffects || []).map(st => ({
            ...st,
            icon: getStatusIcon(st.id),
            class: getStatusClass(st.id),
            tooltip: getStatusTooltip(st)
        })),

        // Metadata
        isPlayer: unit.isPlayer
    };
};
