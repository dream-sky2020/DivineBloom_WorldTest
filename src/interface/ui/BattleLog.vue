<template>
  <div class="battle-log-container" ref="logContainer">
    <div class="log-content">
      <div v-for="(log, i) in battleLog" :key="i" class="log-entry">
        <span v-if="typeof log === 'string'">{{ log }}</span>
        <span v-else>
            [{{ formatTime(log.timestamp) }}] {{ t(log.key, resolveParams(log.params)) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  battleLog: {
    type: Array,
    default: () => []
  }
});

const { t, locale } = useI18n();
const logContainer = ref(null);

const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
};

const resolveParams = (params) => {
    if (!params) return {};
    const resolved = {};
    for (const key in params) {
        const val = params[key];
        if (typeof val === 'object' && val !== null && (val.zh || val.en || val[locale.value])) {
            resolved[key] = val[locale.value] || val.en || val.zh || '';
        } else {
            resolved[key] = val;
        }
    }
    return resolved;
};

// Auto-scroll to bottom when new logs are added
watch(() => props.battleLog, async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
}, { deep: true });
</script>

<style scoped src="@styles/ui/BattleLog.css"></style>

