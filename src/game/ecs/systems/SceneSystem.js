import { world } from '@/game/ecs/world'
import { SceneManager } from '@/game/managers/SceneManager'

export const SceneSystem = {
    /** @type {SceneManager} */
    manager: null,

    /**
     * @param {import('@/game/GameEngine').GameEngine} engine 
     * @param {Object} context 
     */
    update(engine, context) {
        // Init Manager Once
        if (!this.manager) {
            // 我们需要 worldStore，但 context 可能没有直接传，
            // 这里假设 context.worldStore 存在，或者通过其他方式获取。
            // 暂时通过 context 传入
            if (context.worldStore) {
                this.manager = new SceneManager(engine, context.worldStore)
            } else {
                console.error("[SceneSystem] Missing worldStore in context!")
                return
            }
        }

        // Sync Scene Instance if changed
        if (context.currentScene && this.manager.currentScene !== context.currentScene) {
            this.manager.setScene(context.currentScene)
        }

        // 1. Process ECS Components -> Manager Requests
        const transitionEntity = world.with('sceneTransition').first
        if (transitionEntity) {
            const request = transitionEntity.sceneTransition
            this.manager.requestSwitchMap(request.mapId, request.entryId)
            world.removeComponent(transitionEntity, 'sceneTransition')
        }

        const battleEntity = world.with('battleTransition').first
        if (battleEntity) {
            const request = battleEntity.battleTransition
            this.manager.requestBattle(request.enemyGroup, request.battleId)
            world.removeComponent(battleEntity, 'battleTransition')
        }

        // 2. Manager Update (Execute pending transitions)
        this.manager.update()
    }
}
