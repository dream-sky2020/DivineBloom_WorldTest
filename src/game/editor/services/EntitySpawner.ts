import { ref, computed } from 'vue';
import { world2d } from '@world2d'; // ✅ 使用统一接口
import { editorManager } from '../core/EditorCore';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EntitySpawner');

export class EntitySpawner {
    categories: Array<{ id: string, name: string, icon: string }>;
    activeCategory: any;
    allTemplates: any;
    filteredTemplates: any;

    constructor() {
        this.categories = [
            { id: 'all', name: '全部', icon: '📦' },
            { id: 'gameplay', name: '游戏玩法', icon: '🎮' },
            { id: 'environment', name: '环境装饰', icon: '🌲' }
        ];

        this.activeCategory = ref('all');

        // ✅ 延迟获取内部对象（避免循环依赖）
        // 使用 getter 在访问时才获取
        this.allTemplates = computed(() => {
            const registry = world2d.getEntityTemplateRegistry();
            return registry.getAll();
        });
        
        this.filteredTemplates = computed(() => {
            const templates = this.allTemplates.value;
            if (this.activeCategory.value === 'all') {
                return templates;
            }
            return templates.filter((t: any) => t.category === this.activeCategory.value);
        });
    }

    /**
     * 创建实体
     */
    createEntity(template: any) {
        try {
            // ✅ 在方法中获取内部对象（避免循环依赖）
            const world = world2d.getWorld();
            const entityTemplateRegistry = world2d.getEntityTemplateRegistry();

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

export const entitySpawner = new EntitySpawner();
