import { entityRegistry } from '../../registries/EntityRegistry';
import { componentRegistry } from '../../registries/ComponentRegistry';
import { world } from '@world2d/runtime/WorldEcsRuntime';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EntityCreator');

export const EntityCreator = {
    /**
     * Universal create method
     * @param engine Game engine instance (optional, kept for compatibility)
     * @param type Entity type identifier
     * @param data Initialization data
     * @param context Optional context
     */
    create(engine: any, type: string, data: any, context: any = {}) {
        // 1. Try to find entity definition
        const def = entityRegistry.get(type);

        if (def) {
            try {
                // If definition exists, use its factory
                // Handle creationIndex increment
                // Note: creationIndex is modified here to ensure global uniqueness for this session
                def.creationIndex++; 
                
                // If data doesn't have a name, generate one?
                // Most create() methods handle this, e.g. "name || default"
                // We could inject default name here if needed, but definitions handle it well.
                
                return def.create(data);
            } catch (error) {
                logger.error(`[EntityCreator] Failed to create entity of type '${type}':`, error);
                return null;
            }
        }

        // 2. Fallback: Generic Entity Creation (ECS style)
        // If no specific definition, but data has components, create generic entity
        if (data && data.components) {
            return this.createFromData({ ...data, type });
        }

        const summary = {
            type,
            dataType: data?.type,
            id: data?.id,
            name: data?.name,
            dataKeys: data ? Object.keys(data) : [],
            componentKeys: data?.components ? Object.keys(data.components) : [],
            contextKeys: context ? Object.keys(context) : []
        };
        logger.warn(`[EntityCreator] Unknown entity type and no component data provided.`, summary);
        return null;
    },

    /**
     * Create entity from generic component data
     * @param data Entity data object { id?, type?, components: { ... } }
     */
    createFromData(data: any) {
        // 1. Create ECS entity base
        const entity: any = {
            id: data.id,
            type: data.type || 'unknown',
            name: data.name || data.type || 'Entity',
            components: {} 
        };

        // 2. Iterate components and deserialize
        if (data.components) {
            for (const [compName, compData] of Object.entries(data.components)) {
                const def = componentRegistry.get(compName);
                if (!def) {
                    logger.warn(`Component definition not found: ${compName}`);
                    continue;
                }

                try {
                    const componentInstance = def.deserialize(compData);
                    
                    // Convention: component name lowerCamelCase
                    const propName = compName.charAt(0).toLowerCase() + compName.slice(1);
                    entity[propName] = componentInstance;

                } catch (e) {
                    logger.error(`Failed to deserialize component ${compName}:`, e);
                }
            }
        }

        // Special check for Global Manager singleton
        if (entity.type === 'global_manager' || entity.globalManager) {
             const existing = world.with('globalManager').first;
             if (existing) {
                 logger.info('Replacing existing Global Manager');
                 world.remove(existing);
             }
             entity.globalManager = true; 
        }

        return world.add(entity);
    },

    // Legacy helpers - Map to universal create
    // Kept for backward compatibility if any code calls these directly
    createEnemy(data: any) { return this.create(null, 'enemy', data); },
    createPlayer(data: any) { return this.create(null, 'player', data); },
    createNPC(data: any) { return this.create(null, 'npc', data); },
    createPortal(data: any) { return this.create(null, 'portal', data); },
    createPortalDestination(data: any) { return this.create(null, 'portal_destination', data); },
    createGlobalManager(data: any) { return this.create(null, 'global_manager', data); },
    createDecoration(data: any) { return this.create(null, 'decoration', data); },
    createObstacle(data: any) { return this.create(null, 'obstacle', data); },
    createBackground(data: any) { return this.create(null, 'background_ground', data); },
    createSceneConfig(data: any) { return this.create(null, 'scene_config', data); }
};
