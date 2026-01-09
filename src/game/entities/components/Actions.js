export const Actions = {
  /**
   * 战斗行为组件
   * @param {Array} [group=[]] - 战斗组ID列表
   * @param {string} [uuid] - 实体唯一ID
   */
  Battle(group = [], uuid) {
    return {
      group,
      uuid
    }
  },

  /**
   * 对话行为组件
   * @param {string} scriptId - 对话脚本ID
   */
  Dialogue(scriptId) {
    return {
      scriptId
    }
  },

  /**
   * 传送行为组件
   * @param {string} mapId - 目标地图ID
   * @param {string} entryId - 目标入口ID
   */
  Teleport(mapId, entryId) {
    return {
      mapId,
      entryId
    }
  }
}
