<template>
  <div class="panel-container">
    <div class="character-card">
      <div class="char-avatar-placeholder">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" class="avatar-img">
      </div>
      <div class="char-details">
        <h2 class="char-name">Player 01</h2>
        <div class="char-level">Lv. 45</div>
        
        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.hp'"></span>
            <span class="stat-value hp-text">4500 / 4500</span>
          </div>
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.mp'"></span>
            <span class="stat-value mp-text">320 / 320</span>
          </div>
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.atk'"></span>
            <span class="stat-value">85</span>
          </div>
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.def'"></span>
            <span class="stat-value">62</span>
          </div>
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.matk'"></span>
            <span class="stat-value">40</span>
          </div>
          <div class="stat-row">
            <span class="stat-label" v-t="'stats.agi'"></span>
            <span class="stat-value">55</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@styles/panels/CharacterPanel.css"></style>

