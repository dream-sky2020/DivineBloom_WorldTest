import { z } from 'zod';
import { world } from '@world2d/world';
import { IEntityDefinition } from '../interface/IEntity';
import {
    Follow, FOLLOW_INSPECTOR_FIELDS,
    Transform, TRANSFORM_INSPECTOR_FIELDS,
    Weapon, WEAPON_INSPECTOR_FIELDS,
    WeaponIntent,
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
    bulletDetectCcdEnabled: z.boolean().optional(),
    bulletDetectCcdMinDistance: z.number().optional(),
    bulletDetectCcdBuffer: z.number().optional(),
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
    const dir = entity?.weapon?.fireDirection || entity?.weaponIntent?.aimDirection;
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
            follow: Follow.create({
                target: params.ownerTarget || 'player',
                speed: params.followSpeed,
                offset: { x: params.orbitRadius, y: 0 },
                range: { x: params.followRangeX, y: params.followRangeY },
                linearAccelFactor: params.linearAccelFactor,
                orbitAngle: params.orbitAngle,
                orbitSpeed: params.orbitSpeed
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
                bulletDetectCcdEnabled: weaponConfig.bulletDetectCcdEnabled,
                bulletDetectCcdMinDistance: weaponConfig.bulletDetectCcdMinDistance,
                bulletDetectCcdBuffer: weaponConfig.bulletDetectCcdBuffer,
                bulletShape: weaponConfig.bulletShape,
                attackMode: weaponConfig.attackMode,
                attackArcDeg: weaponConfig.attackArcDeg,
                attackAngleOffsetDeg: weaponConfig.attackAngleOffsetDeg,
                blockIfOutOfRange: weaponConfig.blockIfOutOfRange
            }),
            weaponIntent: WeaponIntent.create(),
            sprite: Sprite.create(params.spriteId, {
                scale: params.spriteScale,
                tint: params.spriteTint
            })
        });

        root.inspector = Inspector.create({
            fields: [
                ...(TRANSFORM_INSPECTOR_FIELDS || []),
                ...(FOLLOW_INSPECTOR_FIELDS || []),
                ...(WEAPON_INSPECTOR_FIELDS || []),
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
            ownerTarget: entity.follow?.target ?? 'player',
            orbitRadius: entity.follow?.offset?.x ?? 40,
            orbitAngle: entity.follow?.orbitAngle ?? 0,
            orbitSpeed: entity.follow?.orbitSpeed ?? 0,
            followSpeed: entity.follow?.speed ?? 300,
            followRangeX: entity.follow?.range?.x ?? 0,
            followRangeY: entity.follow?.range?.y ?? 0,
            linearAccelFactor: entity.follow?.linearAccelFactor ?? 0,
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
                bulletDetectCcdEnabled: entity.weapon.bulletDetectCcdEnabled,
                bulletDetectCcdMinDistance: entity.weapon.bulletDetectCcdMinDistance,
                bulletDetectCcdBuffer: entity.weapon.bulletDetectCcdBuffer,
                bulletShape: entity.weapon.bulletShape,
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

