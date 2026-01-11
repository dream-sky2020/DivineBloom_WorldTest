export default {
  // TopBar
  selectTarget: { zh: '请选择目标...', 'zh-TW': '請選擇目標...', en: 'Select Target...', ja: 'ターゲットを選択...', ko: '대상을 선택하세요...' },
  cancel: { zh: '取消', 'zh-TW': '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' },
  turn: { zh: '的回合', 'zh-TW': '的回合', en: "'s Turn", ja: 'のターン', ko: '의 턴' },
  victory: { zh: '战斗胜利!', 'zh-TW': '戰鬥勝利!', en: 'Victory!', ja: '勝利!', ko: '승리!' },
  defeat: { zh: '战斗失败...', 'zh-TW': '戰鬥失敗...', en: 'Defeat...', ja: '敗北...', ko: '패배...' },

  // Log Generic
  started: { zh: '战斗开始!', 'zh-TW': '戰鬥開始!', en: 'Battle Started!', ja: '戦闘開始!', ko: '전투 시작!' },
  cannotMove: { zh: '{name} 无法行动!', 'zh-TW': '{name} 無法行動!', en: '{name} cannot move!', ja: '{name}は動けない！', ko: '{name} 행동 불가!' },
  attacks: { zh: '{attacker} 攻击 {target}!', 'zh-TW': '{attacker} 攻擊 {target}!', en: '{attacker} attacks {target}!', ja: '{attacker}が{target}を攻撃！', ko: '{attacker} {target} 공격!' },
  attackStart: { zh: '{attacker} 发动攻击', 'zh-TW': '{attacker} 發動攻擊', en: '{attacker} attacks', ja: '{attacker}の攻撃', ko: '{attacker} 공격 개시' },
  useItem: { zh: '{user} 使用了 {item}', 'zh-TW': '{user} 使用了 {item}', en: '{user} uses {item}', ja: '{user}は{item}を使った', ko: '{user} {item} 사용' },
  useSkill: { zh: '{user} 使用了 {skill}', 'zh-TW': '{user} 使用了 {skill}', en: '{user} uses {skill}', ja: '{user}は{skill}を使った', ko: '{user} {skill} 사용' },
  notEnoughMp: { zh: 'MP不足!', 'zh-TW': 'MP不足!', en: 'Not enough MP!', ja: 'MPが足りない！', ko: 'MP 부족!' },
  damage: { zh: '{target} 受到 {amount} 点伤害!', 'zh-TW': '{target} 受到 {amount} 點傷害!', en: '{target} took {amount} damage!', ja: '{target}に{amount}のダメージ！', ko: '{target}에게 {amount} 피해!' },
  defended: { zh: '(防御中)', 'zh-TW': '(防禦中)', en: '(Defended)', ja: '(防御中)', ko: '(방어 중)' },
  defending: { zh: '{name} 正在防御。', 'zh-TW': '{name} 正在防禦。', en: '{name} is defending.', ja: '{name}は防御している。', ko: '{name} 방어 중.' },
  recoveredHp: { zh: '{target} 恢复了 {amount} HP', 'zh-TW': '{target} 恢復了 {amount} HP', en: '{target} recovered {amount} HP', ja: '{target}のHPが{amount}回復した', ko: '{target} HP {amount} 회복' },
  recoveredMp: { zh: '{target} 恢复了 {amount} MP', 'zh-TW': '{target} 恢復了 {amount} MP', en: '{target} recovered {amount} MP', ja: '{target}のMPが{amount}回復した', ko: '{target} MP {amount} 회복' },
  revived: { zh: '{target} 复活了!', 'zh-TW': '{target} 復活了!', en: '{target} revived!', ja: '{target}が復活した！', ko: '{target} 부활!' },
  noEffect: { zh: '但是什么也没有发生...', 'zh-TW': '但是什麼也沒有發生...', en: 'But nothing happened...', ja: 'しかし何も起こらなかった...', ko: '하지만 아무 일도 일어나지 않았다...' },
  fell: { zh: '{target} 倒下了! {backup} 接替上场!', 'zh-TW': '{target} 倒下了! {backup} 接替上場!', en: '{target} fell! {backup} takes the lead!', ja: '{target}が倒れた！{backup}が交代に出る！', ko: '{target} 쓰러짐! {backup} 교체 출전!' },
  incapacitated: { zh: '{target} 无法战斗!', 'zh-TW': '{target} 無法戰鬥!', en: '{target} is incapacitated!', ja: '{target}は戦闘不能！', ko: '{target} 전투 불능!' },
  switchIn: { zh: '{name} 上场了!', 'zh-TW': '{name} 上場了!', en: '{name} switched in!', ja: '{name}が戦場に出た！', ko: '{name} 등장!' },
  cannotSwitch: { zh: '无法切换!', 'zh-TW': '無法切換!', en: 'Cannot switch!', ja: '交代できない！', ko: '교체 불가!' },
  skipTurn: { zh: '{name} 跳过回合。', 'zh-TW': '{name} 跳過回合。', en: '{name} skips turn.', ja: '{name}はターンをスキップ。', ko: '{name} 턴 넘김.' },

  // Status
  statusDamage: { zh: '{target} 受到 {amount} 点伤害 (来自 {status})!', 'zh-TW': '{target} 受到 {amount} 點傷害 (來自 {status})!', en: '{target} takes {amount} damage from {status}!', ja: '{target}は{status}により{amount}のダメージ！', ko: '{target} {status}(으)로 인해 {amount} 피해!' },
  statusHeal: { zh: '{target} 恢复了 {amount} HP (来自 {status})!', 'zh-TW': '{target} 恢復了 {amount} HP (來自 {status})!', en: '{target} recovers {amount} HP from {status}!', ja: '{target}は{status}によりHPが{amount}回復！', ko: '{target} {status}(으)로 인해 HP {amount} 회복!' },
  statusWoreOff: { zh: '{target} 的 {status} 效果消失了。', 'zh-TW': '{target} 的 {status} 效果消失了。', en: "{target}'s {status} wore off.", ja: '{target}の{status}が切れた。', ko: '{target}의 {status} 효과 사라짐.' },
  statusApplied: { zh: '{target} 受到了 {status} 的影响!', 'zh-TW': '{target} 受到了 {status} 的影響!', en: '{target} is affected by {status}!', ja: '{target}は{status}を受けた！', ko: '{target}에게 {status} 적용!' },
  statusExtended: { zh: '{target} 的 {status} 持续时间延长!', 'zh-TW': '{target} 的 {status} 持續時間延長!', en: "{target}'s {status} extended!", ja: '{target}の{status}が延長された！', ko: '{target}의 {status} 지속시간 연장!' },
  statusCured: { zh: '{target} 的 {status} 已治愈。', 'zh-TW': '{target} 的 {status} 已治癒。', en: "{target} is no longer {status}.", ja: '{target}の{status}が治った。', ko: '{target}의 {status} 치료됨.' },
  buffCast: { zh: '{user} 对 {target} 施加了增益', 'zh-TW': '{user} 對 {target} 施加了增益', en: '{user} casts buff on {target}', ja: '{user}は{target}に強化をかけた', ko: '{user}가 {target}에게 버프 시전' },
  partyRestored: { zh: '队伍状态已完全恢复!', 'zh-TW': '隊伍狀態已完全恢復!', en: 'Party fully restored!', ja: 'パーティの状態が全回復した！', ko: '파티 상태 완전 회복!' },

  // Boss specific (Generic versions) - DEPRECATED/REMOVED
  // The system now uses dynamic skill names from src/data/skills.js combined with 'useSkill' template


  // Chain
  chainHit: { zh: '[第{count}次弹射] 命中 {target}，造成 {amount} 伤害!', 'zh-TW': '[第{count}次彈射] 命中 {target}，造成 {amount} 傷害!', en: '[Bounce {count}] Hit {target} for {amount} damage!', ja: '[{count}回目] {target}に命中、{amount}のダメージ！', ko: '[{count}회차] {target} 적중, {amount} 피해!' },
  randomHit: { zh: '[第{count}次攻击] 命中 {target}，造成 {amount} 伤害!', 'zh-TW': '[第{count}次攻擊] 命中 {target}，造成 {amount} 傷害!', en: '[Hit {count}] Hit {target} for {amount} damage!', ja: '[{count}撃目] {target}に命中、{amount}のダメージ！', ko: '[{count}타] {target} 적중, {amount} 피해!' },

  // Action Menu
  actionBpMinus: {
    en: 'Decrease BP',
    zh: '减少BP',
    ja: 'BP減少',
    ko: 'BP 감소'
  },
  actionBpPlus: {
    en: 'Boost BP',
    zh: '爆发',
    ja: 'BPブースト',
    ko: 'BP 부스트'
  },
  actionBpCancel: {
    en: 'Reset BP',
    zh: '重置',
    ja: 'BPリセット',
    ko: 'BP 초기화'
  },
  skillsOf: { zh: '{name} 的技能', 'zh-TW': '{name} 的技能', en: "Skills of {name}", ja: '{name}のスキル', ko: '{name}의 스킬' },
  bagConsumables: { zh: '背包 (消耗品)', 'zh-TW': '背包 (消耗品)', en: 'Bag (Consumables)', ja: 'バッグ (消耗品)', ko: '가방 (소모품)' },
  noSkills: { zh: '暂无可用技能', 'zh-TW': '暫無可用技能', en: 'No skills available', ja: '使用可能なスキルがありません', ko: '사용 가능한 스킬 없음' },
  emptyBag: { zh: '背包空空如也', 'zh-TW': '背包空空如也', en: 'Bag is empty', ja: 'バッグは空です', ko: '가방이 비었습니다' },
  actionAttack: { zh: '攻击', 'zh-TW': '攻擊', en: 'Attack', ja: '攻撃', ko: '공격' },
  actionSkill: { zh: '技能', 'zh-TW': '技能', en: 'Skill', ja: 'スキル', ko: '스킬' },
  actionDefend: { zh: '守备', 'zh-TW': '守備', en: 'Defend', ja: '防御', ko: '방어' },
  actionItem: { zh: '道具', 'zh-TW': '道具', en: 'Item', ja: 'アイテム', ko: '도구' },
  actionSwitch: { zh: '换位', 'zh-TW': '換位', en: 'Switch', ja: '交代', ko: '교체' },
  actionSkip: { zh: '空过', 'zh-TW': '空過', en: 'Skip', ja: 'スキップ', ko: '대기' },
  actionRun: { zh: '逃跑', 'zh-TW': '逃跑', en: 'Run', ja: '逃げる', ko: '도망' },
  actionBloom: { zh: '怒放', 'zh-TW': '怒放', en: 'Bloom', ja: '開花', ko: '개화' },
  runAway: { zh: '成功逃离了战斗!', 'zh-TW': '成功逃離了戰鬥!', en: 'Escaped safely!', ja: '逃げ出した！', ko: '성공적으로 도망쳤다!' },
  noBackup: { zh: '无后备', 'zh-TW': '無後備', en: 'No Backup', ja: '控えなし', ko: '예비 없음' },
  foundLoot: { zh: '获得了 {item} x{qty}', 'zh-TW': '獲得了 {item} x{qty}', en: 'Found {item} x{qty}', ja: '{item} x{qty} を手に入れた', ko: '{item} x{qty} 획득' },
  energyConsume: { zh: '{name} 消耗了 {energy} BP', 'zh-TW': '{name} 消耗了 {energy} BP', en: '{name} consumes {energy} BP', ja: '{name}は{energy}BPを消費', ko: '{name} BP {energy} 소모' },

  views: {
    default: { zh: '默认视图', 'zh-TW': '預設視圖', en: 'Default View', ja: 'デフォルト表示', ko: '기본 보기' },
    compact: { zh: '紧凑视图', 'zh-TW': '緊湊視圖', en: 'Compact View', ja: 'コンパクト表示', ko: '간략 보기' },
    avatar: { zh: '头像视图', 'zh-TW': '頭像視圖', en: 'Avatar View', ja: 'アバター表示', ko: '아바타 보기' }
  },
}
