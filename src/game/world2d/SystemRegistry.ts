/**
 * System Registry
 * 
 * 这是一个中心化的系统注册表，用于管理所有 ECS 系统。
 * 通过注册表获取系统，可以实现系统文件的自由移动和按需加载。
 */

// --- 导入所有系统 ---

// Camera
import { CameraSystem } from '@systems/camera/CameraSystem';

// Apply
import { DamageApplySystem } from '@systems/apply/DamageApplySystem';

// Control
import { EnemyControlSystem } from '@systems/control/EnemyControlSystem';
import { MotionControlSystem } from '@systems/control/MotionControlSystem';
import { PlayerControlSystem } from '@systems/control/PlayerControlSystem';
import { PortalControlSystem } from '@systems/control/PortalControlSystem';
import { WeaponControlSystem } from '@systems/control/WeaponControlSystem';

// Process
import { DamageProcessSystem } from '@systems/process/DamageProcessSystem';

// Editor
import { EditorHighlightRenderSystem } from '@systems/editor/EditorHighlightRenderSystem';
import { EditorInteractionSystem } from '@systems/editor/EditorInteractionSystem';

// Event
import { TriggerSystem } from '@systems/event/TriggerSystem';

// Execute
import { ExecuteSystem } from '@systems/execute/ExecuteSystem';

// Intent
import { EnemyAIIntentSystem } from '@systems/intent/EnemyAIIntentSystem';
import { MotionIntentSystem } from '@systems/intent/MotionIntentSystem';
import { PortalIntentSystem } from '@systems/intent/PortalIntentSystem';
import { PlayerIntentSystem } from '@systems/intent/PlayerIntentSystem';
import { WeaponIntentSystem } from '@systems/intent/WeaponIntentSystem';

// Lifecycle
import { HealthCleanupSystem } from '@systems/lifecycle/HealthCleanupSystem';
import { LifeTimeSystem } from '@systems/lifecycle/LifeTimeSystem';

// Physics
import { BoundSystem } from '@systems/physics/BoundSystem';
import { CollisionSystem } from '@systems/physics/CollisionSystem';
import { MovementSystem } from '@systems/physics/MovementSystem';
import { SyncTransformSystem } from '@systems/physics/SyncTransformSystem';

// Render
import { AIPatrolDebugRenderSystem } from '@systems/render/AIPatrolDebugRenderSystem';
import { AIVisionRenderSystem } from '@systems/render/AIVisionRenderSystem';
// import { BackgroundRenderSystem } from '@systems/render/BackgroundRenderSystem'; // Merged into VisualRenderSystem
import { DetectAreaRenderSystem } from '@systems/render/DetectAreaRenderSystem';
import { EditorGridRenderSystem } from '@systems/render/EditorGridRenderSystem';
import { FloatingTextRenderSystem } from '@systems/render/FloatingTextRenderSystem';
import { PhysicsDebugRenderSystem } from '@systems/render/PhysicsDebugRenderSystem';
import { PortalDebugRenderSystem } from '@systems/render/PortalDebugRenderSystem';
import { StatusRenderSystem } from '@systems/render/StatusRenderSystem';
import { WeaponDebugRenderSystem } from '@systems/render/WeaponDebugRenderSystem';
import { VisualRenderSystem } from '@systems/render/VisualRenderSystem';

// Sense
import { DamageDetectSenseSystem } from '@systems/sense/DamageDetectSenseSystem';
import { MotionSenseSystem } from '@systems/sense/MotionSenseSystem';
import { PortalDetectSenseSystem } from '@systems/sense/PortalDetectSenseSystem';
import { AISenseSystem } from '@systems/sense/AISenseSystem';
import { InputSenseSystem } from '@systems/sense/InputSenseSystem';
import { MousePositionSenseSystem } from '@systems/sense/MousePositionSenseSystem';
import { WeaponSenseSystem } from '@systems/sense/WeaponSenseSystem';

