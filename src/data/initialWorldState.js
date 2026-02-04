export const InitialWorldState = {
    scene_light_green: {
        header: {
            version: '1.2.0',
            config: {
                id: 'scene_light_green',
                name: 'Light Green Zone',
                entryPoints: { default: { x: 1000, y: 1000 } }
            }
        },
        entities: [
            // 1. 场景配置实体 (对应 SceneEntity.ts)
            {
                type: 'scene_config',
                id: 'scene_light_green',
                name: 'Light Green Zone',
                width: 2000,
                height: 2000,
                groundColor: '#dcfce7'
            },
            // 2. 背景实体 (对应 BackgroundEntity.ts)
            // 注意：不再使用 components 嵌套，而是直接使用 Schema 定义的字段
            {
                type: 'background_ground',
                width: 2000,
                height: 2000,
                color: '#dcfce7',
                assetId: 'tex_tile_01', // 这会触发 BackgroundEntity 内部创建 Sprite
                tileScale: 1.0
            }
            // 3. 全局管理器 (可选，通常由系统自动创建，但如果需要预设相机位置可以在这里加)
            // {
            //     type: 'global_manager',
            //     camera: { x: 0, y: 0, useBounds: true }
            // }
        ]
    },
    scene_dark_green: {
        header: {
            version: '1.2.0',
            config: {
                id: 'scene_dark_green',
                name: 'Dark Green Zone',
                entryPoints: { default: { x: 1000, y: 1000 } }
            }
        },
        entities: [
            {
                type: 'scene_config',
                id: 'scene_dark_green',
                name: 'Dark Green Zone',
                width: 2000,
                height: 2000,
                groundColor: '#166534'
            },
            {
                type: 'background_ground',
                width: 2000,
                height: 2000,
                color: '#166534',
                assetId: 'tex_dirt_01',
                tileScale: 1.0
            }
        ]
    },
    scene_yellow: {
        header: {
            version: '1.2.0',
            config: {
                id: 'scene_yellow',
                name: 'Yellow Zone',
                entryPoints: { default: { x: 1000, y: 1000 } }
            }
        },
        entities: [
            {
                type: 'scene_config',
                id: 'scene_yellow',
                name: 'Yellow Zone',
                width: 2000,
                height: 2000,
                groundColor: '#fef9c3'
            },
            {
                type: 'background_ground',
                width: 2000,
                height: 2000,
                color: '#fef9c3',
                assetId: 'tex_brick_01',
                tileScale: 1.0
            }
        ]
    }
};
