import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    Motion, MotionMode, MOTION_INSPECTOR_FIELDS,
    Transform, TRANSFORM_INSPECTOR_FIELDS,
    Weapon, WEAPON_INSPECTOR_FIELDS,
    WeaponIntent,
    WeaponSense, WEAPON_SENSE_INSPECTOR_FIELDS,
    Sprite, SPRITE_INSPECTOR_FIELDS,
    Inspector, EDITOR_INSPECTOR_FIELDS
} from '@components';

const weaponConfigSchema = z.object({
    weaponType: z.string().optional(),
    damage: z.number().optional(),
    fireRate: z.number().optional(),
    bulletSpeed: z.number().optional(),
    bulletColor: z.string().optional(),
    bulletLifeTime: z.number().optional(),
    bulletRadius: z.number().optional(),
    bulletSpriteId: z.string().optional(),
    bulletSpriteScale: z.number().optional(),
    damageDetectCcdEnabled: z.boolean().optional(),
    damageDetectCcdMinDistance: z.number().optional(),
    damageDetectCcdBuffer: z.number().optional(),
    bulletShape: z.object({
        type: z.string().optional(),
        radius: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        rotation: z.number().optional(),
        offsetX: z.number().optional(),
        offsetY: z.number().optional(),
        p1: z.object({ x: z.number(), y: z.number() }).optional(),
        p2: z.object({ x: z.number(), y: z.number() }).optional()
    }).optional(),
    projectileCount: z.number().optional(),
    projectileSpreadDeg: z.number().optional(),
    attackMode: z.string().optional(),
    attackArcDeg: z.number().optional(),
    attackAngleOffsetDeg: z.number().optional(),
    blockIfOutOfRange: z.boolean().optional()
});

const WeaponEntitySchema = z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    name: z.string().optional().default('Weapon'),
    ownerTarget: z.string().optional().default('player'),
    orbitRadius: z.number().optional().default(40),
    orbitAngle: z.number().optional().default(0),
    orbitSpeed: z.number().optional().default(0),
    followSpeed: z.number().optional().default(300),
    followRangeX: z.number().optional().default(0),
    followRangeY: z.number().optional().default(0),
    linearAccelFactor: z.number().optional().default(0),
    spriteId: z.string().optional().default('particle_3'),
    spriteScale: z.number().optional().default(0.5),
    spriteTint: z.string().optional().default('#ffffff'),
    weaponConfig: weaponConfigSchema.optional()
});

export type WeaponEntityData = z.infer<typeof WeaponEntitySchema>;

export function getWeaponFireDirection(entity: any): { x: number; y: number } | null {
    const dir = entity?.weapon?.fireDirection || entity?.weaponIntent?.attackDirection;
    if (!dir) return null;
    const len = Math.hypot(dir.x, dir.y);
    if (!len) return null;
    return { x: dir.x / len, y: dir.y / len };
}

