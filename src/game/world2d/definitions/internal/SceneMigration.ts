import { createLogger } from '@/utils/logger';

const logger = createLogger('SceneMigration');

/**
 * Scene Data Migration
 * Handles ECS scene data versioning and migration.
 */
export const SceneMigration = {
    // Current System Version
    CURRENT_VERSION: '1.2.0',

    // Migration Tasks
    MIGRATIONS: {
        /**
         * v1.0.0 -> v1.1.0
         * Example: Add new AI parameters
         */
        '1.0.0': (bundle: any) => {
            logger.info('Migrating from 1.0.0 to 1.1.0');

            bundle.entities.forEach((ent: any) => {
                if (ent.type === 'enemy' && ent.data) {
                    const options = ent.data.options || {};
                    // Add default values for new 1.1.0 fields
                    if (options.chaseExitMultiplier === undefined) options.chaseExitMultiplier = 1.5;
                    if (options.stunDuration === undefined) options.stunDuration = 2.0;
                    ent.data.options = options;
                }
            });

            bundle.header.version = '1.1.0';
            return bundle;
        },

        /**
         * v1.1.0 -> v1.2.0
         * Migrate flat entity data to component-based architecture
         */
        '1.1.0': (bundle: any) => {
            logger.info('Migrating from 1.1.0 to 1.2.0 (Component Architecture)');

            bundle.entities.forEach((ent: any) => {
                // If already has components, skip (or merge?)
                if (!ent.components) {
                    ent.components = {};
                }

                // Migrate based on entity type
                migrateLegacyDataToComponents(ent);
                
                // Cleanup legacy data if fully migrated?
                // For now, we might keep 'data' if the factory still relies on it during transition,
                // but ideally we move everything to components.
            });

            bundle.header.version = '1.2.0';
            return bundle;
        }
    } as Record<string, (bundle: any) => any>,

    /**
     * Execute migration
     * @param bundle Normalized scene bundle
     */
    migrate(bundle: any) {
        if (!bundle.header || !bundle.header.version) {
            if (!bundle.header) bundle.header = {};
            bundle.header.version = '1.0.0';
        }

        let version = bundle.header.version;

        // Loop until current version
        while (version !== this.CURRENT_VERSION) {
            const migrationRunner = this.MIGRATIONS[version];
            if (!migrationRunner) {
                // If target version is higher than current system version, that's okay (forward compatibility check?)
                // But here we want to reach CURRENT_VERSION.
                // If we are "stuck" at a version lower than CURRENT, it's a problem.
                if (compareVersions(version, this.CURRENT_VERSION) < 0) {
                     logger.warn(`No migration path found for version: ${version} to ${this.CURRENT_VERSION}`);
                }
                break;
            }
            bundle = migrationRunner(bundle);
            version = bundle.header.version;
        }

        return bundle;
    }
};

/**
 * Helper to migrate legacy flat data to components
 */
function migrateLegacyDataToComponents(ent: any) {
    const data = ent.data || {};
    const comps = ent.components;

    // Common: Transform
    if (data.x !== undefined || data.y !== undefined) {
        comps['Transform'] = { x: data.x || 0, y: data.y || 0 };
    }

    // Common: Name? (Usually on entity root, but maybe in data)
    // ent.name is usually set from data.name in factories.

    // Specific Types
    switch (ent.type) {
        case 'background_ground':
            // Old: { width, height, color, assetId, tileScale }
            // New: Transform, Sprite (Rect/Repeat), Shape?
            
            // Ensure Transform exists (background usually 0,0)
            if (!comps['Transform']) comps['Transform'] = { x: 0, y: 0 };

            comps['Sprite'] = {
                id: data.assetId || 'rect',
                mode: data.assetId ? 'repeat' : 'rect', // 'repeat' matches SpriteMode.REPEAT value 'repeat' (if enum is string) or check enum
                tint: data.color,
                width: data.width,
                height: data.height,
                tileScale: data.tileScale || 1.0
            };
            
            // Assuming we use Shape for rect now
            comps['Shape'] = {
                type: 'box', // ShapeType.BOX
                width: data.width,
                height: data.height
            };
            break;

        case 'player':
            // Old: { x, y, name, scale, weaponConfig }
            // Already handled Transform
            if (data.scale) {
                // Where does scale go? Sprite?
                if (!comps['Sprite']) comps['Sprite'] = {};
                comps['Sprite'].scale = data.scale;
            }
            if (data.weaponConfig) {
                 comps['Weapon'] = { ...data.weaponConfig };
            }
            break;

        case 'enemy':
            // Old: { x, y, options: { spriteId, aiType, ... } }
            // Transform done
            if (data.options) {
                const opts = data.options;
                comps['Sprite'] = { id: opts.spriteId || 'enemy_default' };
                comps['AIConfig'] = {
                    type: opts.aiType,
                    visionRadius: opts.visionRadius,
                    speed: opts.speed,
                    // ... copy other fields
                };
            }
            break;
            
        case 'decoration':
             // Old: { x, y, name, config: { spriteId, scale, collider, rect: { width, height, color } } }
             if (data.config) {
                 const cfg = data.config;
                 
                 if (cfg.rect) {
                     comps['Sprite'] = {
                         id: 'rect',
                         mode: 'rect',
                         tint: cfg.rect.color,
                         width: cfg.rect.width,
                         height: cfg.rect.height
                     };
                     comps['Shape'] = {
                         type: 'box',
                         width: cfg.rect.width,
                         height: cfg.rect.height
                     };
                 } else {
                     comps['Sprite'] = {
                         id: cfg.spriteId,
                         scale: cfg.scale || 1
                     };
                 }

                 if (cfg.collider) {
                     // Maybe Collider component?
                 }
             }
             break;
    }
}

function compareVersions(v1: string, v2: string) {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (p1[i] > p2[i]) return 1;
        if (p1[i] < p2[i]) return -1;
    }
    return 0;
}
