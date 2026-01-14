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
               'dead': hasStatus(slot.front, 'status_dead'),
               'dying': hasStatus(slot.front, 'status_dying'),
               'selectable': canSelect(slot.front)
           }"
           @click.stop="onCharacterClick(slot.front)"
      >
        <div class="card-header">
          <span class="char-name" :class="{ 'name-dead': hasStatus(slot.front, 'status_dead') || hasStatus(slot.front, 'status_dying') }">{{ getLocalizedName(slot.front.name) }}</span>
          <GameIcon class="element-icon" name="icon_fire" />
        </div>
        <div class="card-avatar-container">
           <!-- Placeholder Avatar -->
           <div class="avatar-placeholder" :style="{ backgroundColor: getRoleColor(slot.front.role) }">
             {{ slot.front.name.en.charAt(0) }}
           </div>
        </div>
        <div class="card-stats">
          <div class="stat-row hp">
            <label>HP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: (slot.front.currentHp / slot.front.maxHp * 100) + '%' }"></div>
              <span class="bar-text">{{ slot.front.currentHp }}/{{ slot.front.maxHp }}</span>
            </div>
          </div>
          <div class="stat-row mp">
            <label>MP</label>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: (slot.front.currentMp / slot.front.maxMp * 100) + '%' }"></div>
               <span class="bar-text">{{ slot.front.currentMp }}/{{ slot.front.maxMp }}</span>
            </div>
          </div>
          <!-- ATB Bar -->
           <div class="stat-row atb">
            <label>ATB</label>
            <div class="bar-container">
              <div class="bar-fill atb-fill" :class="{ 'no-transition': (slot.front.atb || 0) < 5 }" :style="{ width: ((slot.front.atb > 0 ? slot.front.atb : 0) || 0) + '%' }"></div>
            </div>
          </div>
          
          <!-- Energy Points (BP) -->
          <div class="stat-row bp">
            <label>BP</label>
            <div class="bp-pills">
                <div 
                  v-for="n in 6" 
                  :key="n" 
                  class="bp-pill" 
                  :class="{ 'filled': (slot.front.energy || 0) >= n }"
                ></div>
            </div>
          </div>

          <div class="status-row">
            <div 
              v-for="st in slot.front.statusEffects" 
              :key="st.id" 
              class="status-icon"
              :class="getStatusClass(st.id)" 
              :title="getStatusTooltip(st)"
            >
                <GameIcon :name="getStatusIcon(st.id)" />
                <span class="status-duration">{{ st.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Avatar Badge (Only in Avatar Mode) -->
        <div 
          v-if="viewMode === 'avatar' && slot.back"
          class="avatar-badge"
          :class="{ 
            'selectable': canSelect(slot.back),
            'dead': hasStatus(slot.back, 'status_dead'),
            'dying': hasStatus(slot.back, 'status_dying')
          }"
          @click.stop="onCharacterClick(slot.back)"
          :title="getLocalizedName(slot.back.name)"
        >
          <div class="badge-avatar" :style="{ backgroundColor: getRoleColor(slot.back.role) }">
            {{ slot.back.name.en.charAt(0) }}
          </div>
          <!-- Tiny HP Bar Ring or Underline -->
          <div class="badge-bars">
            <div class="badge-bar hp" :style="{ width: (slot.back.currentHp / slot.back.maxHp * 100) + '%' }"></div>
            <div class="badge-bar mp" :style="{ width: (slot.back.currentMp / slot.back.maxMp * 100) + '%' }"></div>
          </div>
        </div>

      </div>
      <div class="empty-card-slot" v-else>Empty</div>
    </template>

    <!-- Front Row Character - Compact View (BackCard Style) -->
    <template v-else>
      <div class="card back-card front-compact" v-if="slot.front"
           :class="{ 
               'dead': hasStatus(slot.front, 'status_dead'),
               'dying': hasStatus(slot.front, 'status_dying'),
               'selectable': canSelect(slot.front)
           }"
           @click.stop="onCharacterClick(slot.front)"
      >
         <div class="back-card-header">
             <span class="char-name" :class="{ 'name-dead': hasStatus(slot.front, 'status_dead') || hasStatus(slot.front, 'status_dying') }">{{ getLocalizedName(slot.front.name) }}</span>
         </div>
         <div class="back-card-main-content">
             <div class="back-card-avatar">
                <div class="mini-avatar large" :style="{ backgroundColor: getRoleColor(slot.front.role) }">
                   {{ slot.front.name.en ? slot.front.name.en.charAt(0) : '' }}
                </div>
             </div>
             <div class="back-card-info">
                <div class="back-card-stats">
                  <div class="mini-bar hp" :style="{ width: (slot.front.currentHp / slot.front.maxHp * 100) + '%' }"></div>
                  <div class="mini-bar mp" :style="{ width: (slot.front.currentMp / slot.front.maxMp * 100) + '%' }"></div>
                  <div class="mini-bar-container atb-container" :class="getATBContainerClass(slot.front.atb)">
                      <div 
                         class="mini-bar atb" 
                         :class="[
                             getATBColorClass(slot.front.atb), 
                             { 
                                 'glow-effect': (slot.front.atb || 0) >= 100,
                                 'no-transition': (slot.front.atb || 0) < 5
                             }
                         ]"
                         :style="{ width: getATBWidth(slot.front.atb) + '%' }"
                       ></div>
                  </div>
                  <!-- Mini BP -->
                  <div class="mini-bp-row">
                     <div v-for="n in 6" :key="n" class="mini-bp-dot" :class="{ 'filled': (slot.front.energy || 0) >= n }"></div>
                  </div>
                </div>
             </div>
         </div>
         <div class="back-card-status-row">
            <div 
              v-for="st in slot.front.statusEffects" 
              :key="st.id" 
              class="status-icon mini"
              :class="getStatusClass(st.id)" 
              :title="getStatusTooltip(st)"
            >
                <GameIcon :name="getStatusIcon(st.id)" />
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
             'dead': hasStatus(slot.back, 'status_dead'),
             'dying': hasStatus(slot.back, 'status_dying'),
             'selectable': canSelect(slot.back) 
         }"
         @click.stop="onCharacterClick(slot.back)"
    >
       <!-- Top Row: Name -->
       <div class="back-card-header">
           <span class="char-name" :class="{ 'name-dead': hasStatus(slot.back, 'status_dead') || hasStatus(slot.back, 'status_dying') }">{{ getLocalizedName(slot.back.name) }}</span>
       </div>

       <div class="back-card-main-content">
           <!-- Left: Avatar -->
           <div class="back-card-avatar">
              <div class="mini-avatar large" :style="{ backgroundColor: getRoleColor(slot.back.role) }">
                 {{ slot.back.name.en ? slot.back.name.en.charAt(0) : '' }}
              </div>
           </div>

           <!-- Right: Info -->
           <div class="back-card-info">
              <!-- Stats -->
              <div class="back-card-stats">
                <div class="mini-bar hp" :style="{ width: (slot.back.currentHp / slot.back.maxHp * 100) + '%' }"></div>
                <div class="mini-bar mp" :style="{ width: (slot.back.currentMp / slot.back.maxMp * 100) + '%' }"></div>
                <!-- Back Row ATB Bar (Overcharge) -->
                <div class="mini-bar-container atb-container" :class="getATBContainerClass(slot.back.atb)">
                    <div 
                       class="mini-bar atb" 
                       :class="[
                           getATBColorClass(slot.back.atb), 
                           { 
                               'glow-effect': (slot.back.atb || 0) >= 100,
                               'no-transition': (slot.back.atb || 0) > 0 && (slot.back.atb || 0) % 100 < 10
                           }
                       ]"
                       :style="{ width: getATBWidth(slot.back.atb) + '%' }"
                     ></div>
                </div>
                <!-- Mini BP -->
                 <div class="mini-bp-row">
                     <div v-for="n in 6" :key="n" class="mini-bp-dot" :class="{ 'filled': (slot.back.energy || 0) >= n }"></div>
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
            :class="getStatusClass(st.id)" 
            :title="getStatusTooltip(st)"
          >
              <GameIcon :name="getStatusIcon(st.id)" />
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
import { 
  getRoleColor,
  getStatusClass, 
  getStatusTooltip, 
  getStatusIcon,
  getATBWidth,
  getATBColorClass,
  getATBContainerClass
} from '@/utils/battleUIUtils';
import GameIcon from '@/components/ui/GameIcon.vue';
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
  validTargetIds: {
    type: Array,
    default: () => []
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

const hasStatus = (character, statusId) => {
    if (!character || !character.statusEffects) return false;
    return character.statusEffects.some(s => s.id === statusId);
};

const canSelect = (character) => {
    if (!character) return false;
    return props.validTargetIds.includes(character.uuid);
};

const onCharacterClick = (character) => {
    emit('click-character', character);
};
</script>

<style scoped src="@styles/components/ui/BattlePartySlot.css"></style>
<style scoped src="@styles/components/ui/BattleFrontCard.css"></style>
<style scoped src="@styles/components/ui/BattleBackCard.css"></style>
<style scoped src="@styles/components/ui/BattleAvatarBadge.css"></style>

