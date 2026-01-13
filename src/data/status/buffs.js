export default {
  'status_regen': {
    id: 'status_regen',
    name: {
      zh: '再生',
      'zh-TW': '再生',
      en: 'Regen',
      ja: 'リジェネ',
      ko: '재생'
    },
    type: "statusTypes.buff",
    icon: "icon_regen",
    subText: {
      zh: '持续恢复',
      'zh-TW': '持續恢復',
      en: 'HoT',
      ja: '継続回復',
      ko: '지속 회복'
    },
    description: {
      zh: '每回合恢复少量生命值。',
      'zh-TW': '每回合恢復少量生命值。',
      en: 'Restores a small amount of HP each turn.',
      ja: '毎ターンHPを少量回復する。',
      ko: '매 턴 HP를 소량 회복한다.'
    },
    effects: [
      { trigger: 'turnStart', type: 'heal', value: 0.1, scaling: 'maxHp' }
    ]
  },
  'status_attack_up': {
    id: 'status_attack_up',
    name: {
      zh: '攻击提升',
      'zh-TW': '攻擊提升',
      en: 'Attack Up',
      ja: '攻撃力アップ',
      ko: '공격력 증가'
    },
    type: "statusTypes.buff",
    icon: "icon_buff_atk",
    subText: {
      zh: 'ATK +20%',
      'zh-TW': 'ATK +20%',
      en: 'ATK +20%',
      ja: '攻撃力 +20%',
      ko: '공격력 +20%'
    },
    description: {
      zh: '物理攻击力暂时提升。',
      'zh-TW': '物理攻擊力暫時提升。',
      en: 'Physical attack power is temporarily increased.',
      ja: '物理攻撃力が一時的に上昇する。',
      ko: '물리 공격력이 일시적으로 증가한다.'
    },
    effects: [
      { trigger: 'passive', type: 'statMod', stat: 'atk', value: 1.2 }
    ]
  },
  'status_haste': {
    id: 'status_haste',
    name: {
      zh: '加速',
      'zh-TW': '加速',
      en: 'Haste',
      ja: 'ヘイスト',
      ko: '가속'
    },
    type: "statusTypes.buff",
    icon: "icon_haste",
    subText: {
      zh: 'SPD +30%',
      'zh-TW': 'SPD +30%',
      en: 'SPD +30%',
      ja: '速度 +30%',
      ko: '속도 +30%'
    },
    description: {
      zh: '行动速度大幅提升。',
      'zh-TW': '行動速度大幅提升。',
      en: 'Action speed is significantly increased.',
      ja: '行動速度が大幅に上昇する。',
      ko: '행동 속도가 크게 증가한다.'
    },
    effects: [
      { trigger: 'passive', type: 'statMod', stat: 'spd', value: 1.3 }
    ]
  },
  'status_defense_up': {
    id: 'status_defense_up',
    name: {
      zh: '防御提升',
      'zh-TW': '防禦提升',
      en: 'Defense Up',
      ja: '防御力アップ',
      ko: '방어력 증가'
    },
    type: "statusTypes.buff",
    icon: "icon_buff_def",
    subText: {
      zh: 'DEF +50%',
      'zh-TW': 'DEF +50%',
      en: 'DEF +50%',
      ja: '防御力 +50%',
      ko: '방어력 +50%'
    },
    description: {
      zh: '物理防御力暂时提升。',
      'zh-TW': '物理防禦力暫時提升。',
      en: 'Physical defense is temporarily increased.',
      ja: '物理防御力が一時的に上昇する。',
      ko: '물리 방어력이 일시적으로 증가한다.'
    },
    effects: [
      { trigger: 'passive', type: 'statMod', stat: 'def', value: 1.5 }
    ]
  },
  'status_ammo_count': {
    id: 'status_ammo_count',
    name: {
      zh: '残弹余数',
      'zh-TW': '殘彈餘數',
      en: 'Ammo Count',
      ja: '残弾',
      ko: '잔탄 수 (殘彈餘數)'
    },
    type: "statusTypes.special", // 改为特殊类型以支持特殊UI条
    icon: "icon_ammo",
    subText: {
      zh: '剩余弹药',
      'zh-TW': '剩餘彈藥',
      en: 'Ammo Left',
      ja: '残弾数',
      ko: '남은 탄약'
    },
    description: {
      zh: '当前剩余的弹药数量。消耗完后需要重新装填。',
      'zh-TW': '當前剩餘的彈藥數量。消耗完後需要重新裝填。',
      en: 'Current remaining ammunition. Requires reloading when depleted.',
      ja: '現在の残弾数。使い切るとリロードが必要。',
      ko: '현재 남은 탄약 수. 다 쓰면 재장전이 필요하다.'
    },
    decayMode: 'none', // 不自动减少
    hasStack: true, // 启用层数/强度显示
    stackLabel: { // 可选：用于UI显示层数含义
      zh: '发',
      'zh-TW': '發',
      en: 'rds',
      ja: '発',
      ko: '발'
    },
    effects: []
  },
  'status_chambered_count': {
    id: 'status_chambered_count',
    name: {
      zh: '弦上余数',
      'zh-TW': '弦上餘數',
      en: 'Chambered Count',
      ja: '弦上餘數',
      ko: '장전 수 (弦上餘數)'
    },
    type: "statusTypes.special",
    icon: "icon_sniper", // 暂用瞄准图标
    subText: {
      zh: '子弹上膛',
      'zh-TW': '子彈上膛',
      en: 'Ammo Ready',
      ja: '弾薬装填',
      ko: '탄약 장전'
    },
    description: {
      zh: '子弹已装填',
      'zh-TW': '子彈已裝填',
      en: 'Special ammo is chambered.',
      ja: '弾が装填されており',
      ko: '탄약이 장전되어 있음'
    },
    decayMode: 'none', // 不自动减少
    hasStack: true,
    stackLabel: {
      zh: '发',
      'zh-TW': '發',
      en: 'rds',
      ja: '発',
      ko: '발'
    },
    effects: []
  },
  'status_shattered_prison': {
    id: 'status_shattered_prison',
    name: {
      zh: '破碎监牢',
      'zh-TW': '破碎監牢',
      en: 'Shattered Prison',
      ja: '砕かれた牢獄',
      ko: '부서진 감옥'
    },
    type: "statusTypes.buff",
    icon: "icon_limit_break",
    subText: {
      zh: '免控',
      'zh-TW': '免控',
      en: 'CC Immunity',
      ja: '阻害無効',
      ko: '제어 면역'
    },
    description: {
      zh: '英雄意志觉醒，无视所有行动限制效果。',
      'zh-TW': '英雄意志覺醒，無視所有行動限制效果。',
      en: 'Heroic will awakened, ignores all action-restricting effects.',
      ja: '英雄の意志が目覚め、全ての行動制限効果を無視する。',
      ko: '영웅의 의지가 각성하여 모든 행동 제한 효과를 무시한다.'
    },
    effects: [
      { trigger: 'checkAction', type: 'immunity', status: 'stun' } // 特殊类型：阻止 checkAction 返回 false
    ]
  }
}

