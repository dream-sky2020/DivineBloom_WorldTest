import type { IScene } from '../interface/IScene';

export const VampireSurvivorsScene: IScene = {
  id: 'scene_vampire_survivors',
  name: 'Vampire Survivors Demo',
  version: '1.0.0',

  systems: {
    core: [
      'time',
      'input-sense',
      'mouse-position-sense',
      'visual-render',
      'camera'
    ],
    logic: {
      sense: ['ai-sense', 'detect-area', 'detect-input'],
      intent: ['player-intent', 'enemy-ai-intent'],
      decision: ['trigger'],
      control: ['player-control', 'enemy-control', 'weapon'],
      physics: ['movement', 'sync-transform', 'collision'],
      lifecycle: ['lifetime'],
      execution: ['execute']
    },
    render: [
      'ai-patrol-debug-render',
      'ai-vision-render',
      'visual-render',
      'status-render',
      'physics-debug-render',
      'detect-area-render',
      'portal-debug-render'
    ],
    editor: {
      sense: ['input-sense', 'mouse-position-sense'],
      interaction: ['editor-interaction'],
      render: ['editor-grid-render', 'editor-highlight-render']
    }
  },

  bundle: {
    header: {
      version: '1.2.0',
      config: {
        id: 'scene_vampire_survivors',
        name: 'Vampire Survivors Demo',
        entryPoints: {
          default: { x: 1000, y: 1000 }
        }
      }
    },
    entities: [
      {
        type: 'global_manager',
        camera: {
          x: 1000 - 400,
          y: 1000 - 300,
          targetX: 1000 - 400,
          targetY: 1000 - 300,
          lerp: 0.1,
          useBounds: true
        }
      },
      {
        type: 'scene_config',
        id: 'scene_vampire_survivors',
        name: 'Vampire Survivors Demo',
        width: 2000,
        height: 2000,
        groundColor: '#0f172a'
      },
      {
        type: 'background_ground',
        width: 2000,
        height: 2000,
        color: '#0f172a',
        assetId: 'tex_tile_01',
        tileScale: 1.0
      },
      {
        type: 'player',
        x: 1000,
        y: 1000,
        name: 'Hero',
        assetId: 'hero',
        scale: 0.7
      },
      {
        type: 'enemy',
        x: 1300,
        y: 1000,
        name: 'Slime',
        assetId: 'enemy_slime',
        options: {
          aiType: 'chase',
          speed: 60
        }
      }
    ]
  }
};
