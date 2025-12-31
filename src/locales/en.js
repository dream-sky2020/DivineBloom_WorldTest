export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    back: 'Back',
    close: 'Close',
    emptySlot: 'Empty Slot',
    unknown: 'Unknown'
  },
  menu: {
    start: 'Start Game',
    continue: 'Continue',
    settings: 'Settings',
    exit: 'Exit Game'
  },
  system: {
    language: 'Language',
    volume: 'Volume',
    save: 'Save Data',
    load: 'Load Data'
  },
  panels: {
    inventory: 'Inventory',
    equipment: 'Equipment',
    skills: 'Skills',
    status: 'Status',
    shop: 'Shop',
    encyclopedia: 'Encyclopedia',
    thank: 'Credits',
    data: 'Data'
  },
  stats: {
    hp: 'HP',
    mp: 'MP',
    atk: 'Attack',
    def: 'Defense',
    matk: 'M.Attack',
    mdef: 'M.Defense',
    agi: 'Agility',
    luck: 'Luck'
  },
  roles: {
    swordsman: 'Swordsman',
    gunner: 'Gunner',
    mage: 'Mage',
    brawler: 'Brawler'
  },
  elements: {
    fire: 'Fire',
    ice: 'Ice',
    lightning: 'Lightning',
    light: 'Light',
    windLight: 'Wind/Light'
  },
  weapons: {
    sword: 'Sword',
    rifle: 'Rifle',
    book: 'Book',
    gauntlets: 'Gauntlets'
  },
  itemTypes: {
    consumable: 'Consumable',
    weapon: 'Weapon',
    armor: 'Armor',
    accessory: 'Accessory',
    keyItem: 'Key Item'
  },
  skillTypes: {
    active: 'Active',
    passive: 'Passive'
  },
  skillCategories: {
    physical: 'Physical',
    magic: 'Magic',
    support: 'Support',
    passive: 'Passive'
  },
  statusTypes: {
    buff: 'Buff',
    debuff: 'Debuff'
  },
  labels: {
    element: 'Element',
    weapon: 'Weapon',
    role: 'Role',
    type: 'Type',
    effect: 'Effect',
    category: 'Category',
    cost: 'Cost'
  },
  dev: {
    title: 'Developer Operations Panel',
    systemSwitcher: 'System Switcher',
    debugActions: 'Debug Actions',
    systems: {
      mainMenu: 'Main Menu (Start Screen)',
      listMenu: 'Menu System (ListMenu)',
      shop: 'Shop System',
      encyclopedia: 'Encyclopedia System',
      battle: 'Battle System (WIP)',
      worldMap: 'World Map System'
    },
    actions: {
      addGold: 'Add 1000 Gold',
      logState: 'Log State'
    }
  },
  worldMap: {
    position: 'Position',
    lastInput: 'Last Input',
    moveControls: 'Move: WASD / Arrow Keys (Shift = faster)'
  },
  shop: {
    title: 'Weapon Shop',
    welcome: 'Welcome, traveler! Take a look at my wares.',
    keeperSpeech: 'I have the finest swords in the kingdom!',
    buy: 'Buy',
    yourGold: 'Your Gold',
    exit: 'Exit Shop'
  },
  mainMenu: {
    title: 'Sacred Colors Unleashed',
    subTitlePrefix: '~Prologue~',
    subTitleMain: 'Vicious Hunger',
    copyright: 'Copyright © 2024 Developer'
  },
  listMenu: {
    gold: 'Gold',
    time: 'Time'
  },
  encyclopedia: {
    description: 'Description',
    baseStats: 'Base Stats'
  },
  inventory: {
    tabs: {
        all: 'All'
    },
    views: {
        list: 'List View',
        card: 'Card View',
        grid: 'Grid View'
    }
  },
  saveLoad: {
    file: 'File',
    empty: 'Empty',
    level: 'Level',
    gold: 'Gold',
    date: 'Date',
    delete: 'Delete',
    save: 'Save',
    load: 'Load',
    playTime: 'Play Time',
    location: 'Location'
  },
  skills: {
    tabs: {
        all: 'All Skills'
    },
    cost: 'Cost',
    target: 'Target',
    type: 'Type',
    unequip: 'Unequip',
    upgrade: 'Upgrade',
    locked: 'Locked',
    equipped: 'EQUIPPED'
  },
  systemSettings: {
    gameplay: 'Gameplay',
    textSpeed: 'Text Speed',
    autoSave: 'Auto Save',
    toTitle: 'To Title',
    music: 'Music',
    soundEffects: 'Sound Effects',
    masterVolume: 'Master Volume',
    speeds: {
        slow: 'Slow',
        normal: 'Normal',
        fast: 'Fast'
    }
  },
  thank: {
    title: 'Credits',
    devTeam: 'Development Team',
    specialThanks: 'Special Thanks',
    footer: 'Thank you for playing!'
  },
  equipment: {
    comparison: 'Comparison',
    weight: 'Weight',
    selectWeapon: 'Select Weapon',
    itemsAvailable: 'Items Available',
    equipped: 'EQUIPPED'
  },
  characters: {
    1: {
      name: 'Alphen',
      description: 'A mysterious swordsman who has lost his memories and ability to feel pain. Wields a blazing sword.'
    },
    2: {
      name: 'Shionne',
      description: "A woman afflicted with 'Thorns' that cause pain to anyone she touches. An excellent marksman and healer."
    },
    3: {
      name: 'Rinwell',
      description: 'A young mage who is the last of her clan. Can cast powerful astral artes but is physically weak.'
    },
    4: {
      name: 'Law',
      description: 'A hot-blooded martial artist who fights with his fists and feet. Exceptionally fast and hits hard.'
    }
  },
  items: {
    1001: {
      name: 'Potion',
      subText: 'Restores 50 HP',
      footerLeft: 'Restores HP',
      description: 'A basic medicinal brew made from herbs. Restores a small amount of health. Essential for any adventurer.'
    },
    1002: {
      name: 'High Potion',
      subText: 'Restores 150 HP',
      footerLeft: 'Restores HP++',
      description: 'A potent medicinal brew. Restores a moderate amount of health.'
    },
    1003: {
      name: 'Ether',
      subText: 'Restores 20 MP',
      footerLeft: 'Restores MP',
      description: 'A magical liquid that restores mental energy. Slightly bitter taste.'
    },
    1004: {
      name: 'Antidote',
      subText: 'Cures Poison',
      footerLeft: 'Cures Poison',
      description: 'An herbal antidote used to treat poison. Works instantly.'
    },
    1005: {
      name: 'Tent',
      subText: 'Full Party Restore',
      footerLeft: 'Full Rest',
      description: 'A portable shelter. Allows the entire party to rest and fully recover HP and MP at save points.'
    },
    1006: {
      name: 'Phoenix Down',
      subText: 'Revive',
      footerLeft: 'Revive Ally',
      description: "Tail feather of a legendary bird. Revives a KO'd ally with small amount of HP."
    },
    2001: {
      name: 'Iron Sword',
      subText: 'ATK +15',
      footerLeft: 'Basic Sword',
      description: 'A standard issue iron sword. Reliable and sturdy.'
    },
    2002: {
      name: 'Steel Saber',
      subText: 'ATK +35',
      footerLeft: 'Sharp Edge',
      description: 'A sharp blade forged from steel. Cuts through light armor with ease.'
    },
    2003: {
      name: 'Mythril Dagger',
      subText: 'ATK +25, SPD +5',
      footerLeft: 'Lightweight',
      description: 'A beautifully crafted dagger made of Mythril. Very light and easy to handle.'
    },
    2004: {
      name: 'Wooden Staff',
      subText: 'MAG +10',
      footerLeft: 'Mage Tool',
      description: 'A simple staff carved from oak. Channels magical energy slightly.'
    },
    3001: {
      name: 'Leather Vest',
      subText: 'DEF +10',
      footerLeft: 'Light Armor',
      description: 'A vest made of tanned leather. Offers basic protection.'
    },
    3002: {
      name: 'Chainmail',
      subText: 'DEF +25',
      footerLeft: 'Medium Armor',
      description: 'Armor made of interlocking metal rings. Good protection against slashing attacks.'
    },
    3003: {
      name: 'Silk Robe',
      subText: 'DEF +5, MAG +15',
      footerLeft: 'Mage Armor',
      description: 'A robe woven from enchanted silk. Boosts magical power but offers little physical protection.'
    },
    4001: {
      name: 'Power Ring',
      subText: 'STR +5',
      footerLeft: 'Strength',
      description: 'A ring set with a red gemstone. The wearer feels a surge of strength.'
    },
    4002: {
      name: 'Protect Ring',
      subText: 'DEF +5',
      footerLeft: 'Defense',
      description: 'A ring set with a blue gemstone. It emits a faint protective aura.'
    },
    9001: {
      name: 'World Map',
      subText: 'Dahna Region',
      footerLeft: 'Navigation',
      description: 'A detailed map of the known world. Essential for travel.'
    },
    9002: {
      name: 'Rusty Key',
      subText: 'Old Iron Key',
      footerLeft: 'Unlocks Door',
      description: 'An old, rusty key found in the ruins. It might open a nearby door.'
    }
  },
  skills: {
    101: {
      name: 'Slash',
      subText: 'Basic Attack',
      description: 'A swift slash with a weapon. Deals 100% Physical Damage to a single enemy.'
    },
    102: {
      name: 'Power Strike',
      subText: 'Heavy Damage',
      description: 'A powerful charged attack. Deals 200% Physical Damage but has a chance to miss.'
    },
    201: {
      name: 'Fireball',
      subText: 'Fire Dmg',
      description: 'Hurls a ball of fire at an enemy. Inflicts Fire Damage and may cause Burn.'
    },
    202: {
      name: 'Ice Shard',
      subText: 'Ice Dmg',
      description: 'Shoots sharp icicles. Deals Ice Damage and lowers target Speed.'
    },
    203: {
      name: 'Thunder',
      subText: 'AoE Lightning',
      description: 'Calls down lightning to strike all enemies. Moderate Lightning Damage.'
    },
    301: {
      name: 'Heal',
      subText: 'Restore HP',
      description: 'Restores a moderate amount of HP to a single ally.'
    },
    302: {
      name: 'Protect',
      subText: 'Buff DEF',
      description: "Increases an ally's Physical Defense for 3 turns."
    },
    401: {
      name: 'Iron Skin',
      subText: 'DEF Up',
      description: 'Permanently increases Physical Defense by 10%.'
    },
    402: {
      name: 'Mana Flow',
      subText: 'MP Regen',
      description: 'Regenerates 5% of Max MP at the end of each turn.'
    }
  },
  status: {
    1: {
      name: 'Poison',
      subText: 'DoT',
      description: 'Takes damage at the start of each turn. Persists after battle.'
    },
    2: {
      name: 'Burn',
      subText: 'DoT',
      description: 'Takes Fire damage each turn. Lowers Attack power.'
    },
    3: {
      name: 'Freeze',
      subText: 'Stun',
      description: 'Cannot act. Taking Physical damage will shatter the ice and deal double damage.'
    },
    4: {
      name: 'Paralysis',
      subText: 'Chance Stun',
      description: '25% chance to be unable to act each turn.'
    },
    101: {
      name: 'Regen',
      subText: 'Heal',
      description: 'Restores a small amount of HP at the start of each turn.'
    },
    102: {
      name: 'Attack Up',
      subText: 'ATK +',
      description: 'Increases Physical Attack power.'
    },
    103: {
      name: 'Haste',
      subText: 'SPD +',
      description: 'Increases Speed, allowing turns to come around faster.'
    }
  }
}
