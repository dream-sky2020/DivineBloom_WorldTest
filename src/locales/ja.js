export default {
  common: {
    confirm: '決定',
    cancel: 'キャンセル',
    back: '戻る',
    close: '閉じる',
    emptySlot: '空きスロット',
    unknown: '不明'
  },
  menu: {
    start: 'ゲーム開始',
    continue: 'つづきから',
    settings: '設定',
    exit: 'ゲーム終了'
  },
  system: {
    language: '言語',
    volume: '音量',
    save: 'セーブ',
    load: 'ロード'
  },
  panels: {
    inventory: 'アイテム',
    equipment: '装備',
    skills: 'スキル',
    status: 'ステータス',
    shop: 'ショップ',
    encyclopedia: '図鑑',
    thank: 'クレジット',
    data: 'データ'
  },
  stats: {
    hp: 'HP',
    mp: 'MP',
    atk: '攻撃力',
    def: '防御力',
    matk: '魔法攻撃',
    mdef: '魔法防御',
    agi: '素早さ',
    luck: '運'
  },
  roles: {
    swordsman: '剣士',
    gunner: 'ガンナー',
    mage: '魔導士',
    brawler: '格闘家'
  },
  elements: {
    fire: '火',
    ice: '氷',
    lightning: '雷',
    light: '光',
    windLight: '風/光'
  },
  weapons: {
    sword: '剣',
    rifle: 'ライフル',
    book: '魔導書',
    gauntlets: '籠手'
  },
  itemTypes: {
    consumable: '消耗品',
    weapon: '武器',
    armor: '防具',
    accessory: '装飾品',
    keyItem: '貴重品'
  },
  skillTypes: {
    active: 'アクティブ',
    passive: 'パッシブ'
  },
  skillCategories: {
    physical: '物理',
    magic: '魔法',
    support: '補助',
    passive: 'パッシブ'
  },
  statusTypes: {
    buff: 'バフ',
    debuff: 'デバフ'
  },
  labels: {
    element: '属性',
    weapon: '武器',
    role: 'ジョブ',
    type: 'タイプ',
    effect: '効果',
    category: 'カテゴリ',
    cost: 'コスト'
  },
  dev: {
    title: '開発者パネル',
    systemSwitcher: 'システム切替',
    debugActions: 'デバッグ操作',
    systems: {
      mainMenu: 'メインメニュー',
      listMenu: 'リストメニュー',
      shop: 'ショップシステム',
      encyclopedia: '図鑑システム',
      battle: 'バトルシステム (WIP)',
      worldMap: 'ワールドマップ'
    },
    actions: {
      addGold: '所持金+1000',
      logState: '状態ログ出力'
    }
  },
  worldMap: {
    position: '現在地',
    lastInput: '最終入力',
    moveControls: '移動: WASD / 方向キー (Shift = ダッシュ)'
  },
  shop: {
    title: '武器屋',
    welcome: 'いらっしゃい！何をお求めかな？',
    keeperSpeech: 'この国一番の剣が揃ってるぜ！',
    buy: '購入する',
    yourGold: '所持金',
    exit: '店を出る'
  },
  mainMenu: {
    title: 'Sacred Colors Unleashed',
    subTitlePrefix: '~Prologue~',
    subTitleMain: 'Vicious Hunger',
    copyright: 'Copyright © 2024 Developer'
  },
  listMenu: {
    gold: '所持金',
    time: 'プレイ時間'
  },
  encyclopedia: {
    description: '説明',
    baseStats: '基本能力'
  },
  inventory: {
    tabs: {
        all: 'すべて'
    },
    views: {
        list: 'リスト',
        card: 'カード',
        grid: 'グリッド'
    }
  },
  saveLoad: {
    file: 'ファイル',
    empty: 'No Data',
    level: 'Lv',
    gold: 'Gold',
    date: '日付',
    delete: '削除',
    save: 'セーブ',
    load: 'ロード',
    playTime: '時間',
    location: '場所'
  },
  skills: {
    tabs: {
        all: '全スキル'
    },
    cost: 'コスト',
    target: '対象',
    type: 'タイプ',
    unequip: '外す',
    upgrade: '強化',
    locked: '未習得',
    equipped: '装備中'
  },
  systemSettings: {
    gameplay: 'ゲームプレイ',
    textSpeed: '表示速度',
    autoSave: 'オートセーブ',
    toTitle: 'タイトルへ',
    music: 'BGM',
    soundEffects: '効果音',
    masterVolume: '主音量',
    speeds: {
        slow: '遅い',
        normal: '普通',
        fast: '速い'
    }
  },
  thank: {
    title: 'クレジット',
    devTeam: '開発チーム',
    specialThanks: 'スペシャルサンクス',
    footer: 'プレイありがとうございました！'
  },
  equipment: {
    comparison: '能力比較',
    weight: '重量',
    selectWeapon: '武器選択',
    itemsAvailable: '所持アイテム',
    equipped: '装備中'
  },
  characters: {
    1: {
      name: 'アルフェン',
      description: '記憶と痛覚を失った謎の剣士。炎の剣を振るう。'
    },
    2: {
      name: 'シオン',
      description: '触れる者に激痛を与える「茨」の呪いを受けた女性。銃と治癒術を操る。'
    },
    3: {
      name: 'リンウェル',
      description: '一族最後の魔法使い。身体能力は低いが、強力な星霊術を行使する。'
    },
    4: {
      name: 'ロウ',
      description: '拳と脚で戦う熱血武闘家。素早い動きと重い一撃が特徴。'
    }
  },
  items: {
    1001: {
      name: 'ポーション',
      subText: 'HP50回復',
      footerLeft: 'HP回復',
      description: '薬草から作られた基本的な薬。HPを少し回復する。冒険者の必需品。'
    },
    1002: {
      name: 'ハイポーション',
      subText: 'HP150回復',
      footerLeft: 'HP回復++',
      description: '効能の高い薬。HPを中程度回復する。'
    },
    1003: {
      name: 'エーテル',
      subText: 'MP20回復',
      footerLeft: 'MP回復',
      description: '精神力を回復する魔法の液体。少し苦い。'
    },
    1004: {
      name: '毒消し',
      subText: '毒を治療',
      footerLeft: '解毒',
      description: '毒を治療する薬草薬。即効性がある。'
    },
    1005: {
      name: 'テント',
      subText: '全回復',
      footerLeft: '宿泊',
      description: '携帯用の宿。セーブポイントでパーティ全員のHP・MPを全回復する。'
    },
    1006: {
      name: 'フェニックスの尾',
      subText: '蘇生',
      footerLeft: '蘇生',
      description: '伝説の鳥の尾羽。戦闘不能の味方を少ないHPで復活させる。'
    },
    2001: {
      name: 'アイアンソード',
      subText: '攻撃力 +15',
      footerLeft: '基本の剣',
      description: '標準的な鉄の剣。頑丈で信頼性が高い。'
    },
    2002: {
      name: 'スチールセイバー',
      subText: '攻撃力 +35',
      footerLeft: '鋭利',
      description: '鋼鉄製の鋭い刃。軽装鎧なら容易に切り裂く。'
    },
    2003: {
      name: 'ミスリルダガー',
      subText: '攻撃力 +25, 速度 +5',
      footerLeft: '軽量',
      description: 'ミスリル製の美しい短剣。非常に軽く扱いやすい。'
    },
    2004: {
      name: '木の杖',
      subText: '魔力 +10',
      footerLeft: '魔導具',
      description: '樫の木を削り出した単純な杖。魔力をわずかに高める。'
    },
    3001: {
      name: 'レザーベスト',
      subText: '防御力 +10',
      footerLeft: '軽鎧',
      description: 'なめし革で作られたベスト。最低限の保護を提供する。'
    },
    3002: {
      name: 'チェーンメイル',
      subText: '防御力 +25',
      footerLeft: '中装鎧',
      description: '金属の輪を繋ぎ合わせた鎧。斬撃に対して高い防御効果がある。'
    },
    3003: {
      name: 'シルクのローブ',
      subText: '防御力 +5, 魔力 +15',
      footerLeft: '魔導衣',
      description: '魔力を帯びた絹のローブ。魔法の威力を高めるが、物理防御は低い。'
    },
    4001: {
      name: 'パワーリング',
      subText: '力 +5',
      footerLeft: '攻撃力UP',
      description: '赤い宝石が埋め込まれた指輪。力が湧いてくるのを感じる。'
    },
    4002: {
      name: 'プロテクトリング',
      subText: '防御力 +5',
      footerLeft: '防御力UP',
      description: '青い宝石が埋め込まれた指輪。微弱な防御オーラを放つ。'
    },
    9001: {
      name: 'ワールドマップ',
      subText: 'ダナ地域',
      footerLeft: '地図',
      description: '既知の世界の詳細な地図。旅には欠かせない。'
    },
    9002: {
      name: '錆びた鍵',
      subText: '古い鉄の鍵',
      footerLeft: '解錠',
      description: '廃墟で見つけた古びた鍵。近くの扉を開けられるかもしれない。'
    }
  },
  skills: {
    101: {
      name: 'スラッシュ',
      subText: '基本攻撃',
      description: '武器による素早い斬撃。敵単体に100%の物理ダメージを与える。'
    },
    102: {
      name: 'パワーストライク',
      subText: '重攻撃',
      description: '力を込めた強力な一撃。200%の物理ダメージを与えるが、命中率が少し低い。'
    },
    201: {
      name: 'ファイアボール',
      subText: '火属性',
      description: '火の玉を投げつける。火属性ダメージを与え、火傷状態にすることがある。'
    },
    202: {
      name: 'アイスニードル',
      subText: '氷属性',
      description: '鋭い氷柱を放つ。氷属性ダメージを与え、素早さを下げる。'
    },
    203: {
      name: 'サンダー',
      subText: '雷属性全体',
      description: '雷を呼び寄せ敵全体を攻撃する。中程度の雷属性ダメージ。'
    },
    301: {
      name: 'ヒール',
      subText: 'HP回復',
      description: '味方単体のHPを中程度回復する。'
    },
    302: {
      name: 'プロテクト',
      subText: '防御UP',
      description: '3ターンの間、味方単体の物理防御力を上昇させる。'
    },
    401: {
      name: 'アイアンスキン',
      subText: '常時防御UP',
      description: '物理防御力が永続的に10%上昇する。'
    },
    402: {
      name: 'マナフロー',
      subText: 'MP再生',
      description: '毎ターン終了時、最大MPの5%を回復する。'
    }
  },
  status: {
    1: {
      name: '毒',
      subText: '継続ダメ',
      description: 'ターン開始時にダメージを受ける。戦闘終了後も継続する。'
    },
    2: {
      name: '火傷',
      subText: '継続ダメ',
      description: '毎ターン火属性ダメージを受ける。攻撃力が低下する。'
    },
    3: {
      name: '凍結',
      subText: 'スタン',
      description: '行動不能になる。物理ダメージを受けると氷が砕け、2倍のダメージを受ける。'
    },
    4: {
      name: '麻痺',
      subText: '確率スタン',
      description: '毎ターン25%の確率で行動できなくなる。'
    },
    101: {
      name: '再生',
      subText: '自動回復',
      description: 'ターン開始時にHPが少量回復する。'
    },
    102: {
      name: '攻撃力上昇',
      subText: 'ATK UP',
      description: '物理攻撃力が上昇している状態。'
    },
    103: {
      name: 'ヘイスト',
      subText: 'SPD UP',
      description: '素早さが上昇し、ターンが回ってきやすくなる。'
    }
  }
}

