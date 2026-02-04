/**
 * 资源清单与全局配置
 */

export const AssetManifest = {
    // 角色
    'hero': '/assets/characters/player.png',
    'player': '/assets/characters/player.png',
    'enemy_slime': '/assets/characters/slime.png',
    'slime_blue': '/assets/characters/slime.png',
    'npc_guide': '/assets/characters/guide.png',
    'npc_elder': '/assets/characters/elder.png',
    'hero_sheet': '/assets/characters/player.png',

    // 地形
    'tex_tile_01': '/assets/TinyTexture/Tile/Tile_01-128x128.png',

    // 装饰物
    'tree': '/assets/TinyTexture/Trees/Tree_1.png',
    'bush': '/assets/TinyTexture/Trees/Bush_1.png',
    'table': '/assets/table/table_0.png',
    'chair': '/assets/table/table_1.png',
    
    // 传送门
    'portal': '/assets/door/door_0.png',
    
    // 默认
    'rect': '/assets/TinyTexture/Misc/Blank_32.png'
};

export const PlayerConfig = {
    speed: 200,
    fastSpeed: 320,
    maxHealth: 100,
    initialWeapon: 'pistol'
};

export default {
    AssetManifest,
    PlayerConfig
};
