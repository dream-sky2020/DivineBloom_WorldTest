type SystemGetter = (id: string) => any

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

function resolveSystemList(ids: string[], getSystem: SystemGetter) {
    return ids.map(id => getSystem(id)).filter(Boolean)
}

export function buildWorldSceneSystems(getSystem: SystemGetter) {
    const systems = {
        init: resolveSystemList(ENV_INIT_SYSTEM_IDS, getSystem),
        always: {
            visualRender: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.visualRender),
            time: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.time),
            execute: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.execute),
            inputSense: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.inputSense),
            camera: getSystem(ALWAYS_UPDATE_SYSTEM_IDS.camera)
        },
        logicPhaseOrder: WORLD_SCENE_SYSTEM_IDS.logicPhaseOrder,
        logic: {
            sense: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.sense, getSystem),
            intent: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.intent, getSystem),
            decision: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.decision, getSystem),
            control: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.control, getSystem),
            physics: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.physics, getSystem),
            lifecycle: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.lifecycle, getSystem),
            execution: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.logic.execution, getSystem)
        },
        render: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.render, getSystem),
        editor: {
            sense: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.editor.sense, getSystem),
            interaction: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.editor.interaction, getSystem),
            render: resolveSystemList(WORLD_SCENE_SYSTEM_IDS.editor.render, getSystem)
        }
    }

    return systems
}
