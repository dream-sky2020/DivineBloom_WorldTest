import { reactive, shallowRef, watch } from 'vue'
import { GameEngine } from './GameEngine'
import { SceneManager } from './SceneManager'
import { WorldScene } from './WorldScene'
import { SceneLifecycle } from './resources/SceneLifecycle'
import { useGameStore } from '@/stores/game'
import { dialoguesDb } from '@schema/dialogues'
import { getMapData } from '@schema/maps'
import { createLogger } from '@/utils/logger'
import { editorManager } from '@/game/editor/core/EditorCore'

const logger = createLogger('GameManager')

class GameManager {
    constructor() {
        this.engine = null
        this.sceneManager = null

        // Current active scene logic (e.g. WorldScene)
        // shallowRef allows Vue components to react to scene changes (e.g. for debugging)
        this.currentScene = shallowRef(null)

        // Reactive Global State
        this.state = reactive({
            system: 'world-map', // Default to world-map for ECS scene project
            isPaused: false
        })

        // Editor is now managed by editorManager
        this.editor = editorManager.state;

        // 🎯 内存泄漏修复：存储 watcher 引用以便清理
        this._watchers = []
        this._isInitialized = false
    }

    /**
     * Initialize the Engine with the Canvas element
     * Must be called once on App mount or when canvas changes
     * @param {HTMLCanvasElement} canvas 
     */
    init(canvas) {
        if (this.engine) {
            // If engine exists, just update the canvas reference
            this.engine.setCanvas(canvas)
            // Ensure loop is running (it might have been stopped or never started if logic changed)
            if (!this.engine.isRunning) {
                this.engine.start()
            }
            return
        }

        logger.info('Initializing Engine')
        this.engine = new GameEngine(canvas)

        // Bind Main Loop
        this.engine.onUpdate = (dt) => this.update(dt)
        this.engine.onDraw = (renderer) => this.draw(renderer)

        // Start the engine loop immediately (it will render blank/clear until scene loads)
        this.engine.start()

        // Setup Watchers (只在首次初始化时设置)
        if (!this._isInitialized) {
            this._setupWatchers()
            this._isInitialized = true
        }
    }

    _setupWatchers() {
        // 🎯 防止内存泄漏：清理旧的 watchers
        this._cleanupWatchers()

        const gameStore = useGameStore()
        const dialogueStore = gameStore.dialogue

        // Pause/Resume on Dialogue
        const unwatchDialogue = watch(() => dialogueStore.isActive, (active) => {
            if (active) {
                this.pause()
            } else {
                if (this.state.system === 'world-map') {
                    this.resume()
                }
            }
        })

        // 🎯 监听系统变化，同步更新编辑器目标
        const unwatchSystem = watch(() => this.state.system, (newSystem) => {
            // 同步声明式面板配置
            editorManager.syncWithSystem(newSystem);

            // 如果是世界地图或战斗，目标是当前场景
            if (newSystem === 'world-map' || newSystem === 'battle') {
                editorManager.setTarget(this.currentScene.value);
            } else {
                // 其他系统目前没有 Editable 接口实现
                editorManager.setTarget(null);
            }
        }, { immediate: true });

        // 🎯 监听场景变化
        const unwatchScene = watch(() => this.currentScene.value, (newScene) => {
            if (this.state.system === 'world-map' || this.state.system === 'battle') {
                editorManager.setTarget(newScene);
            }
        });

        // 保存 unwatch 函数以便后续清理
        this._watchers.push(unwatchDialogue, unwatchSystem, unwatchScene)

        logger.info('Watchers initialized')
    }

    /**
     * 清理所有 Vue watchers
     * @private
     */
    _cleanupWatchers() {
        if (this._watchers.length > 0) {
            logger.info(`Cleaning up ${this._watchers.length} watchers`)
            this._watchers.forEach(unwatch => {
                try {
                    unwatch()
                } catch (e) {
                    logger.error('Error cleaning up watcher:', e)
                }
            })
            this._watchers = []
        }
    }

    /**
     * Switch to World Map Mode
     */
    async startWorldMap() {
        logger.info('Switching to World Map')

        const gameStore = useGameStore()
        const worldStore = gameStore.world2d
        // const battleStore = gameStore.battle // 暂时禁用，等待战斗系统实现

        // Handle return from battle
        // 暂时禁用，等待战斗系统实现
        // if (battleStore.lastBattleResult) {
        //     const { result, enemyUuid } = battleStore.lastBattleResult
        //     worldStore.applyBattleResult(result, enemyUuid)
        //     battleStore.lastBattleResult = null
        // }

        this.state.system = 'world-map'
        this.resume()

        // Init SceneManager if needed
        if (!this.sceneManager) {
            this.sceneManager = new SceneManager(this.engine, worldStore)
        }

        // If no scene exists (first load), load default
        if (!this.currentScene.value) {
            await this.loadMap(worldStore.currentMapId || 'demo_plains')
        }
    }

