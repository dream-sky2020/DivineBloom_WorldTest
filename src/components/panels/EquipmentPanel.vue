<template>
  <div class="panel-container">
    
    <!-- 顶部：角色切换 Tabs -->
    <div class="character-tabs">
      <!-- 选中项 -->
      <div class="char-tab active">
        <span class="char-name">ALPHEN</span>
        <span class="char-role text-blue">Warrior</span>
      </div>

      <!-- 未选中项 -->
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

    <!-- 核心区域：两栏布局 -->
    <div class="equipment-content">
      
      <!-- 左列：装备槽位 & 属性 (40%) -->
      <div class="left-column">
        
        <!-- 属性面板 -->
        <div class="stats-panel">
          <div class="panel-header border-bottom">
            <span class="header-title" v-t="'panels.status'"></span>
            <span class="header-sub">Lv. 45 Warrior</span>
          </div>
          <div class="stats-grid">
            <div class="stat-row"><span class="label" v-t="'stats.atk'"></span> <span class="value">1,250 <span class="diff-positive">(+45)</span></span></div>
            <div class="stat-row"><span class="label" v-t="'stats.def'"></span> <span class="value">890</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.matk'"></span> <span class="value">420</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.mdef'"></span> <span class="value">650</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.agi'"></span> <span class="value">330</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.luck'"></span> <span class="value">120</span></div>
          </div>
        </div>

        <!-- 装备槽位列表 -->
        <div class="slots-list custom-scrollbar">
          
          <!-- 武器槽 (选中) -->
          <div class="slot-item active">
            <div class="slot-icon-box">⚔️</div>
            <div class="slot-info">
              <div class="slot-type text-blue">Main Weapon</div>
              <div class="slot-item-name">Blazing Sword</div>
            </div>
            <div class="arrow-indicator">◀</div>
          </div>

          <!-- 防具槽 -->
          <div class="slot-item">
            <div class="slot-icon-box">🛡️</div>
            <div class="slot-info">
              <div class="slot-type">Armor</div>
              <div class="slot-item-name">Iron Plate</div>
            </div>
          </div>

          <!-- 饰品槽 -->
          <div class="slot-item">
            <div class="slot-icon-box">💍</div>
            <div class="slot-info">
              <div class="slot-type">Accessory</div>
              <div class="slot-item-name">Warrior Emblem</div>
            </div>
          </div>

           <!-- 外观槽 -->
           <div class="slot-item">
            <div class="slot-icon-box">👕</div>
            <div class="slot-info">
              <div class="slot-type">Costume</div>
              <div class="slot-item-name">Summer Outfit</div>
            </div>
          </div>

        </div>

      </div>

      <!-- 右列：物品选择列表 (60%) -->
      <div class="right-column">
        
        <!-- 列表头部 -->
        <div class="list-header">
          <h3 class="list-title">
            <span>⚔️</span> <span v-t="'equipment.selectWeapon'"></span>
          </h3>
          <div class="item-count-label">3 <span v-t="'equipment.itemsAvailable'"></span></div>
        </div>

        <!-- 物品列表 -->
        <div class="items-list custom-scrollbar">
          
          <!-- 列表项 1 (当前装备) -->
          <div class="list-item equipped">
            <div class="item-icon-box">⚔️</div>
            <div class="item-details">
              <div class="item-top-row">
                <span class="item-name text-blue">Blazing Sword</span>
                <span class="equipped-badge" v-t="'equipment.equipped'"></span>
              </div>
              <div class="item-sub-info">ATK +120 | Fire Element</div>
            </div>
          </div>

          <!-- 列表项 2 -->
          <div class="list-item">
            <div class="item-icon-box">🗡️</div>
            <div class="item-details">
              <div class="item-top-row">
                <span class="item-name">Iron Sword</span>
                <span class="stat-diff diff-negative">-40 ATK</span>
              </div>
              <div class="item-sub-info">Standard issue weapon. Reliable but weak.</div>
            </div>
          </div>

          <!-- 列表项 3 -->
          <div class="list-item">
            <div class="item-icon-box">✨</div>
            <div class="item-details">
              <div class="item-top-row">
                <span class="item-name">Platinum Blade</span>
                <span class="stat-diff diff-positive">+55 ATK</span>
              </div>
              <div class="item-sub-info">A masterpiece of craftsmanship.</div>
            </div>
          </div>

          <!-- 填充项 -->
          <div v-for="i in 8" :key="i" class="list-item placeholder">
             <div class="item-icon-box grayscale">⚔️</div>
             <div class="item-details">
               <div class="placeholder-line w-30"></div>
               <div class="placeholder-line w-60"></div>
             </div>
          </div>

        </div>

        <!-- 底部详情 (选中新装备的预览) -->
        <div class="detail-footer">
          <div class="comparison-box">
            <div class="footer-label" v-t="'equipment.comparison'"></div>
            <div class="comparison-row">
              <div class="comp-item">
                <span class="label" v-t="'stats.atk'"></span>: 
                <span class="val-old">120</span> 
                <span class="arrow">→</span> 
                <span class="val-new diff-positive">175</span>
              </div>
              <div class="comp-item">
                <span class="label" v-t="'equipment.weight'"></span>: 
                <span class="val-old">5.0</span> 
                <span class="arrow">→</span> 
                <span class="val-new diff-negative">8.5</span>
              </div>
            </div>
            <div class="footer-desc">
              "Shines with a brilliant light that never fades."
            </div>
          </div>
          <button class="equip-btn">
            EQUIP
          </button>
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

