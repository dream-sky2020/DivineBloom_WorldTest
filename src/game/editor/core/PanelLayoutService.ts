import { createLogger } from '@/utils/logger';
import { LayoutConfig, PanelGroup } from '../config/WorkspacePresets';

const logger = createLogger('PanelLayoutService');
const STORAGE_KEY = 'editor_layout_v1';

export interface MovePanelParams {
    panelId: string;
    sourceSide?: 'left' | 'right';
    sourceGroupId?: string;
    targetSide: 'left' | 'right';
    targetGroupId?: string;
    position: 'top' | 'bottom' | 'tabs';
}

export class PanelLayoutService {
    static save(layout: LayoutConfig) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        } catch (e) {
            logger.error('Failed to save layout', e);
        }
    }

    static load(): LayoutConfig | null {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            logger.error('Failed to load layout', e);
            return null;
        }
    }

    /**
     * 核心移动逻辑：统一处理面板迁移
     */
    static movePanel(layout: LayoutConfig, { panelId, sourceSide, sourceGroupId, targetSide, targetGroupId, position }: MovePanelParams) {
        logger.info(`Moving panel ${panelId} to ${targetSide}/${targetGroupId}`);

        if (sourceSide && sourceGroupId) {
            const sourceGroup = layout[sourceSide].find(g => g.id === sourceGroupId);
            if (sourceGroup) {
                sourceGroup.panels = sourceGroup.panels.filter(id => id !== panelId);
                if (sourceGroup.activeId === panelId) {
                    sourceGroup.activeId = sourceGroup.panels[0] || null;
                }
                if (sourceGroup.panels.length === 0) {
                    layout[sourceSide] = layout[sourceSide].filter(g => g.id !== sourceGroupId);
                }
            }
        }

        this.removePanelEverywhere(layout, panelId, targetGroupId ? [targetGroupId] : []);

        if (position === 'tabs' && targetGroupId) {
            const targetGroup = layout[targetSide].find(g => g.id === targetGroupId);
            if (targetGroup) {
                if (!targetGroup.panels.includes(panelId)) targetGroup.panels.push(panelId);
                targetGroup.activeId = panelId;
            }
        } else {
            const newGroup: PanelGroup = {
                id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                activeId: panelId,
                panels: [panelId]
            };
            if (targetGroupId) {
                const targetIndex = layout[targetSide].findIndex(g => g.id === targetGroupId);
                const insertIndex = position === 'top' ? targetIndex : targetIndex + 1;
                layout[targetSide].splice(insertIndex, 0, newGroup);
            } else {
                layout[targetSide].push(newGroup);
            }
        }
    }

    static removePanelEverywhere(layout: LayoutConfig, panelId: string, excludeGroupIds: string[] = []) {
        (['left', 'right'] as const).forEach(side => {
            layout[side].forEach((group: PanelGroup) => {
                if (!excludeGroupIds.includes(group.id)) {
                    group.panels = group.panels.filter(id => id !== panelId);
                    if (group.activeId === panelId) group.activeId = group.panels[0] || null;
                }
            });
            layout[side] = layout[side].filter((g: PanelGroup) => g.panels.length > 0);
        });
    }
}
