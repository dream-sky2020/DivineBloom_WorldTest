import { IEntityDefinition } from '../definitions/interface/IEntity';
import {
    PlayerEntity,
    NPCEntity,
    EnemyEntity,
    HordeEnemyEntity,
    BackgroundEntity,
    DecorationEntity,
    ObstacleEntity,
    SceneEntity,
    BulletEntity,
    WeaponEntity,
    GlobalEntity,
    PortalEntity,
    PortalDestinationEntity
} from '@entities';

class EntityRegistry {
    private definitions = new Map<string, IEntityDefinition<any>>();

    constructor() {
        this.registerAll();
    }

    private registerAll() {
        // Register all known entities
        this.register(PlayerEntity);
        this.register(NPCEntity);
        this.register(EnemyEntity);
        this.register(HordeEnemyEntity);
        this.register(BackgroundEntity);
        this.register(DecorationEntity);
        this.register(ObstacleEntity);
        this.register(SceneEntity);
        this.register(BulletEntity);
        this.register(WeaponEntity);
        this.register(GlobalEntity);
        this.register(PortalEntity);
        this.register(PortalDestinationEntity);
    }

    register(def: IEntityDefinition<any>) {
        if (this.definitions.has(def.type)) {
            console.warn(`[EntityRegistry] Entity type '${def.type}' already registered.`);
            return;
        }
        this.definitions.set(def.type, def);
    }

    get(type: string): IEntityDefinition<any> | undefined {
        return this.definitions.get(type);
    }

    getAll(): IEntityDefinition<any>[] {
        return Array.from(this.definitions.values()).sort((a, b) => a.order - b.order);
    }
}

export const entityRegistry = new EntityRegistry();
