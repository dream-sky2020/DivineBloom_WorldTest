<template>
  <div class="panel-container">
    
    <!-- 顶部：角色切换 Tabs -->
    <div class="character-tabs">
      <div class="char-tab active">
        <span class="char-name">ALPHEN</span>
        <span class="char-role text-blue">Warrior</span>
      </div>
      <div class="char-tab">
        <span class="char-name">SHIONNE</span>
        <span class="char-role">Gunner</span>
      </div>
      <div class="char-tab">
        <span class="char-name">RINWELL</span>
        <span class="char-role">Mage</span>
      </div>
      <div class="char-tab">
        <span class="char-name">LAW</span>
        <span class="char-role">Brawler</span>
      </div>
    </div>

    <!-- 已装备技能栏 (Equipped Loadout) -->
    <div class="loadout-panel">
      <!-- 主动技能槽 -->
      <div class="loadout-section">
        <h3 class="section-title" v-t="'skillTypes.active'"></h3>
        <div class="skills-row">
          <!-- Slot 1 -->
          <div class="skill-slot equipped-active group hover-effect">
            <span class="skill-icon">🔥</span>
            <div class="slot-badge">1</div>
          </div>
          <!-- Slot 2 -->
          <div class="skill-slot equipped-normal group hover-effect">
            <span class="skill-icon">❄️</span>
            <div class="slot-badge normal">2</div>
          </div>
          <!-- Slot 3 (Empty) -->
          <div class="skill-slot empty group hover-effect">
            <span class="empty-plus">+</span>
            <div class="slot-badge empty-badge">3</div>
          </div>
          <!-- Slot 4 (Empty) -->
          <div class="skill-slot empty group hover-effect">
            <span class="empty-plus">+</span>
            <div class="slot-badge empty-badge">4</div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="divider"></div>

      <!-- 被动技能槽 -->
      <div class="loadout-section">
        <h3 class="section-title" v-t="'skillTypes.passive'"></h3>
        <div class="skills-row">
          <!-- Slot 1 -->
          <div class="skill-slot passive-active rounded-circle group hover-effect">
            <span class="skill-icon">🛡️</span>
          </div>
          <!-- Slot 2 -->
          <div class="skill-slot passive-normal rounded-circle group hover-effect">
            <span class="skill-icon">⚡</span>
          </div>
          <!-- Slot 3 (Empty) -->
          <div class="skill-slot passive-empty rounded-circle group hover-effect">
            <span class="empty-plus">+</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤器 Tabs -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div class="tab active" v-t="'skills.tabs.all'"></div>
        <div class="tab" v-t="'skillTypes.active'"></div>
        <div class="tab" v-t="'skillTypes.passive'"></div>
      </div>
    </div>

    <!-- 技能列表与描述 -->
    <div class="content-area">
      
      <!-- 列表 -->
      <div class="skills-grid custom-scrollbar">
        
        <!-- Active: Fireball (Equipped) -->
        <div class="skill-card active-equipped">
          <div class="card-header">
            <div class="card-icon-box">🔥</div>
            <div class="card-info">
              <div class="card-title text-yellow">Fireball</div>
              <div class="card-sub">Lv. 5</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text text-blue" v-t="'skillTypes.active'"></span>
            <span class="cost-text text-blue-bold">15 MP</span>
          </div>
          <div class="equipped-tag text-yellow" v-t="'skills.equipped'"></div>
        </div>

        <!-- Active: Ice Shard (Equipped) -->
        <div class="skill-card">
          <div class="card-header">
            <div class="card-icon-box">❄️</div>
            <div class="card-info">
              <div class="card-title">Ice Shard</div>
              <div class="card-sub">Lv. 3</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text">Active</span>
            <span class="cost-text">12 MP</span>
          </div>
          <div class="equipped-tag text-slate">EQUIPPED</div>
        </div>

        <!-- Passive: Iron Skin (Equipped) -->
        <div class="skill-card">
          <div class="card-header">
            <div class="card-icon-box">🛡️</div>
            <div class="card-info">
              <div class="card-title">Iron Skin</div>
              <div class="card-sub">Lv. Max</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text text-green">Passive</span>
            <span class="cost-text">--</span>
          </div>
          <div class="equipped-tag text-slate">EQUIPPED</div>
        </div>

        <!-- Active: Thunder Strike -->
        <div class="skill-card">
          <div class="card-header">
            <div class="card-icon-box">⚡</div>
            <div class="card-info">
              <div class="card-title">Thunder</div>
              <div class="card-sub">Lv. 1</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text">Active</span>
            <span class="cost-text">25 MP</span>
          </div>
        </div>

        <!-- Passive: Meditation -->
        <div class="skill-card">
          <div class="card-header">
            <div class="card-icon-box">🧘</div>
            <div class="card-info">
              <div class="card-title">Meditate</div>
              <div class="card-sub">Lv. 2</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text text-green">Passive</span>
            <span class="cost-text">--</span>
          </div>
        </div>

        <!-- Active: Heal -->
        <div class="skill-card">
          <div class="card-header">
            <div class="card-icon-box">💚</div>
            <div class="card-info">
              <div class="card-title">Heal</div>
              <div class="card-sub">Lv. 4</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text">Active</span>
            <span class="cost-text">30 MP</span>
          </div>
        </div>

        <!-- Locked Skill -->
        <div class="skill-card locked">
          <div class="card-header">
            <div class="card-icon-box grayscale">☠️</div>
            <div class="card-info">
              <div class="card-title locked-text">Doom</div>
              <div class="card-sub">{{ $t('skills.locked') }} (Lv. 50)</div>
            </div>
          </div>
          <div class="card-footer">
            <span class="type-text locked-text" v-t="'skillTypes.active'"></span>
            <span class="cost-text locked-text">?? MP</span>
          </div>
          <div class="lock-overlay">🔒</div>
        </div>

        <!-- 填充项 -->
        <div v-for="i in 5" :key="i" class="skill-card placeholder">
          <div class="card-header">
            <div class="card-icon-box placeholder-icon">?</div>
            <div class="card-info">
              <div class="placeholder-line w-60"></div>
            </div>
          </div>
          <div class="card-footer">
            <div class="placeholder-line w-30"></div>
            <div class="placeholder-line w-30"></div>
          </div>
        </div>

      </div>

      <!-- 底部描述区域 -->
      <div class="description-panel">
        <div class="desc-icon-box">🔥</div>
        <div class="desc-content">
          <div>
            <div class="desc-header">
              <h3 class="desc-title">Fireball <span class="desc-level">Lv. 5</span></h3>
              <span class="desc-cost">Cost: 15 MP</span>
            </div>
            <div class="desc-meta">Target: Single Enemy | Type: Magic / Fire</div>
            <p class="desc-body">
              Hurls a ball of searing flame at the target. Deals <span class="highlight-yellow">120% Magic Damage</span> and has a 20% chance to inflict <span class="highlight-red">Burn</span> for 3 turns.
            </p>
          </div>
        </div>
        <div class="desc-actions">
          <button class="action-btn btn-red" v-t="'skills.unequip'"></button>
          <button class="action-btn btn-slate" v-t="'skills.upgrade'"></button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

