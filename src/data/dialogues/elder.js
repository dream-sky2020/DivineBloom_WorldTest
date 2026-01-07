import { say, choose, exec } from '@/game/dialogue/utils';
import { useQuestStore } from '@/stores/quest';

// Generator Function
export function* elderDialogue() {
    const questStore = useQuestStore();

    // 1. 检查是否已经完成了史莱姆任务
    if (questStore.hasFlag('quest_slime_completed')) {
        yield say('elder', 'dialogue.elder_complete_thanks');
        return;
    }

    // 2. 检查是否已经接受了任务
    if (questStore.hasFlag('quest_slime_accepted')) {
        // 假设我们在 items 中有 'slime_gel' (这里仅作模拟逻辑)
        // 真实情况可能通过 useInventoryStore().hasItem(...) 检查
        const hasSlimeGel = questStore.hasFlag('has_slime_gel_debug');

        if (hasSlimeGel) {
            yield say('elder', 'dialogue.elder_finish_quest');

            // 给予奖励事件
            yield exec(() => {
                questStore.addFlag('quest_slime_completed');
                questStore.removeFlag('quest_slime_accepted');
                console.log('Received Reward: 100 Gold');
            });

            yield say('elder', 'dialogue.elder_reward_given');
        } else {
            yield say('elder', 'dialogue.elder_waiting');
        }
        return;
    }

    // 3. 初始对话
    yield say('elder', 'dialogue.elder_greeting');
    yield say('elder', 'dialogue.elder_intro');

    // 选项分支
    const choice = yield choose('dialogue.elder_ask_help', [
        { label: 'dialogue.opt_accept', value: true },
        { label: 'dialogue.opt_refuse', value: false }
    ]);

    if (choice) {
        yield say('elder', 'dialogue.elder_happy');

        yield exec(() => {
            questStore.addFlag('quest_slime_accepted');
        });

        yield say('elder', 'dialogue.elder_instruction');
    } else {
        yield say('elder', 'dialogue.elder_sad');
    }
}

