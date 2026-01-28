export default {
    // --- Common Materials (5000-5099) ---
    item_material_slime_gel: {
        id: "item_material_slime_gel",
        name: { zh: '史莱姆凝胶', 'zh-TW': '史萊姆凝膠', en: 'Slime Gel', ja: 'スライムジェル', ko: '슬라임 젤' },
        type: 'itemTypes.material',
        icon: 'icon_material_gel',
        tags: ['item_material', 'rarity_common', 'element_wood'],
        subText: { zh: '普通材料', 'zh-TW': '普通材料', en: 'Common Material', ja: '普通の素材', ko: '일반 재료' },
        footerLeft: 'itemTypes.material',
        price: 10,
        description: {
            zh: '史莱姆留下的粘稠液体。',
            'zh-TW': '史萊姆留下的粘稠液體。',
            en: 'Sticky liquid left by a slime.',
            ja: 'スライムが残した粘着性の液体。',
            ko: '슬라임이 남긴 끈적끈적한 액체.'
        }
    },
    item_material_bat_fang: {
        id: "item_material_bat_fang",
        name: { zh: '蝙蝠牙', 'zh-TW': '蝙蝠牙', en: 'Bat Fang', ja: 'コウモリの牙', ko: '박쥐 송곳니' },
        type: 'itemTypes.material',
        icon: 'icon_material_fang',
        tags: ['item_material', 'rarity_common', 'status_phys_attr'],
        subText: { zh: '普通材料', 'zh-TW': '普通材料', en: 'Common Material', ja: '普通の素材', ko: '일반 재료' },
        footerLeft: 'itemTypes.material',
        price: 15,
        description: {
            zh: '锋利的小尖牙。',
            'zh-TW': '鋒利的小尖牙。',
            en: 'A small, sharp fang.',
            ja: '鋭く小さな牙。',
            ko: '날카롭고 작은 송곳니.'
        }
    },
    item_material_wolf_pelt: {
        id: "item_material_wolf_pelt",
        name: { zh: '狼皮', 'zh-TW': '狼皮', en: 'Wolf Pelt', ja: '狼の皮', ko: '늑대 가죽' },
        type: 'itemTypes.material',
        icon: 'icon_material_pelt',
        tags: ['item_material', 'rarity_common', 'status_phys_attr'],
        subText: { zh: '普通材料', 'zh-TW': '普通材料', en: 'Common Material', ja: '普通の素材', ko: '일반 재료' },
        footerLeft: 'itemTypes.material',
        price: 30,
        description: {
            zh: '粗糙但保暖的毛皮。',
            'zh-TW': '粗糙但保暖的毛皮。',
            en: 'Rough but warm fur.',
            ja: '粗いが暖かい毛皮。',
            ko: '거칠지만 따뜻한 모피.'
        }
    },
    item_material_iron_scrap: {
        id: "item_material_iron_scrap",
        name: { zh: '铁块', 'zh-TW': '鐵塊', en: 'Iron Scrap', ja: '鉄くず', ko: '철 조각' },
        type: 'itemTypes.material',
        icon: 'icon_material_metal',
        tags: ['item_material', 'rarity_common', 'element_metal'],
        subText: { zh: '普通材料', 'zh-TW': '普通材料', en: 'Common Material', ja: '普通の素材', ko: '일반 재료' },
        footerLeft: 'itemTypes.material',
        price: 40,
        description: {
            zh: '从铠甲上掉落的金属碎片。',
            'zh-TW': '從鎧甲上掉落的金屬碎片。',
            en: 'Metal scrap fallen from armor.',
            ja: '鎧から落ちた金属の破片。',
            ko: '갑옷에서 떨어진 금속 파편.'
        }
    },

    // --- Rare Materials (5100-5199) ---
    item_material_divine_shard: {
        id: "item_material_divine_shard",
        name: { zh: '神圣碎片', 'zh-TW': '神聖碎片', en: 'Divine Shard', ja: '神聖な欠片', ko: '신성한 조각' },
        type: 'itemTypes.material',
        icon: 'icon_material_shard',
        tags: ['item_material', 'rarity_rare', 'element_divine'],
        subText: { zh: '稀有材料', 'zh-TW': '稀有材料', en: 'Rare Material', ja: 'レア素材', ko: '희귀 재료' },
        footerLeft: 'itemTypes.material',
        price: 500,
        description: {
            zh: '蕴含微弱神力的碎片。',
            'zh-TW': '蘊含微弱神力的碎片。',
            en: 'A shard containing faint divine power.',
            ja: 'かすかな神の力を宿した欠片。',
            ko: '약한 신성한 힘이 깃든 조각.'
        }
    },
    item_material_void_dust: {
        id: "item_material_void_dust",
        name: { zh: '虚空粉尘', 'zh-TW': '虛空粉塵', en: 'Void Dust', ja: '虚空の塵', ko: '공허의 먼지' },
        type: 'itemTypes.material',
        icon: 'icon_material_dust',
        tags: ['item_material', 'rarity_rare', 'element_void'],
        subText: { zh: '稀有材料', 'zh-TW': '稀有材料', en: 'Rare Material', ja: 'レア素材', ko: '희귀 재료' },
        footerLeft: 'itemTypes.material',
        price: 500,
        description: {
            zh: '来自虚空的神秘物质。',
            'zh-TW': '來自虛空的神秘物質。',
            en: 'Mysterious substance from the void.',
            ja: '虚空から来た神秘的な物質。',
            ko: '공허에서 온 신비로운 물질.'
        }
    },
    item_material_chaos_crystal: {
        id: "item_material_chaos_crystal",
        name: { zh: '混沌结晶', 'zh-TW': '混沌結晶', en: 'Chaos Crystal', ja: '混沌の結晶', ko: '혼돈의 결정' },
        type: 'itemTypes.material',
        icon: 'icon_material_crystal',
        tags: ['item_material', 'rarity_epic', 'element_chaos'],
        subText: { zh: '史诗材料', 'zh-TW': '史詩材料', en: 'Epic Material', ja: 'エピック素材', ko: '에픽 재료' },
        footerLeft: 'itemTypes.material',
        price: 800,
        description: {
            zh: '充满混乱能量的晶体。',
            'zh-TW': '充滿混亂能量的晶體。',
            en: 'A crystal filled with chaotic energy.',
            ja: '混沌としたエネルギーに満ちた結晶。',
            ko: '혼돈의 에너지로 가득 찬 결정.'
        }
    },
    item_material_plague_essence: {
        id: "item_material_plague_essence",
        name: { zh: '瘟疫精华', 'zh-TW': '瘟疫精華', en: 'Plague Essence', ja: '疫病のエッセンス', ko: '역병의 정수' },
        type: 'itemTypes.material',
        icon: 'icon_material_essence',
        tags: ['item_material', 'rarity_epic', 'status_negative', 'element_wood'],
        subText: { zh: '史诗材料', 'zh-TW': '史詩材料', en: 'Epic Material', ja: 'エピック素材', ko: '에픽 재료' },
        footerLeft: 'itemTypes.material',
        price: 800,
        description: {
            zh: '极其危险的浓缩病原体。',
            'zh-TW': '極其危險的濃縮病原體。',
            en: 'Extremely dangerous concentrated pathogen.',
            ja: '非常に危険な濃縮された病原体。',
            ko: '매우 위험한 농축된 병원체.'
        }
    },
    item_material_essence: {
        id: "item_material_essence",
        name: { zh: '精灵精华', 'zh-TW': '精靈精華', en: 'Sprite Essence', ja: '精霊のエッセンス', ko: '정령의 정수' },
        type: 'itemTypes.material',
        icon: 'icon_material_essence_rare',
        tags: ['item_material', 'rarity_rare', 'element_wind'],
        subText: { zh: '稀有材料', 'zh-TW': '稀有材料', en: 'Rare Material', ja: 'レア素材', ko: '희귀 재료' },
        footerLeft: 'itemTypes.material',
        price: 300,
        description: {
            zh: '从精灵身上提取的精华物质。',
            'zh-TW': '從精靈身上提取的精華物質。',
            en: 'Essence extracted from sprites.',
            ja: '精霊から抽出されたエッセンス。',
            ko: '정령에게서 추출한 정수.'
        }
    }

}