/* Character Tabs (Reused style) */
.character-tabs {
  height: 4rem;
  display: flex;
  gap: 0.25rem;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 0.25rem;
  align-items: center;
}

.char-tab {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: var(--slate-400);
  transition: background-color 0.2s;
}

.char-tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.char-tab.active {
  background-color: var(--slate-700);
  color: white;
  font-weight: 700;
}

.char-name {
  font-size: 0.875rem;
  line-height: 1;
  letter-spacing: 0.05em;
}

.char-role {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--slate-600);
}

.char-tab.active .char-role.text-blue {
  color: var(--blue-300);
}

/* Loadout Panel */
.loadout-panel {
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 2rem;
  align-items: center;
}

.loadout-section {
  flex: 1;
}

.section-title {
  color: var(--slate-400);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
}

.skills-row {
  display: flex;
  gap: 1rem;
}

.skill-slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-slot.hover-effect:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

/* Active Skill Slot Styles */
.skill-slot:not(.rounded-circle) {
  width: 5rem;
  height: 5rem;
  border-radius: 0.25rem;
  border-width: 2px;
  font-size: 2.25rem;
}

.equipped-active {
  background-color: var(--slate-800);
  border-color: rgba(234, 179, 8, 0.5); /* yellow-500/50 */
}

.equipped-active:hover {
  border-color: var(--yellow-400);
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.3);
}

.equipped-normal {
  background-color: var(--slate-800);
  border-color: var(--slate-600);
}

.skill-slot.empty {
  background-color: rgba(30, 41, 59, 0.5);
  border-color: var(--slate-700);
  border-style: dashed;
}

.empty-plus {
  color: var(--slate-600);
  font-size: 1.5rem;
}

/* Badge Styles */
.slot-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: var(--slate-900);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.equipped-active .slot-badge {
  border: 1px solid rgba(234, 179, 8, 0.5);
  color: #eab308;
}

.equipped-normal .slot-badge {
  border: 1px solid var(--slate-600);
  color: var(--slate-400);
}

.equipped-normal:hover .slot-badge {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.empty-badge {
  border: 1px solid var(--slate-700);
  color: var(--slate-600);
}

.skill-slot.empty:hover .empty-badge {
  border-color: var(--slate-500);
  color: var(--slate-400);
}

/* Divider */
.divider {
  width: 1px;
  height: 5rem;
  background-color: var(--slate-700);
}

/* Passive Skill Slot Styles */
.rounded-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border-width: 2px;
  font-size: 1.5rem;
}

