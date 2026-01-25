<template>
  <div class="data-validator">
    <div class="validator-header">
      <h2>🔍 游戏数据验证工具</h2>
      <button @click="runValidation" :disabled="isValidating" class="btn-validate">
        {{ isValidating ? '验证中...' : '开始验证' }}
      </button>
    </div>

    <div v-if="results" class="validation-results">
      <!-- 总览 -->
      <div class="summary" :class="{ error: hasErrors, success: !hasErrors }">
        <h3>📊 验证结果总览</h3>
        <div class="stats">
          <div class="stat">
            <span class="label">总数:</span>
            <span class="value">{{ totalCount }}</span>
          </div>
          <div class="stat success">
            <span class="label">✅ 通过:</span>
            <span class="value">{{ totalValid }}</span>
          </div>
          <div class="stat error">
            <span class="label">❌ 失败:</span>
            <span class="value">{{ totalErrors }}</span>
          </div>
          <div v-if="translationIssues.length > 0" class="stat warning">
            <span class="label">🌐 漏译:</span>
            <span class="value">{{ translationIssues.length }}</span>
          </div>
          <div class="stat">
            <span class="label">成功率:</span>
            <span class="value">{{ successRate }}%</span>
          </div>
        </div>
      </div>

      <!-- 注册表重复 ID 检查 -->
      <div v-if="registryIssues.length > 0" class="section registry-errors">
        <h3 class="error-header">🚫 注册表异常 (重复 ID / 冲突)</h3>
        <div class="errors">
          <div v-for="(issue, idx) in registryIssues" :key="idx" class="error-item">
            <div class="error-header">
              <strong>[{{ issue.collection }}]</strong>: {{ issue.message }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 翻译审计结果 -->
      <div v-if="translationIssues.length > 0" class="section translation-audit">
        <h3 class="warning-header">🌐 翻译审计 (多语言缺失)</h3>
        <div class="errors">
          <div v-for="(issue, idx) in translationIssues" :key="idx" class="error-item" :class="issue.severity">
            <div class="error-header">
              <span class="severity-badge" :class="issue.severity">{{ issue.severity.toUpperCase() }}</span>
              <strong class="entity-id">{{ issue.id }}</strong>
              <span class="path-separator">»</span>
              <span class="error-path">{{ issue.path }}</span>
            </div>
            <div class="error-details">
              <span class="missing-label">缺失语言:</span>
              <span v-for="lang in issue.missing" :key="lang" class="lang-tag">{{ lang }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 角色验证 -->
      <div v-if="results.characters" class="section">
        <h3>👥 角色数据 ({{ results.characters.valid }}/{{ results.characters.total }})</h3>
        <div v-if="results.characters.errors.length > 0" class="errors">
          <div v-for="error in results.characters.errors" :key="error.id" class="error-item">
            <div class="error-header">
              <strong>{{ error.id }}</strong>: {{ error.name }}
            </div>
            <div class="error-details">
              <div v-for="(err, idx) in error.path" :key="idx" class="error-line">
                <span class="error-path">{{ err.path || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">✅ 所有角色数据验证通过！</div>
      </div>

      <!-- 技能验证 -->
      <div v-if="results.skills" class="section">
        <h3>⚔️ 技能数据 ({{ results.skills.valid }}/{{ results.skills.total }})</h3>
        <div v-if="results.skills.errors.length > 0" class="errors">
          <div v-for="error in results.skills.errors" :key="error.id" class="error-item">
            <div class="error-header">
              <strong>{{ error.id }}</strong>: {{ error.name }}
            </div>
            <div class="error-details">
              <div v-for="(err, idx) in error.path" :key="idx" class="error-line">
                <span class="error-path">{{ err.path || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">✅ 所有技能数据验证通过！</div>
      </div>

      <!-- 物品验证 -->
      <div v-if="results.items" class="section">
        <h3>🎒 物品数据 ({{ results.items.valid }}/{{ results.items.total }})</h3>
        <div v-if="results.items.errors.length > 0" class="errors">
          <div v-for="error in results.items.errors" :key="error.id" class="error-item">
            <div class="error-header">
              <strong>{{ error.id }}</strong>: {{ error.name }}
            </div>
            <div class="error-details">
              <div v-for="(err, idx) in error.path" :key="idx" class="error-line">
                <span class="error-path">{{ err.path || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">✅ 所有物品数据验证通过！</div>
      </div>

      <!-- 状态验证 -->
      <div v-if="results.statuses" class="section">
        <h3>✨ 状态数据 ({{ results.statuses.valid }}/{{ results.statuses.total }})</h3>
        <div v-if="results.statuses.errors.length > 0" class="errors">
          <div v-for="error in results.statuses.errors" :key="error.id" class="error-item">
            <div class="error-header">
              <strong>{{ error.id }}</strong>: {{ error.name }}
            </div>
            <div class="error-details">
              <div v-for="(err, idx) in error.path" :key="idx" class="error-line">
                <span class="error-path">{{ err.path || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">✅ 所有状态数据验证通过！</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { validateAllGameData } from '@/schemas/validator.js';

const isValidating = ref(false);
const results = ref(null);

const totalCount = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.total || 0) + 
         (results.value.statuses?.total || 0) +
         (results.value.items?.total || 0) +
         (results.value.characters?.total || 0);
});

const totalValid = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.valid || 0) + 
         (results.value.statuses?.valid || 0) +
         (results.value.items?.valid || 0) +
         (results.value.characters?.valid || 0);
});

const totalErrors = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.errors.length || 0) + 
         (results.value.statuses?.errors.length || 0) +
         (results.value.items?.errors.length || 0) +
         (results.value.characters?.errors.length || 0) +
         (results.value.registry?.issues.length || 0);
});

const successRate = computed(() => {
  if (!results.value || totalCount.value === 0) return 0;
  return ((totalValid.value / totalCount.value) * 100).toFixed(2);
});

const hasErrors = computed(() => totalErrors.value > 0);

const registryIssues = computed(() => {
  if (!results.value?.registry?.issues) return [];
  return results.value.registry.issues.filter(i => i.type !== 'translation_gap');
});

const translationIssues = computed(() => {
  if (!results.value?.registry?.issues) return [];
  return results.value.registry.issues.filter(i => i.type === 'translation_gap');
});

const runValidation = async () => {
  isValidating.value = true;
  results.value = null;

  try {
    results.value = await validateAllGameData();
  } catch (e) {
    console.error('验证失败:', e);
  } finally {
    isValidating.value = false;
  }
};
</script>

<style scoped>
.data-validator {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Courier New', monospace;
  color: #212121;
}

.validator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #333;
}

