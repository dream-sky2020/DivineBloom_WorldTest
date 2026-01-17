import { reactive, shallowRef, watch } from 'vue'
import { GameEngine } from './GameEngine'
import { SceneManager } from './managers/SceneManager'
import { WorldScene } from './scenes/WorldScene'
import { useGameStore } from '@/stores/game'
import { dialoguesDb } from '@/data/dialogues'
import { getMapData } from '@/data/maps'
import { createLogger } from '@/utils/logger'

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
            system: 'main-menu', // main-menu, world-map, battle, etc.
            isPaused: false
        })

        // Editor State (Reactive for UI)
        this.editor = reactive({
            selectedEntity: null,
            editMode: false,
            // 侧边栏布局配置
            layout: {
                left: ['scene-explorer'], // 左侧面板列表
                right: ['entity-properties'] // 右侧面板列表
            }
        })
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

        // Setup Watchers
        this._setupWatchers()
    }

    _setupWatchers() {
        const gameStore = useGameStore()
        const dialogueStore = gameStore.dialogue

        // Pause/Resume on Dialogue
        watch(() => dialogueStore.isActive, (active) => {
            if (active) {
                this.pause()
            } else {
                if (this.state.system === 'world-map') {
                    this.resume()
                }
            }
        })
    }

    /**
     * Switch to World Map Mode
     */
    async startWorldMap() {
        logger.info('Switching to World Map')

        const gameStore = useGameStore()
        const worldStore = gameStore.world
        const battleStore = gameStore.battle

        // Handle return from battle
        if (battleStore.lastBattleResult) {
            const { result, enemyUuid } = battleStore.lastBattleResult
            worldStore.applyBattleResult(result, enemyUuid)
            battleStore.lastBattleResult = null
        }

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
        const worldStore = gameStore.world

        // If we have a SceneManager, let it handle the transition
        // This handles ECS clearing, data loading, etc.
        if (!this.sceneManager) {
            this.sceneManager = new SceneManager(this.engine, worldStore)
        }

        // If scene exists, use SceneManager to switch (reusing the instance)
        if (this.currentScene.value) {
            this.sceneManager.requestSwitchMap(mapId, entryId)
            return
        }

        // --- Bootstrap First Scene ---
        const mapData = await getMapData(mapId)
        if (!mapData) throw new Error(`Map not found: ${mapId}`)

        const scene = new WorldScene(
            this.engine,
            this._onEncounter.bind(this),
            worldStore.currentMapState, // initialState
            mapData,
            entryId,
            (targetMapId) => { worldStore.currentMapId = targetMapId },
            this._onInteract.bind(this),
            () => { this.state.system = 'list-menu' }, // onOpenMenu
            { worldStore, sceneManager: this.sceneManager, gameManager: this }
        )

        this.currentScene.value = scene
        this.sceneManager.setScene(scene)

        await scene.load()
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
        if (!this.currentScene.value) return;

        const scene = this.currentScene.value;
        this.editor.editMode = !this.editor.editMode;

        if (this.editor.editMode) {
            scene.enterEditMode();
            logger.info('Editor Mode Enabled');
        } else {
            scene.exitEditMode();
            logger.info('Editor Mode Disabled');
        }
    }

    // --- Callbacks ---

    _onEncounter(enemyGroup, enemyUuid) {
        logger.info('Encounter:', enemyGroup)
        const gameStore = useGameStore()
        const battleStore = gameStore.battle
        const worldStore = gameStore.world

        // Save Map State before battle (optional, for safety)
        if (this.currentScene.value) {
            worldStore.saveState(this.currentScene.value)
        }

        battleStore.initBattle(enemyGroup, enemyUuid)
        this.startBattle()
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

        // Only update WorldScene if we are in Map Mode
        if (this.state.system === 'world-map') {
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
}

export const gameManager = new GameManager()