.passive-active {
  background-color: var(--slate-800);
  border-color: rgba(59, 130, 246, 0.5); /* blue-500/50 */
}

.passive-active:hover {
  border-color: var(--blue-400);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.passive-normal {
  background-color: var(--slate-800);
  border-color: var(--slate-600);
}

.passive-empty {
  background-color: rgba(30, 41, 59, 0.5);
  border-color: var(--slate-700);
  border-style: dashed;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  height: 3rem;
  gap: 1rem;
}

.filter-tabs {
  flex: 1;
  display: flex;
  gap: 0.25rem;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 0.25rem;
  align-items: center;
}

.tab {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: var(--slate-400);
  transition: background-color 0.2s;
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.tab.active {
  background-color: var(--slate-700);
  color: white;
  font-weight: 700;
}

/* Content Area */
.content-area {
  flex: 1;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.skills-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* Skill Card */
.skill-card {
  position: relative;
  background-color: rgba(30, 41, 59, 0.5); /* slate-800/50 */
  border: 1px solid var(--slate-600);
  padding: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-card:hover {
  background-color: var(--slate-700);
  border-color: rgba(255, 255, 255, 0.5);
}

.skill-card.active-equipped {
  background-color: rgba(30, 58, 138, 0.4); /* blue-900/40 */
  border: 2px solid rgba(234, 179, 8, 0.5);
}

.skill-card.active-equipped:hover {
  background-color: rgba(30, 58, 138, 0.5);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.card-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-title {
  font-weight: 700;
  color: var(--slate-300);
  font-size: 1.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-card:hover .card-title {
  color: white;
}

.card-sub {
  font-size: 0.75rem;
  color: var(--slate-500);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.5rem;
}

.skill-card:hover .card-footer {
  border-color: rgba(255, 255, 255, 0.2);
}

.type-text { font-size: 0.75rem; color: var(--slate-500); }
.cost-text { font-family: monospace; font-size: 0.875rem; color: var(--blue-400); font-weight: 700; }

.text-yellow { color: #fef08a; /* yellow-100 */ }
.text-blue { color: var(--blue-300); }
.text-blue-bold { color: var(--blue-400); }
.text-green { color: var(--green-500); }
.text-slate { color: var(--slate-500); }

.equipped-tag {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  border: 1px solid currentColor;
  padding: 0 0.25rem;
  border-radius: 0.125rem;
}

/* Locked Card */
.skill-card.locked {
  background-color: rgba(30, 41, 59, 0.3);
  border-color: var(--slate-700);
  opacity: 0.7;
}

.locked-text { color: var(--slate-600) !important; }
.grayscale { filter: grayscale(1); }

.lock-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  opacity: 0.2;
}

/* Placeholder */
.skill-card.placeholder {
  background-color: rgba(30, 41, 59, 0.2);
  border-color: var(--slate-700);
  cursor: default;
}
.skill-card.placeholder:hover {
  background-color: rgba(30, 41, 59, 0.2);
  border-color: var(--slate-700);
}

.placeholder-icon {
  background-color: rgba(30, 41, 59, 0.5);
  opacity: 0.2;
  color: var(--slate-400);
}

.placeholder-line {
  height: 0.75rem;
  background-color: var(--slate-800);
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
}
.w-60 { width: 60%; }
.w-30 { width: 30%; }

/* Description Panel */
.description-panel {
  height: 8rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-top: 2px solid var(--slate-700);
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
}

.desc-icon-box {
  width: 5rem;
  height: 5rem;
  background-color: var(--slate-800);
  border: 1px solid #475569;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.desc-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.desc-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.desc-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.desc-level {
  font-size: 0.75rem;
  color: var(--slate-400);
  font-weight: 400;
  margin-left: 0.5rem;
}

.desc-cost {
  font-size: 0.875rem;
  color: var(--blue-300);
  font-family: monospace;
}

.desc-meta {
  font-size: 0.75rem;
  color: var(--slate-400);
  margin-bottom: 0.5rem;
}

.desc-body {
  color: var(--slate-300);
  line-height: 1.5;
  font-size: 0.875rem;
  margin: 0;
}

.highlight-yellow { color: var(--yellow-400); }
.highlight-red { color: #f87171; /* red-400 */ }

.desc-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  padding-left: 1.5rem;
  border-left: 1px solid var(--slate-700);
}

.action-btn {
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-red {
  background-color: rgba(127, 29, 29, 0.5);
  color: #fecaca;
  border: 1px solid #ef4444;
}
.btn-red:hover { background-color: rgba(185, 28, 28, 0.7); }

.btn-slate {
  background-color: var(--slate-700);
  color: var(--slate-200);
  border: 1px solid var(--slate-500);
}
.btn-slate:hover { background-color: var(--slate-600); }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}
</style>

