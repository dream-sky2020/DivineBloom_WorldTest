export interface SceneEntryPoint {
    x: number;
    y: number;
}

export interface SceneConfig {
    id: string;
    name: string;
    entryPoints: Record<string, SceneEntryPoint>;
}

export interface SceneHeader {
    version: string;
    config: SceneConfig;
}

export interface EntityData {
    type: string;
    id?: string;
    name?: string;
    width?: number;
    height?: number;
    groundColor?: string;
    color?: string;
    assetId?: string;
    tileScale?: number;
    [key: string]: any;
}

export interface SceneState {
    header: SceneHeader;
    entities: EntityData[];
}

export interface InitialWorldStateData {
    [sceneId: string]: SceneState;
}

export const InitialWorldState: InitialWorldStateData = {
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
            // 0. 全局管理器 (对应 GlobalEntity.ts)
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
            },
            // 3. 玩家实体 (对应 PlayerEntity.ts)
            {
                type: 'player',
                x: 1000,
                y: 1000,
                name: 'Hero',
                assetId: 'hero',
                scale: 0.7
            },
            // 3.05 宠物实体（跟随玩家 + 可使用传送门捷径）
            {
                type: 'pet',
                x: 960,
                y: 1010,
                name: 'HeroPet',
                petId: 'pet_hero_01',
                ownerTarget: 'player',
                spriteId: 'fleshsprite_scene_1',
                spriteScale: 0.22,
                spriteTint: '#ffffff',
                followSpeed: 300,
                followStopDistance: 10,
                followRangeX: 14,
                followRangeY: 14,
                followOffsetX: -42,
                followOffsetY: 0,
                followDistanceSpeedFactor: 0.35
            },
            // 4. 敌人示例
            {
                type: 'enemy',
                x: 1500,
                y: 1500,
                name: 'Slime',
                assetId: 'enemy_slime',
                options: {
                    aiType: 'patrol',
                    patrolRadius: 100,
                    speed: 50,
                    sensorRadius: 40
                }
            },
            // 5. 怪潮敌人生成器（按 Spawn 配置持续生成 horde_enemy）
            {
                type: 'horde_enemy_spawner',
                x: 1300,
                y: 900,
                name: 'HordeSpawner_A',
                spawnLimit: 3,
                spawnGroup: 'monster',
                enemyName: 'Spawned Horde Enemy',
                enemyOptions: {
                    spriteId: 'enemy_slime',
                    strategy: 'chase',
                    baseSpeed: 90,
                    visionRadius: 500,
                    maxHealth: 50
                }
            },
            {
                type: 'flee_enemy_spawner',
                x: 1450,
                y: 900,
                name: 'FleeSpawner_A',
                spawnLimit: 10,
                spawnGroup: 'fleeEnemy',
                enemyName: 'Spawned Flee Enemy',
                enemyOptions: {
                    spriteId: 'enemy_slime',
                    baseSpeed: 115,
                    visionRadius: 600,
                    maxHealth: 45
                }
            },
            // 6. 传送终点（用于测试宠物是否能及时通过捷径跟随玩家）
            {
                type: 'portal_destination',
                id: 'pet_test_dest_a',
                x: 330,
                y: 340,
                name: 'PetTestDestA',
                visual: { color: '#7c3aed', size: 20 }
            },
            {
                type: 'portal_destination',
                id: 'pet_test_dest_b',
                x: 1710,
                y: 1710,
                name: 'PetTestDestB',
                visual: { color: '#0ea5e9', size: 20 }
            },
            // 7. 双向同图强制传送门（玩家穿门后观察宠物追随表现）
            {
                type: 'portal',
                x: 980,
                y: 950,
                name: 'PetTestPortal_To_A',
                width: 84,
                height: 84,
                isForced: true,
                destinationId: 'pet_test_dest_a'
            },
            {
                type: 'portal',
                x: 170,
                y: 180,
                name: 'PetTestPortal_Back_B',
                width: 84,
                height: 84,
                isForced: true,
                destinationId: 'pet_test_dest_b'
            },
            // 8. 另一组远距离坐标传送门（提高压测覆盖）
            {
                type: 'portal',
                x: 1540,
                y: 960,
                name: 'PetTestPortal_To_Coord',
                width: 72,
                height: 72,
                isForced: true,
                targetX: 420,
                targetY: 1580
            },
            {
                type: 'portal',
                x: 600,
                y: 1580,
                name: 'PetTestPortal_Back_Center',
                width: 72,
                height: 72,
                isForced: true,
                targetX: 1000,
                targetY: 1000
            }
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
            },
            {
                type: 'player',
                x: 1000,
                y: 1000,
                name: 'Hero',
                assetId: 'hero',
                scale: 0.7
            },
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
            },
            {
                type: 'player',
                x: 1000,
                y: 1000,
                name: 'Hero',
                assetId: 'hero',
                scale: 0.7
            },
        ]
    }
};
