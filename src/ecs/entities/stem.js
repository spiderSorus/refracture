import { 
    Position, Velocity, Rotation, Renderable, Collider, 
    PlatformTag, EntityType, Mass, ZLayer, Parent, StaticTag,
    AnchorTag
} from '../components/index';

/**
 * Creates a Stem entity.
 * 
 * @param {number} x - Attachment base X (world or local)
 * @param {number} y - Attachment base Y (world or local)
 * @param {Object} config - { angle, thickness, length, color, parentId }
 */
export const createStem = (x, y, config = {}) => {
    const angle = config.angle ?? 0;
    const length = config.length || 200;
    const thickness = config.thickness || 20;
    const color = config.color || 0x228B22;
    const stiffness = config.stiffness ?? 0.5; // 0.0 to 1.0

    // Center is offset by half length in the growth direction (-Y in local space)
    const centerX_rel = 0;
    const centerY_rel = -length / 2;

    const components = [
        Position(x + centerX_rel, y + centerY_rel),
        Velocity(0, 0),
        Rotation(angle),
        ZLayer('PLAY', 0),
        PlatformTag(),
        AnchorTag(),
        EntityType('STEM'),
        Mass(config.mass || 5),
        Renderable({
            'BASE': { type: 'stem', width: thickness, height: length, color, stiffness }
        }),
        Collider('rect', 0, thickness, length)
    ];

    if (config.parentId) {
        components.push(Parent(config.parentId, { 
            x: x + centerX_rel, 
            y: y + centerY_rel 
        }, angle));
    } else {
        components.push(StaticTag());
    }

    return components;
};