function rotateOffset(x: number, y: number, angle: number) {
    if (!angle) return { x, y };
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

export const WeaponEntity: IEntityDefinition<typeof WeaponEntitySchema> = {
    type: 'weapon',
    name: '武器',
    order: 20,
    creationIndex: 0,
    schema: WeaponEntitySchema,
    create(data: Partial<WeaponEntityData> = {}) {
        const params = WeaponEntitySchema.parse(data);
        const target = params.ownerTarget === 'player'
            ? world.with('player', 'transform').first
            : null;

        const rotated = rotateOffset(params.orbitRadius, 0, params.orbitAngle);
        const initialX = params.x ?? (target?.transform?.x ?? 0) + rotated.x;
        const initialY = params.y ?? (target?.transform?.y ?? 0) + rotated.y;

        const weaponConfig = params.weaponConfig || {};

        const root = world.add({
            type: 'weapon',
            name: params.name,
            tags: ['weapon'],
            transform: Transform.create(initialX, initialY),
            motion: Motion.create({
                enabled: true,
                mode: Math.abs(params.orbitSpeed || 0) > 0 ? MotionMode.ORBIT : MotionMode.FOLLOW,
                maxSpeed: params.followSpeed,
                distanceSpeedFactor: params.linearAccelFactor,
                deadZoneAxis: {
                    x: params.followRangeX,
                    y: params.followRangeY
                },
                target: {
                    entityId: params.ownerTarget || 'player',
                    offset: { x: params.orbitRadius, y: 0 }
                },
                orbit: {
                    radius: params.orbitRadius,
                    angle: params.orbitAngle,
                    angularSpeed: Math.abs(params.orbitSpeed || 0),
                    clockwise: (params.orbitSpeed || 0) < 0
                }
            }),
            weapon: Weapon.create({
                weaponType: weaponConfig.weaponType,
                damage: weaponConfig.damage,
                fireRate: weaponConfig.fireRate,
                bulletSpeed: weaponConfig.bulletSpeed,
                bulletColor: weaponConfig.bulletColor,
                bulletLifeTime: weaponConfig.bulletLifeTime,
                bulletRadius: weaponConfig.bulletRadius,
                bulletSpriteId: weaponConfig.bulletSpriteId,
                bulletSpriteScale: weaponConfig.bulletSpriteScale,
                damageDetectCcdEnabled: weaponConfig.damageDetectCcdEnabled,
                damageDetectCcdMinDistance: weaponConfig.damageDetectCcdMinDistance,
                damageDetectCcdBuffer: weaponConfig.damageDetectCcdBuffer,
                bulletShape: weaponConfig.bulletShape,
                projectileCount: weaponConfig.projectileCount,
                projectileSpreadDeg: weaponConfig.projectileSpreadDeg,
                attackMode: weaponConfig.attackMode,
                attackArcDeg: weaponConfig.attackArcDeg,
                attackAngleOffsetDeg: weaponConfig.attackAngleOffsetDeg,
                blockIfOutOfRange: weaponConfig.blockIfOutOfRange
            }),
            weaponIntent: WeaponIntent.create(),
            weaponSense: WeaponSense.create(),
            sprite: Sprite.create(params.spriteId, {
                scale: params.spriteScale,
                tint: params.spriteTint
            })
        });

        root.inspector = Inspector.create({
            fields: [
                ...(TRANSFORM_INSPECTOR_FIELDS || []),
                ...(MOTION_INSPECTOR_FIELDS || []),
                ...(WEAPON_INSPECTOR_FIELDS || []),
                ...(WEAPON_SENSE_INSPECTOR_FIELDS || []),
                ...(SPRITE_INSPECTOR_FIELDS || []),
                ...(EDITOR_INSPECTOR_FIELDS || [])
            ]
        });

        return root;
    },
    serialize(entity: any) {
        return {
            x: entity.transform?.x ?? 0,
            y: entity.transform?.y ?? 0,
            name: entity.name ?? 'Weapon',
            ownerTarget: entity.motion?.target?.entityId ?? 'player',
            orbitRadius: entity.motion?.orbit?.radius ?? entity.motion?.target?.offset?.x ?? 40,
            orbitAngle: entity.motion?.orbit?.angle ?? 0,
            orbitSpeed: (entity.motion?.orbit?.clockwise ? -1 : 1) * (entity.motion?.orbit?.angularSpeed ?? 0),
            followSpeed: entity.motion?.maxSpeed ?? 300,
            followRangeX: entity.motion?.deadZoneAxis?.x ?? 0,
            followRangeY: entity.motion?.deadZoneAxis?.y ?? 0,
            linearAccelFactor: entity.motion?.distanceSpeedFactor ?? 0,
            spriteId: entity.sprite?.id ?? 'rect',
            spriteScale: entity.sprite?.scale ?? 0.5,
            spriteTint: entity.sprite?.tint ?? '#ffffff',
            weaponConfig: entity.weapon ? {
                weaponType: entity.weapon.weaponType,
                damage: entity.weapon.damage,
                fireRate: entity.weapon.fireRate,
                bulletSpeed: entity.weapon.bulletSpeed,
                bulletColor: entity.weapon.bulletColor,
                bulletLifeTime: entity.weapon.bulletLifeTime,
                bulletRadius: entity.weapon.bulletRadius,
                bulletSpriteId: entity.weapon.bulletSpriteId,
                bulletSpriteScale: entity.weapon.bulletSpriteScale,
                damageDetectCcdEnabled: entity.weapon.damageDetectCcdEnabled,
                damageDetectCcdMinDistance: entity.weapon.damageDetectCcdMinDistance,
                damageDetectCcdBuffer: entity.weapon.damageDetectCcdBuffer,
                bulletShape: entity.weapon.bulletShape,
                projectileCount: entity.weapon.projectileCount,
                projectileSpreadDeg: entity.weapon.projectileSpreadDeg,
                attackMode: entity.weapon.attackMode,
                attackArcDeg: entity.weapon.attackArcDeg,
                attackAngleOffsetDeg: entity.weapon.attackAngleOffsetDeg,
                blockIfOutOfRange: entity.weapon.blockIfOutOfRange
            } : undefined
        };
    },
    deserialize(data: any) {
        return this.create(data);
    }
};

