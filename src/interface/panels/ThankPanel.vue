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
            <span class="role" v-t="'thank.roles.monsterDesign'"></span>
            <span class="name">冷光明</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.characterDesign'"></span>
            <span class="name">井响鸩</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.battleBackground'"></span>
            <span class="name">鼻屎拌饭加个蛋</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.iconDesign'"></span>
            <span class="name">是拍黄瓜呀</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.sceneConcept'"></span>
            <span class="name">唐幽洛</span>
          </div>
          <div class="contributor-row">
            <span class="role" v-t="'thank.roles.weaponDesign'"></span>
            <span class="name">一只凛奈奈</span>
          </div>
        </div>
      </div>
      
      <div class="footer-message" v-t="'thank.footer'"></div>
    </div>
  </div>
</template>

<style scoped src="@styles/panels/ThankPanel.css"></style>

