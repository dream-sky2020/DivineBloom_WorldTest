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
            <span class="stat-label">HP</span>
            <span class="stat-value hp-text">4500 / 4500</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">MP</span>
            <span class="stat-value mp-text">320 / 320</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">STR</span>
            <span class="stat-value">85</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">DEF</span>
            <span class="stat-value">62</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">MAG</span>
            <span class="stat-value">40</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">SPD</span>
            <span class="stat-value">55</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.character-card {
  display: flex;
  gap: 2rem;
  padding: 3rem;
  background-color: rgba(30, 41, 59, 0.5);
  border: 1px solid #475569;
  border-radius: 1rem;
}

.char-avatar-placeholder {
  width: 200px;
  height: 200px;
  background-color: var(--slate-800);
  border: 4px solid var(--blue-500);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.char-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.char-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.char-level {
  font-size: 1.5rem;
  color: var(--blue-300);
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 3rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  width: 200px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.25rem;
}

.stat-label {
  color: var(--slate-400);
  font-weight: 700;
}

.stat-value {
  color: white;
  font-family: monospace;
  font-size: 1.25rem;
}

.hp-text { color: var(--green-500); }
.mp-text { color: var(--blue-400); }
</style>

