<template>
  <div class="panel-container">
    <div class="thank-card">
      <h2 class="title" v-t="'thank.title'"></h2>
      
      <div class="credits-list">
        <div class="credit-section">
          <h3 class="section-title" v-t="'thank.devTeam'"></h3>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.devAndDesign'"></span>
            <span class="name">陆梦龙</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.artist'"></span>
            <span class="name">冷光明</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.artist'"></span>
            <span class="name">井响鸩</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.artist'"></span>
            <span class="name">鼻屎拌饭加个蛋</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.artist'"></span>
            <span class="name">是拍黄瓜呀</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.artist'"></span>
            <span class="name">唐幽洛</span>
          </div>
        </div>
      </div>
      
      <div class="footer-message" v-t="'thank.footer'"></div>
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
  overflow-y: auto;
}

.thank-card {
  width: 100%;
  max-width: 800px;
  height: 100%;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  border-bottom: 2px solid var(--blue-500);
  padding-bottom: 1rem;
}

.credits-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  flex: 1;
}

.section-title {
  color: var(--blue-400);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.contributor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.contributor-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.role {
  color: var(--slate-400);
  font-weight: 600;
}

.name {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.footer-message {
  margin-top: 3rem;
  color: var(--slate-500);
  font-style: italic;
  font-size: 1.1rem;
}
</style>

