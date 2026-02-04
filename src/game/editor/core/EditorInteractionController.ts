import { toRaw } from 'vue';
import { world2d } from '@world2d';
import { editorManager } from './EditorCore';
import { createLogger } from '@/utils/logger';

// const logger = createLogger('EditorInteraction');

export interface MouseInfo {
    worldX: number;
    worldY: number;
    screenX: number;
    screenY: number;
}

export interface MenuItem {
    icon?: string;
    label: string;
    action?: () => void;
    disabled?: boolean;
    class?: string;
}

export interface UiCallbacks {
    openContextMenu: (position: { clientX: number, clientY: number, preventDefault: () => void }, items: MenuItem[]) => void;
    closeContextMenu?: () => void;
}

export class EditorInteractionController {
    uiCallbacks: UiCallbacks;

    constructor(uiCallbacks: UiCallbacks) {
        this.uiCallbacks = uiCallbacks; // 包含 openContextMenu 和 closeContextMenu
    }

    /**
     * 处理空白处右键
     */
    handleEmptyRightClick(mouseInfo: MouseInfo) {
        const worldX = Math.round(mouseInfo.worldX);
        const worldY = Math.round(mouseInfo.worldY);
        const entityTemplateRegistry = world2d.getEntityTemplateRegistry();
        const templates = entityTemplateRegistry.getAll();

        const menuItems: MenuItem[] = [
            { icon: '📍', label: `位置: X=${worldX}, Y=${worldY}`, disabled: true, class: 'menu-header' },
            { icon: '➕', label: '在此位置创建实体', disabled: true, class: 'menu-divider' }
        ];

        // 分类添加模板
        const categories = [
            { id: 'gameplay', icon: '🎮', label: '游戏玩法' },
            { id: 'environment', icon: '🌲', label: '环境装饰' }
        ];

        categories.forEach(cat => {
            const catTemplates = templates.filter(t => t.category === cat.id);
            if (catTemplates.length > 0) {
                menuItems.push({ icon: cat.icon, label: cat.label, disabled: true, class: 'menu-category' });
                catTemplates.forEach(t => {
                    menuItems.push({
                        icon: t.icon || '📦',
                        label: t.name,
                        action: () => this.createEntityAtPosition(t.id, worldX, worldY)
                    });
                });
            }
        });

        this.showMenu(mouseInfo, menuItems);
    }

    /**
     * 处理实体右键
     */
    handleEntityRightClick(entity: any, mouseInfo: MouseInfo) {
        if (!entity) return;

        const canDelete = entity.inspector?.allowDelete !== false;
        const menuItems: MenuItem[] = [
            { icon: '📋', label: entity.name || '未命名实体', disabled: true, class: 'menu-header' },
            { icon: '🏷️', label: `类型: ${entity.type || '未知'}`, disabled: true, class: 'menu-info' },
            { icon: '📍', label: `位置: X=${Math.round(entity.position?.x || 0)}, Y=${Math.round(entity.position?.y || 0)}`, disabled: true, class: 'menu-info' }
        ];

        if (canDelete) {
            menuItems.push({
                icon: '🗑️',
                label: '删除实体',
                class: 'danger',
                action: () => this.deleteEntity(entity)
            });
        }

        this.showMenu(mouseInfo, menuItems);
    }

    /**
     * 创建实体核心逻辑
     */
    createEntityAtPosition(templateId: string, x: number, y: number) {
        const world = world2d.getWorld();
        const globalEntity = world.with('commands').first;
        
        if (globalEntity) {
            globalEntity.commands.queue.push({
                type: 'CREATE_ENTITY',
                payload: { templateId, position: { x, y } }
            });
        } else {
            const entity = world2d.getEntityTemplateRegistry().createEntity(templateId, null, { x, y });
            if (entity) editorManager.selectedEntity = entity;
        }
    }

    /**
     * 删除实体核心逻辑
     */
    deleteEntity(entity: any) {
        const name = entity.name || entity.type || '未命名实体';
        if (confirm(`确定要删除实体 "${name}" 吗？`)) {
            const rawEntity = toRaw(entity);
            const world = world2d.getWorld();
            const globalEntity = world.with('commands').first;

            if (globalEntity) {
                globalEntity.commands.queue.push({ type: 'DELETE_ENTITY', payload: { entity: rawEntity } });
            } else {
                world.remove(rawEntity);
            }
            editorManager.selectedEntity = null;
        }
    }

    showMenu(mouseInfo: MouseInfo, items: MenuItem[]) {
        this.uiCallbacks.openContextMenu({
            clientX: mouseInfo.screenX,
            clientY: mouseInfo.screenY,
            preventDefault: () => {}
        }, items);
    }

    // 在 EditorInteractionController 类中增加此方法
    handlePanelDrop(event: DragEvent, targetSide: 'left' | 'right') {
        const panelId = event.dataTransfer?.getData('panelId');
        const sourceGroupId = event.dataTransfer?.getData('sourceGroupId');
        const sourceSide = event.dataTransfer?.getData('sourceSide') as 'left' | 'right' | undefined;
        
        if (!panelId) return;

        editorManager.movePanel({
            panelId,
            sourceSide,
            sourceGroupId,
            targetSide,
            position: 'bottom'
        });
    }
}
