<template>
  <div 
    class="party-slot"
    :class="{ 
        'active-turn': isActiveTurn
    }"
  >
    <!-- Front Row Character (Main Card) -->
    <div class="card front-card" v-if="slot.front" 
         :class="{ 
             'dead': slot.front.currentHp <= 0,
             'selectable': canSelect(slot.front)
         }"
         @click.stop="onCharacterClick(slot.front)"
    >
      <div class="card-header">
        <span class="char-name" :class="{ 'name-dead': slot.front.currentHp <= 0 }">{{ getLocalizedName(slot.front.name) }}</span>
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
    </div>
    <div class="empty-card-slot" v-else>Empty</div>

    <!-- Back Row Character (Reserve Card) -->
    <div class="card back-card" v-if="slot.back"
         :class="{ 
             'dead': slot.back.currentHp <= 0,
             'selectable': canSelect(slot.back) 
         }"
         @click.stop="onCharacterClick(slot.back)"
    >
       <!-- Top Row: Name -->
       <div class="back-card-header">
           <span class="char-name" :class="{ 'name-dead': slot.back.currentHp <= 0 }">{{ getLocalizedName(slot.back.name) }}</span>
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
  selectionContext: {
    type: Object,
    default: () => ({ isSelectingAlly: false, isSelectingDead: false })
  }
});

const emit = defineEmits(['click-character']);

const { t, locale } = useI18n();

const getLocalizedName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[locale.value] || nameObj.en || nameObj.zh || '';
};

const canSelect = (character) => {
    if (!character) return false;
    if (!props.selectionContext.isSelectingAlly) return false;
    if (props.selectionContext.isSelectingDead) return character.currentHp <= 0;
    return character.currentHp > 0;
};

const onCharacterClick = (character) => {
    emit('click-character', character);
};
</script>

<style scoped>
.party-slot {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.party-slot.active-turn .front-card {
  transform: translateY(-20px);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  border-color: #fbbf24;
}

/* Handle combination of active turn and selectable */
.party-slot.active-turn .front-card.selectable {
  transform: translateY(-20px) scale(1.02);
}

.party-slot.active-turn .front-card.selectable:hover {
  transform: translateY(-20px) scale(1.05);
}

.card.selectable {
    cursor: pointer;
    border-color: #3b82f6;
    box-shadow: 0 0 20px #3b82f6;
    transform: scale(1.02);
    transition: all 0.2s;
}

.card.selectable:hover {
    border-color: #60a5fa;
    box-shadow: 0 0 30px #60a5fa;
    transform: scale(1.05);
}

.card.dead {
    filter: grayscale(1);
    opacity: 0.6;
}

/* Card Styles */
.card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.front-card {
  height: 380px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.card-header {
  padding: 0.8rem;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.card-avatar-container {
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #64748b;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: 900;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}

.card-stats {
  padding: 1rem;
  background: rgba(0,0,0,0.4);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.stat-row label {
  width: 30px;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: bold;
}

.bar-container {
  flex: 1;
  height: 16px;
  background: #334155;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp .bar-fill { background: linear-gradient(to right, #ef4444, #f87171); }
.mp .bar-fill { background: linear-gradient(to right, #3b82f6, #60a5fa); }
.atb .bar-fill { background: #fbbf24; transition: width 0.1s linear; }

.bar-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  text-shadow: 1px 1px 2px black;
}

.status-row {
  height: 30px;
  display: flex;
  gap: 0.5rem;
  justify-content: center; 
}

.status-icon {
  width: 24px;
  height: 24px;
  background: #475569; 
  border-radius: 4px;
  font-size: 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: help;
  border: 1px solid transparent;
}

.status-icon.status-buff {
    border-color: #34d399;
    background: rgba(16, 185, 129, 0.2);
}

.status-icon.status-debuff {
    border-color: #f87171;
    background: rgba(239, 68, 68, 0.2);
}

.status-duration {
    position: absolute;
    bottom: -6px;
    right: -6px;
    font-size: 0.6rem;
    background: #0f172a;
    color: white;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #475569;
}

/* Back Row Card (Reserve) */
.back-card {
  height: 140px;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #475569;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.back-card-header {
  height: 28px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem;
}

.back-card-header .char-name {
  font-size: 0.9rem;
  font-weight: bold;
}

.back-card-main-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5rem 0.75rem;
    gap: 1rem;
    flex: 1;
    justify-content: center; 
}

.name-dead {
    color: #ef4444 !important;
    text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}

.empty-back-slot {
  height: 140px;
  border: 2px dashed #334155;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #475569;
}

.back-card-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Match parent height */
}

.mini-avatar.large {
  width: 40px;  /* Reduced from 60px */
  height: 40px; /* Reduced from 60px */
  border-radius: 50%;
  background: #64748b;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem; /* Reduced font size */
  font-weight: bold;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

.back-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  height: 100%;
}

.back-card-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center; /* Center vertically */
  height: 100%;
}

.mini-bar {
  height: 6px;
  background: #334155;
  border-radius: 3px;
}

.mini-bar.hp { background: #ef4444; }
.mini-bar.mp { background: #3b82f6; }

.mini-bar-container {
    height: 6px;
    background: #334155;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
}

.mini-bar.atb {
    height: 100%;
    transition: width 0.1s linear;
}

.back-card-status-row {
    height: 30px;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.75rem;
    gap: 4px;
}

.back-card-status {
    /* Removed old class style if no longer needed, or keep for compatibility */
    display: none; 
}

.status-icon.mini {
    width: 20px;
    height: 20px;
    font-size: 0.5rem;
}

.status-icon.mini .status-duration {
    width: 10px;
    height: 10px;
    font-size: 0.5rem;
    bottom: -3px;
    right: -3px;
}

/* ATB Colors & Glows */
.bg-yellow { background: #fbbf24; }
.bg-orange { background: #f97316; }
.bg-red { background: #dc2626; }
.bg-blue { background: #3b82f6; }

.atb-yellow { background: #fbbf24; }
.atb-orange { 
    background: #f97316; 
    box-shadow: 0 0 5px #f97316;
}
.atb-red { 
    background: #dc2626; 
    box-shadow: 0 0 8px #dc2626, 0 0 4px #ef4444;
}
.atb-blue { 
    background: #3b82f6; 
    box-shadow: 0 0 10px #3b82f6, 0 0 5px #60a5fa;
}
.atb-white { 
    background: #ffffff; 
    box-shadow: 0 0 15px #ffffff, 0 0 8px #e2e8f0;
}

.glow-effect {
    animation: bar-pulse 1.5s infinite;
}

@keyframes bar-pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; filter: brightness(1.2); }
    100% { opacity: 0.8; }
}

.no-transition {
    transition: none !important;
}
</style>

