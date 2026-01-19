import { z } from 'zod';
import { ID } from '@/data/schemas/common'; // Fix import path to point to common.js

// --- Actions Schema Definitions ---

export const ActionBattleSchema = z.object({
  // Allow string OR number for ID
  group: z.array(z.object({ id: ID })).default([]),
  uuid: z.string().optional()
});

export const ActionDialogueSchema = z.object({
  scriptId: z.string().default('error_missing_id')
});

export const ActionTeleportSchema = z.object({
  // 跨地图传送：需要 mapId 和 entryId
  mapId: z.string().optional(),
  entryId: z.string().optional(),
  // 同地图传送：可以使用 destinationId（目的地实体ID）或直接坐标 (targetX, targetY)
  destinationId: z.string().optional(),
  targetX: z.number().optional(),
  targetY: z.number().optional()
}).refine(
  data => {
    // 必须是跨地图传送或同地图传送之一
    // 注意：需要排除 null 值，因为 null !== undefined 但 null 不是有效值
    const isCrossMap = data.mapId != null && data.entryId != null
    const isLocalTeleport = data.destinationId != null || (data.targetX != null && data.targetY != null)
    return isCrossMap || isLocalTeleport
  },
  {
    message: "Teleport must have either (mapId + entryId) for cross-map or (destinationId / targetX + targetY) for local teleport"
  }
);

// --- Actions Factory ---

export const Actions = {
  /**
   * 战斗行为组件
   * @param {Array} [group] - 战斗组ID列表
   * @param {string} [uuid] - 实体唯一ID
   */
  Battle(group, uuid) {
    if (!ActionBattleSchema) return { group: [], uuid: undefined };

    const result = ActionBattleSchema.safeParse({ group, uuid });
    if (result.success) {
      return result.data;
    } else {
      console.error('[Actions] Battle validation failed', result.error);
      return { group: [], uuid: undefined };
    }
  },

  /**
   * 对话行为组件
   * @param {string} scriptId - 对话脚本ID
   */
  Dialogue(scriptId) {
    if (!ActionDialogueSchema) return { scriptId: 'error' };

    const result = ActionDialogueSchema.safeParse({ scriptId });
    if (result.success) {
      return result.data;
    } else {
      console.error('[Actions] Dialogue validation failed', result.error);
      return { scriptId: 'error' };
    }
  },

  /**
   * 传送行为组件
   * @param {string} [mapId] - 目标地图ID（跨地图传送）
   * @param {string} [entryId] - 目标入口ID（跨地图传送）
   * @param {string} [destinationId] - 目标目的地实体ID（同地图传送）
   * @param {number} [targetX] - 目标X坐标（同地图传送，直接坐标）
   * @param {number} [targetY] - 目标Y坐标（同地图传送，直接坐标）
   */
  Teleport(mapId, entryId, destinationId, targetX, targetY) {
    if (!ActionTeleportSchema) return { mapId: undefined, entryId: undefined, destinationId: undefined, targetX: undefined, targetY: undefined };

    const result = ActionTeleportSchema.safeParse({ mapId, entryId, destinationId, targetX, targetY });
    if (result.success) {
      return result.data;
    } else {
      console.error('[Actions] Teleport validation failed', result.error);
      console.error('[Actions] Invalid params:', { mapId, entryId, destinationId, targetX, targetY });
      // 返回一个无效配置，TeleportExecuteSystem 会记录错误但不会执行传送
      return { mapId: undefined, entryId: undefined, destinationId: undefined, targetX: undefined, targetY: undefined };
    }
  }
}
