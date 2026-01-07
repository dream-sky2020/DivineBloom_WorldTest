import { say } from '@/game/dialogue/utils';

export function* welcome() {
    yield say('guide', 'dialogue.welcome');
}

export function* elder_greeting() {
    yield say('elder', 'dialogue.elder_greeting');
}
