import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useQuestStore = defineStore('quest', () => {
    // 使用 Set 存储布尔标记 (Flags)，如 'met_elder', 'boss_defeated'
    const flags = ref(new Set<string>());

    // 使用 Map 存储复杂变量，如 'friendship_level: 10'
    const variables = ref<Record<string, any>>({});

    // --- Flags 操作 ---
    const addFlag = (flag: string) => flags.value.add(flag);
    const removeFlag = (flag: string) => flags.value.delete(flag);
    const hasFlag = (flag: string) => flags.value.has(flag);

    // --- 变量操作 ---
    const setVar = (key: string, value: any) => variables.value[key] = value;
    const getVar = (key: string, defaultVal: any = 0) => variables.value[key] ?? defaultVal;

    // --- 序列化用 ---
    const serialize = () => ({
        flags: Array.from(flags.value),
        variables: variables.value
    });

    const loadState = (data: { flags?: string[], variables?: Record<string, any> }) => {
        if (data.flags) flags.value = new Set(data.flags);
        if (data.variables) variables.value = { ...data.variables };
    };

    const reset = () => {
        flags.value.clear();
        variables.value = {};
    };

    return {
        flags,
        variables,
        addFlag,
        removeFlag,
        hasFlag,
        setVar,
        getVar,
        serialize,
        loadState,
        reset
    };
});
