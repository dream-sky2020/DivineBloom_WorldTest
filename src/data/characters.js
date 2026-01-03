// src/data/characters.js

/**
 * 角色数据库 (Characters)
 * 记录角色初始状态和基本信息
 */
export const charactersDb = {
  1: {
    id: 1,
    name: {
      zh: '烈焰剑士',
      'zh-TW': '烈焰劍士',
      en: 'Flame Swordsman',
      ja: 'フレイムソードマン',
      ko: '플레임 소드맨'
    },
    role: "roles.swordsman",
    element: "elements.fire",
    weaponType: "weapons.sword",
    initialStats: {
      hp: 1500,
      mp: 50,
      str: 18,
      def: 12,
      mag: 8,
      spd: 10
    },
    skills: [101, 306],
    description: {
      zh: '擅长使用火焰剑技的战士。',
      'zh-TW': '擅長使用火焰劍技的戰士。',
      en: 'A warrior skilled in flame sword techniques.',
      ja: '炎の剣技を得意とする戦士。',
      ko: '화염 검 기술에 능숙한 전사.'
    }
  },
  2: {
    id: 2,
    name: {
      zh: '烈火枪手',
      'zh-TW': '烈火槍手',
      en: 'Blaze Gunner',
      ja: 'ブレイズガンナー',
      ko: '블레이즈 거너'
    },
    role: "roles.gunner",
    element: "elements.fire", // Also uses astral energy
    weaponType: "weapons.rifle",
    initialStats: {
      hp: 1380,
      mp: 120,
      str: 14,
      def: 10,
      mag: 20,
      spd: 14
    },
    skills: [102, 306],
    description: {
      zh: '拥有爆炸性火力的远程攻击者。',
      'zh-TW': '擁有爆炸性火力的遠程攻擊者。',
      en: 'A long-range attacker with explosive power.',
      ja: '爆発的な火力を持つ遠距離攻撃者。',
      ko: '폭발적인 화력을 가진 원거리 공격자.'
    }
  },
  3: {
    id: 3,
    name: {
      zh: '风暴贤者',
      'zh-TW': '風暴賢者',
      en: 'Tempest Mage',
      ja: 'テンペストメイジ',
      ko: '템페스트 메이지'
    },
    role: "roles.mage",
    element: "elements.windLight",
    weaponType: "weapons.book",
    initialStats: {
      hp: 1300,
      mp: 200,
      str: 6,
      def: 8,
      mag: 25,
      spd: 12
    },
    skills: [203, 204, 306],
    description: {
      zh: '精通风与光属性魔法的大师。',
      'zh-TW': '精通風與光屬性魔法的大師。',
      en: 'A master of wind and light magic.',
      ja: '風と光の魔法を極めた達人。',
      ko: '바람과 빛의 마법을 마스터한 현자.'
    }
  },
  4: {
    id: 4,
    name: {
      zh: '圣光斗士',
      'zh-TW': '聖光鬥士',
      en: 'Holy Brawler',
      ja: 'ホーリーブローラー',
      ko: '홀리 브롤러'
    },
    role: "roles.brawler",
    element: "elements.light",
    weaponType: "weapons.gauntlets",
    initialStats: {
      hp: 1550,
      mp: 60,
      str: 22,
      def: 10,
      mag: 5,
      spd: 18
    },
    skills: [101, 103, 302, 305, 306],
    description: {
      zh: '受到光之祝福的近战格斗家。',
      'zh-TW': '受到光之祝福的近戰格鬥家。',
      en: 'A melee fighter blessed by light.',
      ja: '光の加護を受けた近接格闘家。',
      ko: '빛의 축복을 받은 근접 격투가.'
    }
  },
  5: {
    id: 5,
    name: {
      zh: '堂吉诃德',
      'zh-TW': '堂吉訶德',
      en: 'Don Quixote',
      ja: 'ドン・キホーテ',
      ko: '돈키호테'
    },
    role: "roles.lancer",
    element: "elements.blood",
    weaponType: "weapons.spear",
    initialStats: {
      hp: 1600,
      mp: 80,
      str: 24,
      def: 14,
      mag: 5,
      spd: 16
    },
    skills: [101, 103, 306, 401],
    description: {
      zh: '为赎罪而战的堂吉诃德家族末裔，能够使用“绯红日花”的力量。',
      'zh-TW': '為贖罪而戰的堂吉訶德家族末裔，能夠使用“緋紅日花”的力量。',
      en: 'The last descendant of the Don Quixote family fighting for atonement, wielding the power of "Crimson Sun Flower".',
      ja: '贖罪のために戦うドン・キホーテ家の末裔、「緋色の向日葵」の力を使う。',
      ko: '속죄를 위해 싸우는 돈키호테 가문의 후예, "진홍빛 해바라기"의 힘을 사용한다.'
    }
  },
  6: {
    id: 6,
    name: {
      zh: '贾宝玉',
      'zh-TW': '賈寶玉',
      en: 'Jia Baoyu',
      ja: '賈宝玉',
      ko: '가보옥'
    },
    role: "roles.mimic",
    element: "elements.void",
    weaponType: "weapons.jade",
    initialStats: {
      hp: 1400,
      mp: 150,
      str: 10,
      def: 10,
      mag: 18,
      spd: 12
    },
    skills: [101, 102, 103, 201, 202, 203, 204, 301, 302, 303, 304, 305, 306, 401, 402],
    description: {
      zh: '通过通灵宝玉重获新生的少年，拥有兼容一切力量的体质。',
      'zh-TW': '通過通靈寶玉重獲新生的少年，擁有兼容一切力量的體質。',
      en: 'A young man reborn through the Psychic Jade, possessing a constitution compatible with all powers.',
      ja: '通霊宝玉を通じて生まれ変わった少年、あらゆる力を受け入れる体質を持つ。',
      ko: '통령보옥을 통해 다시 태어난 소년, 모든 힘과 호환되는 체질을 가졌다.'
    }
  },
  7: {
    id: 7,
    name: {
      zh: '山鲁佐德',
      'zh-TW': '山魯佐德',
      en: 'Scheherazade',
      ja: 'シェヘラザード',
      ko: '셰헤라자드'
    },
    role: "roles.storyteller",
    element: "elements.time",
    weaponType: "weapons.scroll",
    initialStats: {
      hp: 1350,
      mp: 220,
      str: 5,
      def: 8,
      mag: 26,
      spd: 15
    },
    skills: [103, 201, 202, 203, 204, 301, 303, 306,],
    description: {
      zh: '“虚假生命”的守护者，手持轮回书卷，守护着空心人的幸福。',
      'zh-TW': '“虛假生命”的守護者，手持輪迴書卷，守護著空心人的幸福。',
      en: 'Guardian of the "False Life Alliance", holding the scroll of reincarnation to protect the happiness of the Hollows.',
      ja: '「虚構生命同盟」の守護者、輪廻の書物を手に、空ろな人々の幸福を守る。',
      ko: ' "거짓 생명 연맹"의 수호자, 윤회의 두루마리를 들고 공허한 사람들의 행복을 지킨다.'
    }
  },
  101: {
    id: 101,
    name: {
      zh: '神武皇帝',
      'zh-TW': '神武皇帝',
      en: 'Emperor Shenwu',
      ja: '神武皇帝',
      ko: '신무 황제'
    },
    role: "roles.emperor",
    element: "elements.divine",
    weaponType: "weapons.sword",
    isBoss: true,
    color: '#fbbf24', // Gold
    initialStats: {
      hp: 50000,
      mp: 9999,
      str: 50,
      def: 40,
      mag: 40,
      spd: 20
    },
    description: {
      zh: '神戮兵装的持有者，立誓通过武力终结一切混乱的霸主。',
      'zh-TW': '神戮兵裝的持有者，立誓通過武力終結一切混亂的霸主。',
      en: 'Wielder of the God-Slaying Armament, a hegemon sworn to end all chaos through force.',
      ja: '神殺しの兵装を持つ者、武力ですべての混沌を終わらせると誓った覇王。',
      ko: '신을 죽이는 무구의 소유자, 무력으로 모든 혼란을 끝내겠다고 맹세한 패왕.'
    }
  },
  102: {
    id: 102,
    name: {
      zh: '山鲁亚尔',
      'zh-TW': '山魯亞爾',
      en: 'Shahryar',
      ja: 'シャフリヤール',
      ko: '샤흐리야르'
    },
    role: "roles.king",
    element: "elements.nihility",
    weaponType: "weapons.scimitar",
    isBoss: true,
    color: '#94a3b8', // Slate/Silver
    initialStats: {
      hp: 45000,
      mp: 9999,
      str: 45,
      def: 35,
      mag: 50,
      spd: 25
    },
    description: {
      zh: '看破轮回虚无的国王，试图毁灭许愿术核心以赐予众生彻底的解脱。',
      'zh-TW': '看破輪迴虛無的國王，試圖毀滅許願術核心以賜予眾生徹底的解脫。',
      en: 'The king who saw through the nihilism of reincarnation, seeking to destroy the core of the wish spell to grant ultimate liberation.',
      ja: '輪廻の虚無を見抜いた王、願いの術の核を破壊し、衆生に完全な解脱を与えようとする。',
      ko: '윤회의 허무를 간파한 왕, 소원 주문의 핵심을 파괴하여 중생에게 완전한 해탈을 주려 한다.'
    }
  },
  103: {
    id: 103,
    name: {
      zh: '赫绯天',
      'zh-TW': '赫緋天',
      en: 'Hefietian',
      ja: 'ハー・フェイティアン',
      ko: '헤페이티안'
    },
    role: "roles.god_slayer",
    element: "elements.chaos",
    weaponType: "weapons.scythe",
    isBoss: true,
    color: '#ef4444',
    initialStats: {
      hp: 60000,
      mp: 9999,
      str: 60,
      def: 45,
      mag: 55,
      spd: 30
    },
    description: {
      zh: '屠灭所有神明的非人神。',
      'zh-TW': '屠滅所有神明的非人神。',
      en: 'A non-human god who slaughters all deities.',
      ja: 'すべての神を屠る非人の神。',
      ko: '모든 신을 학살하는 비인간 신.'
    }
  },
  104: {
    id: 104,
    name: {
      zh: '疫碧天',
      'zh-TW': '疫碧天',
      en: 'Yibitian',
      ja: 'イビティアン',
      ko: '이비천'
    },
    role: "roles.god_slayer",
    element: "elements.water",
    weaponType: "weapons.scythe",
    isBoss: true,
    color: '#10b981',
    initialStats: {
      hp: 70000,
      mp: 9999,
      str: 50,
      def: 50,
      mag: 65,
      spd: 32
    },
    skills: [103, 204, 205],
    description: {
      zh: '屠灭所有神明的非人神。',
      'zh-TW': '屠滅所有神明的非人神。',
      en: 'A non-human god who slaughters all deities.',
      ja: 'すべての神を屠る非人の神。',
      ko: '모든 신을 학살하는 비인간 신.'
    }
  }
};
