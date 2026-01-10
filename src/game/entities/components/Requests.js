// 请求切换地图
export function SceneTransition({ mapId, entryId, transitionType = 'fade' }) {
    return { mapId, entryId, transitionType }
}

// 请求进入战斗
export function BattleTransition({ enemyGroup, battleId }) {
    return { enemyGroup, battleId }
}

