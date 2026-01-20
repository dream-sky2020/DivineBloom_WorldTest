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
            <div class="stat-row"><span class="label" v-t="'stats.mag'"></span> <span class="value">420</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.mdef'"></span> <span class="value">650</span></div>
            <div class="stat-row"><span class="label" v-t="'stats.spd'"></span> <span class="value">330</span></div>
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

<style scoped src="@styles/panels/EquipmentPanel.css"></style>
