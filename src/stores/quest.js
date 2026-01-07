import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useQuestStore = defineStore('quest', () => {
    // 使用 Set 存储布尔标记 (Flags)，如 'met_elder', 'boss_defeated'
    const flags = ref(new Set());

    // 使用 Map 存储复杂变量，如 'friendship_level: 10'
    const variables = ref({});

    // --- Flags 操作 ---
    const addFlag = (flag) => flags.value.add(flag);
    const removeFlag = (flag) => flags.value.delete(flag);
    const hasFlag = (flag) => flags.value.has(flag);

    // --- 变量操作 ---
    const setVar = (key, value) => variables.value[key] = value;
    const getVar = (key, defaultVal = 0) => variables.value[key] ?? defaultVal;

    // --- 调试/序列化用 ---
    const serialize = () => ({
        flags: Array.from(flags.value),
        variables: variables.value
    });

    const loadState = (data) => {
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

