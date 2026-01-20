import { createLogger } from '@/utils/logger'

const logger = createLogger('SceneMigration')

/**
 * 场景数据迁移器
 * 用于处理不同版本的 ECS 场景导出数据，确保向前兼容
 */
export const SceneMigration = {
    // 当前系统支持的最新版本
    CURRENT_VERSION: '1.1.0',

    // 迁移任务列表
    MIGRATIONS: {
        /**
         * v1.0.0 -> v1.1.0
         * 示例：为旧版敌人数据补齐新的 AI 参数
         */
        '1.0.0': (bundle) => {
            logger.info('Migrating from 1.0.0 to 1.1.0');

            bundle.entities.forEach(ent => {
                if (ent.type === 'enemy') {
                    const options = ent.data.options || {};
                    // 补齐 1.1.0 新增的字段默认值
                    if (options.chaseExitMultiplier === undefined) options.chaseExitMultiplier = 1.5;
                    if (options.stunDuration === undefined) options.stunDuration = 2.0;
                    ent.data.options = options;
                }
            });

            bundle.header.version = '1.1.0';
            return bundle;
        }
    },

    /**
     * 执行迁移逻辑
     * @param {object} bundle 归一化后的场景包
     * @returns {object} 迁移后的场景包
     */
    migrate(bundle) {
        if (!bundle.header || !bundle.header.version) {
            // 如果没有版本号，视为最原始版本 1.0.0
            if (!bundle.header) bundle.header = {};
            bundle.header.version = '1.0.0';
        }

        let version = bundle.header.version;

        // 循环执行迁移直到达到当前最新版本
        while (version !== this.CURRENT_VERSION) {
            const migrationRunner = this.MIGRATIONS[version];
            if (!migrationRunner) {
                logger.warn(`No migration path found for version: ${version}`);
                break;
            }
            bundle = migrationRunner(bundle);
            version = bundle.header.version;
        }

        return bundle;
    }
};
