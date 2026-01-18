<template>
  <div class="shop-overlay">
    <div class="shop-container">
      <div class="shop-header">
        <h1 v-t="'shop.title'"></h1>
        <p v-t="'shop.welcome'"></p>
      </div>
      
      <div class="shop-content">
        <div class="shop-keeper">
          <div class="keeper-avatar">🧙‍♂️</div>
          <div class="speech-bubble" v-t="'shop.keeperSpeech'">
          </div>
        </div>
        
        <div class="shop-items">
           <!-- Placeholder for Shop Items -->
           <div class="shop-item" v-for="i in 6" :key="i">
             <div class="item-icon">⚔️</div>
             <div class="item-details">
               <span class="name">Iron Sword</span>
               <span class="price">500 G</span>
             </div>
             <button class="buy-btn" v-t="'shop.buy'"></button>
           </div>
        </div>
      </div>

      <div class="shop-footer">
         <span class="gold-display"><span v-t="'shop.yourGold'"></span>: 54,300 G</span>
         <button class="exit-btn" v-t="'shop.exit'"></button>
      </div>
    </div>
  </div>
</template>

<style scoped src="@styles/pages/systems/ShopSystem.css"></style>
