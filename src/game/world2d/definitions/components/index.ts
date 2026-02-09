import { componentRegistry } from '../../registries/ComponentRegistry';

import { ActionDialogue, ActionTeleport } from './Actions';
import { AIConfig, AIState } from './AI';
import { Animation } from './Animation';
import { Bounds } from './Bounds';
import { Camera } from './Camera';
import { Children } from './Children';
import { Collider } from './Collider';
import { Commands } from './Commands';
import { DetectArea } from './DetectArea';
import { Detectable } from './Detectable';
import { DetectInput } from './DetectInput';
import { Follow } from './Follow';
import { Health } from './Health';
import { HordeAI } from './HordeAI';
import { Inspector } from './Inspector';
import { LifeTime } from './LifeTime';
import { LocalTransform } from './LocalTransform';
import { MousePosition } from './MousePosition';
import { Parent } from './Parent';
import { PathAI } from './PathAI';
import { Projectile } from './Projectile';
import { SceneTransition } from './Requests';
import { SceneConfig } from './SceneConfig';
import { Shape } from './Shape';
import { Sprite } from './Sprite';
import { Timer } from './Timer';
import { Transform } from './Transform';
import { Trigger } from './Trigger';
import { Velocity } from './Velocity';
import { Weapon } from './Weapon';
import { WeaponIntent } from './WeaponIntent';
import { WorldTransform } from './WorldTransform';

// Register Core Components
const components = [
    ActionDialogue, ActionTeleport,
    AIConfig, AIState,
    Animation,
    Bounds,
    Camera,
    Children,
    Collider,
    Commands,
    DetectArea,
    Detectable,
    DetectInput,
    Follow,
    Health,
    HordeAI,
    Inspector,
    LifeTime,
    LocalTransform,
    MousePosition,
    Parent,
    PathAI,
    Projectile,
    SceneTransition,
    SceneConfig,
    Shape,
    Sprite,
    Timer,
    Transform,
    Trigger,
    Velocity,
    Weapon,
    WeaponIntent,
    WorldTransform
];

components.forEach(c => {
    if (c && typeof c === 'object' && 'name' in c && 'schema' in c) {
        componentRegistry.register(c as any);
    }
});

// Re-export everything
export * from './Actions';
export * from './AI';
export * from './Animation';
export * from './Bounds';
export * from './Camera';
export * from './Collider';
export * from './Commands';
export * from './DetectArea';
export * from './Detectable';
export * from './DetectInput';
export * from './Follow';
export * from './Health';
export * from './Inspector';
export * from './LifeTime';
export * from './MousePosition';
export * from './Projectile';
export * from './Requests';
export * from './SceneConfig';
export * from './Sprite';
export * from './Timer';
export * from './Trigger';
export * from './Velocity';
export * from './Weapon';
export * from './WeaponIntent';
export * from './HordeAI';
export * from './PathAI';
export * from './Transform';
export * from './Shape';
export * from '../enums/Shape';
export * from './Parent';
export * from './LocalTransform';
export * from './WorldTransform';
export * from './Children';
export * from '../enums/SpriteMode';
