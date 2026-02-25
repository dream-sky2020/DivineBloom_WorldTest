import { ref, computed } from 'vue';
import { world2d } from '@world2d'; // ✅ 使用统一接口
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
            return world2d.getEntityTemplates();
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
            // 获取场景中心位置作为默认生成位置
            const camera = world2d.getDebugInfo();
            const centerX = camera?.playerX || 960;
            const centerY = camera?.playerY || 540;

            world2d.enqueueCommand({
                type: 'CREATE_ENTITY',
                payload: {
                    templateId: template.id,
                    position: { x: centerX, y: centerY }
                }
            });
            logger.info(`Entity creation requested: ${template.name}`);
        } catch (error) {
            logger.error('Failed to create entity:', error);
            throw error; // 让 UI 层处理错误显示
        }
    }
}

export const entitySpawner = new EntitySpawner();
