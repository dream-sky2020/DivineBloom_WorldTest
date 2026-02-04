import { IComponentDefinition } from '../definitions/interface/IComponent';

/**
 * Component Registry
 * 
 * Manages all available component definitions.
 * Used for data-driven entity creation and serialization.
 */
class ComponentRegistry {
    private definitions = new Map<string, IComponentDefinition<any>>();

    /**
     * Register a component definition
     * @param def Component definition
     */
    register(def: IComponentDefinition<any>) {
        if (this.definitions.has(def.name)) {
            console.warn(`[ComponentRegistry] Component ${def.name} already registered!`);
            return;
        }
        this.definitions.set(def.name, def);
    }

    /**
     * Get a component definition by name
     * @param name Component name
     */
    get(name: string): IComponentDefinition<any> | undefined {
        return this.definitions.get(name);
    }

    /**
     * Get all registered component names
     */
    getAllNames(): string[] {
        return Array.from(this.definitions.keys());
    }

    /**
     * Clear all registrations (useful for testing)
     */
    clear() {
        this.definitions.clear();
    }
}

export const componentRegistry = new ComponentRegistry();
