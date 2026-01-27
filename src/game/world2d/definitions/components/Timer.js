import { z } from 'zod';

// --- Schema Definition ---
export const TimerSchema = z.object({
    totalTime: z.number().default(0), // 累计运行时间（秒）
    running: z.boolean().default(true) // 是否正在计时
});

// --- Component Factory ---
export const Timer = {
    /**
     * 创建计时器组件
     * @param {object} data 
     * @returns 
     */
    create(data = {}) {
        return {
            totalTime: data.totalTime || 0,
            running: data.running !== undefined ? data.running : true
        };
    }
};