// Time
import { TimeSystem } from '@systems/time/TimeSystem';
import { WaveEmitterSystem } from '@systems/time/WaveEmitterSystem';

/**
 * 系统类型枚举，用于分类管理
 */
export const SystemType = {
    CORE: 'core',           // 核心系统 (渲染、时间、输入)
    EXPLORATION: 'exploration', // 探索模式特有
    BATTLE: 'battle',       // 战斗模式特有
    EDITOR: 'editor',       // 编辑器特有
    DEBUG: 'debug'          // 调试专用
};

/**
 * 系统注册表配置
 * 映射系统 ID 到具体的系统实现
 */
export const Registry: Record<string, any> = {
    // --- Core Systems ---
    'time': TimeSystem,
    'wave-emitter': WaveEmitterSystem,
    'input-sense': InputSenseSystem,
    'mouse-position-sense': MousePositionSenseSystem,
    'visual-render': VisualRenderSystem,
    // 'background-render': BackgroundRenderSystem, // Merged
    'camera': CameraSystem,

    // --- Physics & Movement ---
    'sync-transform': SyncTransformSystem,
    'movement': MovementSystem,
    'bound': BoundSystem,
    'collision': CollisionSystem,

    // --- Lifecycle Management ---
    'health-cleanup': HealthCleanupSystem,
    'lifetime': LifeTimeSystem,

    // --- Intent & Control ---
    'player-intent': PlayerIntentSystem,
    'weapon-intent': WeaponIntentSystem,
    'motion-intent': MotionIntentSystem,
    'portal-intent': PortalIntentSystem,
    'enemy-ai-intent': EnemyAIIntentSystem,
    'player-control': PlayerControlSystem,
    'portal-control': PortalControlSystem,
    'damage-process': DamageProcessSystem,
    'damage-apply': DamageApplySystem,
    'enemy-control': EnemyControlSystem,
    'motion-control': MotionControlSystem,
    'weapon': WeaponControlSystem,
    'weapon-control': WeaponControlSystem,

    // --- Detection & AI Sense ---
    'damage-detect-sense': DamageDetectSenseSystem,
    'motion-sense': MotionSenseSystem,
    'portal-detect-sense': PortalDetectSenseSystem,
    'weapon-sense': WeaponSenseSystem,
    'ai-sense': AISenseSystem,

    // --- Execution & Events ---
    'execute': ExecuteSystem,
    'trigger': TriggerSystem,

    // --- Editor Systems ---
    'editor-highlight-render': EditorHighlightRenderSystem,
    'editor-interaction': EditorInteractionSystem,
    'editor-grid-render': EditorGridRenderSystem,

    // --- Debug Render Systems ---
    'ai-patrol-debug-render': AIPatrolDebugRenderSystem,
    'ai-vision-render': AIVisionRenderSystem,
    'detect-area-render': DetectAreaRenderSystem,
    'physics-debug-render': PhysicsDebugRenderSystem,
    'portal-debug-render': PortalDebugRenderSystem,
    'status-render': StatusRenderSystem,
    'floating-text-render': FloatingTextRenderSystem,
    'weapon-debug-render': WeaponDebugRenderSystem,
};

/**
 * 创建系统实例或获取系统对象
 * @param {string} id 系统 ID
 * @param {...any} args 传递给构造函数的参数 (如果是类的话)
 * @returns {object} 系统对象
 */
export function getSystem(id: string, ...args: any[]): any {
    const system = Registry[id];
    if (!system) {
        console.warn(`System with ID "${id}" not found in Registry.`);
        return null;
    }

    // 如果系统是一个类，则实例化它
    if (typeof system === 'function' && system.prototype && system.prototype.constructor) {
        return new system(...args);
    }

    // 否则直接返回该对象
    return system;
}

/**
 * 获取一组系统
 * @param {string[]} ids 系统 ID 数组
 * @returns {object[]} 系统对象数组
 */
export function getSystems(ids: string[]): any[] {
    return ids.map(id => getSystem(id)).filter(s => s !== null);
}
