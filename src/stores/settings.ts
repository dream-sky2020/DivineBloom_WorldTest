import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAudioStore } from './audio';
import i18n from '@/i18n'; 

const STORAGE_KEY = 'game_settings_v1';

export const useSettingsStore = defineStore('settings', () => {
    const audioStore = useAudioStore();

    // --- State ---
    const language = ref('zh'); // Default language
    const battleSpeed = ref(1);
    const textSpeed = ref('normal');
    const autoSave = ref(true);

    // --- Actions ---

    // Load settings from localStorage
    const initSettings = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                
                // Restore generic settings
                if (data.language) language.value = data.language;
                if (data.battleSpeed) battleSpeed.value = data.battleSpeed;
                if (data.textSpeed) textSpeed.value = data.textSpeed;
                if (typeof data.autoSave === 'boolean') autoSave.value = data.autoSave;

                // Restore Audio
                if (data.audio) {
                    audioStore.masterVolume = data.audio.master ?? 80;
                    audioStore.bgmVolume = data.audio.bgm ?? 60;
                    audioStore.sfxVolume = data.audio.sfx ?? 100;
                }
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }

        // Apply Side Effects
        applyLanguage();
    };

    // Save settings to localStorage
    const saveSettings = () => {
        const data = {
            language: language.value,
            battleSpeed: battleSpeed.value,
            textSpeed: textSpeed.value,
            autoSave: autoSave.value,
            audio: {
                master: audioStore.masterVolume,
                bgm: audioStore.bgmVolume,
                sfx: audioStore.sfxVolume
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const applyLanguage = () => {
        if (i18n && i18n.global) {
             (i18n.global as any).locale.value = language.value;
        }
    };

    const setLanguage = (lang: string) => {
        language.value = lang;
        applyLanguage();
    };

    // --- Watchers ---
    watch(
        [language, battleSpeed, textSpeed, autoSave],
        () => {
            saveSettings();
        },
        { deep: true }
    );

    watch(
        () => [audioStore.masterVolume, audioStore.bgmVolume, audioStore.sfxVolume],
        () => {
            saveSettings();
        }
    );

    return {
        // State
        language,
        battleSpeed,
        textSpeed,
        autoSave,

        // Actions
        initSettings,
        setLanguage
    };
});