/* Character Tabs */
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

/* Equipment Content Layout */
.equipment-content {
  flex: 1;
  display: flex;
  gap: 1.5rem;
  overflow: hidden;
}

.left-column {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Stats Panel */
.stats-panel {
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.header-title {
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.header-sub {
  font-size: 0.75rem;
  color: var(--slate-500);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 2rem;
  font-size: 0.875rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
}

.stat-row .label {
  color: var(--slate-400);
}

.stat-row .value {
  color: white;
  font-family: monospace;
}

/* Slots List */
.slots-list {
  flex: 1;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.slot-item {
  position: relative;
  background-color: rgba(30, 41, 59, 0.4); /* slate-800/40 */
  border: 1px solid var(--slate-700);
  border-radius: 0.25rem;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.slot-item:hover {
  background-color: var(--slate-700);
  border-color: var(--slate-500);
}

.slot-item.active {
  background-color: rgba(30, 58, 138, 0.3); /* blue-900/30 */
  border: 2px solid var(--blue-400);
}

.slot-icon-box {
  width: 3rem;
  height: 3rem;
  background-color: var(--slate-800);
  border: 1px solid var(--slate-600);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.slot-info {
  flex: 1;
}

.slot-type {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--slate-500);
}

.slot-item.active .slot-type.text-blue {
  color: var(--blue-300);
}

.slot-item-name {
  color: var(--slate-300);
  font-weight: 500;
  font-size: 1.125rem;
}

.slot-item.active .slot-item-name {
  color: white;
  font-weight: 700;
}

.arrow-indicator {
  color: var(--blue-400);
}

/* Right Column: Items List */
.list-header {
  padding: 1rem;
  border-bottom: 1px solid var(--slate-700);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.list-title {
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.item-count-label {
  font-size: 0.75rem;
  color: var(--slate-400);
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background-color: rgba(30, 41, 59, 0.4);
  border: 1px solid var(--slate-700);
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  background-color: var(--slate-700);
  border-color: rgba(255, 255, 255, 0.3);
}

.list-item.equipped {
  background-color: rgba(30, 58, 138, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  cursor: default;
}

.item-icon-box {
  width: 3rem;
  height: 3rem;
  background-color: var(--slate-800);
  border: 1px solid var(--slate-600);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.list-item:hover .item-icon-box {
  transform: scale(1.1);
  transition: transform 0.2s;
}

.item-details {
  flex: 1;
}

.item-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  color: var(--slate-200);
  font-weight: 700;
}

.list-item:hover .item-name {
  color: white;
}

.text-blue { color: var(--blue-100); }

.equipped-badge {
  font-size: 0.75rem;
  background-color: var(--blue-500); /* blue-600 is a bit dark */
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  color: white;
}

.item-sub-info {
  font-size: 0.75rem;
  color: var(--slate-500);
  margin-top: 0.25rem;
}

.list-item:hover .item-sub-info {
  color: var(--slate-400);
}

.stat-diff {
  font-family: monospace;
  font-size: 0.875rem;
}

/* Placeholders */
.list-item.placeholder {
  background-color: rgba(30, 41, 59, 0.2);
  border-color: rgba(51, 65, 85, 0.5);
  opacity: 0.5;
  cursor: default;
}

.list-item.placeholder:hover {
  background-color: rgba(30, 41, 59, 0.2);
  border-color: rgba(51, 65, 85, 0.5);
}

.grayscale { filter: grayscale(1); }

.placeholder-line {
  background-color: var(--slate-700);
  opacity: 0.5;
  height: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}
.placeholder-line:last-child { margin-bottom: 0; height: 0.5rem; opacity: 0.3; }
.w-30 { width: 30%; }
.w-60 { width: 60%; }

/* Detail Footer */
.detail-footer {
  height: 7rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-top: 1px solid var(--slate-700);
  padding: 1rem;
  display: flex;
  gap: 1.5rem;
}

.comparison-box {
  flex: 1;
}

.footer-label {
  font-size: 0.75rem;
  color: var(--slate-500);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.comparison-row {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
}

.comp-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comp-item .label { color: var(--slate-400); }
.comp-item .val-old { color: white; font-family: monospace; }
.comp-item .arrow { color: var(--slate-600); }

.footer-desc {
  margin-top: 0.75rem;
  color: var(--slate-300);
  font-size: 0.875rem;
  font-style: italic;
}

.equip-btn {
  padding: 0 2rem;
  background-color: var(--blue-500);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.1s;
}

.equip-btn:hover {
  background-color: var(--blue-400);
}

.equip-btn:active {
  transform: scale(0.95);
}

/* Utils */
.border-bottom { border-bottom: 1px solid var(--slate-700); padding-bottom: 0.5rem; }
.diff-positive { color: var(--green-500); }
.diff-negative { color: #f87171; /* red-400 */ }

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
