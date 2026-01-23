import { ref, computed } from 'vue';
import { entityTemplateRegistry } from '@/game/ecs/entities/internal/EntityTemplateRegistry';
import { world } from '@/game/ecs/world';
import { editorManager } from '@/game/interface/editor/EditorManager';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EntityCreatorController');

export class EntityCreatorController {
    constructor() {
        this.categories = [
            { id: 'all', name: '全部', icon: '📦' },
            { id: 'gameplay', name: '游戏玩法', icon: '🎮' },
            { id: 'environment', name: '环境装饰', icon: '🌲' }
        ];

        this.activeCategory = ref('all');

        // 定义响应式计算属性
        this.allTemplates = computed(() => entityTemplateRegistry.getAll());
        this.filteredTemplates = computed(() => {
            const templates = this.allTemplates.value;
            if (this.activeCategory.value === 'all') {
                return templates;
            }
            return templates.filter(t => t.category === this.activeCategory.value);
        });
    }

    /**
     * 创建实体
     */
    createEntity(template) {
        try {
            // 获取场景中心位置作为默认生成位置
            const camera = world.with('camera').first?.camera;
            const centerX = camera?.x || 960;
            const centerY = camera?.y || 540;

            // 通过命令系统创建实体
            const globalEntity = world.with('commands').first;
            if (globalEntity) {
                globalEntity.commands.queue.push({
                    type: 'CREATE_ENTITY',
                    payload: {
                        templateId: template.id,
                        position: { x: centerX, y: centerY }
                    }
                });
                logger.info(`Entity creation requested: ${template.name}`);
            } else {
                // 降级方案：直接创建
                const entity = entityTemplateRegistry.createEntity(template.id, null, { x: centerX, y: centerY });
                if (entity) {
                    logger.info(`Entity created directly: ${template.name}`, entity);
                    // 自动选中新创建的实体
                    editorManager.selectedEntity = entity;
                }
            }
        } catch (error) {
            logger.error('Failed to create entity:', error);
            throw error; // 让 UI 层处理错误显示
        }
    }
}

export const entityCreatorController = new EntityCreatorController();
