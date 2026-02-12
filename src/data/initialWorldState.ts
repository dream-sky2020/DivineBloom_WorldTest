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
            // 3.1 武器实体 (对应 WeaponEntity.ts)
            {
                type: 'weapon',
                name: 'HeroWeapon',
                ownerTarget: 'player',
                orbitRadius: 40,
                orbitSpeed: 2,
                spriteId: 'particle_3',
                spriteScale: 0.2,
                weaponConfig: {
                    weaponType: 'pistol',
                    bulletSpriteScale: 0.5,
                    damageDetectCcdEnabled: true,
                    damageDetectCcdMinDistance: 0,
                    damageDetectCcdBuffer: 2,
                    bulletShape: { type: 'circle', radius: 48 }
                }
            },
            // 4. NPC 示例
            {
                type: 'npc',
                x: 1200,
                y: 1000,
                name: 'Guide NPC',
                assetId: 'npc_guide',
                config: {
                    dialogueId: 'welcome',
                    range: 80
                }
            },
            // 5. 敌人示例
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
            // 6. 怪潮敌人生成器（监听波次信号后生成 horde_enemy）
            {
                type: 'horde_enemy_spawner',
                x: 1300,
                y: 900,
                name: 'HordeSpawner_A',
                signal: 'wave_spawn_1',
                enemyName: 'Spawned Horde Enemy',
                enemyOptions: {
                    spriteId: 'enemy_slime',
                    strategy: 'chase',
                    baseSpeed: 90,
                    visionRadius: 500,
                    maxHealth: 50
                }
            },
            // 7. 怪潮波次发信器（每 2 秒发送一次信号）
            {
                type: 'horde_wave_emitter',
                x: 1250,
                y: 900,
                name: 'WaveEmitter_A',
                signal: 'wave_spawn_1',
                interval: 2,
                active: true,
                emitOnStart: true
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
            {
                type: 'weapon',
                name: 'HeroWeapon',
                ownerTarget: 'player',
                orbitRadius: 40,
                orbitSpeed: 2,
                spriteId: 'particle_3',
                spriteScale: 0.3,
                weaponConfig: {
                    weaponType: 'pistol',
                    bulletSpriteScale: 0.5,
                    damageDetectCcdEnabled: true,
                    damageDetectCcdMinDistance: 0,
                    damageDetectCcdBuffer: 2,
                    bulletShape: { type: 'circle', radius: 6 }
                }
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
            {
                type: 'weapon',
                name: 'HeroWeapon',
                ownerTarget: 'player',
                orbitRadius: 40,
                orbitSpeed: 2,
                spriteId: 'particle_3',
                spriteScale: 0.3,
                weaponConfig: {
                    weaponType: 'pistol',
                    bulletSpriteScale: 0.5,
                    damageDetectCcdEnabled: true,
                    damageDetectCcdMinDistance: 0,
                    damageDetectCcdBuffer: 2,
                    bulletShape: { type: 'circle', radius: 6 }
                }
            }
        ]
    }
};
