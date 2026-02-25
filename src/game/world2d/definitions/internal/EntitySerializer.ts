import { entityRegistry } from '../../registries/EntityRegistry';
import { componentRegistry } from '../../registries/ComponentRegistry';

// Temporary entity types to skip during serialization
const TEMPORARY_ENTITY_TYPES = [
    'bullet',
    'particle',
    'vfx'
];

// Components that should never be persisted (editor/runtime only)
const NON_PERSISTENT_COMPONENTS = new Set([
    'Inspector'
]);

export const EntitySerializer = {
    /**
     * Serialize an entity to a data object
     * @param entity The runtime entity instance
     * @returns Serialized data object or null
     */
    serialize(entity: any) {
        if (!entity) return null;

        // 0. Skip child entities (they are recreated by parent definition)
        if (entity.parent?.entity) {
            return null;
        }

        // 1. Skip temporary entities
        if (entity.type && TEMPORARY_ENTITY_TYPES.includes(entity.type)) {
            return null;
        }

        // 2. Skip entities marked as transient/temporary via property
        if (entity.temporary || entity.doNotSave) {
            return null;
        }

        // 3. Try to use Entity Definition for serialization (Preferred)
        if (entity.type) {
            const def = entityRegistry.get(entity.type);
            if (def && def.serialize) {
                try {
                    return def.serialize(entity);
                } catch (e) {
                    console.warn(`[EntitySerializer] Custom serialization failed for ${entity.type}`, e);
                    // Fallback to generic serialization if custom fails? 
                    // Usually better to fail or let generic take over.
                }
            }
        }

        // 4. Generic Component Serialization Fallback
        // This handles entities that don't have a strict definition or are dynamic
        
        const serialized: any = {
            type: entity.type || 'unknown',
            components: {}
        };

        // Optional: Save entity ID (canonical), fallback to interaction payload
        if (entity.id) serialized.id = String(entity.id);
        else if (entity.interaction?.id) serialized.id = String(entity.interaction.id);

        // Iterate over all registered components
        const componentNames = componentRegistry.getAllNames();
        
        for (const name of componentNames) {
            if (NON_PERSISTENT_COMPONENTS.has(name)) continue;
            const def = componentRegistry.get(name);
            if (!def) continue;

            // Resolve property name on entity
            let propName = name;
            let val = entity[propName];

            if (val === undefined) {
                propName = name.charAt(0).toLowerCase() + name.slice(1);
                val = entity[propName];
            }

            // If component exists on entity
            if (val !== undefined) {
                try {
                    if (def.serialize) {
                        serialized.components[name] = def.serialize(val);
                    } else {
                        serialized.components[name] = { ...val };
                    }
                } catch (e) {
                    console.warn(`[EntitySerializer] Failed to serialize component ${name} on entity ${entity.type || entity.name}`, e);
                }
            }
        }

        // Only return if we actually serialized something useful, 
        // or if it's a known type even without components (though rare)
        if (Object.keys(serialized.components).length === 0 && serialized.type === 'unknown') {
            return null;
        }

        return serialized;
    }
};
