<template>
  <div class="view-toggle">
    <!-- Card View (Default) -->
    <button 
      class="toggle-btn" 
      :class="{ active: modelValue === 'default' }" 
      @click="$emit('update:modelValue', 'default')"
      :title="$t('battle.views.default')"
    >
      📄
    </button>
    <!-- Grid View (All Compact) -->
    <button 
      class="toggle-btn" 
      :class="{ active: modelValue === 'compact' }" 
      @click="$emit('update:modelValue', 'compact')"
      :title="$t('battle.views.compact')"
    >
      🧩
    </button>
    <!-- Avatar View (Badge Mode) -->
    <button 
      class="toggle-btn" 
      :class="{ active: modelValue === 'avatar' }" 
      @click="$emit('update:modelValue', 'avatar')"
      :title="$t('battle.views.avatar')"
    >
      👤
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.view-toggle {
    display: flex;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
}

.toggle-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #94a3b8;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
}

.toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

.toggle-btn.active {
    background: #3b82f6;
    color: white;
}
</style>

