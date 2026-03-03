import type { ISystem } from './definitions/interface/ISystem'
import type { RenderPassList } from './render/core'

type SystemGetter = (id: string) => unknown

type LogicPhase = 'sense' | 'intent' | 'decision' | 'control'

const ENV_INIT_SYSTEM_IDS = [
    'detect-area-render',
    'portal-debug-render',
    'ai-sense'
]

const ALWAYS_UPDATE_SYSTEM_IDS = {
    visualRender: 'visual-render',
    time: 'time',
    execute: 'execute',
    inputSense: 'input-sense',
    camera: 'camera'
}

const WORLD_SCENE_SYSTEM_IDS = {
    logic: {
        sense: [
            'component-count-sense',
            'spawner-sense',
            'damage-detect-sense',
            'motion-sense',
            'motion-portal-sense',
            'portal-detect-sense',
            'weapon-sense',
            'ai-sense',
            'mouse-position-sense'
        ],
        intent: [
            'player-intent',
            'weapon-intent',
            'motion-intent',
            'portal-intent',
            'enemy-ai-intent',
            'spawner-intent'
        ],
        decision: [],
        control: [
            'player-control',
            'portal-control',
            'enemy-control',
            'motion-control',
            'spawner-control',
            'weapon-control',
            'damage-process',
            'damage-apply'
        ],
        physics: [
            'movement',
            'bound',
            'sync-transform',
            'collision',
            'sync-transform'
        ],
        lifecycle: [
            'health-cleanup',
            'lifetime'
        ],
        execution: [
            'execute'
        ]
    },
    logicPhaseOrder: ['sense', 'intent', 'decision', 'control'] as LogicPhase[],
    render: [
        'ai-patrol-debug-render',
        'ai-vision-render',
        'visual-render',
        'status-render',
        'floating-text-render',
        'physics-debug-render',
        'detect-area-render',
        'portal-debug-render',
        'spawn-debug-render',
        'weapon-debug-render'
    ],
    editor: {
        sense: [
            'input-sense',
            'mouse-position-sense'
        ],
        interaction: [
            'editor-interaction'
        ],
        render: [
            'editor-grid-render',
            'editor-highlight-render'
        ]
    }
}

function resolveSystemList<T>(ids: string[], getSystem: SystemGetter): T[] {
    return ids.map(id => getSystem(id) as T).filter(Boolean)
}

export type WorldSceneSystems = {
    init: ISystem[]
    always: {
        visualRender: ISystem | null
        time: ISystem | null
        execute: ISystem | null
        inputSense: ISystem | null
        camera: ISystem | null
    }
    logicPhaseOrder: LogicPhase[]
    logic: {
        sense: ISystem[]
        intent: ISystem[]
        decision: ISystem[]
        control: ISystem[]
        physics: ISystem[]
        lifecycle: ISystem[]
        execution: ISystem[]
    }
    render: RenderPassList
    editor: {
        sense: ISystem[]
        interaction: ISystem[]
        render: RenderPassList
    }
}

export function buildWorldSceneSystems(getSystem: SystemGetter): WorldSceneSystems {
    const systems: WorldSceneSystems = {
        init: resolveSystemList<ISystem>(ENV_INIT_SYSTEM_IDS, getSystem),
        always: {
            visualRender: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.visualRender) as ISystem | null,
            time: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.time) as ISystem | null,
            execute: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.execute) as ISystem | null,
            inputSense: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.inputSense) as ISystem | null,
            camera: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.camera) as ISystem | null
        },
        logicPhaseOrder: WORLD_SCENE_SYSTEM_IDS.logicPhaseOrder,
        logic: {
            sense: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.sense, getSystem),
            intent: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.intent, getSystem),
            decision: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.decision, getSystem),
            control: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.control, getSystem),
            physics: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.physics, getSystem),
            lifecycle: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.lifecycle, getSystem),
            execution: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.logic.execution, getSystem)
        },
        render: resolveSystemList<RenderPassList[number]>(WORLD_SCENE_SYSTEM_IDS.render, getSystem),
        editor: {
            sense: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.editor.sense, getSystem),
            interaction: resolveSystemList<ISystem>(WORLD_SCENE_SYSTEM_IDS.editor.interaction, getSystem),
            render: resolveSystemList<RenderPassList[number]>(WORLD_SCENE_SYSTEM_IDS.editor.render, getSystem)
        }
    }

    return systems
}
