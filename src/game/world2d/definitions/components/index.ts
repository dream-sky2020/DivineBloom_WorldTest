import { componentRegistry } from '../../registries/ComponentRegistry';

import { ActionDialogue, ActionTeleport, ActionCreateEntity, ActionEmitSignal } from './Actions';
import { AIConfig, AIState } from './AI';
import { AISensory } from './AISensory';
import { Animation } from './Animation';
import { Bounds } from './Bounds';
import { Bounce } from './Bounce';
import { Camera } from './Camera';
import { Children } from './Children';
import { Collider } from './Collider';
import { Commands } from './Commands';
import { DetectArea } from './DetectArea';
import { DamageDetect } from './DamageDetect';
import { DamageDetectable } from './DamageDetectable';
import { PortalDetect } from './PortalDetect';
import { PortalDetectable } from './PortalDetectable';
import { Portal } from './Portal';
import { Detectable } from './Detectable';
import { DetectInput } from './DetectInput';
import { Damage } from './Damage';
import { TriggerSignal } from './TriggerSignal';
import { MonsterSpawn } from './MonsterSpawn';
import { Monster } from './Monster';
import { Experience } from './Experience';
import { Health } from './Health';
import { Inspector } from './Inspector';
import { PlayerIntent } from './PlayerIntent';
import { PortalIntent } from './PortalIntent';
import { EnemyAIIntent } from './EnemyAIIntent';
import { LifeTime } from './LifeTime';
import { LocalTransform } from './LocalTransform';
import { MousePosition } from './MousePosition';
import { Motion } from './Motion';
import { MotionSteerProfile } from './MotionSteerProfile';
import { RawInput } from './RawInput';
import { Parent } from './Parent';
import { PathAI } from './PathAI';
import { Bullet } from './Bullet';
import { SceneTransition } from './Requests';
import { SceneConfig } from './SceneConfig';
import { Shape } from './Shape';
import { Sprite } from './Sprite';
import { CombatProgress } from './CombatProgress';
import { Timer } from './Timer';
import { Transform } from './Transform';
import { Trigger } from './Trigger';
import { Velocity } from './Velocity';
import { WaveEmitter } from './WaveEmitter';
import { Weapon } from './Weapon';
import { WeaponIntent } from './WeaponIntent';
import { WeaponSense } from './WeaponSense';
import { WorldTransform } from './WorldTransform';

// Register Core Components
const components = [
    ActionDialogue, ActionTeleport, ActionCreateEntity, ActionEmitSignal,
    AIConfig, AIState,
    AISensory,
    Animation,
    Bounds,
    Bounce,
    Camera,
    Children,
    Collider,
    Commands,
    DetectArea,
    DamageDetect,
    DamageDetectable,
    PortalDetect,
    PortalDetectable,
    Portal,
    Detectable,
    DetectInput,
    Damage,
    TriggerSignal,
    MonsterSpawn,
    Monster,
    Experience,
    Health,
    Inspector,
    PlayerIntent,
    PortalIntent,
    EnemyAIIntent,
    LifeTime,
    LocalTransform,
    MousePosition,
    Motion,
    MotionSteerProfile,
    RawInput,
    Parent,
    PathAI,
    Bullet,
    SceneTransition,
    SceneConfig,
    Shape,
    Sprite,
    CombatProgress,
    Timer,
    Transform,
    Trigger,
    Velocity,
    WaveEmitter,
    Weapon,
    WeaponIntent,
    WeaponSense,
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
export * from './AISensory';
export * from './Animation';
export * from './Bounds';
export * from './Bounce';
export * from './Camera';
export * from './Collider';
export * from './Commands';
export * from './DetectArea';
export * from './DamageDetect';
export * from './DamageDetectable';
export * from './PortalDetect';
export * from './PortalDetectable';
export * from './Portal';
export * from './Detectable';
export * from './DetectInput';
export * from './Damage';
export * from './TriggerSignal';
export * from './MonsterSpawn';
export * from './Monster';
export * from './Experience';
export * from './Health';
export * from './Inspector';
export * from './PlayerIntent';
export * from './PortalIntent';
export * from './EnemyAIIntent';
export * from './LifeTime';
export * from './MousePosition';
export * from './Motion';
export * from './MotionSteerProfile';
export * from './RawInput';
export * from './Bullet';
export * from './Requests';
export * from './SceneConfig';
export * from './Sprite';
export * from './CombatProgress';
export * from './Timer';
export * from './Trigger';
export * from './Velocity';
export * from './WaveEmitter';
export * from './Weapon';
export * from './WeaponIntent';
export * from './WeaponSense';
export * from './PathAI';
export * from './Transform';
export * from './Shape';
export * from '../enums/Shape';
export * from '../enums/Motion';
export * from './Parent';
export * from './LocalTransform';
export * from './WorldTransform';
export * from './Children';
export * from '../enums/SpriteMode';
export * from '../enums/InGameState';
