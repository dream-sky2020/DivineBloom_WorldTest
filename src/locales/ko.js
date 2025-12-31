export default {
  common: {
    confirm: '확인',
    cancel: '취소',
    back: '뒤로',
    close: '닫기',
    emptySlot: '빈 슬롯',
    unknown: '알 수 없음'
  },
  menu: {
    start: '게임 시작',
    continue: '이어하기',
    settings: '설정',
    exit: '게임 종료'
  },
  system: {
    language: '언어',
    volume: '볼륨',
    save: '저장',
    load: '불러오기'
  },
  panels: {
    inventory: '인벤토리',
    equipment: '장비',
    skills: '스킬',
    status: '상태',
    shop: '상점',
    encyclopedia: '도감',
    thank: '크레딧',
    data: '데이터'
  },
  stats: {
    hp: 'HP',
    mp: 'MP',
    atk: '공격력',
    def: '방어력',
    matk: '마법공격',
    mdef: '마법방어',
    agi: '민첩',
    luck: '운'
  },
  roles: {
    swordsman: '검사',
    gunner: '거너',
    mage: '마법사',
    brawler: '격투가'
  },
  elements: {
    fire: '화염',
    ice: '얼음',
    lightning: '번개',
    light: '빛',
    windLight: '바람/빛'
  },
  weapons: {
    sword: '검',
    rifle: '라이플',
    book: '마도서',
    gauntlets: '건틀릿'
  },
  itemTypes: {
    consumable: '소비',
    weapon: '무기',
    armor: '방어구',
    accessory: '장신구',
    keyItem: '중요'
  },
  skillTypes: {
    active: '액티브',
    passive: '패시브'
  },
  skillCategories: {
    physical: '물리',
    magic: '마법',
    support: '보조',
    passive: '패시브'
  },
  statusTypes: {
    buff: '버프',
    debuff: '디버프'
  },
  labels: {
    element: '속성',
    weapon: '무기',
    role: '직업',
    type: '유형',
    effect: '효과',
    category: '분류',
    cost: '비용'
  },
  dev: {
    title: '개발자 패널',
    systemSwitcher: '시스템 전환',
    debugActions: '디버그 작업',
    systems: {
      mainMenu: '메인 메뉴',
      listMenu: '리스트 메뉴',
      shop: '상점 시스템',
      encyclopedia: '도감 시스템',
      battle: '전투 시스템 (WIP)',
      worldMap: '월드 맵'
    },
    actions: {
      addGold: '골드 추가 (+1000)',
      logState: '상태 로그'
    }
  },
  worldMap: {
    position: '위치',
    lastInput: '마지막 입력',
    moveControls: '이동: WASD / 방향키 (Shift = 달리기)'
  },
  shop: {
    title: '무기 상점',
    welcome: '어서 오세요, 여행자님! 물건을 둘러보세요.',
    keeperSpeech: '이 왕국 최고의 검들이 여기 있습니다!',
    buy: '구매',
    yourGold: '보유 골드',
    exit: '나가기'
  },
  mainMenu: {
    title: 'Sacred Colors Unleashed',
    subTitlePrefix: '~Prologue~',
    subTitleMain: 'Vicious Hunger',
    copyright: 'Copyright © 2024 Developer'
  },
  listMenu: {
    gold: '골드',
    time: '플레이 시간'
  },
  encyclopedia: {
    description: '설명',
    baseStats: '기본 능력치'
  },
  inventory: {
    tabs: {
        all: '전체'
    },
    views: {
        list: '리스트',
        card: '카드',
        grid: '그리드'
    }
  },
  saveLoad: {
    file: '파일',
    empty: '빈 데이터',
    level: 'Lv',
    gold: 'Gold',
    date: '날짜',
    delete: '삭제',
    save: '저장',
    load: '로드',
    playTime: '시간',
    location: '장소'
  },
  skills: {
    tabs: {
        all: '전체 스킬'
    },
    cost: '비용',
    target: '대상',
    type: '유형',
    unequip: '해제',
    upgrade: '강화',
    locked: '잠김',
    equipped: '장착됨'
  },
  systemSettings: {
    gameplay: '게임 플레이',
    textSpeed: '텍스트 속도',
    autoSave: '자동 저장',
    toTitle: '타이틀로',
    music: '배경음',
    soundEffects: '효과음',
    masterVolume: '전체 음량',
    speeds: {
        slow: '느림',
        normal: '보통',
        fast: '빠름'
    }
  },
  thank: {
    title: '크레딧',
    devTeam: '개발팀',
    specialThanks: 'Special Thanks',
    footer: '플레이해 주셔서 감사합니다!'
  },
  equipment: {
    comparison: '비교',
    weight: '무게',
    selectWeapon: '무기 선택',
    itemsAvailable: '보유 아이템',
    equipped: '장착됨'
  },
  characters: {
    1: {
      name: '알펜',
      description: '기억과 통각을 잃은 수수께끼의 검사. 불타는 검을 휘두른다.'
    },
    2: {
      name: '시온',
      description: '닿는 자에게 고통을 주는 "가시나무"의 저주를 받은 여성. 총과 성령술을 다룬다.'
    },
    3: {
      name: '린웰',
      description: '일족의 마지막 마법사. 신체 능력은 약하지만 강력한 성령술을 구사한다.'
    },
    4: {
      name: '로우',
      description: '주먹과 발로 싸우는 열혈 무투가. 빠른 움직임과 묵직한 타격이 특징.'
    }
  },
  items: {
    1001: {
      name: '포션',
      subText: 'HP 50 회복',
      footerLeft: 'HP 회복',
      description: '약초로 만든 기본적인 약. HP를 소량 회복한다. 모험가의 필수품.'
    },
    1002: {
      name: '하이 포션',
      subText: 'HP 150 회복',
      footerLeft: 'HP 회복++',
      description: '효능이 뛰어난 약. HP를 중량 회복한다.'
    },
    1003: {
      name: '에테르',
      subText: 'MP 20 회복',
      footerLeft: 'MP 회복',
      description: '정신력을 회복하는 마법의 액체. 맛은 조금 쓰다.'
    },
    1004: {
      name: '해독제',
      subText: '독 치료',
      footerLeft: '해독',
      description: '독을 치료하는 약초 해독제. 즉효성이 있다.'
    },
    1005: {
      name: '텐트',
      subText: '파티 전체 회복',
      footerLeft: '휴식',
      description: '휴대용 숙소. 세이브 포인트에서 파티 전원의 HP와 MP를 완전히 회복한다.'
    },
    1006: {
      name: '피닉스의 꼬리',
      subText: '부활',
      footerLeft: '동료 부활',
      description: '전설적인 새의 깃털. 쓰러진 동료를 적은 HP로 부활시킨다.'
    },
    2001: {
      name: '아이언 소드',
      subText: '공격력 +15',
      footerLeft: '기본 검',
      description: '표준적인 철검. 튼튼하고 믿음직하다.'
    },
    2002: {
      name: '스틸 세이버',
      subText: '공격력 +35',
      footerLeft: '예리함',
      description: '강철로 단조된 예리한 검. 가벼운 갑옷은 쉽게 베어버린다.'
    },
    2003: {
      name: '미스릴 대거',
      subText: '공격력 +25, 속도 +5',
      footerLeft: '경량',
      description: '미스릴로 만든 아름다운 단검. 매우 가볍고 다루기 쉽다.'
    },
    2004: {
      name: '나무 지팡이',
      subText: '마력 +10',
      footerLeft: '마법 도구',
      description: '참나무를 깎아 만든 단순한 지팡이. 마력을 약간 증폭시킨다.'
    },
    3001: {
      name: '가죽 조끼',
      subText: '방어력 +10',
      footerLeft: '경갑',
      description: '무두질한 가죽으로 만든 조끼. 기본적인 보호를 제공한다.'
    },
    3002: {
      name: '사슬 갑옷',
      subText: '방어력 +25',
      footerLeft: '중갑',
      description: '금속 고리를 엮어 만든 갑옷. 베기 공격에 대해 우수한 방어력을 제공한다.'
    },
    3003: {
      name: '실크 로브',
      subText: '방어력 +5, 마력 +15',
      footerLeft: '마법사 로브',
      description: '마법 실크로 짠 로브. 마법의 위력을 높이지만 물리 방어력은 낮다.'
    },
    4001: {
      name: '파워 링',
      subText: '힘 +5',
      footerLeft: '공격력 UP',
      description: '붉은 보석이 박힌 반지. 힘이 솟아나는 것을 느낀다.'
    },
    4002: {
      name: '프로텍트 링',
      subText: '방어력 +5',
      footerLeft: '방어력 UP',
      description: '푸른 보석이 박힌 반지. 희미한 보호의 오라를 방출한다.'
    },
    9001: {
      name: '월드 맵',
      subText: '다나 지역',
      footerLeft: '지도',
      description: '알려진 세계의 상세한 지도. 여행의 필수품.'
    },
    9002: {
      name: '녹슨 열쇠',
      subText: '오래된 철 열쇠',
      footerLeft: '잠금 해제',
      description: '폐허에서 발견한 낡고 녹슨 열쇠. 근처의 문을 열 수 있을지도 모른다.'
    }
  },
  skills: {
    101: {
      name: '슬래시',
      subText: '기본 공격',
      description: '무기로 빠르게 벤다. 적 하나에게 100% 물리 데미지를 준다.'
    },
    102: {
      name: '파워 스트라이크',
      subText: '강공격',
      description: '힘을 모아 강력한 일격을 날린다. 200% 물리 데미지를 주지만 명중률이 조금 낮다.'
    },
    201: {
      name: '파이어볼',
      subText: '화염 속성',
      description: '화염구를 던진다. 화염 속성 데미지를 주고 화상 상태로 만들 수 있다.'
    },
    202: {
      name: '아이스 니들',
      subText: '얼음 속성',
      description: '날카로운 고드름을 발사한다. 얼음 속성 데미지를 주고 속도를 낮춘다.'
    },
    203: {
      name: '썬더',
      subText: '광역 번개',
      description: '번개를 소환해 적 전체를 공격한다. 중급 번개 속성 데미지.'
    },
    301: {
      name: '힐',
      subText: 'HP 회복',
      description: '아군 하나의 HP를 중간 정도 회복한다.'
    },
    302: {
      name: '프로텍트',
      subText: '방어 UP',
      description: '3턴 동안 아군 하나의 물리 방어력을 증가시킨다.'
    },
    401: {
      name: '아이언 스킨',
      subText: '방어력 영구 증가',
      description: '물리 방어력이 영구적으로 10% 증가한다.'
    },
    402: {
      name: '마나 플로우',
      subText: 'MP 재생',
      description: '매 턴 종료 시 최대 MP의 5%를 회복한다.'
    }
  },
  status: {
    1: {
      name: '독',
      subText: '지속 피해',
      description: '턴 시작 시 데미지를 입는다. 전투 종료 후에도 지속된다.'
    },
    2: {
      name: '화상',
      subText: '지속 피해',
      description: '매 턴 화염 속성 데미지를 입는다. 공격력이 감소한다.'
    },
    3: {
      name: '동결',
      subText: '기절',
      description: '행동할 수 없다. 물리 데미지를 입으면 얼음이 깨지며 2배의 데미지를 입는다.'
    },
    4: {
      name: '마비',
      subText: '확률 기절',
      description: '매 턴 25% 확률로 행동할 수 없다.'
    },
    101: {
      name: '재생',
      subText: '자동 회복',
      description: '턴 시작 시 HP가 소량 회복된다.'
    },
    102: {
      name: '공격력 증가',
      subText: 'ATK UP',
      description: '물리 공격력이 증가한 상태.'
    },
    103: {
      name: '헤이스트',
      subText: 'SPD UP',
      description: '속도가 증가하여 턴이 더 빨리 돌아온다.'
    }
  }
}

