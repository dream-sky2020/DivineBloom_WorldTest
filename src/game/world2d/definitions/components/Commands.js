/**
 * Commands Component
 * 
 * 存储等待执行的任务或指令。
 * 它可以由 UI 触发（如删除、保存、生成），也可以由 ECS 内部系统触发。
 */
export const Commands = {
    /**
     * 创建 Commands 组件
     * @param {Array} initialCommands 初始命令
     */
    create(initialCommands = []) {
        return {
            queue: initialCommands
        };
    }
};