    /**
     * Load a specific map
     * @param {string} mapId 
     * @param {string} entryId 
     */
    async loadMap(mapId, entryId = 'default') {
        const gameStore = useGameStore()
        const worldStore = gameStore.world2d

        // If we have a SceneManager, let it handle the transition
        // This handles ECS clearing, data loading, etc.
        if (!this.sceneManager) {
            this.sceneManager = new SceneManager(this.engine, worldStore)
        }

        // If scene exists, use SceneManager to switch (reusing the instance)
        if (this.currentScene.value) {
            await this.sceneManager.requestSwitchMap(mapId, entryId)
            return
        }

        // --- Bootstrap First Scene ---
        const mapData = await getMapData(mapId)
        if (!mapData) throw new Error(`Map not found: ${mapId}`)

        // 创建场景实例（只初始化，不创建实体）
        const scene = new WorldScene(
            this.engine,
            this._onEncounter.bind(this),
            null, // initialState 不传递，由 SceneLifecycle 处理
            mapData,
            entryId,
            (targetMapId) => { worldStore.currentMapId = targetMapId },
            this._onInteract.bind(this),
            () => { this.state.system = 'list-menu' }, // onOpenMenu
            () => { this.state.system = 'shop' }, // onOpenShop
            { worldStore, sceneManager: this.sceneManager, gameManager: this }
        )

        this.currentScene.value = scene
        this.sceneManager.setScene(scene)

        // 🎯 使用 SceneLifecycle 统一加载资源和创建实体
        logger.info('Loading scene resources via SceneLifecycle...')
        const result = await SceneLifecycle.prepareScene(
            mapData,
            this.engine,
            entryId,
            worldStore.currentMapState,
            (progress) => {
                if (progress.phase === 'loading') {
                    logger.info(`Loading assets: ${(progress.progress * 100).toFixed(0)}%`)
                }
            }
        )

        // 更新场景的 player 引用
        scene.player = result.player
        logger.info('Scene loaded successfully')
    }

    /**
     * Switch to Battle Mode
     */
    startBattle() {
        logger.info('Switching to Battle Mode')
        this.state.system = 'battle'
        // We do NOT destroy the WorldScene.
        // We pause the World Update, but keep Draw (so map appears as background)
        this.pause()
    }

    /**
     * Toggle Editor Mode
     */
    toggleEditMode() {
        editorManager.toggleEditMode();
    }

    // --- Callbacks ---

    _onEncounter(enemyGroup, enemyUuid) {
        logger.info('Encounter:', enemyGroup)
        const gameStore = useGameStore()
        // const battleStore = gameStore.battle // 暂时禁用，等待战斗系统实现
        const worldStore = gameStore.world2d

        // Save Map State before battle (optional, for safety)
        if (this.currentScene.value) {
            worldStore.saveState(this.currentScene.value)
        }

        // 暂时禁用，等待战斗系统实现
        // battleStore.initBattle(enemyGroup, enemyUuid)
        // this.startBattle()

        logger.warn('战斗系统暂未实现，遭遇敌人:', enemyGroup)
    }

    _onInteract(interaction) {
        const gameStore = useGameStore()
        const dialogueStore = gameStore.dialogue
        if (dialogueStore.isActive) return

        let scriptId = interaction.id
        let scriptFn = dialoguesDb[scriptId]

        // Fallback Logic
        if (!scriptFn && scriptId === 'elder_test' && dialoguesDb['elderDialogue']) {
            scriptFn = dialoguesDb['elderDialogue']
        }

        if (!scriptFn) {
            logger.warn(`No dialogue script found: ${scriptId}`)
            return
        }

        dialogueStore.startDialogue(scriptFn)
    }

    // --- Loop ---

    update(dt) {
        // 全局暂停只影响非场景逻辑（如果有的话）
        // 场景内部现在会根据 this.state.isPaused 自行处理逻辑更新与编辑器更新的隔离

        // Update WorldScene in Map, Battle, Shop or List Menu Mode
        if (this.state.system === 'world-map' || this.state.system === 'battle' ||
            this.state.system === 'shop' || this.state.system === 'list-menu') {
            if (this.currentScene.value) {
                this.currentScene.value.update(dt)
            }
        }
    }

    draw(renderer) {
        // Always draw world scene as background
        if (this.currentScene.value) {
            this.currentScene.value.draw(renderer)
        }
    }

    pause() {
        this.state.isPaused = true
    }

    resume() {
        this.state.isPaused = false
    }

    /**
     * 销毁 GameManager 并清理所有资源
     * 防止内存泄漏
     */
    destroy() {
        logger.info('Destroying GameManager')

        // 1. 清理 Vue watchers
        this._cleanupWatchers()

        // 2. 清理当前场景
        if (this.currentScene.value) {
            if (typeof this.currentScene.value.destroy === 'function') {
                this.currentScene.value.destroy()
            }
            this.currentScene.value = null
        }

        // 3. 清理 SceneManager
        if (this.sceneManager) {
            this.sceneManager.currentScene = null
            this.sceneManager = null
        }

        // 4. 停止并销毁引擎
        if (this.engine) {
            this.engine.destroy()
            this.engine = null
        }

        // 5. 重置状态标志
        this._isInitialized = false

        logger.info('GameManager destroyed successfully')
    }
}

export const gameManager = new GameManager()
