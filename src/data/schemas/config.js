/**
 * Schema 验证配置
 */

// 验证模式配置
export const ValidationConfig = {
    /**
     * 验证模式
     * - 'lenient': 宽松模式 - 只显示警告，不停止运行（推荐用于开发）
     * - 'strict': 严格模式 - 验证失败时抛出错误，停止运行
     */
    mode: 'lenient', // 'lenient' | 'strict'

    /**
     * 是否在控制台显示详细错误信息
     */
    showDetailedErrors: true,

    /**
     * 是否显示验证成功的日志
     */
    showSuccessLogs: false,

    /**
     * 是否在启动时显示验证提示
     */
    showStartupHint: true,
};

/**
 * 获取当前验证模式
 */
export const isStrictMode = () => ValidationConfig.mode === 'strict';

/**
 * 获取当前验证模式
 */
export const isLenientMode = () => ValidationConfig.mode === 'lenient';

/**
 * 切换验证模式
 */
export const setValidationMode = (mode) => {
    if (mode !== 'lenient' && mode !== 'strict') {
        console.warn(`Invalid validation mode: ${mode}. Using 'lenient'.`);
        ValidationConfig.mode = 'lenient';
    } else {
        ValidationConfig.mode = mode;
        console.log(`🔧 Validation mode set to: ${mode}`);
    }
};

// 在开发环境启动时显示提示
if (ValidationConfig.showStartupHint && typeof window !== 'undefined') {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🎮 Game Data Schema Validation System                   ║
║                                                           ║
║  Mode: ${ValidationConfig.mode.toUpperCase().padEnd(48)} ║
║                                                           ║
║  📝 Data errors will show as warnings (⚠️) in console   ║
║  🔍 Press Ctrl+Shift+D to open Dev Tools for details    ║
║  💡 Use validator to see complete validation report      ║
╚═══════════════════════════════════════════════════════════╝
    `.trim());
}
