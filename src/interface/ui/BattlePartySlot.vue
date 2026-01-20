<template>
  <div 
    class="party-slot"
    :class="{ 
        'active-turn': isActiveTurn
    }"
  >
    <!-- Front Row Character (Main Card) - Default View -->
    <template v-if="viewMode === 'default' || viewMode === 'avatar'">
      <div class="card front-card" v-if="slot.front" 
           :class="{ 
               'dead': slot.front.isDead,
               'dying': slot.front.isDying,
               'selectable': slot.front.isSelectable
           }"
           @click.stop="onCharacterClick(slot.front)"
      >
        <div class="card-header">
          <span class="char-name" :class="{ 'name-dead': slot.front.isDead || slot.front.isDying }">{{ getLocalizedName(slot.front.name) }}</span>
          <GameIcon class="element-icon" name="icon_fire" />
        </div>
        <div class="card-avatar-container">
           <!-- Placeholder Avatar -->
           <div class="avatar-placeholder" :style="{ backgroundColor: slot.front.roleColor }">
             {{ slot.front.name.en.charAt(0) }}
           </div>
        </div>
        <div class="card-stats">
          <div class="stat-row hp">
            <label>HP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ transform: `scaleX(${slot.front.hpPercent / 100})` }"></div>
              <span class="bar-text">{{ slot.front.hp }}/{{ slot.front.maxHp }}</span>
            </div>
          </div>
          <div class="stat-row mp">
            <label>MP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ transform: `scaleX(${slot.front.mpPercent / 100})` }"></div>
               <span class="bar-text">{{ slot.front.mp }}/{{ slot.front.maxMp }}</span>
            </div>
          </div>
          <!-- ATB Bar -->
           <div class="stat-row atb">
            <label>ATB</label>
            <div class="bar-container">
              <div class="bar-fill atb-fill" :class="{ 'no-transition': slot.front.atbNoTransition }" :style="{ transform: `scaleX(${(slot.front.atbPercent || 0) / 100})` }"></div>
            </div>
          </div>
          
          <!-- Energy Points (BP) -->
          <div class="stat-row bp">
            <label>BP</label>
            <div class="bp-pills">
                <div 
                  v-for="(filled, i) in slot.front.energyPills" 
                  :key="i" 
                  class="bp-pill" 
                  :class="{ 'filled': filled }"
                ></div>
            </div>
          </div>

          <div class="status-row">
            <div 
              v-for="st in slot.front.statusEffects" 
              :key="st.id" 
              class="status-icon"
              :class="st.class" 
              :title="st.tooltip"
            >
                <GameIcon :name="st.icon" />
                <span class="status-duration">{{ st.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Avatar Badge (Only in Avatar Mode) -->
        <div 
          v-if="viewMode === 'avatar' && slot.back"
          class="avatar-badge"
          :class="{ 
            'selectable': slot.back.isSelectable,
            'dead': slot.back.isDead,
            'dying': slot.back.isDying
          }"
          @click.stop="onCharacterClick(slot.back)"
          :title="getLocalizedName(slot.back.name)"
        >
          <div class="badge-avatar" :style="{ backgroundColor: slot.back.roleColor }">
            {{ slot.back.name.en.charAt(0) }}
          </div>
          <!-- Tiny HP Bar Ring or Underline -->
          <div class="badge-bars">
            <div class="badge-bar hp" :style="{ transform: `scaleX(${slot.back.hpPercent / 100})` }"></div>
            <div class="badge-bar mp" :style="{ transform: `scaleX(${slot.back.mpPercent / 100})` }"></div>
          </div>
        </div>

      </div>
      <div class="empty-card-slot" v-else>Empty</div>
    </template>

    <!-- Front Row Character - Compact View (BackCard Style) -->
    <template v-else>
      <div class="card back-card front-compact" v-if="slot.front"
           :class="{ 
               'dead': slot.front.isDead,
               'dying': slot.front.isDying,
               'selectable': slot.front.isSelectable
           }"
           @click.stop="onCharacterClick(slot.front)"
      >
         <div class="back-card-header">
             <span class="char-name" :class="{ 'name-dead': slot.front.isDead || slot.front.isDying }">{{ getLocalizedName(slot.front.name) }}</span>
         </div>
         <div class="back-card-main-content">
             <div class="back-card-avatar">
                <div class="mini-avatar large" :style="{ backgroundColor: slot.front.roleColor }">
                   {{ slot.front.name.en ? slot.front.name.en.charAt(0) : '' }}
                </div>
             </div>
             <div class="back-card-info">
                <div class="back-card-stats">
                  <div class="mini-bar hp" :style="{ transform: `scaleX(${slot.front.hpPercent / 100})` }"></div>
                  <div class="mini-bar mp" :style="{ transform: `scaleX(${slot.front.mpPercent / 100})` }"></div>
                  <div class="mini-bar-container atb-container" :class="slot.front.atbContainerClass">
                      <div 
                         class="mini-bar atb" 
                         :class="[
                             slot.front.atbColorClass, 
                             { 
                                 'glow-effect': (slot.front.atb || 0) >= 100,
                                 'no-transition': slot.front.atbNoTransition
                             }
                         ]"
                         :style="{ transform: `scaleX(${slot.front.atbPercent / 100})` }"
                       ></div>
                  </div>
                  <!-- Mini BP -->
                  <div class="mini-bp-row">
                     <div v-for="(filled, i) in slot.front.energyPills" :key="i" class="mini-bp-dot" :class="{ 'filled': filled }"></div>
                  </div>
                </div>
             </div>
         </div>
         <div class="back-card-status-row">
            <div 
              v-for="st in slot.front.statusEffects" 
              :key="st.id" 
              class="status-icon mini"
              :class="st.class" 
              :title="st.tooltip"
            >
                <GameIcon :name="st.icon" />
                <span class="status-duration">{{ st.duration }}</span>
            </div>
         </div>
      </div>
      <div class="empty-back-slot" v-else>
        <span class="placeholder-text">{{ t('battle.noBackup') }}</span>
      </div>
    </template>

    <!-- Back Row Character (Reserve Card) -->
    <!-- Not rendered in Avatar Mode (handled inside front card or as badge) -->
    <template v-if="viewMode === 'avatar' && slot.back">
       <!-- Avatar Badge Mode: Rendered relative to Front Card -->
       <!-- Logic: In Avatar Mode, we don't render a separate back card div. 
            Instead, we attach the badge to the front card container.
       -->
    </template>
    
    <div class="card back-card" v-if="slot.back && viewMode !== 'avatar'"
         :class="{ 
             'dead': slot.back.isDead,
             'dying': slot.back.isDying,
             'selectable': slot.back.isSelectable 
         }"
         @click.stop="onCharacterClick(slot.back)"
    >
       <!-- Top Row: Name -->
       <div class="back-card-header">
           <span class="char-name" :class="{ 'name-dead': slot.back.isDead || slot.back.isDying }">{{ getLocalizedName(slot.back.name) }}</span>
       </div>

       <div class="back-card-main-content">
           <!-- Left: Avatar -->
           <div class="back-card-avatar">
              <div class="mini-avatar large" :style="{ backgroundColor: slot.back.roleColor }">
                 {{ slot.back.name.en ? slot.back.name.en.charAt(0) : '' }}
              </div>
           </div>

           <!-- Right: Info -->
           <div class="back-card-info">
              <!-- Stats -->
              <div class="back-card-stats">
                <div class="mini-bar hp" :style="{ transform: `scaleX(${slot.back.hpPercent / 100})` }"></div>
                <div class="mini-bar mp" :style="{ transform: `scaleX(${slot.back.mpPercent / 100})` }"></div>
                <!-- Back Row ATB Bar (Overcharge) -->
                <div class="mini-bar-container atb-container" :class="slot.back.atbContainerClass">
                    <div 
                       class="mini-bar atb" 
                       :class="[
                           slot.back.atbColorClass, 
                           { 
                               'glow-effect': (slot.back.atb || 0) >= 100,
                               'no-transition': slot.back.atbNoTransition
                           }
                       ]"
                       :style="{ transform: `scaleX(${slot.back.atbPercent / 100})` }"
                     ></div>
                </div>
                <!-- Mini BP -->
                 <div class="mini-bp-row">
                     <div v-for="(filled, i) in slot.back.energyPills" :key="i" class="mini-bp-dot" :class="{ 'filled': filled }"></div>
                  </div>
              </div>
           </div>
       </div>

       <!-- Status Effects (Separate Row) -->
       <div class="back-card-status-row">
          <div 
            v-for="st in slot.back.statusEffects" 
            :key="st.id" 
            class="status-icon mini"
            :class="st.class" 
            :title="st.tooltip"
          >
              <GameIcon :name="st.icon" />
              <span class="status-duration">{{ st.duration }}</span>
          </div>
       </div>
    </div>
    <div class="empty-back-slot" v-else>
      <span class="placeholder-text">{{ t('battle.noBackup') }}</span>
    </div>
  </div>
</template>

<script setup>
import GameIcon from '@/interface/ui/GameIcon.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  slot: {
    type: Object,
    required: true
  },
  isActiveTurn: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['click-character']);

const { t, locale } = useI18n();

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj.en || nameObj.zh || '';
};

const onCharacterClick = (character) => {
    emit('click-character', character);
};
</script>

<style scoped src="@styles/ui/BattlePartySlot.css"></style>
<style scoped src="@styles/ui/BattleFrontCard.css"></style>
<style scoped src="@styles/ui/BattleBackCard.css"></style>
<style scoped src="@styles/ui/BattleAvatarBadge.css"></style>