.validator-header h2 {
  margin: 0;
  color: #212121;
}

.btn-validate {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-validate:hover:not(:disabled) {
  background: #45a049;
  transform: scale(1.05);
}

.btn-validate:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.validation-results {
  margin-top: 20px;
}

.summary {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #ddd;
}

.summary.success {
  background: #e8f5e9;
  border-color: #4CAF50;
}

.summary.error {
  background: #ffebee;
  border-color: #f44336;
}

.summary h3 {
  margin-top: 0;
  color: #212121;
  font-weight: bold;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.stat.success {
  border-color: #4CAF50;
  background: #f1f8f4;
}

.stat.error {
  border-color: #f44336;
  background: #fef5f5;
}

.stat.warning {
  border-color: #ffa000;
  background: #fff9f0;
}

.stat .label {
  font-weight: bold;
  color: #212121;
}

.stat .value {
  font-size: 1.2em;
  color: #212121;
  font-weight: bold;
}

.section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.section h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  color: #212121;
  font-weight: bold;
}

.success-message {
  padding: 15px;
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
  margin-top: 10px;
  font-weight: bold;
  color: #1b5e20;
}

.errors {
  margin-top: 10px;
}

.error-item {
  background: white;
  border-left: 4px solid #f44336;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.error-header {
  font-weight: bold;
  color: #d32f2f;
  margin-bottom: 8px;
}

.warning-header {
  color: #ef6c00 !important;
}

.error-item.warning {
  border-left-color: #ffa000;
}

.severity-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
  margin-right: 8px;
  color: white;
}

.severity-badge.error {
  background: #f44336;
}

.severity-badge.warning {
  background: #ffa000;
}

.entity-id {
  color: #2c3e50;
  font-size: 1.1em;
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
}

.path-separator {
  margin: 0 8px;
  color: #95a5a6;
}

.missing-label {
  font-weight: bold;
  margin-right: 5px;
}

.lang-tag {
  display: inline-block;
  padding: 1px 5px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 4px;
  font-size: 0.85em;
}

.error-details {
  margin-left: 15px;
  font-size: 0.9em;
  color: #212121;
}

.error-line {
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.error-line:last-child {
  border-bottom: none;
}

.error-path {
  color: #1976d2;
  font-weight: bold;
}

.error-message {
  color: #212121;
  margin-left: 5px;
  font-weight: 500;
}
</style>
