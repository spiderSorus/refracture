// src/ecs/entities/art/backgroundObjects.js
import {
    Position, Rotation, Renderable, Parallax, BackgroundTag,
    GravityExempt, Spin, Drift, EffectLayer, EntityType
} from '../../components/index';

/**
 * Creates a floating, rotating box entity.
 */
export const createFloatingBox = (x, y, config = {}) => {
    const size = config.size || 100;
    const w = config.width || size;
    const h = config.height || size;
    const layer = config.layer || 'bg_watercolor';
    const renderType = config.renderType || 'hard_shape';

    const components = [
        Position(x, y),
        Rotation(config.rotation || 0),
        BackgroundTag(),
        EntityType('BG_BOX'),
        GravityExempt(),
        Parallax(config.parallax ?? 0.5),
        EffectLayer(layer, config.zIndex || 0),
        Renderable({
            BASE: {
                type: renderType,
                shape: 'rect',
                width: w,
                height: h,
                color: config.color ?? 0xaa44ff,
                alpha: config.alpha ?? 0.4,
                strokeColor: config.strokeColor,
                strokeWidth: config.strokeWidth
            }
        })
    ];

    if (config.spin) {
        components.push(Spin(config.spin));
    }

    if (config.drift) {
        components.push(Drift(config.drift));
    }

    return components;
};

/**
 * Creates a floating geometric shard (triangle).
 */
export const createFloatingShard = (x, y, config = {}) => {
    const size = config.size || 80;
    const layer = config.layer || 'bg_watercolor';

    const components = [
        Position(x, y),
        Rotation(config.rotation || 0),
        BackgroundTag(),
        EntityType('BG_SHARD'),
        GravityExempt(),
        Parallax(config.parallax ?? 0.4),
        EffectLayer(layer, config.zIndex || 0),
        Renderable({
            BASE: {
                type: config.renderType || 'triangle',
                width: size,
                height: size,
                color: config.color ?? 0x00ffcc,
                alpha: config.alpha ?? 0.5
            }
        })
    ];

    if (config.spin) {
        components.push(Spin(config.spin));
    }

    if (config.drift) {
        components.push(Drift(config.drift));
    }

    return components;
};

/**
 * Creates a floating orb or bubble.
 */
export const createFloatingOrb = (x, y, config = {}) => {
    const radius = config.radius || (config.size ? config.size / 2 : 50);
    const layer = config.layer || 'bg_watercolor';

    const components = [
        Position(x, y),
        BackgroundTag(),
        EntityType('BG_ORB'),
        GravityExempt(),
        Parallax(config.parallax ?? 0.3),
        EffectLayer(layer, config.zIndex || 0),
        Renderable({
            BASE: {
                type: config.renderType || 'circle',
                radius: radius,
                color: config.color ?? 0x4488ff,
                alpha: config.alpha ?? 0.4
            }
        })
    ];

    if (config.drift) {
        components.push(Drift(config.drift));
    }

    return components;
};

/**
 * Creates an architectural column or vertical beam.
 */
export const createPillar = (x, y, config = {}) => {
    const w = config.width || 120;
    const h = config.height || 4000;
    const layer = config.layer || 'bg_watercolor';

    return [
        Position(x, y),
        Rotation(config.rotation || 0),
        BackgroundTag(),
        EntityType('BG_PILLAR'),
        GravityExempt(),
        Parallax(config.parallax ?? 0.2),
        EffectLayer(layer, config.zIndex || 0),
        Renderable({
            BASE: {
                type: config.renderType || 'watercolor',
                shape: 'rect',
                width: w,
                height: h,
                color: config.color ?? 0x224466,
                alpha: config.alpha ?? 0.2,
                layers: 6
            }
        })
    ];
};
