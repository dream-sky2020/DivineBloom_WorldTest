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
          <div class="stat">
            <span class="label">成功率:</span>
            <span class="value">{{ successRate }}%</span>
          </div>
        </div>
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
              <div v-for="(err, idx) in error.error.errors" :key="idx" class="error-line">
                <span class="error-path">{{ err.path.join('.') || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">
          ✅ 所有技能数据验证通过！
        </div>
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
              <div v-for="(err, idx) in error.error.errors" :key="idx" class="error-line">
                <span class="error-path">{{ err.path.join('.') || 'root' }}</span>:
                <span class="error-message">{{ err.message }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="success-message">
          ✅ 所有状态数据验证通过！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { validateSkillsDb, validateStatusDb } from '@/data/schemas/validator.js';
import { skillsDb } from '@/data/skills.js';
import { statusDb } from '@/data/status.js';

const isValidating = ref(false);
const results = ref(null);

const totalCount = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.total || 0) + (results.value.statuses?.total || 0);
});

const totalValid = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.valid || 0) + (results.value.statuses?.valid || 0);
});

const totalErrors = computed(() => {
  if (!results.value) return 0;
  return (results.value.skills?.errors.length || 0) + (results.value.statuses?.errors.length || 0);
});

const successRate = computed(() => {
  if (!results.value || totalCount.value === 0) return 0;
  return ((totalValid.value / totalCount.value) * 100).toFixed(2);
});

const hasErrors = computed(() => totalErrors.value > 0);

const runValidation = () => {
  isValidating.value = true;
  results.value = null;

  setTimeout(() => {
    try {
      const skillResults = validateSkillsDb(skillsDb, false);
      const statusResults = validateStatusDb(statusDb, false);

      results.value = {
        skills: skillResults,
        statuses: statusResults,
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('验证失败:', e);
    } finally {
      isValidating.value = false;
    }
  }, 100);
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
