export enum ExecutionPolicy {
    Always = 'Always', // 无论如何都运行（如：基础计时、编辑器交互）
    RunningOnly = 'RunningOnly', // 仅未暂停时运行（如：物理、AI、技能）
    EditorOnly = 'EditorOnly', // 仅编辑模式运行
    HardStop = 'HardStop', // 硬暂停时必须停止，软暂停可以运行（如：动画）
}
