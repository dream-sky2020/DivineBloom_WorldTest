import { SpawnFactory } from '../definitions/interface/IEntity';

class SpawnRegistry {
    private factories = new Map<string, SpawnFactory>();

    register(id: string, factory: SpawnFactory): void {
        this.factories.set(id, factory);
    }

    get(id: string): SpawnFactory | undefined {
        return this.factories.get(id);
    }

    has(id: string): boolean {
        return this.factories.has(id);
    }
}

export const spawnRegistry = new SpawnRegistry();
