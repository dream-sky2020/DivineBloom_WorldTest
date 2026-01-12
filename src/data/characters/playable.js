export default {
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
      hp: 14500,
      mp: 150,
      str: 18,
      def: 12,
      mag: 8,
      spd: 10
    },
    skills: [101, 104, 105, 106, 206, 306],
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
      hp: 13380,
      mp: 220,
      str: 14,
      def: 10,
      mag: 20,
      spd: 14
    },
    skills: [102, 105, 106, 206, 306, 2001, 2002, 2003, 2004],
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
      hp: 13300,
      mp: 300,
      str: 6,
      def: 8,
      mag: 25,
      spd: 12
    },
    skills: [203, 204, 206, 306],
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
      hp: 14550,
      mp: 160,
      str: 22,
      def: 10,
      mag: 5,
      spd: 18
    },
    skills: [101, 103, 104, 105, 106, 302, 305, 306],
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
      hp: 15600,
      mp: 180,
      str: 24,
      def: 14,
      mag: 5,
      spd: 16
    },
    skills: [101, 103, 104, 105, 106, 206, 306, 401],
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
      hp: 13400,
      mp: 250,
      str: 10,
      def: 10,
      mag: 18,
      spd: 12
    },
    skills: [101, 102, 103, 104, 105, 106, 201, 202, 203, 204, 206, 301, 302, 303, 304, 305, 306, 401, 402, 2001, 2002, 2003, 2004],
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
      hp: 13350,
      mp: 320,
      str: 5,
      def: 8,
      mag: 26,
      spd: 15
    },
    skills: [103, 104, 105, 106, 201, 202, 203, 204, 206, 301, 303, 306,],
    description: {
      zh: '“虚假生命”的守护者，手持轮回书卷，守护着空心人的幸福。',
      'zh-TW': '“虛假生命”的守護者，手持輪迴書卷，守護著空心人的幸福。',
      en: 'Guardian of the "False Life Alliance", holding the scroll of reincarnation to protect the happiness of the Hollows.',
      ja: '「虚構生命同盟」の守護者、輪廻の書物を手に、空ろな人々の幸福を守る。',
      ko: ' "거짓 생명 연맹"의 수호자, 윤회의 두루마리를 들고 공허한 사람들의 행복을 지킨다.'
    }
  }
}

