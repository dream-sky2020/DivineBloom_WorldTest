<template>
  <div class="panel-container">
    <div class="thank-card">
      <h2 class="title">CREDITS</h2>
      
      <div class="credits-list">
        <div class="credit-section">
          <h3 class="section-title">Development Team</h3>
          <div class="contributor-row">
            <span class="role">Lead Developer</span>
            <span class="name">Collaborator A</span>
          </div>
          <div class="contributor-row">
            <span class="role">UI/UX Design</span>
            <span class="name">Collaborator B</span>
          </div>
          <div class="contributor-row">
            <span class="role">Game Logic</span>
            <span class="name">Collaborator C</span>
          </div>
        </div>

        <div class="credit-section">
          <h3 class="section-title">Special Thanks</h3>
          <div class="contributor-row">
            <span class="role">Testing</span>
            <span class="name">Collaborator D</span>
          </div>
          <div class="contributor-row">
            <span class="role">Support</span>
            <span class="name">Collaborator E</span>
          </div>
        </div>
      </div>
      
      <div class="footer-message">
        Thank you for playing!
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

